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
  /** Дата создания */
  createdAt: string;
  /** Дата обновления */
  updatedAt?: string;
}
