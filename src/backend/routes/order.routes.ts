/**
 * Маршруты заказов - L_Shop
 * Управление заказами пользователей
 */

import { Router } from 'express';
import {
  createOrder, getOrders, getOrderById, cancelOrder,
} from '../controllers/order.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { asyncHandler } from '../middleware/error.middleware';

const router = Router();

// Все маршруты заказов требуют авторизации

/**
 * POST /api/orders
 * Создать новый заказ
 */
router.post('/', authMiddleware, asyncHandler(createOrder));

/**
 * GET /api/orders
 * Получить список заказов текущего пользователя с пагинацией
 * Query параметры: status, limit, offset
 */
router.get('/', authMiddleware, asyncHandler(getOrders));

/**
 * GET /api/orders/:orderId
 * Получить заказ по ID
 */
router.get('/:orderId', authMiddleware, asyncHandler(getOrderById));

/**
 * PUT /api/orders/:orderId/cancel
 * Отменить заказ (только в статусе pending)
 */
router.put('/:orderId/cancel', authMiddleware, asyncHandler(cancelOrder));

export default router;
