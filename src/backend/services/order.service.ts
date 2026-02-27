/**
 * Сервис заказов - L_Shop
 * Создание и управление заказами пользователей
 */

import { readJsonFile, writeJsonFile } from '../utils/file.utils';
import { Order, OrderItem, CreateOrderData } from '../models/order.model';
import { Cart } from '../models/cart.model';
import { Product } from '../models/product.model';
import { generateId } from '../utils/id.utils';

const ORDERS_FILE = 'orders.json';
const CARTS_FILE = 'carts.json';
const PRODUCTS_FILE = 'products.json';

/**
 * Сервис для работы с заказами
 */
export class OrderService {
  /**
   * Создать новый заказ из корзины пользователя
   * @param userId - ID пользователя
   * @param data - Данные для создания заказа
   * @returns Созданный заказ
   * @throws Error если корзина пуста
   */
  async createOrder(userId: string, data: CreateOrderData): Promise<Order> {
    // 1. Получить корзину пользователя
    const carts = await readJsonFile<Cart>(CARTS_FILE);
    const cart = carts.find((c) => c.userId === userId);

    if (!cart || cart.items.length === 0) {
      throw new Error('Cart is empty');
    }

    // 2. Получить продукты для копирования данных
    const products = await readJsonFile<Product>(PRODUCTS_FILE);

    // 3. Создать элементы заказа с копией данных продуктов
    const orderItems: OrderItem[] = cart.items.map((item) => {
      const product = products.find((p) => p.id === item.productId);
      return {
        productId: item.productId,
        name: product?.name || 'Unknown',
        price: product?.price || 0,
        quantity: item.quantity,
        discountPercent: product?.discountPercent,
      };
    });

    // 4. Рассчитать общую сумму с учётом скидок
    const totalSum = orderItems.reduce((sum, item) => {
      const discount = item.discountPercent || 0;
      const itemPrice = item.price * item.quantity * (1 - discount / 100);
      return sum + itemPrice;
    }, 0);

    // 5. Создать заказ
    const orders = await readJsonFile<Order>(ORDERS_FILE);
    const newOrder: Order = {
      id: generateId(),
      userId,
      items: orderItems,
      deliveryAddress: data.deliveryAddress,
      phone: data.phone,
      email: data.email,
      paymentMethod: data.paymentMethod,
      deliveryType: data.deliveryType, // Вариант 24
      comment: data.comment, // Вариант 24
      status: 'pending',
      totalSum: Math.round(totalSum * 100) / 100, // Округление до 2 знаков
      createdAt: new Date().toISOString(),
    };

    orders.push(newOrder);
    await writeJsonFile(ORDERS_FILE, orders);

    // 6. Очистить корзину пользователя
    const updatedCarts = carts.map((c) =>
      c.userId === userId
        ? { ...c, items: [], updatedAt: new Date().toISOString() }
        : c,
    );
    await writeJsonFile(CARTS_FILE, updatedCarts);

    return newOrder;
  }

  /**
   * Получить все заказы пользователя
   * @param userId - ID пользователя
   * @returns Массив заказов, отсортированный по дате создания (новые первыми)
   */
  async getOrders(userId: string): Promise<Order[]> {
    const orders = await readJsonFile<Order>(ORDERS_FILE);
    return orders
      .filter((o) => o.userId === userId)
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
  }

  /**
   * Получить конкретный заказ пользователя по ID
   * @param userId - ID пользователя
   * @param orderId - ID заказа
   * @returns Заказ или null, если не найден
   */
  async getOrderById(userId: string, orderId: string): Promise<Order | null> {
    const orders = await readJsonFile<Order>(ORDERS_FILE);
    return orders.find((o) => o.userId === userId && o.id === orderId) || null;
  }

  /**
   * Обновить статус заказа
   * @param orderId - ID заказа
   * @param status - Новый статус
   * @returns Обновлённый заказ или null
   */
  async updateOrderStatus(
    orderId: string,
    status: Order['status'],
  ): Promise<Order | null> {
    const orders = await readJsonFile<Order>(ORDERS_FILE);
    const index = orders.findIndex((o) => o.id === orderId);

    if (index === -1) {
      return null;
    }

    orders[index] = {
      ...orders[index],
      status,
      updatedAt: new Date().toISOString(),
    };

    await writeJsonFile(ORDERS_FILE, orders);
    return orders[index];
  }
}