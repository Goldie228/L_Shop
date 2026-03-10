/**
 * Контроллер заказов - L_Shop
 * Управление заказами пользователей
 */

import { Response } from 'express';
import { AuthRequest } from '../middleware/auth-request';
import { OrderService, GetOrdersParams } from '../services/order.service';
import { createOrderSchema, updateOrderStatusSchema, validate } from '../utils/validation';
import {
  ValidationError, NotFoundError, AuthorizationError, BusinessRuleError,
} from '../errors';
import { createContextLogger } from '../utils/logger';

const logger = createContextLogger('OrderController');
const orderService = new OrderService();

/**
 * Создать новый заказ
 * Требует авторизации
 * @param req - AuthRequest с userId и телом заказа
 * @param res - Ответ Express
 * @returns 201 с созданным заказом
 */
export async function createOrder(req: AuthRequest, res: Response): Promise<undefined> {
  const { userId } = req;

  if (!userId) {
    throw new ValidationError('Не авторизован');
  }

  // Валидация тела запроса через Zod
  const validation = validate(createOrderSchema, req.body);
  if (!validation.success || !validation.data) {
    throw new ValidationError(validation.error || 'Ошибка валидации', { field: validation.field });
  }

  const order = await orderService.createOrder(userId, validation.data);
  logger.info({ userId, orderId: order.id, totalSum: order.totalSum }, 'Заказ создан');
  res.status(201).json(order);
}

/**
 * Получить список заказов текущего пользователя с пагинацией
 * Требует авторизации
 * @param req - AuthRequest с userId и query параметрами
 * @param res - Ответ Express
 * @returns 200 с массивом заказов и метаданными пагинации
 */
export async function getOrders(req: AuthRequest, res: Response): Promise<undefined> {
  const { userId } = req;

  if (!userId) {
    throw new ValidationError('Не авторизован');
  }

  // Парсим query параметры
  const status = req.query.status as string | undefined;
  const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;
  const offset = req.query.offset ? parseInt(req.query.offset as string, 10) : 0;

  // Валидация limit и offset
  if (limit < 1 || limit > 100) {
    res.status(400).json({
      message: 'limit должен быть от 1 до 100',
      error: 'INVALID_LIMIT',
    });
    return;
  }

  if (offset < 0) {
    res.status(400).json({
      message: 'offset должен быть неотрицательным',
      error: 'INVALID_OFFSET',
    });
    return;
  }

  // Валидация status
  const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
  if (status && !validStatuses.includes(status)) {
    res.status(400).json({
      message: `Некорректный статус. Допустимые значения: ${validStatuses.join(', ')}`,
      error: 'INVALID_STATUS',
    });
    return;
  }

  const result = await orderService.getOrdersWithPaginationUser(userId, {
    status: status as GetOrdersParams['status'],
    limit,
    offset,
  });

  res.json({
    orders: result.orders,
    pagination: {
      total: result.total,
      limit: result.limit,
      offset: result.offset,
      hasMore: result.hasMore,
    },
  });
}

/**
 * Получить конкретный заказ по ID
 * Требует авторизации
 * Пользователь может получить только свои заказы, админ - все
 * @param req - AuthRequest с userId и params { orderId }
 * @param res - Ответ Express
 * @returns 200 с данными заказа
 */
export async function getOrderById(req: AuthRequest, res: Response): Promise<undefined> {
  const { userId } = req;
  const { orderId } = req.params;

  if (!userId) {
    throw new ValidationError('Не авторизован');
  }

  if (!orderId) {
    throw new ValidationError('ID заказа обязателен', { field: 'orderId' });
  }

  const order = await orderService.getOrderById(userId, orderId);

  if (!order) {
    // Проверяем, существует ли заказ с таким ID (для админа)
    const allOrders = await orderService.getAllOrders();
    const exists = allOrders.some((o) => o.id === orderId);
    if (exists) {
      throw new AuthorizationError('Нет прав на просмотр этого заказа');
    }
    throw new NotFoundError('Заказ не найден');
  }

  res.json(order);
}

/**
 * Отменить заказ
 * Требует авторизации
 * Пользователь может отменить только свой заказ в статусе pending
 * @param req - AuthRequest с userId и params { orderId }
 * @param res - Ответ Express
 * @returns 200 с обновлённым заказом
 */
export async function cancelOrder(req: AuthRequest, res: Response): Promise<undefined> {
  const { userId } = req;
  const { orderId } = req.params;

  if (!userId) {
    throw new ValidationError('Не авторизован');
  }

  if (!orderId) {
    throw new ValidationError('ID заказа обязателен', { field: 'orderId' });
  }

  try {
    const order = await orderService.cancelOrder(userId, orderId);

    if (!order) {
      throw new NotFoundError('Заказ не найден');
    }

    logger.info({ userId, orderId }, 'Заказ отменён пользователем');
    res.json(order);
  } catch (error) {
    if (error instanceof BusinessRuleError) {
      res.status(400).json({
        message: error.message,
        error: 'ORDER_CANCELLATION_NOT_ALLOWED',
      });
      return;
    }
    throw error;
  }
}

