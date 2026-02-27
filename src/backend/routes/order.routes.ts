/**
 * Маршруты заказов - L_Shop
 */

import { Router } from 'express';
import {
  createOrder,
  getOrders,
  getOrderById,
} from '../controllers/order.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// Все маршруты заказов требуют авторизации
router.post('/', authMiddleware, createOrder);
router.get('/', authMiddleware, getOrders);
router.get('/:orderId', authMiddleware, getOrderById);

export default router;