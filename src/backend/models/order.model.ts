/**
 * Модель заказа
 */
import { CartItem } from './cart.model';

export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  deliveryAddress: string;
  phone: string;
  email: string;
  paymentMethod: 'cash' | 'card' | 'online';
  status: 'pending' | 'completed';
  createdAt: string;
}
