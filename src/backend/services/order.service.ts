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
   * @param userId - ID пользователя
   * @param data - Данные для создания заказа
   * @returns Созданный заказ
   * @throws {ValidationError} Если данные невалидны или корзина пуста
   * @throws {NotFoundError} Если продукты из корзины не найдены в каталоге
   * @throws {BusinessRuleError} Если продукт отсутствует на складе
   * @throws {OrderError} При ошибке чтения или записи данных заказа
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
   * @param userId - ID пользователя
   * @returns Массив заказов, отсортированный по дате создания (новые первыми)
   * @throws {OrderError} При ошибке чтения данных заказов
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
   * @param userId - ID пользователя
   * @param orderId - ID заказа
   * @returns Заказ или null, если не найден
   * @throws {OrderError} При ошибке чтения данных заказов
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
   * @param orderId - ID заказа
   * @param status - Новый статус
   * @returns Обновлённый заказ или null если заказ не найден
   * @throws {OrderError} При ошибке чтения или записи данных заказа
   * @throws {ValidationError} Если статус невалиден
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
   * @returns Массив всех заказов, отсортированный по дате создания
   * @throws {OrderError} При ошибке чтения данных заказов
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

      const allOrders = (await OrderService.getOrdersInternal()) ?? [];

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
   * @param orderId - ID заказа
   * @returns true если заказ удален, false если не найден
   * @throws {OrderError} При ошибке чтения или записи данных заказа
   */
  async deleteOrder(orderId: string): Promise<boolean> {
    try {
      // Читаем текущие заказы
      const orders = (await OrderService.getOrdersInternal()) ?? [];

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
   * @param items - Элементы корзины
   * @param products - Список всех продуктов
   * @returns Элементы заказа с обогащёнными данными
   * @throws {NotFoundError} Если продукт не найден
   * @throws {BusinessRuleError} Если продукт отсутствует на складе
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
   * @param items - Элементы заказа
   * @returns Общая сумма (BYN, округлённая до 2 знаков)
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
   */
  private static async getOrdersInternal(): Promise<Order[]> {
    try {
      const orders = await readJsonFile<Order>(ORDERS_FILE);

      if (!Array.isArray(orders)) {
        logger.warn('Файл заказов содержит не массив, возвращаем пустой массив');
        return [];
      }
      return orders;
    } catch (error) {
      logger.error({ error }, 'Ошибка чтения заказов');
      // Возвращаем пустой массив вместо выбрасывания ошибки,
      // чтобы вызывающие методы могли обработать эту ситуацию
      return [];
    }
  }

  /**
   * Получить список продуктов с кэшированием
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
      // Возвращаем пустой массив при ошибке
      return [];
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
}
