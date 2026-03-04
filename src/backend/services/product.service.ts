/**
 * Сервис продуктов - L_Shop
 * Получение и фильтрация списка продуктов
 * Вариант 17: поддержка фильтрации по рейтингу
 */

import { readJsonFile } from '../utils/file.utils';
import { Product } from '../models/product.model';

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
  async getProducts(filters: ProductFilters = {}): Promise<Product[]> {
    let products = await readJsonFile<Product>(PRODUCTS_FILE);

    // Поиск по названию и описанию (без учёта регистра)
    if (filters.search) {
      const term = filters.search.toLowerCase();
      products = products.filter(
        (p) =>
          p.name.toLowerCase().includes(term) ||
          p.description.toLowerCase().includes(term)
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
  async getProductById(id: string): Promise<Product | null> {
    const products = await readJsonFile<Product>(PRODUCTS_FILE);
    return products.find((p) => p.id === id) || null;
  }
}