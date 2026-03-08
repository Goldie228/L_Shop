/**
 * Сервис продуктов - L_Shop
 * Получение, фильтрация и управление продуктами
 * Вариант 17: поддержка фильтрации по рейтингу
 */

import { readJsonFile, writeJsonFile } from '../utils/file.utils';
import { Product } from '../models/product.model';
import { generateId } from '../utils/id.utils';

const PRODUCTS_FILE = 'products.json';

/**
 * Интерфейс фильтров для поиска продуктов
 */
export interface ProductFilters {
  /** Поиск по названию и описанию */
  search?: string;
  /** Сортировка: price_asc, price_desc */
  sort?: string;
  /** Фильтр по категории */
  category?: string;
  /** Фильтр по наличию */
  inStock?: string;
  /** Минимальный рейтинг (Вариант 17) */
  minRating?: string;
}

/**
 * Сервис для работы с продуктами
 */
export class ProductService {
  /**
   * Получить список продуктов с фильтрацией и сортировкой
   * @param filters - Параметры фильтрации
   * @returns Отфильтрованный массив продуктов
   */
  static async getProducts(filters: ProductFilters = {}): Promise<Product[]> {
    let products = await readJsonFile<Product>(PRODUCTS_FILE);

    // Поиск по названию и описанию (без учёта регистра)
    if (filters.search) {
      const term = filters.search.toLowerCase();
      products = products.filter(
        (p) => p.name.toLowerCase().includes(term) || p.description.toLowerCase().includes(term),
      );
    }

    // Фильтр по категории
    if (filters.category) {
      products = products.filter((p) => p.category === filters.category);
    }

    // Фильтр по наличию
    if (filters.inStock !== undefined) {
      const inStockValue = filters.inStock === 'true';
      products = products.filter((p) => p.inStock === inStockValue);
    }

    // Фильтр по минимальному рейтингу (Вариант 17)
    if (filters.minRating) {
      const minRating = Number(filters.minRating);
      if (!Number.isNaN(minRating)) {
        products = products.filter((p) => (p.rating || 0) >= minRating);
      }
    }

    // Сортировка по цене
    if (filters.sort === 'price_asc') {
      products.sort((a, b) => a.price - b.price);
    } else if (filters.sort === 'price_desc') {
      products.sort((a, b) => b.price - a.price);
    }

    return products;
  }

  /**
   * Получить продукт по ID
   * @param id - Уникальный идентификатор продукта
   * @returns Продукт или null, если не найден
   */
  static async getProductById(id: string): Promise<Product | null> {
    const products = await readJsonFile<Product>(PRODUCTS_FILE);
    return products.find((p) => p.id === id) || null;
  }

  /**
   * Получить все продукты (без фильтрации)
   * Используется в админ-панели
   * @returns Массив всех продуктов
   */
  static async getAllProducts(): Promise<Product[]> {
    const products = await readJsonFile<Product>(PRODUCTS_FILE);
    return products;
  }

  /**
   * Создать новый продукт
   * @param data - Данные продукта (без id, createdAt, updatedAt)
   * @returns Созданный продукт
   */
  static async createProduct(data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> {
    const products = await readJsonFile<Product>(PRODUCTS_FILE);
    const now = new Date().toISOString();

    const newProduct: Product = {
      ...data,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    };

    products.push(newProduct);
    await writeJsonFile(PRODUCTS_FILE, products);

    return newProduct;
  }

  /**
   * Обновить продукт по ID
   * @param id - ID продукта
   * @param data - Данные для обновления (частичные)
   * @returns Обновлённый продукт или null, если не найден
   */
  static async updateProduct(
    id: string,
    data: Partial<Omit<Product, 'id' | 'createdAt'>>,
  ): Promise<Product | null> {
    const products = await readJsonFile<Product>(PRODUCTS_FILE);
    const index = products.findIndex((p) => p.id === id);

    if (index === -1) {
      return null;
    }

    products[index] = {
      ...products[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };

    await writeJsonFile(PRODUCTS_FILE, products);
    return products[index];
  }

  /**
   * Удалить продукт по ID
   * @param id - ID продукта
   * @returns true если продукт удален, false если не найден
   */
  static async deleteProduct(id: string): Promise<boolean> {
    const products = await readJsonFile<Product>(PRODUCTS_FILE);
    const filtered = products.filter((p) => p.id !== id);

    if (filtered.length === products.length) {
      return false; // Продукт не найден
    }

    await writeJsonFile(PRODUCTS_FILE, filtered);
    return true;
  }
}
