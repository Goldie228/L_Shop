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
import { asyncHandler } from '../middleware/error.middleware';

const router = Router();

// Публичные маршруты
router.post('/register', asyncHandler(register));
router.post('/login', asyncHandler(login));
router.post('/logout', asyncHandler(logout));
router.get('/session-config', getSessionConfig);

// Защищённые маршруты (требуют авторизации)
router.get('/me', authMiddleware, asyncHandler(getCurrentUser));

// Маршруты для управления профилем пользователя
router.put('/profile', authMiddleware, asyncHandler(updateProfile));
router.put('/password', authMiddleware, asyncHandler(updatePassword));

export default router;
