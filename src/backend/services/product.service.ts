/**
 * Сервис для работы с товарами
 *
 * @summary
 * ProductService предоставляет методы для получения списка товаров
 * и деталей конкретного товара. Использует файловое хранение JSON.
 *
 * @see src/backend/models/product.model.ts - модель товара
 * @see src/backend/data/products.json - хранилище данных
 */

import { readJsonFile, writeJsonFile } from '../utils/file.utils.js';
import { Product } from '../models/product.model.js';
import { config } from '../config/constants.js';

const PRODUCTS_FILE = `${config.dataDir}/products.json`;

/**
 * Сервис для управления товарами
 */
export class ProductService {
  /**
   * Получить все товары
   * @returns Массив всех товаров
   */
  async getAllProducts(): Promise<Product[]> {
    try {
      const products = await readJsonFile(PRODUCTS_FILE);
      return (products ?? []) as Product[];
    } catch (error) {
      console.error('[ProductService] Ошибка получения товаров:', error);
      return [];
    }
  }

  /**
   * Получить товар по ID
   * @param id - ID товара
   * @returns Товар или null если не найден
   */
  async getProductById(id: string): Promise<Product | null> {
    try {
      const products = await readJsonFile(PRODUCTS_FILE);
      const productArray = (products ?? []) as Product[];
      return productArray.find((p) => p.id === id) ?? null;
    } catch (error) {
      console.error(`[ProductService] Ошибка получения товара ${id}:`, error);
      return null;
    }
  }

  /**
   * Создать новый товар (админская функция)
   * @param productData - данные товара
   * @returns Созданный товар
   */
  async createProduct(productData: Omit<Product, 'id'>): Promise<Product> {
    const products = ((await readJsonFile(PRODUCTS_FILE)) ?? []) as Product[];

    const newProduct: Product = {
      ...productData,
      id: crypto.randomUUID(),
    };

    products.push(newProduct);
    await writeJsonFile(PRODUCTS_FILE, products);

    return newProduct;
  }

  /**
   * Обновить товар (админская функция)
   * @param id - ID товара
   * @param updates - обновляемые поля
   * @returns Обновлённый товар или null
   */
  async updateProduct(id: string, updates: Partial<Product>): Promise<Product | null> {
    const products = ((await readJsonFile(PRODUCTS_FILE)) ?? []) as Product[];
    const index = products.findIndex((p) => p.id === id);

    if (index === -1) {
      return null;
    }

    products[index] = { ...products[index], ...updates };
    await writeJsonFile(PRODUCTS_FILE, products);

    return products[index];
  }

  /**
   * Удалить товар (админская функция)
   * @param id - ID товара
   * @returns true если удалён, false если не найден
   */
  async deleteProduct(id: string): Promise<boolean> {
    const products = ((await readJsonFile(PRODUCTS_FILE)) ?? []) as Product[];
    const filtered = products.filter((p) => p.id !== id);

    if (filtered.length === products.length) {
      return false;
    }

    await writeJsonFile(PRODUCTS_FILE, filtered);
    return true;
  }
}
