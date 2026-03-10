/**
 * Сервис заказов - L_Shop Frontend
 * API запросы для работы с заказами
 */

import { api } from './api';
import { Order, CreateOrderData } from '../types/order';

/**
 * Сервис для работы с заказами
 */
export class OrderService {
  /**
   * Создать новый заказ
   * @param data - Данные для создания заказа
   * @returns Созданный заказ
   */
  async createOrder(data: CreateOrderData): Promise<Order> {
    return api.post<Order>('/api/orders', data);
  }

  /**
   * Получить все заказы пользователя
   * @returns Массив заказов
   */
  async getOrders(): Promise<Order[]> {
    const response = await api.get<{
      orders: Order[];
      pagination: { total: number; limit: number; offset: number; hasMore: boolean };
    }>('/api/orders');
    // API возвращает { orders: [], pagination: {} }, возвращаем массив заказов
    return response.orders || [];
  }

  /**
   * Получить заказ по ID
   * @param orderId - ID заказа
   * @returns Заказ
   */
  async getOrderById(orderId: string): Promise<Order> {
    return api.get<Order>(`/api/orders/${orderId}`);
  }
}

/**
 * Экземпляр сервиса заказов
 */
export const orderService = new OrderService();
