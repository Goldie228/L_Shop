/**
 * Типы для работы с заказами - L_Shop
 * Вариант 24: Добавлены deliveryType и comment
 */

/**
 * Элемент заказа - копия данных продукта на момент заказа
 */
export interface OrderItem {
  /** ID продукта */
  productId: string;
  /** Название продукта */
  name: string;
  /** Цена на момент заказа */
  price: number;
  /** Количество */
  quantity: number;
  /** Скидка в процентах (опционально) */
  discountPercent?: number;
}

/**
 * Статус заказа
 */
export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'shipped'
  | 'delivered'
  | 'cancelled';

/**
 * Способ оплаты
 */
export type PaymentMethod = 'cash' | 'card' | 'online';

/**
 * Тип доставки (Вариант 24)
 */
export type DeliveryType = 'courier' | 'pickup';

/**
 * Данные для создания заказа
 */
export interface CreateOrderData {
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
}

/**
 * Полная модель заказа
 */
export interface Order {
  /** ID заказа */
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
  /** Дата обновления (опционально) */
  updatedAt?: string;
}