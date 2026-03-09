/**
 * Middleware для валидации запросов
 * Использует Zod схемы для валидации body, query, params
 */

import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { logger } from '../utils/logger';

/**
 * Результат валидации
 */
export interface ValidationResult {
  success: boolean;
  error?: string;
  field?: string;
}

/**
 * Валидация через Zod схему
 */
function validateSchema<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
): { success: true; data: T } | { success: false; error: string; field?: string } {
  const result = schema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data };
  }

  const firstError = result.error.issues[0];
  return {
    success: false,
    error: firstError.message,
    field: firstError.path.join('.') || undefined,
  };
}

/**
 * Middleware для валидации тела запроса
 */
export function validateBody<T>(schema: z.ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = validateSchema(schema, req.body);

    if (!result.success) {
      logger.warn(
        { field: result.field, error: result.error, body: req.body },
        'Валидация body не пройдена',
      );
      res.status(400).json({
        message: result.error,
        error: 'VALIDATION_ERROR',
        field: result.field,
      });
      return;
    }

    // Заменяем body на валидированные данные (с трансформациями)
    req.body = result.data;
    next();
  };
}

/**
 * Middleware для валидации query параметров
 */
export function validateQuery<T>(schema: z.ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = validateSchema(schema, req.query);

    if (!result.success) {
      logger.warn(
        { field: result.field, error: result.error, query: req.query },
        'Валидация query не пройдена',
      );
      res.status(400).json({
        message: result.error,
        error: 'VALIDATION_ERROR',
        field: result.field,
      });
      return;
    }

    // Заменяем query на валидированные данные
    req.query = result.data as typeof req.query;
    next();
  };
}

/**
 * Middleware для валидации URL параметров
 */
export function validateParams<T>(schema: z.ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = validateSchema(schema, req.params);

    if (!result.success) {
      logger.warn(
        { field: result.field, error: result.error, params: req.params },
        'Валидация params не пройдена',
      );
      res.status(400).json({
        message: result.error,
        error: 'VALIDATION_ERROR',
        field: result.field,
      });
      return;
    }

    // Заменяем params на валидированные данные
    req.params = result.data as typeof req.params;
    next();
  };
}

/**
 * Комбинированный middleware для валидации body, query и params
 */
export function validateRequest<TBody, TQuery, TParams>(
  schemas: {
    body?: z.ZodSchema<TBody>;
    query?: z.ZodSchema<TQuery>;
    params?: z.ZodSchema<TParams>;
  },
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    // Валидация body
    if (schemas.body) {
      const result = validateSchema(schemas.body, req.body);
      if (!result.success) {
        logger.warn({ field: result.field, error: result.error }, 'Валидация body не пройдена');
        res.status(400).json({
          message: result.error,
          error: 'VALIDATION_ERROR',
          field: result.field,
        });
        return;
      }
      req.body = result.data;
    }

    // Валидация query
    if (schemas.query) {
      const result = validateSchema(schemas.query, req.query);
      if (!result.success) {
        logger.warn({ field: result.field, error: result.error }, 'Валидация query не пройдена');
        res.status(400).json({
          message: result.error,
          error: 'VALIDATION_ERROR',
          field: result.field,
        });
        return;
      }
      req.query = result.data as typeof req.query;
    }

    // Валидация params
    if (schemas.params) {
      const result = validateSchema(schemas.params, req.params);
      if (!result.success) {
        logger.warn({ field: result.field, error: result.error }, 'Валидация params не пройдена');
        res.status(400).json({
          message: result.error,
          error: 'VALIDATION_ERROR',
          field: result.field,
        });
        return;
      }
      req.params = result.data as typeof req.params;
    }

    next();
  };
}

/**
 * Схемы для пагинации
 */
export const paginationSchema = z.object({
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 20))
    .refine((val) => val >= 1 && val <= 100, {
      message: 'limit должен быть от 1 до 100',
    }),
  offset: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 0))
    .refine((val) => val >= 0, {
      message: 'offset должен быть неотрицательным',
    }),
});

/**
 * Тип для пагинации
 */
export interface PaginationParams {
  limit: number;
  offset: number;
}

/**
 * Результат пагинации с метаданными
 */
export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

/**
 * Применить пагинацию к массиву
 */
export function applyPagination<T>(
  items: T[],
  pagination: PaginationParams,
): PaginatedResult<T> {
  const { limit, offset } = pagination;
  const total = items.length;
  const paginatedItems = items.slice(offset, offset + limit);
  const hasMore = offset + limit < total;

  return {
    data: paginatedItems,
    pagination: {
      total,
      limit,
      offset,
      hasMore,
    },
  };
}