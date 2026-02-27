/**
 * Модель заказа - L_Shop
 */

/**
 * Элемент заказа (копия из корзины)
 */
export interface OrderItem {
  /** ID продукта */
  productId: string;
  /** Название продукта на момент заказа */
  name: string;
  /** Цена на момент заказа */
  price: number;
  /** Количество */
  quantity: number;
  /** Скидка на момент заказа */
  discountPercent?: number;
}

/**
 * Статус заказа
 */
export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

/**
 * Способ оплаты
 */
export type PaymentMethod = 'cash' | 'card' | 'online';

/**
 * Тип доставки - Вариант 24
 */
export type DeliveryType = 'courier' | 'pickup';

/**
 * Заказ
 */
export interface Order {
  /** Уникальный идентификатор */
  id: string;
  /** ID пользователя */
  userId: string;
  /** Элементы заказа */
  items: OrderItem[];
  /** Адрес доставки */
  deliveryAddress: string;
  /** Телефон */
  phone: string;
  /** Email */
  email: string;
  /** Способ оплаты */
  paymentMethod: PaymentMethod;
  /** Тип доставки (Вариант 24) */
  deliveryType?: DeliveryType;
  /** Комментарий к заказу (Вариант 24) */
  comment?: string;
  /** Статус заказа */
  status: OrderStatus;
  /** Общая сумма */
  totalSum: number;
  /** Дата создания */
  createdAt: string;
  /** Дата обновления */
  updatedAt?: string;
}

/**
 * Данные для создания заказа
 */
export interface CreateOrderData {
  deliveryAddress: string;
  phone: string;
  email: string;
  paymentMethod: PaymentMethod;
  deliveryType?: DeliveryType;
  comment?: string;
}