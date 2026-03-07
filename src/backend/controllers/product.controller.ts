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
export async function getProducts(req: Request, res: Response): Promise<void> {
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
export async function getProductById(req: Request, res: Response): Promise<void> {
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

/**
 * Получить все продукты (админ)
 * GET /api/admin/products
 */
export async function getAllProductsAdmin(_req: Request, res: Response): Promise<void> {
  try {
    const products = await productService.getAllProducts();
    res.json(products);
  } catch (error) {
    console.error('[ProductController] Ошибка получения всех продуктов:', error);
    res.status(500).json({
      message: 'Ошибка при получении всех продуктов',
      error: 'GET_ALL_PRODUCTS_ERROR',
    });
  }
}

/**
 * Создать новый продукт (админ)
 * POST /api/admin/products
 */
export async function createProduct(req: Request, res: Response): Promise<void> {
  try {
    const {
      name,
      description,
      price,
      category,
      inStock,
      imageUrl,
      discountPercent,
      rating,
      reviewsCount,
    } = req.body;

    // Валидация обязательных полей
    if (!name || !description || price === undefined || !category || inStock === undefined) {
      res.status(400).json({
        message: 'Обязательные поля: name, description, price, category, inStock',
        error: 'MISSING_REQUIRED_FIELDS',
      });
      return;
    }

    // Валидация цены
    if (typeof price !== 'number' || price < 0) {
      res.status(400).json({
        message: 'Цена должна быть неотрицательным числом',
        error: 'INVALID_PRICE',
      });
      return;
    }

    // Валидация inStock (должен быть boolean)
    if (typeof inStock !== 'boolean') {
      res.status(400).json({
        message: 'Поле inStock должно быть булевым значением',
        error: 'INVALID_IN_STOCK',
      });
      return;
    }

    // Валидация discountPercent если указано
    if (discountPercent !== undefined) {
      if (typeof discountPercent !== 'number' || discountPercent < 0 || discountPercent > 100) {
        res.status(400).json({
          message: 'Скидка должна быть числом от 0 до 100',
          error: 'INVALID_DISCOUNT',
        });
        return;
      }
    }

    // Валидация rating если указано
    if (rating !== undefined) {
      if (typeof rating !== 'number' || rating < 1 || rating > 5) {
        res.status(400).json({
          message: 'Рейтинг должен быть числом от 1 до 5',
          error: 'INVALID_RATING',
        });
        return;
      }
    }

    // Валидация reviewsCount если указано
    if (reviewsCount !== undefined) {
      if (typeof reviewsCount !== 'number' || reviewsCount < 0) {
        res.status(400).json({
          message: 'Количество отзывов должно быть неотрицательным числом',
          error: 'INVALID_REVIEWS_COUNT',
        });
        return;
      }
    }

    const product = await productService.createProduct({
      name: name.trim(),
      description: description.trim(),
      price,
      category: category.trim(),
      inStock,
      imageUrl: imageUrl?.trim(),
      discountPercent,
      rating,
      reviewsCount,
    });

    res.status(201).json(product);
  } catch (error) {
    console.error('[ProductController] Ошибка создания продукта:', error);
    res.status(500).json({
      message: 'Ошибка при создании продукта',
      error: 'CREATE_PRODUCT_ERROR',
    });
  }
}

/**
 * Обновить продукт (админ)
 * PUT /api/admin/products/:id
 */
export async function updateProduct(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    if (!id) {
      res.status(400).json({
        message: 'ID продукта не указан',
        error: 'MISSING_PRODUCT_ID',
      });
      return;
    }

    const {
      name,
      description,
      price,
      category,
      inStock,
      imageUrl,
      discountPercent,
      rating,
      reviewsCount,
    } = req.body;

    // Валидация цены если указана
    if (price !== undefined) {
      if (typeof price !== 'number' || price < 0) {
        res.status(400).json({
          message: 'Цена должна быть неотрицательным числом',
          error: 'INVALID_PRICE',
        });
        return;
      }
    }

    // Валидация inStock если указано
    if (inStock !== undefined) {
      if (typeof inStock !== 'boolean') {
        res.status(400).json({
          message: 'Поле inStock должно быть булевым значением',
          error: 'INVALID_IN_STOCK',
        });
        return;
      }
    }

    // Валидация discountPercent если указано
    if (discountPercent !== undefined) {
      if (typeof discountPercent !== 'number' || discountPercent < 0 || discountPercent > 100) {
        res.status(400).json({
          message: 'Скидка должна быть числом от 0 до 100',
          error: 'INVALID_DISCOUNT',
        });
        return;
      }
    }

    // Валидация rating если указано
    if (rating !== undefined) {
      if (typeof rating !== 'number' || rating < 1 || rating > 5) {
        res.status(400).json({
          message: 'Рейтинг должен быть числом от 1 до 5',
          error: 'INVALID_RATING',
        });
        return;
      }
    }

    // Валидация reviewsCount если указано
    if (reviewsCount !== undefined) {
      if (typeof reviewsCount !== 'number' || reviewsCount < 0) {
        res.status(400).json({
          message: 'Количество отзывов должно быть неотрицательным числом',
          error: 'INVALID_REVIEWS_COUNT',
        });
        return;
      }
    }

    const product = await productService.updateProduct(id, {
      name: name?.trim(),
      description: description?.trim(),
      price,
      category: category?.trim(),
      inStock,
      imageUrl: imageUrl?.trim(),
      discountPercent,
      rating,
      reviewsCount,
    });

    if (!product) {
      res.status(404).json({
        message: 'Product not found',
        error: 'PRODUCT_NOT_FOUND',
      });
      return;
    }

    res.json(product);
  } catch (error) {
    console.error('[ProductController] Ошибка обновления продукта:', error);
    res.status(500).json({
      message: 'Ошибка при обновлении продукта',
      error: 'UPDATE_PRODUCT_ERROR',
    });
  }
}

/**
 * Удалить продукт (админ)
 * DELETE /api/admin/products/:id
 */
export async function deleteProduct(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    if (!id) {
      res.status(400).json({
        message: 'ID продукта не указан',
        error: 'MISSING_PRODUCT_ID',
      });
      return;
    }

    const deleted = await productService.deleteProduct(id);

    if (!deleted) {
      res.status(404).json({
        message: 'Product not found',
        error: 'PRODUCT_NOT_FOUND',
      });
      return;
    }

    res.status(204).send(); // No Content
  } catch (error) {
    console.error('[ProductController] Ошибка удаления продукта:', error);
    res.status(500).json({
      message: 'Ошибка при удалении продукта',
      error: 'DELETE_PRODUCT_ERROR',
    });
  }
}
