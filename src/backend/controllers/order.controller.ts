/**
 * Контроллер заказов - L_Shop
 * Обрабатывает создание и получение заказов
 */

import { Response } from 'express';
import { AuthRequest } from '../middleware/auth-request';
import { OrderService } from '../services/order.service';
import { isValidEmail, isValidPhone } from '../utils/validators';

const orderService = new OrderService();

/**
 * Создать новый заказ
 * Требует авторизации
 */
export async function createOrder(
  req: AuthRequest,
  res: Response,
): Promise<void> {
  try {
    const { userId } = req;

    if (!userId) {
      res.status(401).json({
        message: 'Не авторизован',
        error: 'UNAUTHORIZED',
      });
      return;
    }

    const {
      deliveryAddress,
      phone,
      email,
      paymentMethod,
      deliveryType,
      comment,
    } = req.body;

    // Валидация обязательных полей
    if (!deliveryAddress || !phone || !email || !paymentMethod) {
      res.status(400).json({
        message:
          'Обязательные поля: deliveryAddress, phone, email, paymentMethod',
        error: 'MISSING_FIELDS',
      });
      return;
    }

    // Валидация email
    if (!isValidEmail(email)) {
      res.status(400).json({
        message: 'Некорректный формат email',
        error: 'INVALID_EMAIL',
      });
      return;
    }

    // Валидация телефона
    if (!isValidPhone(phone)) {
      res.status(400).json({
        message: 'Некорректный формат телефона. Ожидается: +1234567890 (10-15 цифр)',
        error: 'INVALID_PHONE',
      });
      return;
    }

    // Валидация способа оплаты
    const validPaymentMethods = ['cash', 'card', 'online'];
    if (!validPaymentMethods.includes(paymentMethod)) {
      res.status(400).json({
        message: 'Некорректный способ оплаты. Допустимые: cash, card, online',
        error: 'INVALID_PAYMENT_METHOD',
      });
      return;
    }

    // Валиант 24: Валидация типа доставки
    if (deliveryType !== undefined) {
      const validDeliveryTypes = ['courier', 'pickup'];
      if (!validDeliveryTypes.includes(deliveryType)) {
        res.status(400).json({
          message: 'Некорректный тип доставки. Допустимые: courier, pickup',
          error: 'INVALID_DELIVERY_TYPE',
        });
        return;
      }
    }

    // Создать заказ
    const order = await orderService.createOrder(userId, {
      deliveryAddress,
      phone,
      email,
      paymentMethod,
      deliveryType, // Вариант 24
      comment, // Вариант 24
    });

    res.status(201).json(order);
  } catch (error) {
    console.error('[OrderController] Ошибка создания заказа:', error);

    if (error instanceof Error && error.message === 'Cart is empty') {
      res.status(400).json({
        message: 'Корзина пуста',
        error: 'CART_EMPTY',
      });
      return;
    }

    res.status(500).json({
      message: 'Ошибка при создании заказа',
      error: 'CREATE_ORDER_ERROR',
    });
  }
}

/**
 * Получить список заказов текущего пользователя
 * Требует авторизации
 */
export async function getOrders(
  req: AuthRequest,
  res: Response,
): Promise<void> {
  try {
    const { userId } = req;

    if (!userId) {
      res.status(401).json({
        message: 'Не авторизован',
        error: 'UNAUTHORIZED',
      });
      return;
    }

    const orders = await orderService.getOrders(userId);
    res.json(orders);
  } catch (error) {
    console.error('[OrderController] Ошибка получения заказов:', error);
    res.status(500).json({
      message: 'Ошибка при получении заказов',
      error: 'GET_ORDERS_ERROR',
    });
  }
}

/**
 * Получить конкретный заказ по ID
 * Требует авторизации
 */
export async function getOrderById(
  req: AuthRequest,
  res: Response,
): Promise<void> {
  try {
    const { userId } = req;
    const { orderId } = req.params;

    if (!userId) {
      res.status(401).json({
        message: 'Не авторизован',
        error: 'UNAUTHORIZED',
      });
      return;
    }

    if (!orderId) {
      res.status(400).json({
        message: 'ID заказа не указан',
        error: 'MISSING_ORDER_ID',
      });
      return;
    }

    const order = await orderService.getOrderById(userId, orderId);

    if (!order) {
      res.status(404).json({
        message: 'Заказ не найден',
        error: 'ORDER_NOT_FOUND',
      });
      return;
    }

    res.json(order);
  } catch (error) {
    console.error('[OrderController] Ошибка получения заказа:', error);
    res.status(500).json({
      message: 'Ошибка при получении заказа',
      error: 'GET_ORDER_ERROR',
    });
  }
}