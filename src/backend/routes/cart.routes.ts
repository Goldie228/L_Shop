/**
 * Маршруты корзины
 */

import { Router } from 'express';
import {
  getCart, addItem, updateItem, removeItem,
} from '../controllers/cart.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { asyncHandler } from '../middleware/error.middleware';

const router = Router();

// Все маршруты требуют авторизации
router.get('/', authMiddleware, asyncHandler(getCart));
router.post('/items', authMiddleware, asyncHandler(addItem));
router.put('/items/:productId', authMiddleware, asyncHandler(updateItem));
router.delete('/items/:productId', authMiddleware, asyncHandler(removeItem));

export default router;
