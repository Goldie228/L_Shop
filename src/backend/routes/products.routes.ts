/**
 * Маршруты для работы с товарами
 * Публичные маршруты, доступные всем
 */

import { Router } from 'express';
import { getAllProducts, getProductById } from '../controllers/products.controller';

const router = Router();

// Публичные маршруты
router.get('/', getAllProducts);
router.get('/:id', getProductById);

export default router;
