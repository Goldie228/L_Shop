import { Request, Response, NextFunction } from 'express';
import { config } from '../config/constants';

/**
 * Интерфейс для ошибки с дополнительными полями
 */
interface AppError extends Error {
  statusCode?: number;
  code?: string;
  details?: unknown;
}

/**
 * Общий обработчик ошибок
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
  const message = err.message || 'Internal Server Error';
  const code = err.code || 'INTERNAL_ERROR';

  // Логирование ошибки (в продакшене можно отправлять в систему логирования)
  console.error(`[${new Date().toISOString()}] Error:`, {
    statusCode,
    code,
    message,
    stack: config.isProduction ? undefined : err.stack,
    details: err.details,
  });

  // Ответ клиенту
  res.status(statusCode).json({
    message,
    error: code,
    // Не показываем stack trace в продакшене
    ...(config.isProduction ? {} : { stack: err.stack }),
  });
}

/**
 * Функция для создания обработанных ошибок
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
 * Async-обёртка для обработки ошибок в async middleware
 */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>,
) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
