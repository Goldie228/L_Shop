import { Request, Response, NextFunction } from 'express';
import { SessionService } from '../services/session.service';

const sessionService = new SessionService();

/**
 * Расширение интерфейса Request для добавления userId
 */
export interface AuthRequest extends Request {
  userId?: string;
}

/**
 * Middleware для проверки авторизации
 * Проверяет наличие и валидность sessionToken в cookies
 * Добавляет userId в request при успешной проверке
 */
export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const token = req.cookies?.sessionToken;

    if (!token) {
      res.status(401).json({
        message: 'Unauthorized',
        error: 'NO_TOKEN',
      });
      return;
    }

    const userId = await sessionService.getUserIdByToken(token);

    if (!userId) {
      res.clearCookie('sessionToken', {
        httpOnly: true,
        sameSite: 'strict',
      });

      res.status(401).json({
        message: 'Session expired',
        error: 'SESSION_EXPIRED',
      });
      return;
    }

    // Добавляем userId в request
    (req as AuthRequest).userId = userId;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({
      message: 'Internal server error during authentication',
      error: 'AUTH_ERROR',
    });
  }
}

/**
 * Необязательная авторизация
 * Не блокирует запрос, но добавляет userId если есть
 */
export async function optionalAuth(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const token = req.cookies?.sessionToken;

    if (token) {
      const userId = await sessionService.getUserIdByToken(token);
      if (userId) {
        (req as AuthRequest).userId = userId;
      }
    }

    next();
  } catch (error) {
    // Не блокируем запрос при ошибке
    console.error('Optional auth error:', error);
    next();
  }
}
