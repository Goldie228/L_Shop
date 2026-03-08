/**
 * Сервис работы с корзиной
 * Валюты: все суммы в белорусских рублях (BYN)
 */

import { readJsonFile, modifyJsonFile } from '../utils/file.utils';
import {
  Cart,
  CartItem,
  CartItemWithProduct,
  CartWithProducts,
} from '../models/cart.model';
import { Product } from '../models/product.model';
import { validate, addToCartSchema, updateCartQuantitySchema } from '../utils/validation';
import {
  ValidationError, NotFoundError, BusinessRuleError, CartError,
} from '../errors';
import { createContextLogger } from '../utils/logger';

const CARTS_FILE = 'carts.json';
const PRODUCTS_FILE = 'products.json';

/**
 * Сервис для работы с корзиной пользователей
 */
export class CartService {
  // Кэш для часто запрашиваемых корзин (опционально, можно расширить)
  static cartCache = new Map<string, CartWithProducts>();

  private static productsCache: Product[] | null = null;

  private static productsCacheTime = 0;

  private static readonly CACHE_TTL = 5 * 60 * 1000; // 5 минут

  // Логгер как статическое readonly поле
  private static readonly logger = createContextLogger('CartService');

  /**
   * Получить корзину пользователя с обогащёнными данными продуктов
   * @param userId - ID пользователя
   * @returns Корзина с данными продуктов
   * @throws {CartError} При ошибке чтения файлов данных или повреждённых данных
   */
  async getCart(userId: string): Promise<CartWithProducts> {
    try {
      // Проверяем кэш
      const cached = CartService.getCachedCart(userId);
      if (cached) {
        CartService.logger.debug({ userId }, 'Корзина получена из кэша');
        return cached;
      }

      const [carts, products] = await Promise.all([
        readJsonFile<Cart>(CARTS_FILE),
        CartService.getProducts(),
      ]);

      const cart: Cart = carts.find((c: Cart) => c.userId === userId) ?? {
        userId,
        items: [],
        updatedAt: new Date().toISOString(),
        currency: 'BYN',
      };

      const items = await this.enrichCartItems(cart.items, products);
      const totalSum = this.calculateTotalSum(items);

      const result: CartWithProducts = { ...cart, items, totalSum };

      // Сохраняем в кэш
      CartService.setCachedCart(userId, result);

      return result;
    } catch (error) {
      CartService.logger.error({ userId, error }, 'Ошибка получения корзины');
      throw new CartError('Не удалось получить корзину', { userId, originalError: error });
    }
  }

  /**
   * Добавить продукт в корзину с валидацией
   * @param userId - ID пользователя
   * @param productId - ID продукта
   * @param quantity - Количество для добавления
   * @returns Обновлённая корзина с данными продуктов
   * @throws {ValidationError} Если данные невалидны
   * @throws {NotFoundError} Если продукт не найден
   * @throws {BusinessRuleError} Если продукт отсутствует на складе
   * @throws {CartError} При ошибке чтения или записи данных корзины
   */
  async addItem(userId: string, productId: string, quantity: number): Promise<CartWithProducts> {
    // Валидация входных данных
    const validationResult = validate(addToCartSchema, { productId, quantity });
    if (!validationResult.success) {
      throw new ValidationError(validationResult.error ?? 'Невалидные данные', {
        field: validationResult.field,
        productId,
        quantity,
      });
    }

    try {
      const products = await CartService.getProducts();

      // Проверяем существование продукта
      const product = products.find((p: Product) => p.id === productId);
      if (!product) {
        throw new NotFoundError('Продукт не найден', { productId });
      }

      // Проверяем наличие
      if (!product.inStock) {
        throw new BusinessRuleError('Продукт отсутствует на складе', {
          productId,
          productName: product.name,
        });
      }

      // Обновляем корзину атомарно
      const updatedCarts = await modifyJsonFile<Cart>(CARTS_FILE, (currentCarts) => {
        const cartIndex = currentCarts.findIndex((c: Cart) => c.userId === userId);
        let cart: Cart;

        if (cartIndex === -1) {
          cart = {
            userId,
            items: [],
            updatedAt: new Date().toISOString(),
            currency: 'BYN',
          };
          currentCarts.push(cart);
        } else {
          cart = currentCarts[cartIndex];
        }

        // Добавляем или обновляем элемент
        const existingItem = cart.items.find((i: CartItem) => i.productId === productId);
        if (existingItem) {
          existingItem.quantity += quantity;
        } else {
          cart.items.push({ productId, quantity });
        }

        cart.updatedAt = new Date().toISOString();
        return currentCarts;
      });

      // Инвалидируем кэш
      CartService.invalidateCartCache(userId);

      // Возвращаем обновлённую корзину
      const updatedCart = updatedCarts.find((c: Cart) => c.userId === userId);
      if (!updatedCart) {
        throw new CartError('Корзина не найдена после обновления', { userId });
      }
      const items = await this.enrichCartItems(updatedCart.items, products);
      const totalSum = this.calculateTotalSum(items);

      return { ...updatedCart, items, totalSum };
    } catch (error) {
      if (
        error instanceof ValidationError
        || error instanceof NotFoundError
        || error instanceof BusinessRuleError
      ) {
        throw error;
      }
      CartService.logger.error(
        {
          userId,
          productId,
          quantity,
          error,
        },
        'Ошибка добавления товара в корзину',
      );
      throw new CartError('Не удалось добавить товар в корзину', { userId, originalError: error });
    }
  }

