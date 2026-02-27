/**
 * Тесты для CartService - L_Shop Backend
 */

import { CartService } from '../cart.service';
import { readJsonFile, writeJsonFile } from '../../utils/file.utils';
import { Cart } from '../../models/cart.model';
import { Product } from '../../models/product.model';

jest.mock('../../utils/file.utils');

const mockReadJsonFile = readJsonFile as jest.MockedFunction<typeof readJsonFile>;
const mockWriteJsonFile = writeJsonFile as jest.MockedFunction<typeof writeJsonFile>;

// Хелпер для создания глубокой копии корзин
const getFreshCarts = (): Cart[] => [
  {
    userId: 'user-1',
    items: [{ productId: 'product-1', quantity: 2 }],
    updatedAt: '2026-02-19T10:00:00Z',
  },
];

describe('CartService', () => {
  let cartService: CartService;

  const mockProducts: Product[] = [
    {
      id: 'product-1',
      name: 'iPhone 15',
      description: 'Смартфон Apple',
      price: 1000,
      category: 'electronics',
      inStock: true,
      discountPercent: 10,
      createdAt: '2026-02-19T10:00:00Z',
      updatedAt: '2026-02-19T10:00:00Z',
    },
    {
      id: 'product-2',
      name: 'Samsung Galaxy',
      description: 'Смартфон Samsung',
      price: 800,
      category: 'electronics',
      inStock: true,
      createdAt: '2026-02-19T10:00:00Z',
      updatedAt: '2026-02-19T10:00:00Z',
    },
    {
      id: 'product-3',
      name: 'Out of Stock Product',
      description: 'Нет в наличии',
      price: 500,
      category: 'electronics',
      inStock: false,
      createdAt: '2026-02-19T10:00:00Z',
      updatedAt: '2026-02-19T10:00:00Z',
    },
  ];

  beforeEach(() => {
    cartService = new CartService();
    jest.clearAllMocks();
  });

  describe('getCart', () => {
    it('должен вернуть корзину с обогащёнными элементами', async () => {
      mockReadJsonFile
        .mockResolvedValueOnce(getFreshCarts())
        .mockResolvedValueOnce(mockProducts);

      const result = await cartService.getCart('user-1');

      expect(result.userId).toBe('user-1');
      expect(result.items).toHaveLength(1);
      expect(result.items[0].name).toBe('iPhone 15');
    });

    it('должен корректно рассчитывать скидку (вариант 21)', async () => {
      mockReadJsonFile
        .mockResolvedValueOnce(getFreshCarts())
        .mockResolvedValueOnce(mockProducts);

      const result = await cartService.getCart('user-1');

      expect(result.items[0].total).toBe(1800);
      expect(result.items[0].discountPercent).toBe(10);
    });

    it('должен вернуть пустую корзину для нового пользователя', async () => {
      mockReadJsonFile
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce(mockProducts);

      const result = await cartService.getCart('new-user');

      expect(result.items).toHaveLength(0);
      expect(result.totalSum).toBe(0);
    });

    it('должен корректно рассчитывать общую сумму', async () => {
      const cartWithMultipleItems: Cart[] = [
        {
          userId: 'user-1',
          items: [
            { productId: 'product-1', quantity: 1 },
            { productId: 'product-2', quantity: 2 },
          ],
          updatedAt: '2026-02-19T10:00:00Z',
        },
      ];

      mockReadJsonFile
        .mockResolvedValueOnce(cartWithMultipleItems)
        .mockResolvedValueOnce(mockProducts);

      const result = await cartService.getCart('user-1');

      expect(result.totalSum).toBe(2500);
    });
  });

  describe('addItem', () => {
    it('должен добавить новый товар в корзину', async () => {
      mockReadJsonFile
        .mockResolvedValueOnce(getFreshCarts())
        .mockResolvedValueOnce(mockProducts)
        .mockResolvedValueOnce(getFreshCarts())
        .mockResolvedValueOnce(mockProducts);
      mockWriteJsonFile.mockResolvedValue();

      await cartService.addItem('user-1', 'product-2', 1);

      // Проверяем что было записано в файл (2 товара: product-1 и product-2)
      const savedCart = mockWriteJsonFile.mock.calls[0][1] as Cart[];
      expect(savedCart[0].items).toHaveLength(2);
      expect(savedCart[0].items.find((i) => i.productId === 'product-2')).toBeDefined();
    });

    it('должен увеличить количество, если товар уже есть', async () => {
      mockReadJsonFile
        .mockResolvedValueOnce(getFreshCarts())
        .mockResolvedValueOnce(mockProducts)
        .mockResolvedValueOnce(getFreshCarts())
        .mockResolvedValueOnce(mockProducts);
      mockWriteJsonFile.mockResolvedValue();

      await cartService.addItem('user-1', 'product-1', 1);

      const savedCart = mockWriteJsonFile.mock.calls[0][1] as Cart[];
      const item = savedCart[0].items.find((i) => i.productId === 'product-1');
      expect(item?.quantity).toBe(3);
    });

    it('должен выбросить ошибку для несуществующего продукта', async () => {
      mockReadJsonFile
        .mockResolvedValueOnce(getFreshCarts())
        .mockResolvedValueOnce(mockProducts);

      await expect(cartService.addItem('user-1', 'non-existent', 1)).rejects.toThrow(
        'Product not found',
      );
    });

    it('должен выбросить ошибку для продукта не в наличии', async () => {
      mockReadJsonFile
        .mockResolvedValueOnce(getFreshCarts())
        .mockResolvedValueOnce(mockProducts);

      await expect(cartService.addItem('user-1', 'product-3', 1)).rejects.toThrow(
        'Product is out of stock',
      );
    });

    it('должен создать новую корзину для нового пользователя', async () => {
      mockReadJsonFile
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce(mockProducts)
        .mockResolvedValueOnce([{ userId: 'new-user', items: [{ productId: 'product-1', quantity: 1 }], updatedAt: '2026-02-19T10:00:00Z' }])
        .mockResolvedValueOnce(mockProducts);
      mockWriteJsonFile.mockResolvedValue();

      const result = await cartService.addItem('new-user', 'product-1', 1);

      expect(result.userId).toBe('new-user');
      expect(result.items).toHaveLength(1);
      expect(result.items[0].productId).toBe('product-1');
    });
  });

  describe('updateItem', () => {
    it('должен обновить количество товара', async () => {
      mockReadJsonFile
        .mockResolvedValueOnce(getFreshCarts())
        .mockResolvedValueOnce(mockProducts);
      mockWriteJsonFile.mockResolvedValue();

      await cartService.updateItem('user-1', 'product-1', 5);

      const savedCart = mockWriteJsonFile.mock.calls[0][1] as Cart[];
      const item = savedCart[0].items.find((i) => i.productId === 'product-1');
      expect(item?.quantity).toBe(5);
    });

    it('должен удалить товар при количестве 0', async () => {
      mockReadJsonFile
        .mockResolvedValueOnce(getFreshCarts())
        .mockResolvedValueOnce(mockProducts);
      mockWriteJsonFile.mockResolvedValue();

      await cartService.updateItem('user-1', 'product-1', 0);

      const savedCart = mockWriteJsonFile.mock.calls[0][1] as Cart[];
      expect(savedCart[0].items).toHaveLength(0);
    });

    it('должен выбросить ошибку, если корзина не найдена', async () => {
      mockReadJsonFile.mockResolvedValueOnce([]);

      await expect(cartService.updateItem('unknown-user', 'product-1', 5)).rejects.toThrow(
        'Cart not found',
      );
    });

    it('должен выбросить ошибку, если товар не найден в корзине', async () => {
      mockReadJsonFile.mockResolvedValueOnce(getFreshCarts());

      await expect(
        cartService.updateItem('user-1', 'product-2', 5),
      ).rejects.toThrow('Item not found in cart');
    });
  });

  describe('removeItem', () => {
    it('должен удалить товар из корзины', async () => {
      mockReadJsonFile
        .mockResolvedValueOnce(getFreshCarts())
        .mockResolvedValueOnce(mockProducts);
      mockWriteJsonFile.mockResolvedValue();

      await cartService.removeItem('user-1', 'product-1');

      const savedCart = mockWriteJsonFile.mock.calls[0][1] as Cart[];
      expect(savedCart[0].items).toHaveLength(0);
    });

    it('должен выбросить ошибку, если корзина не найдена', async () => {
      mockReadJsonFile.mockResolvedValueOnce([]);

      await expect(cartService.removeItem('unknown-user', 'product-1')).rejects.toThrow(
        'Cart not found',
      );
    });
  });

  describe('clearCart', () => {
    it('должен очистить корзину пользователя', async () => {
      mockReadJsonFile.mockResolvedValueOnce(getFreshCarts());
      mockWriteJsonFile.mockResolvedValue();

      await cartService.clearCart('user-1');

      const savedCart = mockWriteJsonFile.mock.calls[0][1] as Cart[];
      expect(savedCart[0].items).toHaveLength(0);
    });

    it('не должен выбрасывать ошибку, если корзина не найдена', async () => {
      mockReadJsonFile.mockResolvedValueOnce([]);

      await expect(cartService.clearCart('unknown-user')).resolves.not.toThrow();
    });
  });
});