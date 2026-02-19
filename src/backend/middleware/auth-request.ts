import { Request } from 'express';

/**
 * Расширенный тип Request с userId
 */
export interface AuthRequest extends Request {
  /** ID авторизованного пользователя */
  userId?: string;
}
