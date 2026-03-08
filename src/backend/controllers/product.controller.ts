import { Request, Response } from 'express';
import { z } from 'zod';
import { ProductService } from '../services/product.service';
import {
  createProductSchema,
  updateProductSchema,
  productFiltersSchema,
  CreateProductInput,
  UpdateProductInput,
  ProductFiltersInput,
} from '../utils/validation';
import { ValidationError } from '../errors/validation.error';
import { NotFoundError } from '../errors/not-found.error';
import { logger } from '../utils/logger';

/**
 * Получить список продуктов с фильтрацией
 * Публичный endpoint - авторизация не требуется
 * @param req - Запрос с query-параметрами (search, sort, category, inStock, minRating)
 * @param res - Ответ Express
 * @throws {ValidationError} При невалидных query-параметрах (ZodError)
 * @returns 200 с массивом продуктов
 */
export async function getProducts(req: Request, res: Response): Promise<undefined> {
  try {
    // Валидация query-параметров через Zod
    const filters = productFiltersSchema.parse(req.query) as ProductFiltersInput;

    // Дополнительная валидация inStock (должна быть 'true' или 'false')
    if (filters.inStock !== undefined && !['true', 'false'].includes(filters.inStock)) {
      res.status(400).json({
        message: 'Некорректный параметр inStock. Допустимые значения: true, false',
        error: 'INVALID_INSTOCK_PARAMETER',
      });
      return;
    }

    // Дополнительная валидация minRating (должно быть число от 1 до 5)
    if (filters.minRating !== undefined) {
      const rating = parseFloat(filters.minRating);
      if (Number.isNaN(rating) || rating < 1 || rating > 5) {
        res.status(400).json({
          message: 'Некорректный параметр minRating. Допустимые значения: число от 1 до 5',
          error: 'INVALID_MINRATING_PARAMETER',
        });
        return;
      }
    }

    const products = await ProductService.getProducts(filters);
    res.json(products);
  } catch (error) {
    if (error instanceof z.ZodError) {
      // Обработка ошибок валидации Zod
      const firstIssue = error.issues[0];
      const field = firstIssue.path[0];
      let message = 'Некорректный параметр';
      let errorCode = 'INVALID_PARAMETER';

      if (field === 'sort') {
        message = 'Некорректный параметр sort. Допустимые значения: price_asc, price_desc';
        errorCode = 'INVALID_SORT_PARAMETER';
      }

      res.status(400).json({ message, error: errorCode });
      return;
    }

    // Обработка остальных ошибок
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
 * @param res - Ответ Express
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
 * Получить все продукты (без фильтрации)
 * Админский endpoint - требует прав администратора
 * @param req - Запрос (auth middleware установит req.user)
 * @param res - Ответ Express
 * @returns 200 с массивом всех продуктов
 */
export async function getAllProductsAdmin(_req: Request, res: Response): Promise<undefined> {
  const products = await ProductService.getAllProducts();
  res.json(products);
}

/**
 * Создать новый продукт
 * Админский endpoint - требует прав администратора
 * @param req - Запрос с данными продукта в теле
 * @param res - Ответ Express
 * @throws {ValidationError} При невалидных данных (ZodError)
 * @returns 201 с созданным продуктом
 */
export async function createProduct(req: Request, res: Response): Promise<undefined> {
  const validatedData = createProductSchema.parse(req.body) as CreateProductInput;

  const product = await ProductService.createProduct(validatedData);
  res.status(201).json(product);
}

/**
 * Обновить продукт по ID
 * Админский endpoint - требует прав администратора
 * @param req - Запрос с параметром id в URL и данными для обновления в теле
 * @param res - Ответ Express
 * @throws {ValidationError} При отсутствии id или невалидных данных (ZodError)
 * @throws {NotFoundError} Если продукт не найден
 * @returns 200 с обновлённым продуктом
 */
export async function updateProduct(req: Request, res: Response): Promise<undefined> {
  const { id } = req.params;

  if (!id) {
    throw new ValidationError('ID продукта не указан');
  }

  const validatedData = updateProductSchema.parse(req.body) as UpdateProductInput;

  const product = await ProductService.updateProduct(id, validatedData);

  if (!product) {
    throw new NotFoundError('Product not found');
  }

  res.json(product);
}

/**
 * Удалить продукт по ID
 * Админский endpoint - требует прав администратора
 * @param req - Запрос с параметром id в URL
 * @param res - Ответ Express
 * @throws {ValidationError} При отсутствии id
 * @throws {NotFoundError} Если продукт не найден
 * @returns 204 No Content
 */
export async function deleteProduct(req: Request, res: Response): Promise<undefined> {
  const { id } = req.params;

  if (!id) {
    throw new ValidationError('ID продукта не указан');
  }

  const deleted = await ProductService.deleteProduct(id);

  if (!deleted) {
    throw new NotFoundError('Product not found');
  }

  res.status(204).send();
}
