/**
 * Модель корзины - L_Shop
 */

/**
 * Элемент корзины
 */
export interface CartItem {
  /** ID продукта */
  productId: string;
  /** Количество */
  quantity: number;
}

/**
 * Корзина пользователя
 */
export interface Cart {
  /** ID пользователя */
  userId: string;
  /** Элементы корзины */
  items: CartItem[];
  /** Дата обновления */
  updatedAt: string;
  /** Валюта (BYN) */
  currency: 'BYN';
}

/**
 * Элемент корзины с данными продукта (для ответа API)
 */
export interface CartItemWithProduct extends CartItem {
  /** Название продукта */
  name: string;
  /** Цена продукта (BYN) */
  price: number;
  /** Процент скидки (Вариант 21) */
  discountPercent?: number;
  /** Итоговая сумма (BYN) */
  total: number;
  /** Валюта (BYN) */
  currency: 'BYN';
  /** URL изображения продукта */
  imageUrl?: string;
}

/**
 * Корзина с обогащёнными данными (для ответа API)
 */
export interface CartWithProducts extends Cart {
  /** Элементы с данными продуктов */
  items: CartItemWithProduct[];
  /** Общая сумма (BYN) */
  totalSum: number;
}
