/**
 * Сервис администрирования - L_Shop Frontend
 * API запросы для работы с товарами, заказами и пользователями
 */

import { api } from './api.js';
import { ADMIN_ENDPOINTS } from '../types/api.js';
import { Product } from '../types/product.js';
import { Order, OrderStatus } from '../types/order.js';
import { User, UserRole } from '../types/user.js';

/**
 * Данные для создания/обновления товара
 */
export interface CreateProductData {
  name: string;
  description: string;
  price: number;
  category: string;
  inStock: boolean;
  imageUrl?: string;
  discountPercent?: number;
  rating?: number;
  reviewsCount?: number;
}

/**
 * Ответ API при обновлении статуса заказа
 */
interface UpdateOrderStatusResponse {
  order: Order;
  message: string;
}

/**
 * Ответ API при обновлении роли пользователя
 */
interface UpdateUserRoleResponse {
  user: User;
  message: string;
}

/**
 * Ответ API при блокировке/разблокировке пользователя
 */
interface ToggleUserBlockResponse {
  user: User;
  message: string;
}

/**
 * Сервис для администрирования магазина
 */
export class AdminService {
  // ============ ТОВАРЫ ============

  /**
   * Получить все товары
   * @returns Массив товаров
   */
  public static async getAllProducts(): Promise<Product[]> {
    console.log('[AdminService] Загрузка всех товаров');
    return api.get<Product[]>(ADMIN_ENDPOINTS.PRODUCTS);
  }

  /**
   * Создать новый товар
   * @param product - Данные товара
   * @returns Созданный товар
   */
  public static async createProduct(product: CreateProductData): Promise<Product> {
    console.log('[AdminService] Создание товара:', product.name);
    return api.post<Product>(ADMIN_ENDPOINTS.PRODUCTS, product);
  }

  /**
   * Обновить товар
   * @param id - ID товара
   * @param product - Данные для обновления
   * @returns Обновлённый товар
   */
  public static async updateProduct(id: string, product: CreateProductData): Promise<Product> {
    console.log('[AdminService] Обновление товара:', id);
    return api.put<Product>(`${ADMIN_ENDPOINTS.PRODUCTS}/${id}`, product);
  }

  /**
   * Удалить товар
   * @param id - ID товара
   */
  public static async deleteProduct(id: string): Promise<void> {
    console.log('[AdminService] Удаление товара:', id);
    return api.delete<void>(`${ADMIN_ENDPOINTS.PRODUCTS}/${id}`);
  }

  // ============ ЗАКАЗЫ ============

  /**
   * Получить все заказы
   * @returns Массив заказов
   */
  public static async getAllOrders(): Promise<Order[]> {
    console.log('[AdminService] Загрузка всех заказов');
    return api.get<Order[]>(ADMIN_ENDPOINTS.ORDERS);
  }

  /**
   * Обновить статус заказа
   * @param id - ID заказа
   * @param status - Новый статус
   * @returns Обновлённый заказ
   */
  public static async updateOrderStatus(
    id: string,
    status: OrderStatus
  ): Promise<Order> {
    console.log('[AdminService] Обновление статуса заказа:', id, status);
    const response = await api.put<UpdateOrderStatusResponse>(
      `${ADMIN_ENDPOINTS.ORDERS}/${id}/status`,
      { status }
    );
    return response.order;
  }

  /**
   * Удалить заказ
   * @param id - ID заказа
   */
  public static async deleteOrder(id: string): Promise<void> {
    console.log('[AdminService] Удаление заказа:', id);
    return api.delete<void>(`${ADMIN_ENDPOINTS.ORDERS}/${id}`);
  }

  // ============ ПОЛЬЗОВАТЕЛИ ============

  /**
   * Получить всех пользователей
   * @returns Массив пользователей
   */
  public static async getAllUsers(): Promise<User[]> {
    console.log('[AdminService] Загрузка всех пользователей');
    return api.get<User[]>(ADMIN_ENDPOINTS.USERS);
  }

  /**
   * Обновить роль пользователя
   * @param id - ID пользователя
   * @param role - Новая роль
   * @returns Обновлённый пользователь
   */
  public static async updateUserRole(id: string, role: UserRole): Promise<User> {
    console.log('[AdminService] Обновление роли пользователя:', id, role);
    const response = await api.put<UpdateUserRoleResponse>(
      `${ADMIN_ENDPOINTS.USERS}/${id}/role`,
      { role }
    );
    return response.user;
  }

  /**
   * Заблокировать/разблокировать пользователя
   * @param id - ID пользователя
   * @returns Обновлённый пользователь
   */
  public static async toggleUserBlock(id: string): Promise<User> {
    console.log('[AdminService] Переключение блокировки пользователя:', id);
    const response = await api.put<ToggleUserBlockResponse>(
      `${ADMIN_ENDPOINTS.USERS}/${id}/block`,
      {}
    );
    return response.user;
  }
}

/**
 * Экземпляр сервиса администрирования
 */
export const adminService = AdminService;
