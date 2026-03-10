/**
 * Контроллер продуктов - L_Shop
 * Управление продуктами магазина
 */

import { Request, Response } from 'express';
import { z } from 'zod';
import { ProductService } from '../services/product.service';
import type { GetProductsParams } from '../services/product.service';
import {
  createProductSchema,
  updateProductSchema,
  productFiltersSchema,
  CreateProductInput,
  UpdateProductInput,
  ProductFiltersInput,
} from '../utils/validation';
import { logger } from '../utils/logger';

/**
 * Получить список продуктов с фильтрацией и пагинацией
 * Публичный endpoint - авторизация не требуется
 * @param req - Запрос с query-параметрами
 * @param res - Ответ Express
 * @returns 200 с массивом продуктов и метаданными пагинации
 */
export async function getProducts(req: Request, res: Response): Promise<undefined> {
  try {
    // Валидация query-параметров через Zod
    const filters = productFiltersSchema.parse(req.query) as ProductFiltersInput;

    // Парсим параметры пагинации
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;
    const offset = req.query.offset ? parseInt(req.query.offset as string, 10) : 0;

    // Валидация limit и offset
    if (limit < 1 || limit > 100) {
      res.status(400).json({
        message: 'limit должен быть от 1 до 100',
        error: 'INVALID_LIMIT',
      });
      return;
    }

    if (offset < 0) {
      res.status(400).json({
        message: 'offset должен быть неотрицательным',
        error: 'INVALID_OFFSET',
      });
      return;
    }

    // Валидация inStock
    let inStockValue: boolean | undefined;
    if (filters.inStock !== undefined) {
      if (!['true', 'false'].includes(filters.inStock)) {
        res.status(400).json({
          message: 'Некорректный параметр inStock. Допустимые значения: true, false',
          error: 'INVALID_INSTOCK_PARAMETER',
        });
        return;
      }
      inStockValue = filters.inStock === 'true';
    }

    // Валидация minRating
    let minRatingValue: number | undefined;
    if (filters.minRating !== undefined) {
      const rating = parseFloat(filters.minRating);
      if (Number.isNaN(rating) || rating < 1 || rating > 5) {
        res.status(400).json({
          message: 'Некорректный параметр minRating. Допустимые значения: число от 1 до 5',
          error: 'INVALID_MINRATING_PARAMETER',
        });
        return;
      }
      minRatingValue = rating;
    }

    // Валидация sort для публичного API
    const publicSorts = ['price_asc', 'price_desc'];
    const sort = filters.sort as GetProductsParams['sort'];
    if (sort && !publicSorts.includes(sort)) {
      // Для публичного API используем только базовые сортировки
      // Можно расширить для публичного API
    }

    const result = await ProductService.getProductsWithPagination({
      search: filters.search,
      sort: sort || 'created_at_desc',
      category: filters.category,
      inStock: inStockValue,
      minRating: minRatingValue,
      limit,
      offset,
    });

    res.json({
      products: result.products,
      pagination: {
        total: result.total,
        limit: result.limit,
        offset: result.offset,
        hasMore: result.hasMore,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstIssue = error.issues[0];
      const field = firstIssue.path[0];
      let message = 'Некорректный параметр';
      let errorCode = 'INVALID_PARAMETER';

      if (field === 'sort') {
        message = 'Некорректный параметр sort. Допустимые значения: price_asc, price_desc';
        errorCode = 'INVALID_SORT_PARAMETER';
      }

      res.status(400).json({ message, error: errorCode, field });
      return;
    }

    logger.error(error, 'Ошибка при получении продуктов');
    res.status(500).json({
      message: 'Ошибка при получении продуктов',
      error: 'GET_PRODUCTS_ERROR',
    });
  }
}

/**
 * Получить продукт по ID
 * Публичный endpoint - авторизация не требуется
 * @param req - Запрос с параметром id в URL
 * @returns 200 с данными продукта или 400/404/500 при ошибках
 */
export async function getProductById(req: Request, res: Response): Promise<undefined> {
  const { id } = req.params;

  if (!id) {
    res.status(400).json({
      message: 'ID продукта не указан',
      error: 'MISSING_PRODUCT_ID',
    });
    return;
  }

  try {
    const product = await ProductService.getProductById(id);

    if (!product) {
      res.status(404).json({
        message: 'Product not found',
        error: 'PRODUCT_NOT_FOUND',
      });
      return;
    }

    res.json(product);
  } catch (error) {
    logger.error(error, 'Ошибка при получении продукта');
    res.status(500).json({
      message: 'Ошибка при получении продукта',
      error: 'GET_PRODUCT_ERROR',
    });
  }
}

/**
 * Получить все продукты (админ) с пагинацией и фильтрацией
 * Админский endpoint - требует прав администратора
 * @param req - Запрос с query параметрами
 * @param res - Ответ Express
 * @returns 200 с массивом всех продуктов и метаданными пагинации
 */
export async function getAllProductsAdmin(req: Request, res: Response): Promise<undefined> {
  try {
    // Парсим query параметры
    const inStockParam = req.query.inStock;
    let inStockValue: boolean | undefined;
    if (inStockParam === 'true') {
      inStockValue = true;
    } else if (inStockParam === 'false') {
      inStockValue = false;
    }

    const params: GetProductsParams = {
      search: req.query.search as string | undefined,
      sort: req.query.sort as GetProductsParams['sort'] | undefined,
      category: req.query.category as string | undefined,
      inStock: inStockValue,
      minRating: req.query.minRating ? parseFloat(req.query.minRating as string) : undefined,
      limit: req.query.limit ? parseInt(req.query.limit as string, 10) : 20,
      offset: req.query.offset ? parseInt(req.query.offset as string, 10) : 0,
    };

    // Валидация limit и offset
    if (params.limit && (params.limit < 1 || params.limit > 100)) {
      res.status(400).json({
        message: 'limit должен быть от 1 до 100',
        error: 'INVALID_LIMIT',
      });
      return;
    }

    if (params.offset && params.offset < 0) {
      res.status(400).json({
        message: 'offset должен быть неотрицательным',
        error: 'INVALID_OFFSET',
      });
      return;
    }

    // Валидация sort
    const validSorts = [
      'price_asc',
      'price_desc',
      'name_asc',
      'name_desc',
      'created_at_desc',
      'rating_desc',
    ];
    if (params.sort && !validSorts.includes(params.sort)) {
      res.status(400).json({
        message: `Некорректный параметр sort. Допустимые значения: ${validSorts.join(', ')}`,
        error: 'INVALID_SORT_PARAMETER',
      });
      return;
    }

    const result = await ProductService.getProductsWithPagination(params);

    res.json({
      products: result.products,
      pagination: {
        total: result.total,
        limit: result.limit,
        offset: result.offset,
        hasMore: result.hasMore,
      },
    });
  } catch (error) {
    logger.error(error, 'Ошибка при получении продуктов для админа');
    res.status(500).json({
      message: 'Ошибка при получении продуктов',
      error: 'GET_PRODUCTS_ERROR',
    });
  }
}

/**
 * Получить продукт по ID (админ)
 * Админский endpoint - требует прав администратора
 */
export async function getProductByIdAdmin(req: Request, res: Response): Promise<undefined> {
  const { id } = req.params;

  if (!id) {
    res.status(400).json({
      message: 'ID продукта не указан',
      error: 'MISSING_PRODUCT_ID',
    });
    return;
  }

  try {
    const product = await ProductService.getProductById(id);

    if (!product) {
      res.status(404).json({
        message: 'Product not found',
        error: 'PRODUCT_NOT_FOUND',
      });
      return;
    }

    res.json(product);
  } catch (error) {
    logger.error(error, 'Ошибка при получении продукта');
    res.status(500).json({
      message: 'Ошибка при получении продукта',
      error: 'GET_PRODUCT_ERROR',
    });
  }
}

/**
 * Создать новый продукт
 * Админский endpoint - требует прав администратора
 * @param req - Запрос с данными продукта в теле
 * @param res - Ответ Express
 * @returns 201 с созданным продуктом
 */
export async function createProduct(req: Request, res: Response): Promise<undefined> {
  try {
    const validatedData = createProductSchema.parse(req.body) as CreateProductInput;

    const product = await ProductService.createProduct(validatedData);
    logger.info({ productId: product.id, name: product.name }, 'Продукт создан');
    res.status(201).json(product);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstIssue = error.issues[0];
      res.status(400).json({
        message: firstIssue.message,
        error: 'VALIDATION_ERROR',
        field: firstIssue.path.join('.'),
      });
      return;
    }
    logger.error(error, 'Ошибка при создании продукта');
    res.status(500).json({
      message: 'Ошибка при создании продукта',
      error: 'CREATE_PRODUCT_ERROR',
    });
  }
}

/**
 * Обновить продукт по ID
 * Админский endpoint - требует прав администратора
 * @param req - Запрос с параметром id в URL и данными для обновления в теле
 * @param res - Ответ Express
 * @returns 200 с обновлённым продуктом
 */
export async function updateProduct(req: Request, res: Response): Promise<undefined> {
  const { id } = req.params;

  if (!id) {
    res.status(400).json({
      message: 'ID продукта не указан',
      error: 'MISSING_PRODUCT_ID',
    });
    return;
  }

  try {
    const validatedData = updateProductSchema.parse(req.body) as UpdateProductInput;

    const product = await ProductService.updateProduct(id, validatedData);

    if (!product) {
      res.status(404).json({
        message: 'Product not found',
        error: 'PRODUCT_NOT_FOUND',
      });
      return;
    }

    logger.info({ productId: id }, 'Продукт обновлён');
    res.json(product);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstIssue = error.issues[0];
      res.status(400).json({
        message: firstIssue.message,
        error: 'VALIDATION_ERROR',
        field: firstIssue.path.join('.'),
      });
      return;
    }
    logger.error(error, 'Ошибка при обновлении продукта');
    res.status(500).json({
      message: 'Ошибка при обновлении продукта',
      error: 'UPDATE_PRODUCT_ERROR',
    });
  }
}

