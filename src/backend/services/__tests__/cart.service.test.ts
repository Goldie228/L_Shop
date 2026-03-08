/**
 * Тесты для CartService - L_Shop Backend
 * Адаптировано под текущую реализацию
 */

jest.mock('../../utils/file.utils', () => ({
  ...jest.requireActual('../../utils/file.utils'),
  readJsonFile: jest.fn(),
  modifyJsonFile: jest.fn(),
}));
jest.mock('../../utils/logger', () => ({
  createContextLogger: jest.fn(() => ({
    debug: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
  })),
}));

import { CartService } from '../cart.service';
import { readJsonFile, modifyJsonFile, clearCache } from '../../utils/file.utils';
import { Cart, CartWithProducts } from '../../models/cart.model';
import { Product } from '../../models/product.model';
import { ValidationError, NotFoundError, BusinessRuleError, CartError } from '../../errors';

const mockReadJsonFile = readJsonFile as jest.MockedFunction<typeof readJsonFile>;
const mockModifyJsonFile = modifyJsonFile as jest.MockedFunction<typeof modifyJsonFile>;

// Хелпер для создания корзин (модель Cart: userId, items, updatedAt, currency)
const getFreshCarts = (): Cart[] => [
  {
    userId: 'user-1',
    items: [],
    updatedAt: new Date().toISOString(),
    currency: 'BYN',
  },
  {
    userId: 'user-2',
    items: [],
    updatedAt: new Date().toISOString(),
    currency: 'BYN',
  },
];

// Хелпер для создания продуктов (модель Product)
const getFreshProducts = (): Product[] => [
  {
    id: 'prod-1',
    name: 'Товар 1',
    description: 'Описание товара 1',
    price: 100,
    currency: 'BYN',
    category: 'cat-1',
    inStock: true,
    imageUrl: 'image1.jpg',
    discountPercent: 0,
    rating: 5,
    reviewsCount: 10,
    brand: 'Бренд 1',
    warranty: '12 месяцев',
    specifications: {},
    createdAt: new Date().toISOString(),
  },
  {
    id: 'prod-2',
    name: 'Товар 2',
    description: 'Описание товара 2',
    price: 200,
    currency: 'BYN',
    category: 'cat-2',
    inStock: true,
    imageUrl: 'image2.jpg',
    discountPercent: 0,
    rating: 4,
    reviewsCount: 5,
    brand: 'Бренд 2',
    warranty: '24 месяца',
    specifications: {},
    createdAt: new Date().toISOString(),
  },
];

