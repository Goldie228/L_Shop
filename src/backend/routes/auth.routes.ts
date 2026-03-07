/**
 * Маршруты авторизации
 */

import { Router } from 'express';
import {
  register,
  login,
  logout,
  getCurrentUser,
  getSessionConfig,
} from '../controllers/auth.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { updateProfile, updatePassword } from '../controllers/user.controller';

const router = Router();

// Публичные маршруты
router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.get('/session-config', getSessionConfig);

// Защищённые маршруты (требуют авторизации)
router.get('/me', authMiddleware, getCurrentUser);

// Маршруты для управления профилем пользователя
router.put('/profile', authMiddleware, updateProfile);
router.put('/password', authMiddleware, updatePassword);

export default router;
