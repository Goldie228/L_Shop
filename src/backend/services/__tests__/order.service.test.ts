/**
 * Unit-тесты для OrderService
 * Вариант 24: deliveryType, comment
 */

import { OrderService } from '../order.service';
import { readJsonFile, writeJsonFile } from '../../utils/file.utils';
import { Order } from '../../models/order.model';
import { Cart } from '../../models/cart.model';
import { Product } from '../../models/product.model';

jest.mock('../../utils/file.utils');

const mockReadJsonFile = readJsonFile as jest.MockedFunction<typeof readJsonFile>;
const mockWriteJsonFile = writeJsonFile as jest.MockedFunction<typeof writeJsonFile>;

describe('OrderService', () => {
  let orderService: OrderService;

  const mockProducts: Product[] = [
    {
      id: 'product-1',
      name: 'iPhone 15',
      description: 'Смартфон',
      price: 1000,
      category: 'electronics',
      inStock: true,
      createdAt: '2026-02-01T00:00:00Z',
    },
  ];

  const mockCarts: Cart[] = [
    {
      userId: 'user-1',
      items: [{ productId: 'product-1', quantity: 2 }],
      updatedAt: '2026-02-19T10:00:00Z',
    },
  ];

  const mockOrders: Order[] = [];

  beforeEach(() => {
    orderService = new OrderService();
    jest.clearAllMocks();
  });

  describe('createOrder', () => {
    it('должен создать заказ из корзины', async () => {
      mockReadJsonFile
        .mockResolvedValueOnce(mockCarts)     // carts
        .mockResolvedValueOnce(mockProducts)  // products
        .mockResolvedValueOnce(mockOrders);   // orders
      mockWriteJsonFile.mockResolvedValue();

      const result = await orderService.createOrder('user-1', {
        deliveryAddress: 'ул. Пушкина, д. 10',
        phone: '+375291234567',
        email: 'test@example.com',
        paymentMethod: 'cash',
        deliveryType: 'courier', // Вариант 24
        comment: 'Позвонить перед доставкой', // Вариант 24
      });

      expect(result.userId).toBe('user-1');
      expect(result.status).toBe('pending');
      expect(result.items).toHaveLength(1);
      expect(result.deliveryType).toBe('courier'); // Вариант 24
      expect(result.comment).toBe('Позвонить перед доставкой'); // Вариант 24
    });

    it('должен выбросить ошибку для пустой корзины', async () => {
      mockReadJsonFile.mockResolvedValueOnce([]); // пустые корзины

      await expect(orderService.createOrder('user-1', {
        deliveryAddress: 'ул. Пушкина, д. 10',
        phone: '+375291234567',
        email: 'test@example.com',
        paymentMethod: 'cash',
      })).rejects.toThrow('Cart is empty');
    });

    it('должен очистить корзину после создания заказа', async () => {
      mockReadJsonFile
        .mockResolvedValueOnce(mockCarts)
        .mockResolvedValueOnce(mockProducts)
        .mockResolvedValueOnce(mockOrders);
      mockWriteJsonFile.mockResolvedValue();

      await orderService.createOrder('user-1', {
        deliveryAddress: 'ул. Пушкина, д. 10',
        phone: '+375291234567',
        email: 'test@example.com',
        paymentMethod: 'cash',
      });

      // Проверяем, что writeJsonFile был вызван для очистки корзины
      // Второй вызов - сохранение очищенной корзины
      expect(mockWriteJsonFile).toHaveBeenCalledTimes(2);
    });
  });

  describe('getOrders', () => {
    it('должен вернуть заказы пользователя', async () => {
      const mockUserOrders: Order[] = [
        {
          id: 'order-1',
          userId: 'user-1',
          items: [],
          deliveryAddress: 'ул. Пушкина, д. 10',
          phone: '+375291234567',
          email: 'test@example.com',
          paymentMethod: 'cash',
          status: 'pending',
          totalSum: 2000,
          createdAt: '2026-02-19T10:00:00Z',
        },
      ];
      mockReadJsonFile.mockResolvedValueOnce(mockUserOrders);

      const result = await orderService.getOrders('user-1');

      expect(result).toHaveLength(1);
      expect(result[0].userId).toBe('user-1');
    });

    it('должен вернуть пустой массив для пользователя без заказов', async () => {
      mockReadJsonFile.mockResolvedValueOnce([]);

      const result = await orderService.getOrders('user-1');

      expect(result).toHaveLength(0);
    });
  });
});