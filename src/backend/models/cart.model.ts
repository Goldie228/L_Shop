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

/**
 * Элемент корзины с данными продукта (для ответа API)
 */
export interface CartItemWithProduct extends CartItem {
  /** Название продукта */
  name: string;
  /** Цена продукта */
  price: number;
  /** Процент скидки (Вариант 21) */
  discountPercent?: number;
  /** Итоговая сумма */
  total: number;
}

/**
 * Корзина с обогащёнными данными (для ответа API)
 */
export interface CartWithProducts extends Cart {
  /** Элементы с данными продуктов */
  items: CartItemWithProduct[];
  /** Общая сумма */
  totalSum: number;
}
