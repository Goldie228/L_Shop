/**
 * Расширенный тип Request с userId для авторизованных запросов
 * Используется в контроллерах для типизации req.userId
 */

import { Request } from 'express';

/**
 * Расширенный Request с идентификатором пользователя
 */
export interface AuthRequest extends Request {
  userId?: string;
}
