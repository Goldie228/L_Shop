import { Request, Response, NextFunction } from 'express';
import { SessionService } from '../services/session.service';

const sessionService = new SessionService();

// Middleware для проверки авторизации
export async function authMiddleware(req: Request, res: Response, next: NextFunction): Promise<void> {
  const token = req.cookies.sessionToken;
  if (!token) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }
  const userId = await sessionService.getUserIdByToken(token);
  if (!userId) {
    res.clearCookie('sessionToken');
    res.status(401).json({ message: 'Session expired' });
    return;
  }
  // Добавляем userId в request для последующих обработчиков
  (req as unknown as { userId: string }).userId = userId;
  next();
}
