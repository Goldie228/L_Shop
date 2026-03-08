/**
 * Типы продукта - L_Shop Frontend
 * Вариант 17: добавлены поля rating, reviewsCount, currency, brand, warranty, specifications
 */

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
  /** Цена в рублях */
  price: number;
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
  /** Валюта (BYN) */
  currency: 'BYN';
  /** Бренд продукта */
  brand?: string;
  /** Гарантия (например "24 месяца") */
  warranty?: string;
  /** Технические характеристики */
  specifications?: Record<string, unknown>;
  /** Дата создания */
  createdAt?: string;
  /** Дата обновления */
  updatedAt?: string;
}

/**
 * Параметры фильтрации продуктов
 */
export interface ProductFilters {
  /** Поиск по названию и описанию */
  search?: string;
  /** Сортировка: price_asc, price_desc */
  sort?: string;
  /** Фильтр по категории */
  category?: string;
  /** Фильтр по наличию */
  inStock?: boolean;
  /** Минимальный рейтинг (Вариант 17) */
  minRating?: number;
}

/**
 * Категории продуктов
 */
export const PRODUCT_CATEGORIES = [
  { value: 'electronics', label: 'Электроника' },
  { value: 'clothing', label: 'Одежда' },
  { value: 'books', label: 'Книги' },
  { value: 'home', label: 'Дом и сад' },
  { value: 'sports', label: 'Спорт' },
] as const;

/**
 * Варианты сортировки
 */
export const SORT_OPTIONS = [
  { value: '', label: 'По умолчанию' },
  { value: 'price_asc', label: 'Цена: по возрастанию' },
  { value: 'price_desc', label: 'Цена: по убыванию' },
] as const;