/**
 * Удалить продукт по ID
 * Админский endpoint - требует прав администратора
 * @param req - Запрос с параметром id в URL
 * @param res - Ответ Express
 * @returns 204 No Content
 */
export async function deleteProduct(req: Request, res: Response): Promise<undefined> {
  const { id } = req.params;

  if (!id) {
    res.status(400).json({
      message: 'ID продукта не указан',
      error: 'MISSING_PRODUCT_ID',
    });
    return;
  }

  try {
    const deleted = await ProductService.deleteProduct(id);

    if (!deleted) {
      res.status(404).json({
        message: 'Product not found',
        error: 'PRODUCT_NOT_FOUND',
      });
      return;
    }

    logger.info({ productId: id }, 'Продукт удалён');
    res.status(204).send();
  } catch (error) {
    logger.error(error, 'Ошибка при удалении продукта');
    res.status(500).json({
      message: 'Ошибка при удалении продукта',
      error: 'DELETE_PRODUCT_ERROR',
    });
  }
}

/**
 * Получить статистику по продуктам (админ)
 * Админский endpoint - требует прав администратора
 */
export async function getProductsStatsAdmin(_req: Request, res: Response): Promise<undefined> {
  try {
    const stats = await ProductService.getProductsStats();
    res.json(stats);
  } catch (error) {
    logger.error(error, 'Ошибка при получении статистики продуктов');
    res.status(500).json({
      message: 'Ошибка при получении статистики',
      error: 'GET_STATS_ERROR',
    });
  }
}

