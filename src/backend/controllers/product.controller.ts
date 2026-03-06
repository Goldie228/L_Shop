/**
 * Контроллер продуктов - L_Shop
 * Обрабатывает получение списка продуктов и отдельного продукта
 */

import { Request, Response } from 'express';
import { ProductService, ProductFilters } from '../services/product.service';

const productService = new ProductService();

/**
 * Получить список продуктов с фильтрацией
 * Публичный endpoint - авторизация не требуется
 */
export async function getProducts(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    // Извлечение query-параметров
    const filters: ProductFilters = {
      search: req.query.search as string | undefined,
      sort: req.query.sort as string | undefined,
      category: req.query.category as string | undefined,
      inStock: req.query.inStock as string | undefined,
      minRating: req.query.minRating as string | undefined,
    };

    // Валидация параметра sort
    if (filters.sort && !['price_asc', 'price_desc'].includes(filters.sort)) {
      res.status(400).json({
        message: 'Некорректный параметр sort. Допустимые значения: price_asc, price_desc',
        error: 'INVALID_SORT_PARAMETER',
      });
      return;
    }

    // Валидация параметра inStock
    if (filters.inStock !== undefined && !['true', 'false'].includes(filters.inStock)) {
      res.status(400).json({
        message: 'Некорректный параметр inStock. Допустимые значения: true, false',
        error: 'INVALID_INSTOCK_PARAMETER',
      });
      return;
    }

    // Валидация параметра minRating (Вариант 17)
    if (filters.minRating !== undefined) {
      const rating = Number(filters.minRating);
      if (Number.isNaN(rating) || rating < 1 || rating > 5) {
        res.status(400).json({
          message: 'Некорректный параметр minRating. Допустимые значения: число от 1 до 5',
          error: 'INVALID_MINRATING_PARAMETER',
        });
        return;
      }
    }

    const products = await productService.getProducts(filters);
    res.json(products);
  } catch (error) {
    console.error('[ProductController] Ошибка получения продуктов:', error);
    res.status(500).json({
      message: 'Ошибка при получении продуктов',
      error: 'GET_PRODUCTS_ERROR',
    });
  }
}

/**
 * Получить продукт по ID
 * Публичный endpoint - авторизация не требуется
 */
export async function getProductById(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const { id } = req.params;

    if (!id) {
      res.status(400).json({
        message: 'ID продукта не указан',
        error: 'MISSING_PRODUCT_ID',
      });
      return;
    }

    const product = await productService.getProductById(id);

    if (!product) {
      res.status(404).json({
        message: 'Product not found',
        error: 'PRODUCT_NOT_FOUND',
      });
      return;
    }

    res.json(product);
  } catch (error) {
    console.error('[ProductController] Ошибка получения продукта:', error);
    res.status(500).json({
      message: 'Ошибка при получении продукта',
      error: 'GET_PRODUCT_ERROR',
    });
  }
}