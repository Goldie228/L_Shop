/**
 * Сервис заказов - L_Shop
 * Создание и управление заказами пользователей
 */

import { modifyJsonFile, readJsonFile } from '../utils/file.utils';
import { Order, OrderItem, CreateOrderData } from '../models/order.model';
import { Cart } from '../models/cart.model';
import { Product } from '../models/product.model';
import { generateId } from '../utils/id.utils';
import { validate, createOrderSchema, updateOrderStatusSchema } from '../utils/validation';
import { createContextLogger } from '../utils/logger';
import {
  ValidationError, NotFoundError, OrderError, BusinessRuleError,
} from '../errors';

const logger = createContextLogger('OrderService');
const ORDERS_FILE = 'orders.json';
const CARTS_FILE = 'carts.json';
const PRODUCTS_FILE = 'products.json';

/**
 * Параметры для получения списка заказов (админ)
 */
export interface GetOrdersParams {
  status?: Order['status'];
  userId?: string;
  dateFrom?: string;
  dateTo?: string;
  limit?: number;
  offset?: number;
  sort?: 'created_at_desc' | 'created_at_asc' | 'total_desc' | 'total_asc';
}

/**
 * Результат получения списка заказов с пагинацией
 */
export interface GetOrdersResult {
  orders: Order[];
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

/**
 * Статистика заказов
 */
export interface OrdersStats {
  total: number;
  byStatus: Record<Order['status'], number>;
  totalRevenue: number;
  averageOrderValue: number;
}

/**
 * Сервис для работы с заказами
 */
export class OrderService {
  // Кэш заказов пользователей (userId -> Order[])
  static orderCache = new Map<string, Order[]>();

  static orderCacheTimestamps = new Map<string, number>();

  // Максимальное количество записей в кэше (LRU)
  private static readonly MAX_CACHE_SIZE = 100;

  // Кэш продуктов (аналогично cart.service)
  private static productsCache: Product[] | null = null;

  private static productsCacheTime = 0;

  private static readonly CACHE_TTL = 5 * 60 * 1000; // 5 минут

  /**
   * Создать новый заказ из корзины пользователя
   */
  async createOrder(userId: string, data: CreateOrderData): Promise<Order> {
    // 1. Валидация входных данных
    const validationResult = validate(createOrderSchema, data);
    if (!validationResult.success) {
      throw new ValidationError(validationResult.error ?? 'Невалидные данные', {
        field: validationResult.field,
        data,
      });
    }

    try {
      // 2. Получить корзину пользователя и продукты атомарно
      const [carts, products] = await Promise.all([
        readJsonFile<Cart>(CARTS_FILE),
        OrderService.getProducts(),
      ]);

      const cart = carts.find((c) => c.userId === userId);

      if (!cart || cart.items.length === 0) {
        throw new BusinessRuleError('Корзина пуста', { userId });
      }

      // 3. Создать элементы заказа с копией данных продуктов и проверкой наличия
      const orderItems = await this.enrichOrderItems(cart.items, products);

      // 4. Рассчитать общую сумму
      const totalSum = this.calculateOrderTotal(orderItems);

      // 5. Создать заказ атомарно
      const newOrder: Order = {
        id: generateId(),
        userId,
        firstName: data.firstName,
        items: orderItems,
        deliveryAddress: data.deliveryAddress,
        phone: data.phone,
        email: data.email,
        paymentMethod: data.paymentMethod,
        deliveryType: data.deliveryType,
        comment: data.comment,
        status: 'pending',
        totalSum,
        currency: 'BYN',
        createdAt: new Date().toISOString(),
      };

      // Атомарно добавляем заказ и очищаем корзину
      await modifyJsonFile<Order>(ORDERS_FILE, (orders) => {
        orders.push(newOrder);
        return orders;
      });

      await modifyJsonFile<Cart>(CARTS_FILE, (currentCarts) => {
        const cartIndex = currentCarts.findIndex((c) => c.userId === userId);
        if (cartIndex !== -1) {
          // eslint-disable-next-line no-param-reassign
          currentCarts[cartIndex].items = [];
          // eslint-disable-next-line no-param-reassign
          currentCarts[cartIndex].updatedAt = new Date().toISOString();
        }
        return currentCarts;
      });

      // 6. Инвалидировать кэш
      OrderService.invalidateCache(userId);

      logger.info({ userId, orderId: newOrder.id, totalSum }, 'Заказ создан успешно');
      return newOrder;
    } catch (error) {
      if (
        error instanceof ValidationError
        || error instanceof NotFoundError
        || error instanceof BusinessRuleError
      ) {
        throw error;
      }
      logger.error({ userId, data, error }, 'Ошибка создания заказа');
      throw new OrderError(
        `Не удалось создать заказ: ${
          error instanceof Error ? error.message : 'Неизвестная ошибка'
        }`,
        { userId, originalError: error },
      );
    }
  }

