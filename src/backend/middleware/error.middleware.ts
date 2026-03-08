/**
 * Обработчик ошибок
 */

import { Request, Response, NextFunction } from 'express';
import { config } from '../config/constants';
import { logger } from '../utils/logger';
import { BusinessError, IAppError } from '../errors';

/**
 * Тип ошибок, которые могут быть переданы в middleware
 */
export interface AppError extends Error, IAppError {}

/**
 * Тип ответа об ошибке
 */
export type ErrorResponse = {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
  stack?: string;
};

type ErrorWithProps = AppError;

/**
 * Централизованный обработчик ошибок
 * Должен быть последним middleware в цепочке
 *
 * @param err - Ошибка (BusinessError или стандартная Error)
 * @param _req - Express Request (не используется)
 * @param res - Express Response
 * @param _next - Express NextFunction (не используется)
 *
 * @throws {Error} В случае критической ошибки (не должно происходить)
 *
 * @example
 * // В app.ts
 * app.use(errorHandler);
 */
export function errorHandler(
  err: ErrorWithProps,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction,
): void {
  const isBusinessError = err instanceof BusinessError;

  // Определяем статус код, код ошибки и сообщение
  const statusCode = err.statusCode || 500;
  const code = isBusinessError ? err.code : 'INTERNAL_ERROR';
  const message = err.message || 'Внутренняя ошибка сервера';
  const details = isBusinessError ? err.details : undefined;

  // Структурированное логирование
  logger.error({ err }, `Ошибка ${code} (${statusCode}): ${message}`, {
    statusCode,
    code,
    message,
    details,
    ...(config.isProduction ? {} : { stack: err.stack }),
  });

  // Формируем ответ в структурированном формате
  const response: ErrorResponse = {
    error: {
      code,
      message,
    },
  };

  // Добавляем details только если он есть
  if (details !== undefined && details !== null) {
    response.error.details = details;
  }

  // В development режиме добавляем stack trace для отладки
  if (!config.isProduction && err.stack) {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
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
  const error = Object.create(Error.prototype, {
    message: { value: message, writable: true, enumerable: true },
    name: { value: 'Error', writable: true, enumerable: true },
    statusCode: { value: statusCode, writable: true, enumerable: true },
    code: { value: code, writable: true, enumerable: true },
    details: { value: details, writable: true, enumerable: true },
  }) as AppError;
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
