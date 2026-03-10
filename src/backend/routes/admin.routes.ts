/**
 * Маршруты админ-панели - L_Shop
 * Защищённые endpoints для управления товарами, заказами и пользователями
 * Требуют роль admin
 */

import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { requireAdmin } from '../middleware/admin.middleware';
import { asyncHandler } from '../middleware/error.middleware';
import {
  getAllProductsAdmin,
  getProductByIdAdmin,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductsStatsAdmin,
  bulkUpdateStock,
} from '../controllers/product.controller';
import {
  getAllOrdersAdmin,
  getOrderByIdAdmin,
  updateOrderStatusAdmin,
  deleteOrderAdmin,
  getOrdersStatsAdmin,
} from '../controllers/order.controller';
import {
  getAllUsers,
  getUserById,
  updateUserRole,
  toggleUserBlock,
  deleteUser,
  getUsersStats,
} from '../controllers/user.controller';

const router = Router();

// ==================== Продукты ====================

/**
 * GET /api/admin/products
 * Получить все продукты с пагинацией и фильтрацией
 */
router.get('/products', authMiddleware, requireAdmin, asyncHandler(getAllProductsAdmin));

/**
 * GET /api/admin/products/stats
 * Получить статистику по продуктам
 */
router.get('/products/stats', authMiddleware, requireAdmin, asyncHandler(getProductsStatsAdmin));

/**
 * GET /api/admin/products/:id
 * Получить продукт по ID
 */
router.get('/products/:id', authMiddleware, requireAdmin, asyncHandler(getProductByIdAdmin));

/**
 * POST /api/admin/products
 * Создать новый продукт
 */
router.post('/products', authMiddleware, requireAdmin, asyncHandler(createProduct));

/**
 * PUT /api/admin/products/:id
 * Обновить продукт
 */
router.put('/products/:id', authMiddleware, requireAdmin, asyncHandler(updateProduct));

/**
 * DELETE /api/admin/products/:id
 * Удалить продукт
 */
router.delete('/products/:id', authMiddleware, requireAdmin, asyncHandler(deleteProduct));

/**
 * PUT /api/admin/products/bulk/stock
 * Массовое обновление наличия продуктов
 */
router.put('/products/bulk/stock', authMiddleware, requireAdmin, asyncHandler(bulkUpdateStock));

// ==================== Заказы ====================

/**
 * GET /api/admin/orders
 * Получить все заказы с пагинацией и фильтрацией
 */
router.get('/orders', authMiddleware, requireAdmin, asyncHandler(getAllOrdersAdmin));

/**
 * GET /api/admin/orders/stats
 * Получить статистику по заказам
 */
router.get('/orders/stats', authMiddleware, requireAdmin, asyncHandler(getOrdersStatsAdmin));

/**
 * GET /api/admin/orders/:id
 * Получить заказ по ID
 */
router.get('/orders/:id', authMiddleware, requireAdmin, asyncHandler(getOrderByIdAdmin));

/**
 * PUT /api/admin/orders/:id/status
 * Обновить статус заказа
 */
router.put(
  '/orders/:id/status',
  authMiddleware,
  requireAdmin,
  asyncHandler(updateOrderStatusAdmin),
);

/**
 * DELETE /api/admin/orders/:id
 * Удалить заказ
 */
router.delete('/orders/:id', authMiddleware, requireAdmin, asyncHandler(deleteOrderAdmin));

// ==================== Пользователи ====================

/**
 * GET /api/admin/users
 * Получить всех пользователей с пагинацией и фильтрацией
 */
router.get('/users', authMiddleware, requireAdmin, asyncHandler(getAllUsers));

/**
 * GET /api/admin/users/stats
 * Получить статистику по пользователям
 */
router.get('/users/stats', authMiddleware, requireAdmin, asyncHandler(getUsersStats));

/**
 * GET /api/admin/users/:id
 * Получить пользователя по ID
 */
router.get('/users/:id', authMiddleware, requireAdmin, asyncHandler(getUserById));

/**
 * PUT /api/admin/users/:id/role
 * Изменить роль пользователя
 */
router.put('/users/:id/role', authMiddleware, requireAdmin, asyncHandler(updateUserRole));

/**
 * PUT /api/admin/users/:id/block
 * Заблокировать/разблокировать пользователя
 */
router.put('/users/:id/block', authMiddleware, requireAdmin, asyncHandler(toggleUserBlock));

/**
 * DELETE /api/admin/users/:id
 * Удалить пользователя
 */
router.delete('/users/:id', authMiddleware, requireAdmin, asyncHandler(deleteUser));

export default router;
