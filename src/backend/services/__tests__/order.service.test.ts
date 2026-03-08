/**
 * Unit-тесты для OrderService
 * Вариант 24: deliveryType, comment
 */

import { OrderService } from '../order.service';
import { readJsonFile, modifyJsonFile } from '../../utils/file.utils';
import { Order } from '../../models/order.model';
import { Cart } from '../../models/cart.model';
import { Product } from '../../models/product.model';
import { ValidationError, NotFoundError, BusinessRuleError } from '../../errors';

jest.mock('../../utils/file.utils');
jest.mock('../../utils/logger', () => ({
  createContextLogger: jest.fn(() => ({
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  })),
}));

const mockReadJsonFile = readJsonFile as jest.MockedFunction<typeof readJsonFile>;
const mockModifyJsonFile = modifyJsonFile as jest.MockedFunction<typeof modifyJsonFile>;

describe('OrderService', () => {
  // Состояния для моков
  let ordersState: Order[];
  let cartsState: Cart[];
  let productsState: Product[];

  // Базовые тестовые данные
  const baseProduct: Product = {
    id: 'product-1',
    name: 'iPhone 15',
    description: 'Смартфон',
    price: 1000,
    currency: 'BYN',
    category: 'electronics',
    inStock: true,
    imageUrl: '/images/iphone15.jpg',
    brand: 'Apple',
    warranty: '12 месяцев',
    specifications: { Диагональ: '6.1"', Память: '128 ГБ' },
    rating: 4.5,
    reviewsCount: 100,
    createdAt: '2026-02-01T00:00:00Z',
    updatedAt: '2026-02-01T00:00:00Z',
    discountPercent: 10,
  };

  const baseCart: Cart = {
    userId: 'user-1',
    items: [{ productId: 'product-1', quantity: 2 }],
    updatedAt: '2026-02-19T10:00:00Z',
    currency: 'BYN',
  };

  beforeEach(() => {
    // Инициализируем состояния (глубокие копии для избежания мутации)
    ordersState = [];
    cartsState = [JSON.parse(JSON.stringify(baseCart))];
    productsState = [JSON.parse(JSON.stringify(baseProduct))];

    // Сбрасываем статические кэши
    OrderService.invalidateAllCache();
    jest.clearAllMocks();

    // Настраиваем мок readJsonFile для возврата состояний
    mockReadJsonFile.mockImplementation(async (filename: string) => {
      switch (filename) {
        case 'orders.json':
          return ordersState;
        case 'carts.json':
          return cartsState;
        case 'products.json':
          return productsState;
        default:
          return [];
      }
    });

    // Настраиваем мок modifyJsonFile для обновления состояний
    mockModifyJsonFile.mockImplementation(
      async (filename: string, modifier: (data: unknown[]) => unknown[] | Promise<unknown[]>) => {
        const currentData = await mockReadJsonFile(filename);
        const modified = await modifier(currentData);

        // Обновляем состояние
        switch (filename) {
          case 'orders.json':
            ordersState = modified as Order[];
            break;
          case 'carts.json':
            cartsState = modified as Cart[];
            break;
          case 'products.json':
            productsState = modified as Product[];
            break;
        }

        return modified;
      },
    );
  });

  describe('createOrder', () => {
    it('должен создать заказ из корзины', async () => {
      const result = await new OrderService().createOrder('user-1', {
        firstName: 'Иван',
        deliveryAddress: 'ул. Пушкина, д. 10',
        phone: '+375291234567',
        email: 'test@example.com',
        paymentMethod: 'cash',
        deliveryType: 'courier',
        comment: 'Позвонить перед доставкой',
      });

      expect(result.userId).toBe('user-1');
      expect(result.status).toBe('pending');
      expect(result.items).toHaveLength(1);
      expect(result.deliveryType).toBe('courier');
      expect(result.comment).toBe('Позвонить перед доставкой');
      expect(result.totalSum).toBe(1800); // 1000 * 2 * (1 - 0.1) = 1800
      expect(result.currency).toBe('BYN');
      expect(ordersState).toHaveLength(1);
      expect(cartsState[0].items).toHaveLength(0); // корзина очищена
    });

    it('должен выбросить ValidationError для пустого firstName', async () => {
      await expect(
        new OrderService().createOrder('user-1', {
          firstName: '',
          deliveryAddress: 'ул. Пушкина, д. 10',
          phone: '+375291234567',
          email: 'test@example.com',
          paymentMethod: 'cash',
        }),
      ).rejects.toThrow(ValidationError);
    });

    it('должен выбросить ValidationError для невалидного email', async () => {
      await expect(
        new OrderService().createOrder('user-1', {
          firstName: 'Иван',
          deliveryAddress: 'ул. Пушкина, д. 10',
          phone: '+375291234567',
          email: 'invalid-email',
          paymentMethod: 'cash',
        }),
      ).rejects.toThrow(ValidationError);
    });

    it('должен выбросить BusinessRuleError для пустой корзины', async () => {
      // Устанавливаем пустую корзину
      cartsState = [
        { userId: 'user-1', items: [], updatedAt: new Date().toISOString(), currency: 'BYN' },
      ];

      await expect(
        new OrderService().createOrder('user-1', {
          firstName: 'Иван',
          deliveryAddress: 'ул. Пушкина, д. 10',
          phone: '+375291234567',
          email: 'test@example.com',
          paymentMethod: 'cash',
        }),
      ).rejects.toThrow(BusinessRuleError);
    });

    it('должен выбросить NotFoundError если продукт не найден', async () => {
      // Устанавливаем пустой список продуктов
      productsState = [];

      await expect(
        new OrderService().createOrder('user-1', {
          firstName: 'Иван',
          deliveryAddress: 'ул. Пушкина, д. 10',
          phone: '+375291234567',
          email: 'test@example.com',
          paymentMethod: 'cash',
        }),
      ).rejects.toThrow(NotFoundError);
    });

    it('должен выбросить BusinessRuleError если продукт отсутствует на складе', async () => {
      // Продукт отсутствует на складе
      productsState = [{ ...baseProduct, inStock: false }];

      await expect(
        new OrderService().createOrder('user-1', {
          firstName: 'Иван',
          deliveryAddress: 'ул. Пушкина, д. 10',
          phone: '+375291234567',
          email: 'test@example.com',
          paymentMethod: 'cash',
        }),
      ).rejects.toThrow(BusinessRuleError);
    });

    it('должен корректно рассчитать сумму со скидкой', async () => {
      const result = await new OrderService().createOrder('user-1', {
        firstName: 'Иван',
        deliveryAddress: 'ул. Пушкина, д. 10',
        phone: '+375291234567',
        email: 'test@example.com',
        paymentMethod: 'cash',
      });

      // 1000 * 2 * (1 - 0.1) = 1800
      expect(result.totalSum).toBe(1800);
    });

    it('должен корректно округлять сумму до 2 знаков', async () => {
      // Продукт с дробной ценой
      productsState = [{ ...baseProduct, price: 999.999 }];

      const result = await new OrderService().createOrder('user-1', {
        firstName: 'Иван',
        deliveryAddress: 'ул. Пушкина, д. 10',
        phone: '+375291234567',
        email: 'test@example.com',
        paymentMethod: 'cash',
      });

      // 999.999 * 2 = 1999.998 * (1 - 0.1) = 1799.9982 -> округление до 1800.00
      expect(result.totalSum).toBe(1800);
    });

    it('должен корректно обрабатывать заказ с нулевым discountPercent', async () => {
      productsState = [{ ...baseProduct, discountPercent: 0 }];

      const result = await new OrderService().createOrder('user-1', {
        firstName: 'Иван',
        deliveryAddress: 'ул. Пушкина, д. 10',
        phone: '+375291234567',
        email: 'test@example.com',
        paymentMethod: 'cash',
      });

      // 1000 * 2 = 2000 (без скидки)
      expect(result.totalSum).toBe(2000);
    });

    it('должен корректно обрабатывать заказ с несколькими товарами', async () => {
      const multiProducts: Product[] = [
        { ...baseProduct, id: 'product-1', price: 1000, discountPercent: 10 },
        {
          id: 'product-2',
          name: 'AirPods Pro',
          description: 'Наушники',
          price: 500,
          currency: 'BYN',
          category: 'electronics',
          inStock: true,
          imageUrl: '/images/airpods.jpg',
          brand: 'Apple',
          warranty: '6 месяцев',
          specifications: { Тип: 'TWS', 'Время работы': '6 часов' },
          rating: 4.7,
          reviewsCount: 200,
          createdAt: '2026-02-01T00:00:00Z',
          updatedAt: '2026-02-01T00:00:00Z',
          discountPercent: 0,
        },
      ];
      const multiItemCart: Cart[] = [
        {
          userId: 'user-1',
          items: [
            { productId: 'product-1', quantity: 2 },
            { productId: 'product-2', quantity: 1 },
          ],
          updatedAt: new Date().toISOString(),
          currency: 'BYN',
        },
      ];

      productsState = multiProducts;
      cartsState = multiItemCart;

      const result = await new OrderService().createOrder('user-1', {
        firstName: 'Иван',
        deliveryAddress: 'ул. Пушкина, д. 10',
        phone: '+375291234567',
        email: 'test@example.com',
        paymentMethod: 'cash',
      });

      // (1000 * 2 * 0.9) + (500 * 1) = 1800 + 500 = 2300
      expect(result.totalSum).toBe(2300);
      expect(result.items).toHaveLength(2);
    });

    it('должен корректно округлять при сложных расчётах', async () => {
      const productsWithDecimal: Product[] = [
        { ...baseProduct, id: 'product-1', price: 333.333, discountPercent: 0 },
        {
          id: 'product-2',
          name: 'AirPods Pro',
          description: 'Наушники',
          price: 666.667,
          currency: 'BYN',
          category: 'electronics',
          inStock: true,
          imageUrl: '/images/airpods.jpg',
          brand: 'Apple',
          warranty: '6 месяцев',
          specifications: { Тип: 'TWS', 'Время работы': '6 часов' },
          rating: 4.7,
          reviewsCount: 200,
          createdAt: '2026-02-01T00:00:00Z',
          updatedAt: '2026-02-01T00:00:00Z',
          discountPercent: 0,
        },
      ];
      const multiItemCart: Cart[] = [
        {
          userId: 'user-1',
          items: [
            { productId: 'product-1', quantity: 3 },
            { productId: 'product-2', quantity: 2 },
          ],
          updatedAt: new Date().toISOString(),
          currency: 'BYN',
        },
      ];

      productsState = productsWithDecimal;
      cartsState = multiItemCart;

      const result = await new OrderService().createOrder('user-1', {
        firstName: 'Иван',
        deliveryAddress: 'ул. Пушкина, д. 10',
        phone: '+375291234567',
        email: 'test@example.com',
        paymentMethod: 'cash',
      });

      // (333.333 * 3) + (666.667 * 2) = 999.999 + 1333.334 = 2333.333 -> округление до 2333.33
      expect(result.totalSum).toBe(2333.33);
    });
  });

  describe('getOrders', () => {
    it('должен вернуть заказы пользователя', async () => {
      const mockUserOrders: Order[] = [
        {
          id: 'order-1',
          userId: 'user-1',
          firstName: 'Иван',
          items: [
            {
              productId: 'product-1',
              name: 'iPhone 15',
              price: 1000,
              currency: 'BYN',
              quantity: 2,
            },
          ],
          deliveryAddress: 'ул. Пушкина, д. 10',
          phone: '+375291234567',
          email: 'test@example.com',
          paymentMethod: 'cash',
          status: 'pending',
          currency: 'BYN',
          totalSum: 2000,
          createdAt: '2026-02-19T10:00:00Z',
        },
      ];
      ordersState = mockUserOrders;

      const result = await new OrderService().getOrders('user-1');

      expect(result).toHaveLength(1);
      expect(result[0].userId).toBe('user-1');
    });

    it('должен вернуть пустой массив для пользователя без заказов', async () => {
      ordersState = [];

      const result = await new OrderService().getOrders('user-1');

      expect(result).toHaveLength(0);
    });

    it('должен использовать кэш при повторном вызове', async () => {
      const mockUserOrders: Order[] = [
        {
          id: 'order-1',
          userId: 'user-1',
          firstName: 'Иван',
          items: [],
          deliveryAddress: '',
          phone: '',
          email: '',
          paymentMethod: 'cash',
          status: 'pending',
          currency: 'BYN',
          totalSum: 0,
          createdAt: new Date().toISOString(),
        },
      ];
      ordersState = mockUserOrders;

      // Первый вызов - читает из файла
      const result1 = await new OrderService().getOrders('user-1');
      // Второй вызов - должен использовать кэш
      const result2 = await new OrderService().getOrders('user-1');

      expect(result1).toEqual(result2);
      expect(mockReadJsonFile).toHaveBeenCalledTimes(1);
    });

    it('должен инвалидировать кэш при создании заказа', async () => {
      ordersState = [];

      // Сначала получаем пустой список (кэшируется)
      await new OrderService().getOrders('user-1');

      // Создаём заказ
      const result = await new OrderService().createOrder('user-1', {
        firstName: 'Иван',
        deliveryAddress: 'ул. Пушкина, д. 10',
        phone: '+375291234567',
        email: 'test@example.com',
        paymentMethod: 'cash',
      });

      expect(result).toBeDefined();
      // После создания заказа кэш должен быть инвалидирован
      // Следующий вызов должен читать из файла
      const orders = await new OrderService().getOrders('user-1');
      expect(orders).toHaveLength(1);
    });
  });

  describe('getOrderById', () => {
    it('должен вернуть заказ по ID', async () => {
      const mockUserOrders: Order[] = [
        {
          id: 'order-1',
          userId: 'user-1',
          firstName: 'Иван',
          items: [],
          deliveryAddress: '',
          phone: '',
          email: '',
          paymentMethod: 'cash',
          status: 'pending',
          currency: 'BYN',
          totalSum: 0,
          createdAt: new Date().toISOString(),
        },
      ];
      ordersState = mockUserOrders;

      const result = await new OrderService().getOrderById('user-1', 'order-1');

      expect(result).not.toBeNull();
      expect(result?.id).toBe('order-1');
    });

    it('должен вернуть null если заказ не найден', async () => {
      ordersState = [];

      const result = await new OrderService().getOrderById('user-1', 'non-existent');

      expect(result).toBeNull();
    });

    it('должен использовать кэш если доступен', async () => {
      const mockUserOrders: Order[] = [
        {
          id: 'order-1',
          userId: 'user-1',
          firstName: 'Иван',
          items: [],
          deliveryAddress: '',
          phone: '',
          email: '',
          paymentMethod: 'cash',
          status: 'pending',
          currency: 'BYN',
          totalSum: 0,
          createdAt: new Date().toISOString(),
        },
      ];
      ordersState = mockUserOrders;

      // Первый вызов кэширует
      await new OrderService().getOrderById('user-1', 'order-1');
      // Второй вызов должен использовать кэш
      const result = await new OrderService().getOrderById('user-1', 'order-1');

      expect(result).not.toBeNull();
      expect(mockReadJsonFile).toHaveBeenCalledTimes(1);
    });
  });

  describe('updateOrderStatus', () => {
    it('должен обновить статус заказа', async () => {
      ordersState = [
        {
          id: 'order-1',
          userId: 'user-1',
          firstName: 'Иван',
          items: [],
          deliveryAddress: '',
          phone: '',
          email: '',
          paymentMethod: 'cash',
          status: 'pending',
          currency: 'BYN',
          totalSum: 0,
          createdAt: new Date().toISOString(),
        },
      ];

      const result = await new OrderService().updateOrderStatus('order-1', 'processing');

      expect(result).not.toBeNull();
      expect(result?.status).toBe('processing');
      expect(ordersState[0].status).toBe('processing');
    });

    it('должен вернуть null если заказ не найден', async () => {
      ordersState = [];

      const result = await new OrderService().updateOrderStatus('non-existent', 'processing');

      expect(result).toBeNull();
    });

    it('должен выбросить ValidationError для невалидного статуса', async () => {
      await expect(
        new OrderService().updateOrderStatus('order-1', 'invalid-status' as any),
      ).rejects.toThrow(ValidationError);
    });

    it('должен инвалидировать весь кэш при обновлении статуса', async () => {
      ordersState = [
        {
          id: 'order-1',
          userId: 'user-1',
          firstName: 'Иван',
          items: [],
          deliveryAddress: '',
          phone: '',
          email: '',
          paymentMethod: 'cash',
          status: 'pending',
          currency: 'BYN',
          totalSum: 0,
          createdAt: new Date().toISOString(),
        },
      ];

      // Сначала кэшируем заказы
      await new OrderService().getOrders('user-1');

      // Обновляем статус
      await new OrderService().updateOrderStatus('order-1', 'processing');

      // Проверяем что кэш очищен (следующий вызов прочитает из файла)
      const orders = await new OrderService().getOrders('user-1');
      expect(orders).toHaveLength(1);
      expect(orders[0].status).toBe('processing');
    });
  });

  describe('getAllOrders', () => {
    it('должен вернуть все заказы', async () => {
      const allOrders: Order[] = [
        {
          id: 'order-1',
          userId: 'user-1',
          firstName: 'Иван',
          items: [],
          deliveryAddress: '',
          phone: '',
          email: '',
          paymentMethod: 'cash',
          status: 'pending',
          currency: 'BYN',
          totalSum: 0,
          createdAt: new Date().toISOString(),
        },
        {
          id: 'order-2',
          userId: 'user-2',
          firstName: 'Петр',
          items: [],
          deliveryAddress: '',
          phone: '',
          email: '',
          paymentMethod: 'card',
          status: 'processing',
          currency: 'BYN',
          totalSum: 0,
          createdAt: new Date().toISOString(),
        },
      ];
      ordersState = allOrders;

      const result = await new OrderService().getAllOrders();

      expect(result).toHaveLength(2);
    });

    it('должен вернуть пустой массив если заказов нет', async () => {
      ordersState = [];

      const result = await new OrderService().getAllOrders();

      expect(result).toHaveLength(0);
    });

    it('должен использовать кэш если доступен', async () => {
      const allOrders: Order[] = [
        {
          id: 'order-1',
          userId: 'user-1',
          firstName: 'Иван',
          items: [],
          deliveryAddress: '',
          phone: '',
          email: '',
          paymentMethod: 'cash',
          status: 'pending',
          currency: 'BYN',
          totalSum: 0,
          createdAt: new Date().toISOString(),
        },
      ];
      ordersState = allOrders;

      // Первый вызов кэширует
      await new OrderService().getAllOrders();
      // Второй вызов должен использовать кэш
      const result = await new OrderService().getAllOrders();

      expect(result).toHaveLength(1);
      expect(mockReadJsonFile).toHaveBeenCalledTimes(1);
    });
  });

  describe('deleteOrder', () => {
    it('должен удалить заказ', async () => {
      ordersState = [
        {
          id: 'order-1',
          userId: 'user-1',
          firstName: 'Иван',
          items: [],
          deliveryAddress: '',
          phone: '',
          email: '',
          paymentMethod: 'cash',
          status: 'pending',
          currency: 'BYN',
          totalSum: 0,
          createdAt: new Date().toISOString(),
        },
      ];

      const result = await new OrderService().deleteOrder('order-1');

      expect(result).toBe(true);
      expect(ordersState).toHaveLength(0);
    });

    it('должен вернуть false если заказ не найден', async () => {
      ordersState = [];

      const result = await new OrderService().deleteOrder('non-existent');

      expect(result).toBe(false);
    });

    it('должен инвалидировать кэш при удалении', async () => {
      ordersState = [
        {
          id: 'order-1',
          userId: 'user-1',
          firstName: 'Иван',
          items: [],
          deliveryAddress: '',
          phone: '',
          email: '',
          paymentMethod: 'cash',
          status: 'pending',
          currency: 'BYN',
          totalSum: 0,
          createdAt: new Date().toISOString(),
        },
      ];

      // Кэшируем заказы
      await new OrderService().getOrders('user-1');

      // Удаляем заказ
      await new OrderService().deleteOrder('order-1');

      // Проверяем что кэш очищен
      const orders = await new OrderService().getOrders('user-1');
      expect(orders).toHaveLength(0);
    });
  });

  describe('Валидация', () => {
    it('должен валидировать обязательные поля createOrder', async () => {
      // Проверка на пустой firstName уже есть выше
      // Проверка на невалидный email уже есть выше

      // Проверка на отсутствие deliveryAddress
      await expect(
        new OrderService().createOrder('user-1', {
          firstName: 'Иван',
          deliveryAddress: '',
          phone: '+375291234567',
          email: 'test@example.com',
          paymentMethod: 'cash',
        }),
      ).rejects.toThrow(ValidationError);
    });

    it('должен валидировать phone формат', async () => {
      await expect(
        new OrderService().createOrder('user-1', {
          firstName: 'Иван',
          deliveryAddress: 'ул. Пушкина, д. 10',
          phone: 'invalid-phone',
          email: 'test@example.com',
          paymentMethod: 'cash',
        }),
      ).rejects.toThrow(ValidationError);
    });

    it('должен валидировать paymentMethod', async () => {
      await expect(
        new OrderService().createOrder('user-1', {
          firstName: 'Иван',
          deliveryAddress: 'ул. Пушкина, д. 10',
          phone: '+375291234567',
          email: 'test@example.com',
          paymentMethod: 'invalid' as any,
        }),
      ).rejects.toThrow(ValidationError);
    });

    it('должен валидировать статус updateOrderStatus', async () => {
      ordersState = [
        {
          id: 'order-1',
          userId: 'user-1',
          firstName: 'Иван',
          items: [],
          deliveryAddress: '',
          phone: '',
          email: '',
          paymentMethod: 'cash',
          status: 'pending',
          currency: 'BYN',
          totalSum: 0,
          createdAt: new Date().toISOString(),
        },
      ];

      await expect(
        new OrderService().updateOrderStatus('order-1', 'invalid-status' as any),
      ).rejects.toThrow(ValidationError);
    });
  });

  describe('Кэширование', () => {
    it('должен кэшировать результаты getOrders', async () => {
      const mockUserOrders: Order[] = [
        {
          id: 'order-1',
          userId: 'user-1',
          firstName: 'Иван',
          items: [],
          deliveryAddress: '',
          phone: '',
          email: '',
          paymentMethod: 'cash',
          status: 'pending',
          currency: 'BYN',
          totalSum: 0,
          createdAt: new Date().toISOString(),
        },
      ];
      ordersState = mockUserOrders;

      // Первый вызов - читает из файла
      const result1 = await new OrderService().getOrders('user-1');
      // Второй вызов - должен использовать кэш
      const result2 = await new OrderService().getOrders('user-1');

      expect(result1).toEqual(result2);
      expect(mockReadJsonFile).toHaveBeenCalledTimes(1);
    });

    it('должен кэшировать результаты getOrderById', async () => {
      const mockUserOrders: Order[] = [
        {
          id: 'order-1',
          userId: 'user-1',
          firstName: 'Иван',
          items: [],
          deliveryAddress: '',
          phone: '',
          email: '',
          paymentMethod: 'cash',
          status: 'pending',
          currency: 'BYN',
          totalSum: 0,
          createdAt: new Date().toISOString(),
        },
      ];
      ordersState = mockUserOrders;

      // Первый вызов кэширует
      await new OrderService().getOrderById('user-1', 'order-1');
      // Второй вызов должен использовать кэш
      const result = await new OrderService().getOrderById('user-1', 'order-1');

      expect(result).not.toBeNull();
      expect(mockReadJsonFile).toHaveBeenCalledTimes(1);
    });

    it('должен кэшировать результаты getAllOrders', async () => {
      const allOrders: Order[] = [
        {
          id: 'order-1',
          userId: 'user-1',
          firstName: 'Иван',
          items: [],
          deliveryAddress: '',
          phone: '',
          email: '',
          paymentMethod: 'cash',
          status: 'pending',
          currency: 'BYN',
          totalSum: 0,
          createdAt: new Date().toISOString(),
        },
      ];
      ordersState = allOrders;

      // Первый вызов кэширует
      await new OrderService().getAllOrders();
      // Второй вызов должен использовать кэш
      const result = await new OrderService().getAllOrders();

      expect(result).toHaveLength(1);
      expect(mockReadJsonFile).toHaveBeenCalledTimes(1);
    });

    it('должен инвалидировать кэш при createOrder', async () => {
      ordersState = [];

      // Кэшируем пустой список
      await new OrderService().getOrders('user-1');

      // Создаём заказ
      await new OrderService().createOrder('user-1', {
        firstName: 'Иван',
        deliveryAddress: 'ул. Пушкина, д. 10',
        phone: '+375291234567',
        email: 'test@example.com',
        paymentMethod: 'cash',
      });

      // Кэш должен быть инвалидирован, следующий вызов прочитает из файла
      const orders = await new OrderService().getOrders('user-1');
      expect(orders).toHaveLength(1);
    });

    it('должен инвалидировать кэш при updateOrderStatus', async () => {
      ordersState = [
        {
          id: 'order-1',
          userId: 'user-1',
          firstName: 'Иван',
          items: [],
          deliveryAddress: '',
          phone: '',
          email: '',
          paymentMethod: 'cash',
          status: 'pending',
          currency: 'BYN',
          totalSum: 0,
          createdAt: new Date().toISOString(),
        },
      ];

      // Кэшируем
      await new OrderService().getOrders('user-1');

      // Обновляем статус
      await new OrderService().updateOrderStatus('order-1', 'processing');

      // Кэш должен быть инвалидирован
      const orders = await new OrderService().getOrders('user-1');
      expect(orders[0].status).toBe('processing');
    });

    it('должен инвалидировать кэш при deleteOrder', async () => {
      ordersState = [
        {
          id: 'order-1',
          userId: 'user-1',
          firstName: 'Иван',
          items: [],
          deliveryAddress: '',
          phone: '',
          email: '',
          paymentMethod: 'cash',
          status: 'pending',
          currency: 'BYN',
          totalSum: 0,
          createdAt: new Date().toISOString(),
        },
      ];

      // Кэшируем
      await new OrderService().getOrders('user-1');

      // Удаляем заказ
      await new OrderService().deleteOrder('order-1');

      // Кэш должен быть инвалидирован
      const orders = await new OrderService().getOrders('user-1');
      expect(orders).toHaveLength(0);
    });
  });

  describe('Граничные случаи', () => {
    it('должен корректно обрабатывать заказ с большим количеством товаров', async () => {
      const product: Product = { ...baseProduct, price: 100, discountPercent: 0 };
      const cart: Cart = {
        userId: 'user-1',
        items: [{ productId: 'product-1', quantity: 1000 }],
        updatedAt: new Date().toISOString(),
        currency: 'BYN',
      };

      productsState = [product];
      cartsState = [cart];

      const result = await new OrderService().createOrder('user-1', {
        firstName: 'Иван',
        deliveryAddress: 'ул. Пушкина, д. 10',
        phone: '+375291234567',
        email: 'test@example.com',
        paymentMethod: 'cash',
      });

      expect(result.totalSum).toBe(100000); // 100 * 1000
    });

    it('должен корректно обрабатывать заказ с нулевой скидкой', async () => {
      productsState = [{ ...baseProduct, discountPercent: 0 }];

      const result = await new OrderService().createOrder('user-1', {
        firstName: 'Иван',
        deliveryAddress: 'ул. Пушкина, д. 10',
        phone: '+375291234567',
        email: 'test@example.com',
        paymentMethod: 'cash',
      });

      expect(result.totalSum).toBe(2000); // 1000 * 2
    });

    it('должен корректно обрабатывать заказ с максимальной скидкой', async () => {
      productsState = [{ ...baseProduct, discountPercent: 100 }];

      const result = await new OrderService().createOrder('user-1', {
        firstName: 'Иван',
        deliveryAddress: 'ул. Пушкина, д. 10',
        phone: '+375291234567',
        email: 'test@example.com',
        paymentMethod: 'cash',
      });

      expect(result.totalSum).toBe(0); // 1000 * 2 * 0 = 0
    });

    it('должен корректно обрабатывать заказ с дробными ценами', async () => {
      productsState = [{ ...baseProduct, price: 99.999 }];

      const result = await new OrderService().createOrder('user-1', {
        firstName: 'Иван',
        deliveryAddress: 'ул. Пушкина, д. 10',
        phone: '+375291234567',
        email: 'test@example.com',
        paymentMethod: 'cash',
      });

      // 99.999 * 2 = 199.998 * 0.9 = 179.9982 -> 180
      expect(result.totalSum).toBe(180);
    });

    it('должен сохранять все поля заказа', async () => {
      const result = await new OrderService().createOrder('user-1', {
        firstName: 'Иван',
        deliveryAddress: 'ул. Пушкина, д. 10',
        phone: '+375291234567',
        email: 'test@example.com',
        paymentMethod: 'cash',
        deliveryType: 'pickup',
        comment: 'Тестовый комментарий',
      });

      expect(result.firstName).toBe('Иван');
      expect(result.deliveryAddress).toBe('ул. Пушкина, д. 10');
      expect(result.phone).toBe('+375291234567');
      expect(result.email).toBe('test@example.com');
      expect(result.paymentMethod).toBe('cash');
      expect(result.deliveryType).toBe('pickup');
      expect(result.comment).toBe('Тестовый комментарий');
    });
  });
});