  /**
   * Получить все заказы пользователя
   */
  async getOrders(userId: string): Promise<Order[]> {
    try {
      // Проверяем кэш
      const cached = OrderService.getCachedOrders(userId);
      if (cached) {
        logger.debug({ userId }, 'Заказы получены из кэша');
        return cached;
      }

      const orders = await OrderService.getOrdersInternal();
      const userOrders = orders
        .filter((o) => o.userId === userId)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      // Сохраняем в кэш
      OrderService.setCachedOrders(userId, userOrders);

      return userOrders;
    } catch (error) {
      logger.error({ userId, error }, 'Ошибка получения заказов');
      throw new OrderError(
        `Не удалось получить заказы: ${
          error instanceof Error ? error.message : 'Неизвестная ошибка'
        }`,
        { userId, originalError: error },
      );
    }
  }

  /**
   * Получить конкретный заказ пользователя по ID
   */
  async getOrderById(userId: string, orderId: string): Promise<Order | null> {
    try {
      let userOrders: Order[];

      // Пробуем получить из кэша
      const cached = OrderService.getCachedOrders(userId);
      if (cached) {
        userOrders = cached;
      } else {
        // Читаем все заказы и фильтруем
        const allOrders = await OrderService.getOrdersInternal();
        userOrders = allOrders
          .filter((o) => o.userId === userId)
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        // Кэшируем заказы пользователя
        OrderService.setCachedOrders(userId, userOrders);
      }

      const order = userOrders.find((o) => o.id === orderId) || null;
      return order;
    } catch (error) {
      logger.error({ userId, orderId, error }, 'Ошибка получения заказа');
      throw new OrderError(
        `Не удалось получить заказ: ${
          error instanceof Error ? error.message : 'Неизвестная ошибка'
        }`,
        { userId, orderId, originalError: error },
      );
    }
  }

  /**
   * Обновить статус заказа
   */
  async updateOrderStatus(orderId: string, status: Order['status']): Promise<Order | null> {
    // Валидация статуса
    const validationResult = validate(updateOrderStatusSchema, { status });
    if (!validationResult.success) {
      throw new ValidationError(validationResult.error ?? 'Невалидный статус', {
        field: validationResult.field,
        status,
      });
    }

    try {
      const updatedOrders = await modifyJsonFile<Order>(ORDERS_FILE, (orders) => {
        const index = orders.findIndex((o) => o.id === orderId);

        if (index === -1) {
          return orders;
        }
        // eslint-disable-next-line no-param-reassign
        orders[index] = {
          ...orders[index],
          status,
          updatedAt: new Date().toISOString(),
        };

        return orders;
      });

      const updatedOrder = updatedOrders.find((o) => o.id === orderId) || null;

      if (updatedOrder) {
        // Инвалидировать кэш для всех пользователей (статус может влиять на списки)
        OrderService.invalidateAllCache();
        logger.info({ orderId, status }, 'Статус заказа обновлён');
      }

      return updatedOrder;
    } catch (error) {
      if (error instanceof ValidationError) {
        throw error;
      }
      logger.error({ orderId, status, error }, 'Ошибка обновления статуса заказа');
      throw new OrderError(
        `Не удалось обновить статус заказа: ${
          error instanceof Error ? error.message : 'Неизвестная ошибка'
        }`,
        { orderId, originalError: error },
      );
    }
  }

