/**
 * Сервис работы с корзиной
 */

import { readJsonFile, writeJsonFile } from '../utils/file.utils';
import { Cart, CartItemWithProduct, CartWithProducts } from '../models/cart.model';
import { Product } from '../models/product.model';

const CARTS_FILE = 'carts.json';
const PRODUCTS_FILE = 'products.json';

export class CartService {
  /**
   * Получить корзину пользователя с обогащёнными данными продуктов
   */
  async getCart(userId: string): Promise<CartWithProducts> {
    const carts = await readJsonFile<Cart>(CARTS_FILE);
    const products = await readJsonFile<Product>(PRODUCTS_FILE);

    let cart = carts.find((c) => c.userId === userId);
    if (!cart) {
      cart = { userId, items: [], updatedAt: new Date().toISOString() };
    }

    // Обогащаем данными продукта
    const items: CartItemWithProduct[] = cart.items.map((item) => {
      const product = products.find((p) => p.id === item.productId);
      const price = product?.price || 0;
      const discount = product?.discountPercent || 0;
      // Вариант 21: учитываем скидку при расчёте
      const total = item.quantity * price * (1 - discount / 100);

      return {
        ...item,
        name: product?.name || 'Unknown',
        price,
        discountPercent: discount,
        total,
      };
    });

    const totalSum = items.reduce((sum, item) => sum + item.total, 0);

    return { ...cart, items, totalSum };
  }

  /**
   * Добавить продукт в корзину
   */
  async addItem(
    userId: string,
    productId: string,
    quantity: number,
  ): Promise<CartWithProducts> {
    const carts = await readJsonFile<Cart>(CARTS_FILE);
    const products = await readJsonFile<Product>(PRODUCTS_FILE);

    // Проверяем существование продукта
    const product = products.find((p) => p.id === productId);
    if (!product) {
      throw new Error('Product not found');
    }

    // Проверяем наличие
    if (!product.inStock) {
      throw new Error('Product is out of stock');
    }

    // Ищем или создаём корзину
    let cart = carts.find((c) => c.userId === userId);
    const cartIndex = carts.findIndex((c) => c.userId === userId);

    if (!cart) {
      cart = { userId, items: [], updatedAt: new Date().toISOString() };
      carts.push(cart);
    }

    // Добавляем или обновляем элемент
    const existingItem = cart.items.find((i) => i.productId === productId);
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.items.push({ productId, quantity });
    }

    cart.updatedAt = new Date().toISOString();

    // Обновляем корзину в массиве
    if (cartIndex !== -1) {
      carts[cartIndex] = cart;
    }

    await writeJsonFile(CARTS_FILE, carts);

    return this.getCart(userId);
  }

  /**
   * Изменить количество продукта в корзине
   */
  async updateItem(
    userId: string,
    productId: string,
    quantity: number,
  ): Promise<CartWithProducts> {
    const carts = await readJsonFile<Cart>(CARTS_FILE);
    const cart = carts.find((c) => c.userId === userId);

    if (!cart) {
      throw new Error('Cart not found');
    }

    const item = cart.items.find((i) => i.productId === productId);
    if (!item) {
      throw new Error('Item not found in cart');
    }

    if (quantity <= 0) {
      cart.items = cart.items.filter((i) => i.productId !== productId);
    } else {
      item.quantity = quantity;
    }

    cart.updatedAt = new Date().toISOString();
    await writeJsonFile(CARTS_FILE, carts);

    return this.getCart(userId);
  }

  /**
   * Удалить продукт из корзины
   */
  async removeItem(userId: string, productId: string): Promise<CartWithProducts> {
    const carts = await readJsonFile<Cart>(CARTS_FILE);
    const cart = carts.find((c) => c.userId === userId);

    if (!cart) {
      throw new Error('Cart not found');
    }

    cart.items = cart.items.filter((i) => i.productId !== productId);
    cart.updatedAt = new Date().toISOString();
    await writeJsonFile(CARTS_FILE, carts);

    return this.getCart(userId);
  }

  /**
   * Очистить корзину пользователя
   */
  async clearCart(userId: string): Promise<void> {
    const carts = await readJsonFile<Cart>(CARTS_FILE);
    const cart = carts.find((c) => c.userId === userId);

    if (cart) {
      cart.items = [];
      cart.updatedAt = new Date().toISOString();
      await writeJsonFile(CARTS_FILE, carts);
    }
  }
}