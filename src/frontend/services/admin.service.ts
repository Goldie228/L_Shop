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
 * Данные пагинации
 */
export interface Pagination {
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

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
 * Ответ API со списком товаров
 */
interface ProductsResponse {
  products: Product[];
  pagination: Pagination;
}

/**
 * Ответ API со списком заказов
 */
interface OrdersResponse {
  orders: Order[];
  pagination: Pagination;
}

/**
 * Ответ API со списком пользователей
 */
interface UsersResponse {
  users: User[];
  pagination: Pagination;
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
    const response = await api.get<ProductsResponse>(ADMIN_ENDPOINTS.PRODUCTS);
    return response.products || [];
  }

  /**
   * Создать новый товар
   * @param product - Данные товара
   * @returns Созданный товар
   */
  public static async createProduct(product: CreateProductData): Promise<Product> {
    return api.post<Product>(ADMIN_ENDPOINTS.PRODUCTS, product);
  }

  /**
   * Обновить товар
   * @param id - ID товара
   * @param product - Данные для обновления
   * @returns Обновлённый товар
   */
  public static async updateProduct(id: string, product: CreateProductData): Promise<Product> {
    return api.put<Product>(`${ADMIN_ENDPOINTS.PRODUCTS}/${id}`, product);
  }

  /**
   * Удалить товар
   * @param id - ID товара
   */
  public static async deleteProduct(id: string): Promise<void> {
    return api.delete<void>(`${ADMIN_ENDPOINTS.PRODUCTS}/${id}`);
  }

  // ============ ЗАКАЗЫ ============

  /**
   * Получить все заказы
   * @returns Массив заказов
   */
  public static async getAllOrders(): Promise<Order[]> {
    const response = await api.get<OrdersResponse>(ADMIN_ENDPOINTS.ORDERS);
    return response.orders || [];
  }

  /**
   * Обновить статус заказа
   * @param id - ID заказа
   * @param status - Новый статус
   * @returns Обновлённый заказ
   */
  public static async updateOrderStatus(id: string, status: OrderStatus): Promise<Order> {
    const response = await api.put<UpdateOrderStatusResponse>(
      `${ADMIN_ENDPOINTS.ORDERS}/${id}/status`,
      { status },
    );
    return response.order;
  }

  /**
   * Удалить заказ
   * @param id - ID заказа
   */
  public static async deleteOrder(id: string): Promise<void> {
    return api.delete<void>(`${ADMIN_ENDPOINTS.ORDERS}/${id}`);
  }

  // ============ ПОЛЬЗОВАТЕЛИ ============

  /**
   * Получить всех пользователей
   * @returns Массив пользователей
   */
  public static async getAllUsers(): Promise<User[]> {
    const response = await api.get<UsersResponse>(ADMIN_ENDPOINTS.USERS);
    return response.users || [];
  }

  /**
   * Обновить роль пользователя
   * @param id - ID пользователя
   * @param role - Новая роль
   * @returns Обновлённый пользователь
   */
  public static async updateUserRole(id: string, role: UserRole): Promise<User> {
    const response = await api.put<UpdateUserRoleResponse>(`${ADMIN_ENDPOINTS.USERS}/${id}/role`, {
      role,
    });
    return response.user;
  }

  /**
   * Заблокировать/разблокировать пользователя
   * @param id - ID пользователя
   * @returns Обновлённый пользователь
   */
  public static async toggleUserBlock(id: string): Promise<User> {
    const response = await api.put<ToggleUserBlockResponse>(
      `${ADMIN_ENDPOINTS.USERS}/${id}/block`,
      {},
    );
    return response.user;
  }
}

/**
 * Экземпляр сервиса администрирования
 */
export const adminService = AdminService;
