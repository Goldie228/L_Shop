/**
 * Расширение типа Request для Express
 * Добавляет userId из авторизованной сессии
 */

import 'express';

declare module 'express' {
  interface Request {
    userId?: string;
  }
}