/**
 * Получить список категорий
 * Публичный endpoint - авторизация не требуется
 */
export async function getCategories(_req: Request, res: Response): Promise<undefined> {
  try {
    const categories = await ProductService.getCategories();
    res.json({ categories });
  } catch (error) {
    logger.error(error, 'Ошибка при получении категорий');
    res.status(500).json({
      message: 'Ошибка при получении категорий',
      error: 'GET_CATEGORIES_ERROR',
    });
  }
}

/**
 * Массовое обновление наличия продуктов (админ)
 * Админский endpoint - требует прав администратора
 */
export async function bulkUpdateStock(req: Request, res: Response): Promise<undefined> {
  try {
    const { updates } = req.body;

    if (!Array.isArray(updates) || updates.length === 0) {
      res.status(400).json({
        message: 'Массив updates обязателен',
        error: 'INVALID_UPDATES',
      });
      return;
    }

    // Валидация формата updates
    const invalidUpdate = updates.find((u) => !u.id || typeof u.inStock !== 'boolean');
    if (invalidUpdate) {
      res.status(400).json({
        message: 'Каждый элемент updates должен содержать id (string) и inStock (boolean)',
        error: 'INVALID_UPDATE_FORMAT',
      });
      return;
    }

    const updatedCount = await ProductService.bulkUpdateStock(updates);

    logger.info({ count: updatedCount }, 'Массовое обновление наличия продуктов');
    res.json({
      message: `Обновлено ${updatedCount} продуктов`,
      updatedCount,
    });
  } catch (error) {
    logger.error(error, 'Ошибка при массовом обновлении наличия');
    res.status(500).json({
      message: 'Ошибка при массовом обновлении наличия',
      error: 'BULK_UPDATE_ERROR',
    });
  }
}
