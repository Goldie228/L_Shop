/**
 * Модель продукта
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
  /** Цена продукта */
  price: number;
  /** Категория продукта */
  category: string;
  /** Количество на складе */
  inStock: boolean;
  /** Процент скидки */
  discountPercent?: number;
  /** Дата создания */
  createdAt: string;
  /** Дата обновления */
  updatedAt?: string;
}
