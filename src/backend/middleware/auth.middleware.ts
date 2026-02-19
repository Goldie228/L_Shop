/**
 * Middleware для проверки авторизации
 */

import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth-request';
import { SessionService } from '../services/session.service';

const sessionService = new SessionService();

/**
 * Проверяет наличие и валидность sessionToken в cookies
 * При успехе добавляет userId в request
 */
export async function authMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const token = req.cookies?.sessionToken;

    if (!token) {
      res.status(401).json({
        message: 'Не авторизован',
        error: 'NO_TOKEN',
      });
      return;
    }

    const userId = await sessionService.getUserIdByToken(token);

    if (!userId) {
      // Сессия истекла или не найдена - очищаем cookie
      res.clearCookie('sessionToken', {
        httpOnly: true,
        sameSite: 'strict',
      });

      res.status(401).json({
        message: 'Сессия истекла',
        error: 'SESSION_EXPIRED',
      });
      return;
    }

    req.userId = userId;
    next();
  } catch (error) {
    console.error('[AuthMiddleware] Ошибка:', error);
    res.status(500).json({
      message: 'Ошибка при проверке авторизации',
      error: 'AUTH_ERROR',
    });
  }
}

/**
 * Опциональная авторизация
 * Не блокирует запрос, но добавляет userId если токен валиден
 */
export async function optionalAuth(
  req: AuthRequest,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const token = req.cookies?.sessionToken;

    if (token) {
      const userId = await sessionService.getUserIdByToken(token);
      if (userId) {
        req.userId = userId;
      }
    }

    next();
  } catch (error) {
    // При ошибке просто продолжаем без userId
    console.error('[OptionalAuth] Ошибка:', error);
    next();
  }
}
