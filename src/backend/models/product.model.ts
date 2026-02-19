/**
 * Модель товара
 */
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  inStock: boolean;
  imageUrl?: string;
  // TODO: Добавить поля из вариантов (Никита П.)
}
