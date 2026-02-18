// Модель товара
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  inStock: boolean;
  imageUrl?: string;
  // Здесь будут добавляться поля из вариантов
}