/**
 * Получить все заказы (админ) с пагинацией и фильтрацией
 * Требует прав администратора
 * @param req - AuthRequest с query параметрами
 * @param res - Ответ Express
 * @returns 200 с массивом всех заказов и метаданными пагинации
 */
export async function getAllOrdersAdmin(req: AuthRequest, res: Response): Promise<undefined> {
  // Парсим query параметры
  const params: GetOrdersParams = {
    status: req.query.status as GetOrdersParams['status'],
    userId: req.query.userId as string | undefined,
    dateFrom: req.query.dateFrom as string | undefined,
    dateTo: req.query.dateTo as string | undefined,
    limit: req.query.limit ? parseInt(req.query.limit as string, 10) : 20,
    offset: req.query.offset ? parseInt(req.query.offset as string, 10) : 0,
    sort: req.query.sort as GetOrdersParams['sort'] | undefined,
  };

  // Валидация limit и offset
  if (params.limit && (params.limit < 1 || params.limit > 100)) {
    res.status(400).json({
      message: 'limit должен быть от 1 до 100',
      error: 'INVALID_LIMIT',
    });
    return;
  }

  if (params.offset && params.offset < 0) {
    res.status(400).json({
      message: 'offset должен быть неотрицательным',
      error: 'INVALID_OFFSET',
    });
    return;
  }

  // Валидация status
  const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
  if (params.status && !validStatuses.includes(params.status)) {
    res.status(400).json({
      message: `Некорректный статус. Допустимые значения: ${validStatuses.join(', ')}`,
      error: 'INVALID_STATUS',
    });
    return;
  }

  // Валидация sort
  const validSorts = ['created_at_desc', 'created_at_asc', 'total_desc', 'total_asc'];
  if (params.sort && !validSorts.includes(params.sort)) {
    res.status(400).json({
      message: `Некорректный параметр sort. Допустимые: ${validSorts.join(', ')}`,
      error: 'INVALID_SORT_PARAMETER',
    });
    return;
  }

  const result = await orderService.getOrdersWithPagination(params);

  res.json({
    orders: result.orders,
    pagination: {
      total: result.total,
      limit: result.limit,
      offset: result.offset,
      hasMore: result.hasMore,
    },
  });
}

/**
 * Получить заказ по ID (админ)
 * Требует прав администратора
 * @param req - AuthRequest с params { id }
 * @param res - Ответ Express
 * @returns 200 с данными заказа
 */
export async function getOrderByIdAdmin(req: AuthRequest, res: Response): Promise<undefined> {
  const { id } = req.params;

  if (!id) {
    throw new ValidationError('ID заказа обязателен', { field: 'id' });
  }

  const order = await orderService.getOrderByIdAdmin(id);

  if (!order) {
    throw new NotFoundError('Заказ не найден');
  }

  res.json(order);
}

/**
 * Обновить статус заказа (админ)
 * Требует прав администратора
 * @param req - AuthRequest с params { id } и body { status }
 * @param res - Ответ Express
 * @returns 200 с обновлённым заказом
 */
export async function updateOrderStatusAdmin(req: AuthRequest, res: Response): Promise<undefined> {
  const { id } = req.params;

  if (!id) {
    throw new ValidationError('ID заказа обязателен', { field: 'id' });
  }

  // Валидация статуса через Zod
  const validation = validate(updateOrderStatusSchema, req.body);
  if (!validation.success || !validation.data) {
    throw new ValidationError(validation.error || 'Некорректный статус', { field: 'status' });
  }

  const order = await orderService.updateOrderStatus(id, validation.data.status);

  if (!order) {
    throw new NotFoundError('Заказ не найден');
  }

  logger.info(
    { orderId: id, status: validation.data.status },
    'Статус заказа обновлён администратором',
  );
  res.json(order);
}

/**
 * Удалить заказ (админ)
 * Требует прав администратора
 * @param req - AuthRequest с params { id }
 * @param res - Ответ Express
 * @returns 204 No Content
 */
export async function deleteOrderAdmin(req: AuthRequest, res: Response): Promise<undefined> {
  const { id } = req.params;

  if (!id) {
    throw new ValidationError('ID заказа обязателен', { field: 'id' });
  }

  const deleted = await orderService.deleteOrder(id);

  if (!deleted) {
    throw new NotFoundError('Заказ не найден');
  }

  logger.info({ orderId: id }, 'Заказ удалён администратором');
  res.status(204).send();
}

/**
 * Получить статистику заказов (админ)
 * Требует прав администратора
 * @param req - AuthRequest
 * @param res - Ответ Express
 * @returns 200 со статистикой заказов
 */
export async function getOrdersStatsAdmin(_req: AuthRequest, res: Response): Promise<undefined> {
  const stats = await orderService.getOrdersStats();
  res.json(stats);
}