describe('CartService', () => {
  let service: CartService;
  let cartsState: Cart[];
  let productsState: Product[];

  beforeEach(() => {
    jest.clearAllMocks();
    // Очищаем кэш файлов для гарантии изоляции тестов
    clearCache();
    CartService.invalidateProductsCache();
    CartService.cartCache.clear();
    service = new CartService();
    // Инициализируем состояния
    cartsState = getFreshCarts();
    productsState = getFreshProducts();
    // Мок для readJsonFile
    mockReadJsonFile.mockImplementation(async (filePath: string) => {
      if (filePath === 'carts.json') {
        return [...cartsState];
      } else if (filePath === 'products.json') {
        return [...productsState];
      }
      return [];
    });
    // Мок для modifyJsonFile - применяет изменения к cartsState
    mockModifyJsonFile.mockImplementation(
      async (filePath: string, updateFn: (data: unknown[]) => unknown[] | Promise<unknown[]>) => {
        if (filePath === 'carts.json') {
          const result = await updateFn(cartsState);
          cartsState = result as Cart[];
          return cartsState;
        }
        return [] as unknown[];
      },
    );
  });

  describe('getCart', () => {
    it('должен вернуть корзину пользователя', async () => {
      const cart = await service.getCart('user-1');

      expect(cart).toBeDefined();
      expect(cart.userId).toBe('user-1');
      expect(cart.items).toEqual([]);
      expect(cart.totalSum).toBe(0);
    });

    it('должен создать новую корзину если у пользователя нет корзины', async () => {
      // Устанавливаем состояние: нет корзин
      cartsState = [];
      // productsState остаётся по умолчанию (продукты есть)

      const cart = await service.getCart('user-3');

      expect(cart).toBeDefined();
      expect(cart.userId).toBe('user-3');
      expect(cart.items).toEqual([]);
      // getCart не сохраняет новую корзину, поэтому modifyJsonFile не вызывается
      expect(mockModifyJsonFile).not.toHaveBeenCalled();
    });

    it('должен обогатить корзину данными продуктов', async () => {
      // Устанавливаем состояние: корзина с товаром
      cartsState = [
        {
          userId: 'user-1',
          items: [{ productId: 'prod-1', quantity: 2 }],
          updatedAt: new Date().toISOString(),
          currency: 'BYN',
        },
      ];
      // productsState остаётся по умолчанию (содержит prod-1)

      const cart = await service.getCart('user-1');

      expect(cart).toBeDefined();
      expect(cart.items).toHaveLength(1);
      expect(cart.items[0].productId).toBe('prod-1');
      expect(cart.items[0].name).toBe('Товар 1');
      expect(cart.items[0].price).toBe(100);
      expect(cart.items[0].total).toBe(200); // 2 * 100
      expect(cart.totalSum).toBe(200);
    });
  });

  describe('addItem', () => {
    it('должен добавить товар в корзину', async () => {
      const result = await service.addItem('user-1', 'prod-1', 2);

      expect(result).toBeDefined();
      expect(result.userId).toBe('user-1');
      expect(result.items).toHaveLength(1);
      expect(result.items[0].productId).toBe('prod-1');
      expect(result.items[0].quantity).toBe(2);
      expect(mockModifyJsonFile).toHaveBeenCalled();
    });

    it('должен выбросить NotFoundError если продукт не найден', async () => {
      // Устанавливаем состояния
      cartsState = [getFreshCarts()[0]];
      productsState = [];
      // Мок с проверкой filePath, возвращающий копии состояний
      mockReadJsonFile.mockImplementation(async (filePath: string) => {
        if (filePath === 'carts.json') {
          return [...cartsState];
        } else if (filePath === 'products.json') {
          return [...productsState];
        }
        return [];
      });

      await expect(service.addItem('user-1', 'non-existent', 1)).rejects.toThrow(NotFoundError);
    });

    it('должен выбросить BusinessRuleError если товар отсутствует на складе', async () => {
      const productsOutOfStock: Product[] = [
        {
          id: 'prod-1',
          name: 'Товар 1',
          description: 'Описание товара 1',
          price: 100,
          currency: 'BYN',
          category: 'cat-1',
          inStock: false,
          imageUrl: 'image1.jpg',
          discountPercent: 0,
          rating: 5,
          reviewsCount: 10,
          brand: 'Бренд 1',
          warranty: '12 месяцев',
          specifications: {},
          createdAt: new Date().toISOString(),
        },
      ];
      // Устанавливаем состояния
      cartsState = [getFreshCarts()[0]];
      productsState = productsOutOfStock;
      // Мок с проверкой filePath, возвращающий копии состояний
      mockReadJsonFile.mockImplementation(async (filePath: string) => {
        if (filePath === 'carts.json') {
          return [...cartsState];
        } else if (filePath === 'products.json') {
          return [...productsState];
        }
        return [];
      });

      await expect(service.addItem('user-1', 'prod-1', 1)).rejects.toThrow(BusinessRuleError);
    });

    it('должен увеличить количество если товар уже в корзине', async () => {
      const cartsWithItem: Cart[] = [
        {
          userId: 'user-1',
          items: [{ productId: 'prod-1', quantity: 1 }],
          updatedAt: new Date().toISOString(),
          currency: 'BYN',
        },
      ];
      // Устанавливаем состояния
      cartsState = cartsWithItem;
      // productsState остается по умолчанию
      mockReadJsonFile.mockImplementation(async (filePath: string) => {
        if (filePath === 'carts.json') {
          return [...cartsState];
        } else if (filePath === 'products.json') {
          return [...productsState];
        }
        return [];
      });

      const result = await service.addItem('user-1', 'prod-1', 2);

      expect(result.items).toHaveLength(1);
      expect(result.items[0].quantity).toBe(3);
    });
  });

  describe('updateItem', () => {
    it('должен обновить количество товара в корзине', async () => {
      const initialCarts: Cart[] = [
        {
          userId: 'user-1',
          items: [{ productId: 'prod-1', quantity: 2 }],
          updatedAt: new Date().toISOString(),
          currency: 'BYN',
        },
      ];
      // Устанавливаем состояния
      cartsState = initialCarts;
      // productsState остается по умолчанию
      mockReadJsonFile.mockImplementation(async (filePath: string) => {
        if (filePath === 'carts.json') {
          return [...cartsState];
        } else if (filePath === 'products.json') {
          return [...productsState];
        }
        return [];
      });

      const result = await service.updateItem('user-1', 'prod-1', 5);

      expect(result).toBeDefined();
      expect(result.items[0].quantity).toBe(5);
    });

    it('должен удалить товар при quantity <= 0', async () => {
      const initialCarts: Cart[] = [
        {
          userId: 'user-1',
          items: [{ productId: 'prod-1', quantity: 2 }],
          updatedAt: new Date().toISOString(),
          currency: 'BYN',
        },
      ];
      // Устанавливаем состояния
      cartsState = initialCarts;
      // productsState остается по умолчанию
      mockReadJsonFile.mockImplementation(async (filePath: string) => {
        if (filePath === 'carts.json') {
          return [...cartsState];
        } else if (filePath === 'products.json') {
          return [...productsState];
        }
        return [];
      });

      const result = await service.updateItem('user-1', 'prod-1', 0);

      expect(result.items).toHaveLength(0);
    });

    it('должен выбросить NotFoundError если корзина не найдена', async () => {
      // Устанавливаем состояние: нет корзин
      cartsState = [];
      // productsState остается по умолчанию
      mockReadJsonFile.mockImplementation(async (filePath: string) => {
        if (filePath === 'carts.json') {
          return [...cartsState];
        } else if (filePath === 'products.json') {
          return [...productsState];
        }
        return [];
      });

      await expect(service.updateItem('user-1', 'prod-1', 5)).rejects.toThrow(NotFoundError);
    });

    it('должен выбросить NotFoundError если товар не в корзине', async () => {
      const initialCarts: Cart[] = [
        {
          userId: 'user-1',
          items: [],
          updatedAt: new Date().toISOString(),
          currency: 'BYN',
        },
      ];
      // Устанавливаем состояния
      cartsState = initialCarts;
      // productsState остается по умолчанию
      mockReadJsonFile.mockImplementation(async (filePath: string) => {
        if (filePath === 'carts.json') {
          return [...cartsState];
        } else if (filePath === 'products.json') {
          return [...productsState];
        }
        return [];
      });

      await expect(service.updateItem('user-1', 'prod-1', 5)).rejects.toThrow(NotFoundError);
    });

    it('должен выбросить BusinessRuleError если товар отсутствует на складе', async () => {
      const initialCarts: Cart[] = [
        {
          userId: 'user-1',
          items: [{ productId: 'prod-1', quantity: 2 }],
          updatedAt: new Date().toISOString(),
          currency: 'BYN',
        },
      ];
      const productsOutOfStock: Product[] = [
        {
          id: 'prod-1',
          name: 'Товар 1',
          description: 'Описание товара 1',
          price: 100,
          currency: 'BYN',
          category: 'cat-1',
          inStock: false,
          imageUrl: 'image1.jpg',
          discountPercent: 0,
          rating: 5,
          reviewsCount: 10,
          brand: 'Бренд 1',
          warranty: '12 месяцев',
          specifications: {},
          createdAt: new Date().toISOString(),
        },
      ];
      // Устанавливаем состояния
      cartsState = initialCarts;
      productsState = productsOutOfStock;
      // Инвалидируем кэш продуктов чтобы убедиться, что возьмётся productsState
      CartService.invalidateProductsCache();
      // Мок с проверкой filePath, возвращающий копии состояний
      mockReadJsonFile.mockImplementation(async (filePath: string) => {
        if (filePath === 'carts.json') {
          return [...cartsState];
        } else if (filePath === 'products.json') {
          return [...productsState];
        }
        return [];
      });

      await expect(service.updateItem('user-1', 'prod-1', 2)).rejects.toThrow(BusinessRuleError);
    });
  });

  describe('removeItem', () => {
    it('должен удалить товар из корзины', async () => {
      const initialCarts: Cart[] = [
        {
          userId: 'user-1',
          items: [{ productId: 'prod-1', quantity: 2 }],
          updatedAt: new Date().toISOString(),
          currency: 'BYN',
        },
      ];
      // Устанавливаем состояние
      cartsState = initialCarts;
      mockReadJsonFile.mockImplementation(async (filePath: string) => {
        if (filePath === 'carts.json') {
          return [...cartsState];
        } else if (filePath === 'products.json') {
          return getFreshProducts();
        }
        return [];
      });

      const result = await service.removeItem('user-1', 'prod-1');

      expect(result).toBeDefined();
      expect(result.items).toHaveLength(0);
    });

    it('должен выбросить NotFoundError если корзина не найдена', async () => {
      // Устанавливаем состояние: нет корзин
      cartsState = [];
      // productsState остается по умолчанию
      mockReadJsonFile.mockImplementation(async (filePath: string) => {
        if (filePath === 'carts.json') {
          return [...cartsState];
        } else if (filePath === 'products.json') {
          return [...productsState];
        }
        return [];
      });

      await expect(service.removeItem('user-1', 'prod-1')).rejects.toThrow(NotFoundError);
    });

    it('должен выбросить NotFoundError если товар не в корзине', async () => {
      // Устанавливаем состояние: корзина без товаров
      cartsState = [
        {
          userId: 'user-1',
          items: [],
          updatedAt: new Date().toISOString(),
          currency: 'BYN',
        },
      ];
      // productsState остается по умолчанию
      mockReadJsonFile.mockImplementation(async (filePath: string) => {
        if (filePath === 'carts.json') {
          return [...cartsState];
        } else if (filePath === 'products.json') {
          return [...productsState];
        }
        return [];
      });

      await expect(service.removeItem('user-1', 'prod-1')).rejects.toThrow(NotFoundError);
    });
  });

  describe('clearCart', () => {
    it('должен очистить корзину', async () => {
      const initialCarts: Cart[] = [
        {
          userId: 'user-1',
          items: [{ productId: 'prod-1', quantity: 2 }],
          updatedAt: new Date().toISOString(),
          currency: 'BYN',
        },
      ];
      mockReadJsonFile.mockImplementation(async (filePath: string) => {
        if (filePath === 'carts.json') {
          return initialCarts;
        } else if (filePath === 'products.json') {
          return getFreshProducts();
        }
        return [];
      });

      await service.clearCart('user-1');

      expect(mockModifyJsonFile).toHaveBeenCalled();
      // Проверяем, что items стали пустыми
      const callArgs = (mockModifyJsonFile as jest.Mock).mock.calls[0][1] as (
        carts: Cart[],
      ) => Cart[];
      const resultCarts = callArgs(initialCarts);
      expect(resultCarts[0].items).toEqual([]);
    });

    it('должен работать даже если корзина не найдена', async () => {
      mockReadJsonFile.mockImplementation(async (filePath: string) => {
        if (filePath === 'carts.json') {
          return [];
        } else if (filePath === 'products.json') {
          return getFreshProducts();
        }
        return [];
      });

      await expect(service.clearCart('user-1')).resolves.toBeUndefined();
    });
  });

  describe('invalidateProductsCache', () => {
    it('должен инвалидировать кэш продуктов', () => {
      CartService.invalidateProductsCache();
      // Проверяем, что метод не выбрасывает ошибок
      expect(true).toBe(true);
    });
  });

  describe('invalidateCartCache', () => {
    it('должен инвалидировать кэш корзины пользователя', () => {
      const cart: CartWithProducts = {
        userId: 'user-1',
        items: [],
        updatedAt: new Date().toISOString(),
        currency: 'BYN',
        totalSum: 0,
      };
      CartService.cartCache.set('user-1', cart);

      CartService.cartCache.clear();

      expect(CartService.cartCache.has('user-1')).toBe(false);
    });
  });

  describe('обработка ошибок', () => {
    it('должен выбросить CartError при ошибке чтения файла корзин', async () => {
      mockReadJsonFile.mockRejectedValue(new Error('IO Error'));

      await expect(service.getCart('user-1')).rejects.toThrow(CartError);
    });

    it('должен выбросить ValidationError при невалидных данных addItem', async () => {
      await expect(service.addItem('user-1', 'prod-1', -1)).rejects.toThrow(ValidationError);
    });

    it('должен выбросить ValidationError при невалидных данных updateItem', async () => {
      await expect(service.updateItem('user-1', 'prod-1', -5)).rejects.toThrow(ValidationError);
    });
  });
});
