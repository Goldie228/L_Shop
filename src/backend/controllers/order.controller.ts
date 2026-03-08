import { Response } from 'express';
import { AuthRequest } from '../middleware/auth-request';
import { OrderService } from '../services/order.service';
import { createOrderSchema, updateOrderStatusSchema, validate } from '../utils/validation';
import { ValidationError, NotFoundError, AuthorizationError } from '../errors';

const orderService = new OrderService();

/**
 * Создать новый заказ
 * Требует авторизации
 * @param req - AuthRequest с userId и телом заказа
 * @param res - Ответ Express
 * @throws {AuthenticationError} Если не авторизован (обрабатывается в auth middleware)
 * @throws {ValidationError} При невалидных данных
 * @throws {NotFoundError} Если продукты из корзины не найдены
 * @throws {OrderError} При ошибках создания заказа
 * @throws {CartError} При ошибках работы с корзиной
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
  res.status(201).json(order);
}

/**
 * Получить список заказов текущего пользователя
 * Требует авторизации
 * @param req - AuthRequest с userId
 * @param res - Ответ Express
 * @throws {OrderError} При ошибках получения заказов
 * @returns 200 с массивом заказов
 */
export async function getOrders(req: AuthRequest, res: Response): Promise<undefined> {
  const { userId } = req;

  if (!userId) {
    throw new ValidationError('Не авторизован');
  }

  const orders = await orderService.getOrders(userId);
  res.json(orders);
}

/**
 * Получить конкретный заказ по ID
 * Требует авторизации
 * Пользователь может получить только свои заказы, админ - все
 * @param req - AuthRequest с userId и params { orderId }
 * @param res - Ответ Express
 * @throws {ValidationError} При отсутствии orderId или неавторизованном доступе
 * @throws {NotFoundError} Если заказ не найден
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
 * Получить все заказы (админ)
 * Требует прав администратора
 * @param req - AuthRequest
 * @param res - Ответ Express
 * @throws {OrderError} При ошибках получения заказов
 * @returns 200 с массивом всех заказов
 */
export async function getAllOrdersAdmin(_req: AuthRequest, res: Response): Promise<undefined> {
  const orders = await orderService.getAllOrders();
  res.json(orders);
}

/**
 * Обновить статус заказа (админ)
 * Требует прав администратора
 * @param req - AuthRequest с params { id } и body { status }
 * @param res - Ответ Express
 * @throws {ValidationError} При отсутствии id или невалидном статусе
 * @throws {NotFoundError} Если заказ не найден
 * @throws {OrderError} При ошибках обновления
 * @returns 200 с обновлённым заказом
 */
export async function updateOrderStatusAdmin(req: AuthRequest, res: Response): Promise<undefined> {
  const { id } = req.params;
  const { status } = req.body;

  if (!id) {
    throw new ValidationError('ID заказа обязателен', { field: 'id' });
  }

  // Валидация статуса через Zod
  const validation = validate(updateOrderStatusSchema, { status });
  if (!validation.success || !validation.data) {
    throw new ValidationError(validation.error || 'Некорректный статус', { field: 'status' });
  }

  const order = await orderService.updateOrderStatus(id, validation.data.status);

  if (!order) {
    throw new NotFoundError('Заказ не найден');
  }

  res.json(order);
}

/**
 * Удалить заказ (админ)
 * Требует прав администратора
 * @param req - AuthRequest с params { id }
 * @param res - Ответ Express
 * @throws {ValidationError} При отсутствии id
 * @throws {NotFoundError} Если заказ не найден
 * @throws {OrderError} При ошибках удаления
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

  res.status(204).send();
}
