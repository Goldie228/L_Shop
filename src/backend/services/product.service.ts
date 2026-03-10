/**
 * Сервис продуктов - L_Shop
 * Получение, фильтрация и управление продуктами
 * Вариант 17: поддержка фильтрации по рейтингу
 */

import { readJsonFile, writeJsonFile, clearCache } from '../utils/file.utils';
import { Product } from '../models/product.model';
import { generateId } from '../utils/id.utils';
import { createContextLogger } from '../utils/logger';

const logger = createContextLogger('ProductService');
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
 * Параметры для получения списка продуктов с пагинацией
 */
export interface GetProductsParams {
  search?: string;
  sort?: 'price_asc' | 'price_desc' | 'name_asc' | 'name_desc' | 'created_at_desc' | 'rating_desc';
  category?: string;
  inStock?: boolean;
  minRating?: number;
  limit?: number;
  offset?: number;
}

/**
 * Результат получения списка продуктов с пагинацией
 */
export interface GetProductsResult {
  products: Product[];
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

/**
 * Статистика по продуктам
 */
export interface ProductsStats {
  total: number;
  inStock: number;
  outOfStock: number;
  categories: Record<string, number>;
  averagePrice: number;
  averageRating: number;
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
  static async createProduct(
    data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<Product> {
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

    // Очищаем кэш
    clearCache(PRODUCTS_FILE);
    logger.info({ productId: id }, 'Продукт удалён');

    return true;
  }

  /**
   * Получить продукты с пагинацией, фильтрацией и сортировкой
   * @param params - Параметры фильтрации и пагинации
   * @returns Результат с продуктами и метаданными пагинации
   */
  static async getProductsWithPagination(params: GetProductsParams): Promise<GetProductsResult> {
    const {
      search,
      sort = 'created_at_desc',
      category,
      inStock,
      minRating,
      limit = 20,
      offset = 0,
    } = params;

    let products = await this.getAllProducts();

    // Поиск по названию и описанию
    if (search) {
      const searchLower = search.toLowerCase();
      products = products.filter(
        (p) => p.name.toLowerCase().includes(searchLower)
          || p.description.toLowerCase().includes(searchLower)
          || (p.brand && p.brand.toLowerCase().includes(searchLower)),
      );
    }

    // Фильтр по категории
    if (category) {
      products = products.filter((p) => p.category === category);
    }

    // Фильтр по наличию
    if (inStock !== undefined) {
      products = products.filter((p) => p.inStock === inStock);
    }

    // Фильтр по минимальному рейтингу
    if (minRating !== undefined) {
      products = products.filter((p) => (p.rating || 0) >= minRating);
    }

    // Сортировка
    switch (sort) {
      case 'price_asc':
        products.sort((a, b) => a.price - b.price);
        break;
      case 'price_desc':
        products.sort((a, b) => b.price - a.price);
        break;
      case 'name_asc':
        products.sort((a, b) => a.name.localeCompare(b.name, 'ru'));
        break;
      case 'name_desc':
        products.sort((a, b) => b.name.localeCompare(a.name, 'ru'));
        break;
      case 'rating_desc':
        products.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'created_at_desc':
      default:
        products.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
    }

    const total = products.length;
    const paginatedProducts = products.slice(offset, offset + limit);
    const hasMore = offset + limit < total;

    return {
      products: paginatedProducts,
      total,
      limit,
      offset,
      hasMore,
    };
  }

  /**
   * Получить статистику по продуктам
   * @returns Статистика по продуктам
   */
  static async getProductsStats(): Promise<ProductsStats> {
    const products = await this.getAllProducts();

    const categories: Record<string, number> = {};
    let totalPrice = 0;
    let totalRating = 0;
    let ratedProducts = 0;

    products.forEach((product) => {
      // Подсчёт по категориям
      categories[product.category] = (categories[product.category] || 0) + 1;

      // Сумма цен
      totalPrice += product.price;

      // Сумма рейтингов
      if (product.rating) {
        totalRating += product.rating;
        ratedProducts += 1;
      }
    });

    const avgPrice = products.length > 0 ? (totalPrice / products.length) : 0;
    const averagePrice = Math.round(avgPrice * 100) / 100;

    const avgRating = ratedProducts > 0 ? (totalRating / ratedProducts) : 0;
    const averageRating = Math.round(avgRating * 100) / 100;

    return {
      total: products.length,
      inStock: products.filter((p) => p.inStock).length,
      outOfStock: products.filter((p) => !p.inStock).length,
      categories,
      averagePrice,
      averageRating,
    };
  }

  /**
   * Получить список уникальных категорий
   * @returns Массив названий категорий
   */
  static async getCategories(): Promise<string[]> {
    const products = await this.getAllProducts();
    const categoriesSet = new Set(products.map((p) => p.category));
    return Array.from(categoriesSet).sort();
  }

  /**
   * Проверить существование продукта по ID
   * @param id - ID продукта
   * @returns true если продукт существует
   */
  static async productExists(id: string): Promise<boolean> {
    const product = await this.getProductById(id);
    return product !== null;
  }

  /**
   * Массовое обновление наличия продуктов
   * @param updates - Массив объектов { id, inStock }
   * @returns Количество обновлённых продуктов
   */
  static async bulkUpdateStock(updates: Array<{ id: string; inStock: boolean }>): Promise<number> {
    const products = await readJsonFile<Product>(PRODUCTS_FILE);
    let updatedCount = 0;
    const now = new Date().toISOString();

    updates.forEach((update) => {
      const index = products.findIndex((p) => p.id === update.id);
      if (index !== -1 && products[index].inStock !== update.inStock) {
        // eslint-disable-next-line no-param-reassign
        products[index].inStock = update.inStock;
        // eslint-disable-next-line no-param-reassign
        products[index].updatedAt = now;
        updatedCount += 1;
      }
    });

    if (updatedCount > 0) {
      await writeJsonFile(PRODUCTS_FILE, products);
      clearCache(PRODUCTS_FILE);
      logger.info({ count: updatedCount }, 'Массовое обновление наличия продуктов');
    }

    return updatedCount;
  }
}