  /**
   * Получить все заказы (для администратора)
   */
  async getAllOrders(): Promise<Order[]> {
    try {
      // Проверяем кэш
      const cacheKey = 'all-orders';
      const cached = OrderService.orderCache.get(cacheKey);
      if (cached) {
        // Проверяем TTL кэша (2 минуты)
        const cacheTime = OrderService.orderCacheTimestamps.get(cacheKey);
        if (cacheTime && Date.now() - cacheTime > 2 * 60 * 1000) {
          OrderService.orderCache.delete(cacheKey);
          OrderService.orderCacheTimestamps.delete(cacheKey);
          logger.debug('Кэш всех заказов устарел, загружаем заново');
        } else {
          logger.debug('Возвращаем все заказы из кэша');
          return cached;
        }
      }

      const allOrders = await OrderService.getOrdersInternal();

      // Сортируем по дате создания (новые первыми)
      const sorted = allOrders.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );

      // Кэшируем результат
      OrderService.orderCache.set(cacheKey, sorted);
      OrderService.orderCacheTimestamps.set(cacheKey, Date.now());

      return sorted;
    } catch (error) {
      logger.error({ error }, 'Ошибка получения всех заказов');
      throw new OrderError(
        `Не удалось получить все заказы: ${
          error instanceof Error ? error.message : 'Неизвестная ошибка'
        }`,
        { originalError: error },
      );
    }
  }

  /**
   * Удалить заказ по ID (для администратора)
   */
  async deleteOrder(orderId: string): Promise<boolean> {
    try {
      // Читаем текущие заказы
      const orders = await OrderService.getOrdersInternal();

      // Ищем заказ
      const orderIndex = orders.findIndex((o) => o.id === orderId);
      if (orderIndex === -1) {
        return false; // Заказ не найден
      }

      // Удаляем заказ атомарно
      await modifyJsonFile<Order>(ORDERS_FILE, (currentOrders) => {
        const index = currentOrders.findIndex((o) => o.id === orderId);
        if (index !== -1) {
          currentOrders.splice(index, 1);
        }
        return currentOrders;
      });

      // Инвалидировать весь кэш
      OrderService.invalidateAllCache();
      logger.info({ orderId }, 'Заказ удалён');

      return true;
    } catch (error) {
      logger.error({ orderId, error }, 'Ошибка удаления заказа');
      throw new OrderError(
        `Не удалось удалить заказ: ${
          error instanceof Error ? error.message : 'Неизвестная ошибка'
        }`,
        { orderId, originalError: error },
      );
    }
  }

  // ========== Приватные вспомогательные методы ==========

  /**
   * Обогатить элементы заказа данными продуктов и проверить наличие
   */
  private async enrichOrderItems(items: Cart['items'], products: Product[]): Promise<OrderItem[]> {
    return items.map((item) => {
      const product = products.find((p) => p.id === item.productId);
      if (!product) {
        throw new NotFoundError('Продукт не найден в каталоге', { productId: item.productId });
      }

      if (!product.inStock) {
        throw new BusinessRuleError('Продукт отсутствует на складе', {
          productId: product.id,
          productName: product.name,
        });
      }

      return {
        productId: item.productId,
        name: product.name,
        price: product.price,
        currency: product.currency,
        quantity: item.quantity,
        discountPercent: product.discountPercent,
      };
    });
  }

  /**
   * Рассчитать общую сумму заказа с учётом скидок
   */
  private calculateOrderTotal(items: OrderItem[]): number {
    const total = items.reduce((sum, item) => {
      const discount = item.discountPercent || 0;
      const itemPrice = item.price * item.quantity * (1 - discount / 100);
      return sum + itemPrice;
    }, 0);

    // Округление до 2 знаков (BYN)
    return Math.round(total * 100) / 100;
  }