  /**
   * Изменить количество продукта в корзине с валидацией
   * @param userId - ID пользователя
   * @param productId - ID продукта
   * @param quantity - Новое количество (если <= 0, товар удаляется из корзины)
   * @returns Обновлённая корзина с данными продуктов
   * @throws {ValidationError} Если данные невалидны
   * @throws {NotFoundError} Если корзина или товар в корзине не найден
   * @throws {CartError} При ошибке чтения или записи данных корзины
   */
  async updateItem(userId: string, productId: string, quantity: number): Promise<CartWithProducts> {
    // Валидация входных данных
    const validationResult = validate(updateCartQuantitySchema, { quantity });
    if (!validationResult.success) {
      throw new ValidationError(validationResult.error ?? 'Невалидное количество', {
        field: validationResult.field,
        quantity,
      });
    }

    try {
      const products = await CartService.getProducts();

      const updatedCarts = await modifyJsonFile<Cart>(CARTS_FILE, (currentCarts) => {
        const cart = currentCarts.find((c: Cart) => c.userId === userId);
        if (!cart) {
          throw new NotFoundError('Корзина не найдена', { userId });
        }

        const item = cart.items.find((i: CartItem) => i.productId === productId);
        if (!item) {
          throw new NotFoundError('Товар не найден в корзине', { userId, productId });
        }

        // Проверяем наличие товара на складе при обновлении количества
        if (quantity > 0) {
          const product = products.find((p: Product) => p.id === productId);
          if (!product) {
            throw new NotFoundError('Продукт не найден', { productId });
          }
          if (!product.inStock) {
            throw new BusinessRuleError('Товар отсутствует на складе', {
              productId,
              productName: product.name,
            });
          }
        }

        if (quantity <= 0) {
          cart.items = cart.items.filter((i: CartItem) => i.productId !== productId);
        } else {
          item.quantity = quantity;
        }

        cart.updatedAt = new Date().toISOString();
        return currentCarts;
      });

      // Инвалидируем кэш
      CartService.invalidateCartCache(userId);

      // Возвращаем обновлённую корзину
      const updatedCart = updatedCarts.find((c: Cart) => c.userId === userId);
      if (!updatedCart) {
        throw new CartError('Корзина не найдена после обновления', { userId });
      }
      const items = await this.enrichCartItems(updatedCart.items, products);
      const totalSum = this.calculateTotalSum(items);

      return { ...updatedCart, items, totalSum };
    } catch (error) {
      if (
        error instanceof ValidationError
        || error instanceof NotFoundError
        || error instanceof BusinessRuleError
      ) {
        throw error;
      }
      CartService.logger.error(
        {
          userId,
          productId,
          quantity,
          error,
        },
        'Ошибка обновления товара в корзине',
      );
      throw new CartError('Не удалось обновить товар в корзине', { userId, originalError: error });
    }
  }

