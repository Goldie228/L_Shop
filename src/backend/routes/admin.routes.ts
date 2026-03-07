/**
 * Маршруты админ-панели - L_Shop
 * Защищённые endpoints для управления товарами, заказами и пользователями
 * Требуют роль admin
 */

import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { requireAdmin } from '../middleware/admin.middleware';
import {
  getAllProductsAdmin,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../controllers/product.controller';
import {
  getAllOrdersAdmin,
  updateOrderStatus,
  deleteOrderAdmin,
} from '../controllers/order.controller';
import { getAllUsers, updateUserRole, toggleUserBlock } from '../controllers/user.controller';

const router = Router();

// Продукты
/**
 * GET /api/admin/products
 * Получить все продукты (админ)
 */
router.get('/products', authMiddleware, requireAdmin, getAllProductsAdmin);

/**
 * POST /api/admin/products
 * Создать новый продукт
 */
router.post('/products', authMiddleware, requireAdmin, createProduct);

/**
 * PUT /api/admin/products/:id
 * Обновить продукт
 */
router.put('/products/:id', authMiddleware, requireAdmin, updateProduct);

/**
 * DELETE /api/admin/products/:id
 * Удалить продукт
 */
router.delete('/products/:id', authMiddleware, requireAdmin, deleteProduct);

// Заказы
/**
 * GET /api/admin/orders
 * Получить все заказы (админ)
 */
router.get('/orders', authMiddleware, requireAdmin, getAllOrdersAdmin);

/**
 * PUT /api/admin/orders/:id/status
 * Обновить статус заказа
 */
router.put('/orders/:id/status', authMiddleware, requireAdmin, updateOrderStatus);

/**
 * DELETE /api/admin/orders/:id
 * Удалить заказ
 */
router.delete('/orders/:id', authMiddleware, requireAdmin, deleteOrderAdmin);

// Пользователи
/**
 * GET /api/admin/users
 * Получить всех пользователей (админ)
 */
router.get('/users', authMiddleware, requireAdmin, getAllUsers);

/**
 * PUT /api/admin/users/:id/role
 * Изменить роль пользователя
 */
router.put('/users/:id/role', authMiddleware, requireAdmin, updateUserRole);

/**
 * PUT /api/admin/users/:id/block
 * Заблокировать/разблокировать пользователя
 */
router.put('/users/:id/block', authMiddleware, requireAdmin, toggleUserBlock);

export default router;
