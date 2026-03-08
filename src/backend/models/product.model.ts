/**
 * Модель продукта - L_Shop
 * Вариант 17: добавлены поля rating и reviewsCount
 */

/**
 * Статус продукта
 */
export type ProductStatus = 'active' | 'inactive' | 'discontinued';

/**
 * Продукт
 */
export interface Product {
  /** Уникальный идентификатор */
  id: string;
  /** Название продукта */
  name: string;
  /** Описание продукта */
  description: string;
  /** Цена в рублях (BYN) */
  price: number;
  /** Валюта (BYN) */
  currency: string;
  /** Категория продукта */
  category: string;
  /** Есть ли в наличии */
  inStock: boolean;
  /** URL изображения */
  imageUrl?: string;
  /** Процент скидки */
  discountPercent?: number;
  /** Средний рейтинг (1-5) - Вариант 17 */
  rating?: number;
  /** Количество отзывов - Вариант 17 */
  reviewsCount?: number;
  /** Бренд продукта */
  brand: string;
  /** Гарантия (например "24 месяца") */
  warranty: string;
  /** Технические характеристики */
  specifications: Record<string, unknown>;
  /** Дата создания */
  createdAt: string;
  /** Дата обновления */
  updatedAt?: string;
}

/**
 * Фильтры для продуктов
 */
export interface ProductFilters {
  /** Поиск по названию и описанию */
  search?: string;
  /** Сортировка: price_asc, price_desc */
  sort?: string;
  /** Фильтр по категории */
  category?: string;
  /** Фильтр по наличию (true/false) */
  inStock?: string;
  /** Минимальный рейтинг */
  minRating?: string;
}
