/**
 * Обработчик ошибок
 */

import { Request, Response, NextFunction } from 'express';
import { config } from '../config/constants';

interface AppError extends Error {
  statusCode?: number;
  code?: string;
  details?: unknown;
}

/**
 * Централизованный обработчик ошибок
 * Должен быть последним middleware в цепочке
 */
export function errorHandler(
  err: AppError,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction,
): void {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Внутренняя ошибка сервера';
  const code = err.code || 'INTERNAL_ERROR';

  console.error(`[${new Date().toISOString()}] Error:`, {
    statusCode,
    code,
    message,
    // Stack trace не показываем в продакшене
    stack: config.isProduction ? undefined : err.stack,
    details: err.details,
  });

  res.status(statusCode).json({
    message,
    error: code,
    ...(config.isProduction ? {} : { stack: err.stack }),
  });
}

/**
 * Создаёт ошибку с дополнительными полями
 */
export function createError(
  message: string,
  statusCode = 500,
  code = 'INTERNAL_ERROR',
  details?: unknown,
): AppError {
  const error: AppError = new Error(message);
  error.statusCode = statusCode;
  error.code = code;
  error.details = details;
  return error;
}

/**
 * Обёртка для async middleware, автоматически передаёт ошибки в next()
 */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>,
) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
