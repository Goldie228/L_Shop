/**
 * Маршруты продуктов - L_Shop
 * Публичные endpoints для получения продуктов
 */

import { Router } from 'express';
import { getProducts, getProductById, getCategories } from '../controllers/product.controller';
import { asyncHandler } from '../middleware/error.middleware';

const router = Router();

/**
 * GET /api/products
 * Получить список продуктов с фильтрацией и пагинацией
 * Query параметры: search, sort, category, inStock, minRating, limit, offset
 */
router.get('/', asyncHandler(getProducts));

/**
 * GET /api/products/categories
 * Получить список всех категорий
 */
router.get('/categories', asyncHandler(getCategories));

/**
 * GET /api/products/:id
 * Получить продукт по ID
 */
router.get('/:id', asyncHandler(getProductById));

export default router;