  /**
   * Получить все заказы из файла (внутренний метод без кэширования)
   * Выбрасывает OrderError при ошибке чтения файла заказов
   */
  private static async getOrdersInternal(): Promise<Order[]> {
    try {
      const orders = await readJsonFile<Order>(ORDERS_FILE);

      if (!Array.isArray(orders)) {
        logger.error('Файл заказов содержит не массив');
        throw new OrderError('Файл заказов повреждён');
      }
      return orders;
    } catch (error) {
      if (error instanceof OrderError) {
        throw error;
      }
      logger.error({ error }, 'Ошибка чтения заказов');
      throw new OrderError(
        `Не удалось прочитать файл заказов: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`,
        { originalError: error },
      );
    }
  }

  /**
   * Получить список продуктов с кэшированием
   * Выбрасывает OrderError при ошибке чтения файла продуктов
   */
  private static async getProducts(): Promise<Product[]> {
    const now = Date.now();

    if (
      OrderService.productsCache
      && now - OrderService.productsCacheTime < OrderService.CACHE_TTL
    ) {
      logger.debug('Продукты получены из кэша');
      return OrderService.productsCache;
    }

    try {
      const productsArray = await readJsonFile<Product>(PRODUCTS_FILE);

      OrderService.productsCache = productsArray;
      OrderService.productsCacheTime = now;

      return productsArray;
    } catch (error) {
      logger.error({ error }, 'Ошибка чтения продуктов');
      throw new OrderError(
        `Не удалось прочитать файл продуктов: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`,
        { originalError: error },
      );
    }
  }

  /**
   * Инвалидировать кэш заказов для конкретного пользователя
   */
  private static invalidateCache(userId?: string): void {
    if (userId) {
      OrderService.orderCache.delete(userId);
      OrderService.orderCacheTimestamps.delete(userId);
      logger.debug({ userId }, 'Кэш заказов инвалидирован для пользователя');
    } else {
      OrderService.orderCache.clear();
      OrderService.orderCacheTimestamps.clear();
      logger.debug('Кэш заказов инвалидирован полностью');
    }
  }

  /**
   * Инвалидировать весь кэш (включая продукты)
   */
  static invalidateAllCache(): void {
    OrderService.invalidateCache();
    OrderService.productsCache = null;
    OrderService.productsCacheTime = 0;
    OrderService.orderCacheTimestamps.clear();
    logger.debug('Весь кэш инвалидирован');
  }

  /**
   * Получить заказы из кэша
   */
  private static getCachedOrders(userId: string): Order[] | null {
    const cached = OrderService.orderCache.get(userId);
    if (!cached) {
      return null;
    }
    // Проверяем TTL кэша заказов (2 минуты)
    const cacheTime = OrderService.orderCacheTimestamps.get(userId);
    if (cacheTime && Date.now() - cacheTime > 2 * 60 * 1000) {
      OrderService.orderCache.delete(userId);
      OrderService.orderCacheTimestamps.delete(userId);
      return null;
    }
    return cached;
  }

  /**
   * Сохранить заказы в кэш
   */
  private static setCachedOrders(userId: string, orders: Order[]): void {
    // Проверяем размер кэша и удаляем старые записи при превышении лимита
    if (OrderService.orderCache.size >= OrderService.MAX_CACHE_SIZE) {
      // Удаляем первую запись (самую старую, так как Map сохраняет порядок вставки)
      const firstKey = OrderService.orderCache.keys().next().value;
      if (firstKey) {
        OrderService.orderCache.delete(firstKey);
        OrderService.orderCacheTimestamps.delete(firstKey);
        logger.debug('Кэш заказов превысил лимит, удалена самая старая запись');
      }
    }

    OrderService.orderCache.set(userId, orders);
    OrderService.orderCacheTimestamps.set(userId, Date.now());
  }

