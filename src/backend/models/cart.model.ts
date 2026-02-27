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
}
