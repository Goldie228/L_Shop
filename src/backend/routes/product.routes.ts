/**
 * Маршруты продуктов - L_Shop
 * Публичные endpoints для получения продуктов
 */

import { Router } from 'express';
import { getProducts, getProductById } from '../controllers/product.controller';

const router = Router();

/**
 * GET /api/products
 * Получить список продуктов с фильтрацией
 * Query параметры: search, sort, category, inStock, minRating
 */
router.get('/', getProducts);

/**
 * GET /api/products/:id
 * Получить продукт по ID
 */
router.get('/:id', getProductById);

export default router;