  /**
   * Получить заказы с пагинацией и фильтрацией (для админа)
   */
  async getOrdersWithPagination(params: GetOrdersParams): Promise<GetOrdersResult> {
    const {
      status,
      userId,
      dateFrom,
      dateTo,
      limit = 20,
      offset = 0,
      sort = 'created_at_desc',
    } = params;

    let orders = await this.getAllOrders();

    // Фильтрация по статусу
    if (status) {
      orders = orders.filter((o) => o.status === status);
    }

    // Фильтрация по userId
    if (userId) {
      orders = orders.filter((o) => o.userId === userId);
    }

    // Фильтрация по датам
    if (dateFrom) {
      const fromDate = new Date(dateFrom);
      if (!Number.isNaN(fromDate.getTime())) {
        orders = orders.filter((o) => new Date(o.createdAt) >= fromDate);
      }
    }

    if (dateTo) {
      const toDate = new Date(dateTo);
      if (!Number.isNaN(toDate.getTime())) {
        orders = orders.filter((o) => new Date(o.createdAt) <= toDate);
      }
    }

    // Сортировка
    switch (sort) {
      case 'created_at_asc':
        orders.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        break;
      case 'total_desc':
        orders.sort((a, b) => b.totalSum - a.totalSum);
        break;
      case 'total_asc':
        orders.sort((a, b) => a.totalSum - b.totalSum);
        break;
      case 'created_at_desc':
      default:
        orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
    }

    const total = orders.length;
    const paginatedOrders = orders.slice(offset, offset + limit);
    const hasMore = offset + limit < total;

    return {
      orders: paginatedOrders,
      total,
      limit,
      offset,
      hasMore,
    };
  }

  /**
   * Получить заказ по ID (для админа, без проверки userId)
   */
  async getOrderByIdAdmin(orderId: string): Promise<Order | null> {
    const orders = await this.getAllOrders();
    return orders.find((o) => o.id === orderId) || null;
  }

  /**
   * Отменить заказ (пользователем)
   */
  async cancelOrder(userId: string, orderId: string): Promise<Order | null> {
    const order = await this.getOrderById(userId, orderId);

    if (!order) {
      return null;
    }

    // Проверяем, можно ли отменить заказ
    if (order.status !== 'pending') {
      throw new BusinessRuleError('Невозможно отменить заказ в текущем статусе', {
        orderId,
        currentStatus: order.status,
      });
    }

    return this.updateOrderStatus(orderId, 'cancelled');
  }

  /**
   * Получить статистику заказов
   */
  async getOrdersStats(): Promise<OrdersStats> {
    const orders = await this.getAllOrders();

    const statusCounts: Record<Order['status'], number> = {
      pending: 0,
      processing: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0,
    };

    let totalRevenue = 0;

    for (const order of orders) {
      statusCounts[order.status] = (statusCounts[order.status] || 0) + 1;
      if (order.status !== 'cancelled') {
        totalRevenue += order.totalSum;
      }
    }

    const nonCancelledCount = orders.filter((o) => o.status !== 'cancelled').length;

    return {
      total: orders.length,
      byStatus: statusCounts,
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      averageOrderValue: nonCancelledCount > 0 
        ? Math.round((totalRevenue / nonCancelledCount) * 100) / 100 
        : 0,
    };
  }

  /**
   * Получить заказы пользователя с пагинацией
   */
  async getOrdersWithPaginationUser(
    userId: string,
    params: { status?: Order['status']; limit?: number; offset?: number },
  ): Promise<GetOrdersResult> {
    const { status, limit = 20, offset = 0 } = params;

    let orders = await this.getOrders(userId);

    // Фильтрация по статусу
    if (status) {
      orders = orders.filter((o) => o.status === status);
    }

    const total = orders.length;
    const paginatedOrders = orders.slice(offset, offset + limit);
    const hasMore = offset + limit < total;

    return {
      orders: paginatedOrders,
      total,
      limit,
      offset,
      hasMore,
    };
  }
}