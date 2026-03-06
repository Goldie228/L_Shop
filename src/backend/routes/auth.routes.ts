/**
 * Маршруты авторизации
 */

import { Router } from 'express';
import {
  register, login, logout, getCurrentUser,
} from '../controllers/auth.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// Публичные маршруты
router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);

// Защищённые маршруты (требуют авторизации)
router.get('/me', authMiddleware, getCurrentUser);

export default router;
