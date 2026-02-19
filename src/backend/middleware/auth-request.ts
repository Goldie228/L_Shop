/**
 * Расширенный тип Request с userId для авторизованных запросов
 */

import { Request } from 'express';

export interface AuthRequest extends Request {
  userId?: string;
}
