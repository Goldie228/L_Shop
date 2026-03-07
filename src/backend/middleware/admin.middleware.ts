/**
 * Middleware для проверки прав администратора
 * Проверяет, что пользователь имеет роль 'admin'
 */

import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth-request';
import { SessionService } from '../services/session.service';

const sessionService = new SessionService();

/**
 * Проверяет, что авторизованный пользователь имеет роль администратора
 * Middleware должен использоваться после authMiddleware
 *
 * @param req - Request с userId (установлен authMiddleware)
 * @param res - Response для отправки ошибок
 * @param next - Next middleware
 */
export async function requireAdmin(
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

    // Получаем роль пользователя по токену сессии
    const role = await sessionService.getRoleByToken(token);

    if (!role) {
      // Сессия истекла или не найдена
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

    // Проверяем, что роль - администратор
    if (role !== 'admin') {
      res.status(403).json({
        message: 'Доступ запрещён. Требуются права администратора',
        error: 'FORBIDDEN',
      });
      return;
    }

    next();
  } catch (error) {
    console.error('[AdminMiddleware] Ошибка:', error);
    res.status(500).json({
      message: 'Ошибка при проверке прав администратора',
      error: 'ADMIN_CHECK_ERROR',
    });
  }
}
