/**
 * Маршруты корзины
 */

import { Router } from 'express';
import { getCart, addItem, updateItem, removeItem } from '../controllers/cart.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// Все маршруты требуют авторизации
router.get('/', authMiddleware, getCart);
router.post('/items', authMiddleware, addItem);
router.put('/items/:productId', authMiddleware, updateItem);
router.delete('/items/:productId', authMiddleware, removeItem);

export default router;