  /**
   * Удалить продукт из корзины
   * @param userId - ID пользователя
   * @param productId - ID продукта для удаления
   * @returns Обновлённая корзина с данными продуктов
   * @throws {NotFoundError} Если корзина не найдена
   * @throws {CartError} При ошибке чтения или записи данных корзины
   */
  async removeItem(userId: string, productId: string): Promise<CartWithProducts> {
    try {
      const products = await CartService.getProducts();

      const updatedCarts = await modifyJsonFile<Cart>(CARTS_FILE, (currentCarts) => {
        const cart = currentCarts.find((c: Cart) => c.userId === userId);
        if (!cart) {
          throw new NotFoundError('Корзина не найдена', { userId });
        }

        const itemExists = cart.items.some((i: CartItem) => i.productId === productId);
        if (!itemExists) {
          throw new NotFoundError('Товар не найден в корзине', { userId, productId });
        }

        cart.items = cart.items.filter((i: CartItem) => i.productId !== productId);
        cart.updatedAt = new Date().toISOString();
        return currentCarts;
      });

      // Инвалидируем кэш
      CartService.invalidateCartCache(userId);

      // Возвращаем обновлённую корзину
      const updatedCart = updatedCarts.find((c: Cart) => c.userId === userId);
      if (!updatedCart) {
        throw new CartError('Корзина не найдена после удаления', { userId });
      }
      const items = await this.enrichCartItems(updatedCart.items, products);
      const totalSum = this.calculateTotalSum(items);

      return { ...updatedCart, items, totalSum };
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof BusinessRuleError) {
        throw error;
      }
      CartService.logger.error({ userId, productId, error }, 'Ошибка удаления товара из корзины');
      throw new CartError('Не удалось удалить товар из корзины', { userId, originalError: error });
    }
  }

  /**
   * Очистить корзину пользователя
   * @param userId - ID пользователя
   * @throws {CartError} При ошибке чтения или записи данных корзины
   */
  async clearCart(userId: string): Promise<void> {
    try {
      await modifyJsonFile<Cart>(CARTS_FILE, (currentCarts) => {
        const cartIndex = currentCarts.findIndex((c: Cart) => c.userId === userId);

        if (cartIndex === -1) {
          return currentCarts; // Корзина не найдена - ничего не делаем
        }

        // Создаём копию корзины для избежания мутации параметра
        const updatedCart: Cart = {
          ...currentCarts[cartIndex],
          items: [],
          updatedAt: new Date().toISOString(),
        };
        return [
          ...currentCarts.slice(0, cartIndex),
          updatedCart,
          ...currentCarts.slice(cartIndex + 1),
        ];
      });

      // Инвалидируем кэш
      CartService.invalidateCartCache(userId);
    } catch (error) {
      CartService.logger.error({ userId, error }, 'Ошибка очистки корзины');
      throw new CartError('Не удалось очистить корзину', { userId, originalError: error });
    }
  }

  // ========== Приватные вспомогательные методы ==========

  /**
   * Получить список продуктов с кэшированием
   */
  private static async getProducts(): Promise<Product[]> {
    const now = Date.now();

    if (CartService.productsCache && now - CartService.productsCacheTime < CartService.CACHE_TTL) {
      CartService.logger.debug('Продукты получены из кэша');
      return CartService.productsCache;
    }

    const products = await readJsonFile<Product>(PRODUCTS_FILE);
    CartService.productsCache = products;
    CartService.productsCacheTime = now;

    return products;
  }

  /**
   * Инвалидировать кэш продуктов (вызывать при изменении продуктов)
   */
  static invalidateProductsCache(): void {
    CartService.productsCache = null;
    CartService.productsCacheTime = 0;
    CartService.logger.debug('Кэш продуктов инвалидирован');
  }

  /**
   * Получить корзину из кэша
   */
  private static getCachedCart(userId: string): CartWithProducts | null {
    const cached = CartService.cartCache.get(userId);
    if (!cached) {
      return null;
    }
    // Проверяем TTL кэша корзины (упрощённо - 2 минуты)
    const cacheTime = new Date(cached.updatedAt).getTime();
    if (Date.now() - cacheTime > 2 * 60 * 1000) {
      CartService.cartCache.delete(userId);
      return null;
    }
    return cached;
  }

  /**
   * Сохранить корзину в кэш
   */
  private static setCachedCart(userId: string, cart: CartWithProducts): void {
    CartService.cartCache.set(userId, cart);
  }

  /**
   * Инвалидировать кэш корзины
   */
  private static invalidateCartCache(userId: string): void {
    CartService.cartCache.delete(userId);
  }

  /**
   * Обогатить элементы корзины данными продуктов
   * @param items - Элементы корзины
   * @param products - Список всех продуктов
   * @returns Элементы с обогащёнными данными
   */
  private async enrichCartItems(
    items: Cart['items'],
    products: Product[],
  ): Promise<CartItemWithProduct[]> {
    return items.map((item) => {
      const product = products.find((p: Product) => p.id === item.productId);
      const price = product?.price ?? 0;
      const discount = product?.discountPercent ?? 0;

      // Расчет суммы с учетом скидки (BYN)
      const total = this.calculateItemTotal(price, discount, item.quantity);

      return {
        ...item,
        name: product?.name ?? 'Неизвестный продукт',
        price,
        discountPercent: discount,
        total,
        currency: 'BYN',
        imageUrl: product?.imageUrl,
      };
    });
  }

  /**
   * Рассчитать сумму позиции с учетом скидки
   * @param price - Цена за единицу (BYN)
   * @param discountPercent - Процент скидки
   * @param quantity - Количество
   * @returns Итоговая сумма (BYN)
   */
  private calculateItemTotal(price: number, discountPercent: number, quantity: number): number {
    if (price <= 0 || quantity <= 0) {
      return 0;
    }
    const discountMultiplier = 1 - (discountPercent ?? 0) / 100;
    return Math.round(price * quantity * discountMultiplier * 100) / 100;
  }

  /**
   * Рассчитать общую сумму корзины
   * @param items - Элементы корзины с рассчитанными суммами
   * @returns Общая сумма (BYN)
   */
  private calculateTotalSum(items: CartItemWithProduct[]): number {
    return items.reduce((sum, item) => sum + item.total, 0);
  }
}
