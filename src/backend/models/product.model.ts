/**
 * Модель продукта
 */
export interface Product {
  /** ID продукта */
  id: string;
  /** Название продукта */
  name: string;
  /** Описание продукта */
  description: string;
  /** Цена продукта */
  price: number;
  /** Категория продукта */
  category: string;
  /** Наличие на складе */
  inStock: boolean;
  /** Процент скидки (Вариант 21: 0-100) */
  discountPercent?: number;
  /** URL изображения */
  imageUrl?: string;
  /** Дата создания */
  createdAt: string;
  /** Дата обновления */
  updatedAt: string;
}