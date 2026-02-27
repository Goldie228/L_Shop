/**
 * Тесты для OrderService
 * Вариант 24: Интеграция с заказами
 */

import { OrderService } from '../order.service';
import { readJsonFile, writeJsonFile } from '../../utils/file.utils';
import { Order } from '../../models/order.model';
import { Cart } from '../../models/cart.model';
import { Product } from '../../models/product.model';

jest.mock('../../utils/file.utils');

const mockReadJsonFile = readJsonFile as jest.MockedFunction<typeof readJsonFile>;
const mockWriteJsonFile = writeJsonFile as jest.MockedFunction<typeof writeJsonFile>;

describe('Тесты OrderService', () => {
  let orderService: OrderService;

  beforeEach(() => {
    orderService = new OrderService();
    jest.clearAllMocks();
  });

  describe('Получение заказов пользователя', () => {
    it('должен возвращать заказы пользователя', async () => {
      const mockOrders: Order[] = [
        {
          id: 'order-1',
          userId: 'user-1',
          items: [],
          deliveryAddress: 'г. Минск, ул. Примерная, д. 1',
          phone: '+375291234567',
          email: 'test@example.com',
          paymentMethod: 'cash',
          status: 'pending',
          totalSum: 100,
          createdAt: '2026-02-27T12:00:00Z',
        },
        {
          id: 'order-2',
          userId: 'user-2',
          items: [],
          deliveryAddress: 'г. Гомель, ул. Тестовая, д. 2',
          phone: '+375297654321',
          email: 'test2@example.com',
          paymentMethod: 'card',
          status: 'processing',
          totalSum: 200,
          createdAt: '2026-02-27T13:00:00Z',
        },
      ];
      mockReadJsonFile.mockResolvedValue(mockOrders);

      const orders = await orderService.getOrders('user-1');

      expect(orders).toHaveLength(1);
      expect(orders[0].id).toBe('order-1');
      expect(orders[0].userId).toBe('user-1');
    });

    it('должен возвращать пустой массив если заказов нет', async () => {
      mockReadJsonFile.mockResolvedValue([]);

      const orders = await orderService.getOrders('user-1');

      expect(orders).toEqual([]);
    });

    it('должен сортировать заказы по дате создания (новые первые)', async () => {
      const mockOrders: Order[] = [
        {
          id: 'order-1',
          userId: 'user-1',
          items: [],
          deliveryAddress: 'г. Минск',
          phone: '+375291234567',
          email: 'test@example.com',
          paymentMethod: 'cash',
          status: 'pending',
          totalSum: 100,
          createdAt: '2026-02-27T10:00:00Z',
        },
        {
          id: 'order-2',
          userId: 'user-1',
          items: [],
          deliveryAddress: 'г. Минск',
          phone: '+375291234567',
          email: 'test@example.com',
          paymentMethod: 'cash',
          status: 'pending',
          totalSum: 200,
          createdAt: '2026-02-27T15:00:00Z',
        },
      ];
      mockReadJsonFile.mockResolvedValue(mockOrders);

      const orders = await orderService.getOrders('user-1');

      expect(orders[0].id).toBe('order-2');
      expect(orders[1].id).toBe('order-1');
    });
  });

  describe('Получение заказа по ID', () => {
    it('должен возвращать заказ по ID для владельца', async () => {
      const mockOrders: Order[] = [
        {
          id: 'order-1',
          userId: 'user-1',
          items: [],
          deliveryAddress: 'г. Минск, ул. Примерная, д. 1',
          phone: '+375291234567',
          email: 'test@example.com',
          paymentMethod: 'cash',
          status: 'pending',
          totalSum: 100,
          createdAt: '2026-02-27T12:00:00Z',
        },
      ];
      mockReadJsonFile.mockResolvedValue(mockOrders);

      const order = await orderService.getOrderById('user-1', 'order-1');

      expect(order).toEqual(mockOrders[0]);
    });

    it('должен возвращать null если заказ не найден', async () => {
      mockReadJsonFile.mockResolvedValue([]);

      const order = await orderService.getOrderById('user-1', 'non-existent');

      expect(order).toBeNull();
    });

    it('должен возвращать null если пользователь не владелец заказа', async () => {
      const mockOrders: Order[] = [
        {
          id: 'order-1',
          userId: 'user-1',
          items: [],
          deliveryAddress: 'г. Минск',
          phone: '+375291234567',
          email: 'test@example.com',
          paymentMethod: 'cash',
          status: 'pending',
          totalSum: 100,
          createdAt: '2026-02-27T12:00:00Z',
        },
      ];
      mockReadJsonFile.mockResolvedValue(mockOrders);

      const order = await orderService.getOrderById('user-2', 'order-1');

      expect(order).toBeNull();
    });
  });

  describe('Создание заказа', () => {
    it('должен создавать заказ из корзины пользователя', async () => {
      const mockCarts: Cart[] = [
        {
          userId: 'user-1',
          items: [
            { productId: 'product-1', quantity: 2 },
            { productId: 'product-2', quantity: 1 },
          ],
          updatedAt: '2026-02-27T11:00:00Z',
        },
      ];

      const mockProducts: Product[] = [
        {
          id: 'product-1',
          name: 'Товар 1',
          price: 100,
          description: 'Описание 1',
          category: 'Категория 1',
          inStock: true,
          createdAt: '2026-02-01T00:00:00Z',
          discountPercent: 10,
        },
        {
          id: 'product-2',
          name: 'Товар 2',
          price: 50,
          description: 'Описание 2',
          category: 'Категория 2',
          inStock: true,
          createdAt: '2026-02-01T00:00:00Z',
        },
      ];

      mockReadJsonFile
        .mockResolvedValueOnce(mockCarts) // carts
        .mockResolvedValueOnce(mockProducts) // products
        .mockResolvedValueOnce([]); // existing orders

      mockWriteJsonFile.mockResolvedValue();

      const orderData = {
        deliveryAddress: 'г. Минск, ул. Примерная, д. 1',
        phone: '+375291234567',
        email: 'test@example.com',
        paymentMethod: 'cash' as const,
        deliveryType: 'courier' as const,
        comment: 'Позвонить перед доставкой',
      };

      const order = await orderService.createOrder('user-1', orderData);

      expect(order.userId).toBe('user-1');
      expect(order.status).toBe('pending');
      expect(order.deliveryAddress).toBe('г. Минск, ул. Примерная, д. 1');
      expect(order.phone).toBe('+375291234567');
      expect(order.email).toBe('test@example.com');
      expect(order.paymentMethod).toBe('cash');
      expect(order.deliveryType).toBe('courier');
      expect(order.comment).toBe('Позвонить перед доставкой');
      // (100 * 2 * 0.9) + (50 * 1) = 180 + 50 = 230
      expect(order.totalSum).toBe(230);
      expect(order.items).toHaveLength(2);
      expect(mockWriteJsonFile).toHaveBeenCalledTimes(2); // orders + carts
    });

    it('должен выбрасывать ошибку если корзина пуста', async () => {
      mockReadJsonFile.mockResolvedValue([]);

      const orderData = {
        deliveryAddress: 'г. Минск',
        phone: '+375291234567',
        email: 'test@example.com',
        paymentMethod: 'cash' as const,
      };

      await expect(orderService.createOrder('user-1', orderData)).rejects.toThrow('Cart is empty');
    });

    it('должен очищать корзину после создания заказа', async () => {
      const mockCarts: Cart[] = [
        {
          userId: 'user-1',
          items: [{ productId: 'product-1', quantity: 1 }],
          updatedAt: '2026-02-27T11:00:00Z',
        },
      ];

      const mockProducts: Product[] = [
        {
          id: 'product-1',
          name: 'Товар',
          price: 100,
          description: 'Описание',
          category: 'Категория',
          inStock: true,
          createdAt: '2026-02-01T00:00:00Z',
        },
      ];

      mockReadJsonFile
        .mockResolvedValueOnce(mockCarts)
        .mockResolvedValueOnce(mockProducts)
        .mockResolvedValueOnce([]);

      mockWriteJsonFile.mockResolvedValue();

      await orderService.createOrder('user-1', {
        deliveryAddress: 'г. Минск',
        phone: '+375291234567',
        email: 'test@example.com',
        paymentMethod: 'cash',
      });

      // Проверить что корзина очищена
      const lastCall = mockWriteJsonFile.mock.calls[mockWriteJsonFile.mock.calls.length - 1];
      expect(lastCall[1]).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            userId: 'user-1',
            items: [],
          }),
        ]),
      );
    });
  });

  describe('Обновление статуса заказа', () => {
    it('должен обновлять статус заказа', async () => {
      const mockOrders: Order[] = [
        {
          id: 'order-1',
          userId: 'user-1',
          items: [],
          deliveryAddress: 'г. Минск',
          phone: '+375291234567',
          email: 'test@example.com',
          paymentMethod: 'cash',
          status: 'pending',
          totalSum: 100,
          createdAt: '2026-02-27T12:00:00Z',
        },
      ];
      mockReadJsonFile.mockResolvedValue(mockOrders);
      mockWriteJsonFile.mockResolvedValue();

      const updatedOrder = await orderService.updateOrderStatus('order-1', 'processing');

      expect(updatedOrder?.status).toBe('processing');
      expect(updatedOrder?.updatedAt).toBeDefined();
      expect(mockWriteJsonFile).toHaveBeenCalled();
    });

    it('должен возвращать null если заказ не найден', async () => {
      mockReadJsonFile.mockResolvedValue([]);

      const result = await orderService.updateOrderStatus('non-existent', 'processing');

      expect(result).toBeNull();
    });

    it('должен устанавливать updatedAt при обновлении', async () => {
      const mockOrders: Order[] = [
        {
          id: 'order-1',
          userId: 'user-1',
          items: [],
          deliveryAddress: 'г. Минск',
          phone: '+375291234567',
          email: 'test@example.com',
          paymentMethod: 'cash',
          status: 'pending',
          totalSum: 100,
          createdAt: '2026-02-27T12:00:00Z',
        },
      ];
      mockReadJsonFile.mockResolvedValue(mockOrders);
      mockWriteJsonFile.mockResolvedValue();

      const beforeUpdate = new Date().toISOString();
      const updatedOrder = await orderService.updateOrderStatus('order-1', 'shipped');
      const afterUpdate = new Date().toISOString();

      expect(updatedOrder?.updatedAt).toBeDefined();
      expect(updatedOrder?.updatedAt! >= beforeUpdate).toBe(true);
      expect(updatedOrder?.updatedAt! <= afterUpdate).toBe(true);
    });
  });

  describe('Расчёт суммы заказа со скидками', () => {
    it('должен правильно рассчитывать сумму с учётом скидок', async () => {
      const mockCarts: Cart[] = [
        {
          userId: 'user-1',
          items: [
            { productId: 'product-1', quantity: 3 },
          ],
          updatedAt: '2026-02-27T11:00:00Z',
        },
      ];

      const mockProducts: Product[] = [
        {
          id: 'product-1',
          name: 'Товар со скидкой',
          price: 200,
          description: 'Описание',
          category: 'Категория',
          inStock: true,
          createdAt: '2026-02-01T00:00:00Z',
          discountPercent: 25, // 25% скидка
        },
      ];

      mockReadJsonFile
        .mockResolvedValueOnce(mockCarts)
        .mockResolvedValueOnce(mockProducts)
        .mockResolvedValueOnce([]);

      mockWriteJsonFile.mockResolvedValue();

      const order = await orderService.createOrder('user-1', {
        deliveryAddress: 'г. Минск',
        phone: '+375291234567',
        email: 'test@example.com',
        paymentMethod: 'cash',
      });

      // 200 * 3 * (1 - 0.25) = 600 * 0.75 = 450
      expect(order.totalSum).toBe(450);
    });
  });
});