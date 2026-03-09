/**
 * Unit-тесты для ProductService - L_Shop
 * Тестирование фильтрации, CRUD операций
 */

// Мок логгера должен быть определен ДО импорта
const mockLogger = {
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

jest.mock('../../utils/logger', () => ({
  createContextLogger: jest.fn(() => mockLogger),
  logger: mockLogger,
}));

jest.mock('../../utils/file.utils');

import { readJsonFile, writeJsonFile, clearCache } from '../../utils/file.utils';
import { Product } from '../../models/product.model';
import { ProductService } from '../product.service';

const mockReadJsonFile = readJsonFile as jest.MockedFunction<typeof readJsonFile>;
const mockWriteJsonFile = writeJsonFile as jest.MockedFunction<typeof writeJsonFile>;
const mockClearCache = clearCache as jest.MockedFunction<typeof clearCache>;

describe('ProductService', () => {
  const mockProducts: Product[] = [
    {
      id: '1',
      name: 'iPhone 15',
      description: 'Смартфон от Apple',
      price: 999,
      currency: 'BYN',
      category: 'electronics',
      inStock: true,
      imageUrl: '/images/iphone15.jpg',
      brand: 'Apple',
      warranty: '12 месяцев',
      specifications: { Диагональ: '6.1"', Память: '128 ГБ' },
      rating: 4.5,
      reviewsCount: 128,
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
    },
    {
      id: '2',
      name: 'Samsung Galaxy',
      description: 'Смартфон от Samsung',
      price: 799,
      currency: 'BYN',
      category: 'electronics',
      inStock: false,
      imageUrl: '/images/samsung-s24.jpg',
      brand: 'Samsung',
      warranty: '24 месяца',
      specifications: { Диагональ: '6.4"', Память: '256 ГБ' },
      rating: 4.0,
      reviewsCount: 64,
      createdAt: '2024-01-02T00:00:00.000Z',
      updatedAt: '2024-01-02T00:00:00.000Z',
    },
    {
      id: '3',
      name: 'Nike Air Max',
      description: 'Кроссовки от Nike',
      price: 150,
      currency: 'BYN',
      category: 'sports',
      inStock: true,
      imageUrl: '/images/nike-airmax.jpg',
      brand: 'Nike',
      warranty: '6 месяцев',
      specifications: { Размер: '42', Материал: 'текстиль' },
      rating: 4.8,
      reviewsCount: 256,
      createdAt: '2024-01-03T00:00:00.000Z',
      updatedAt: '2024-01-03T00:00:00.000Z',
    },
    {
      id: '4',
      name: 'Harry Potter Book',
      description: 'Книга о мальчике-волшебнике',
      price: 25,
      currency: 'BYN',
      category: 'books',
      inStock: true,
      imageUrl: '/images/harry-potter.jpg',
      brand: 'Bloomsbury',
      warranty: 'не гарантируется',
      specifications: { 'Год издания': '1997', Страниц: '432' },
      rating: 3.5,
      reviewsCount: 32,
      createdAt: '2024-01-04T00:00:00.000Z',
      updatedAt: '2024-01-04T00:00:00.000Z',
    },
  ];

  beforeEach(() => {
    jest.resetAllMocks();
    mockLogger.info.mockClear();
    mockLogger.debug.mockClear();
    mockLogger.warn.mockClear();
    mockLogger.error.mockClear();
  });

  describe('getProducts', () => {
    it('должен вернуть все продукты без фильтров', async () => {
      mockReadJsonFile.mockResolvedValue(mockProducts);

      const result = await ProductService.getProducts({});

      expect(result).toHaveLength(4);
      expect(mockReadJsonFile).toHaveBeenCalledWith('products.json');
    });

    it('должен фильтровать по поисковому запросу в названии', async () => {
      mockReadJsonFile.mockResolvedValue(mockProducts);

      const result = await ProductService.getProducts({ search: 'iphone' });

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('iPhone 15');
    });

    it('должен фильтровать по поисковому запросу в описании', async () => {
      mockReadJsonFile.mockResolvedValue(mockProducts);

      const result = await ProductService.getProducts({ search: 'волшебнике' });

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Harry Potter Book');
    });

    it('должен игнорировать регистр при поиске', async () => {
      mockReadJsonFile.mockResolvedValue(mockProducts);

      const result = await ProductService.getProducts({ search: 'SAMSUNG' });

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Samsung Galaxy');
    });

    it('должен фильтровать по категории', async () => {
      mockReadJsonFile.mockResolvedValue(mockProducts);

      const result = await ProductService.getProducts({ category: 'electronics' });

      expect(result).toHaveLength(2);
      expect(result.every((p) => p.category === 'electronics')).toBe(true);
    });

    it('должен фильтровать по наличию (true)', async () => {
      mockReadJsonFile.mockResolvedValue(mockProducts);

      const result = await ProductService.getProducts({ inStock: 'true' });

      expect(result).toHaveLength(3);
      expect(result.every((p) => p.inStock === true)).toBe(true);
    });

    it('должен фильтровать по наличию (false)', async () => {
      mockReadJsonFile.mockResolvedValue(mockProducts);

      const result = await ProductService.getProducts({ inStock: 'false' });

      expect(result).toHaveLength(1);
      expect(result[0].inStock).toBe(false);
    });

    it('должен фильтровать по минимальному рейтингу', async () => {
      mockReadJsonFile.mockResolvedValue(mockProducts);

      const result = await ProductService.getProducts({ minRating: '4.2' });

      expect(result).toHaveLength(2);
      expect(result.every((p) => (p.rating || 0) >= 4.2)).toBe(true);
    });

    it('должен сортировать по возрастанию цены', async () => {
      mockReadJsonFile.mockResolvedValue(mockProducts);

      const result = await ProductService.getProducts({ sort: 'price_asc' });

      expect(result[0].price).toBe(25);
      expect(result[1].price).toBe(150);
      expect(result[2].price).toBe(799);
      expect(result[3].price).toBe(999);
    });

    it('должен сортировать по убыванию цены', async () => {
      mockReadJsonFile.mockResolvedValue(mockProducts);

      const result = await ProductService.getProducts({ sort: 'price_desc' });

      expect(result[0].price).toBe(999);
      expect(result[1].price).toBe(799);
      expect(result[2].price).toBe(150);
      expect(result[3].price).toBe(25);
    });

    it('должен применять несколько фильтров одновременно', async () => {
      mockReadJsonFile.mockResolvedValue(mockProducts);

      const result = await ProductService.getProducts({
        category: 'electronics',
        inStock: 'true',
        minRating: '4.0',
      });

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('iPhone 15');
    });

    it('должен возвращать пустой массив если ничего не найдено', async () => {
      mockReadJsonFile.mockResolvedValue(mockProducts);

      const result = await ProductService.getProducts({ search: 'nonexistent' });

      expect(result).toHaveLength(0);
    });
  });

  describe('getProductById', () => {
    it('должен вернуть продукт по id', async () => {
      mockReadJsonFile.mockResolvedValue(mockProducts);

      const result = await ProductService.getProductById('1');

      expect(result).not.toBeNull();
      expect(result?.name).toBe('iPhone 15');
    });

    it('должен вернуть null для несуществующего id', async () => {
      mockReadJsonFile.mockResolvedValue(mockProducts);

      const result = await ProductService.getProductById('999');

      expect(result).toBeNull();
    });
  });

  describe('getAllProducts', () => {
    it('должен вернуть все продукты', async () => {
      mockReadJsonFile.mockResolvedValue(mockProducts);

      const result = await ProductService.getAllProducts();

      expect(result).toHaveLength(4);
      expect(mockReadJsonFile).toHaveBeenCalledWith('products.json');
    });
  });

  describe('updateProduct', () => {
    const updateData = {
      name: 'Updated iPhone',
      price: 1099,
    };

    it('должен обновить продукт успешно', async () => {
      mockReadJsonFile.mockResolvedValue(mockProducts);
      mockWriteJsonFile.mockResolvedValue();

      const result = await ProductService.updateProduct('1', updateData);

      expect(result).not.toBeNull();
      expect(result?.id).toBe('1');
      expect(result?.name).toBe('Updated iPhone');
      expect(result?.price).toBe(1099);
    });

    it('должен вернуть null при обновлении несуществующего продукта', async () => {
      mockReadJsonFile.mockResolvedValue(mockProducts);

      const result = await ProductService.updateProduct('999', updateData);

      expect(result).toBeNull();
    });
  });

  describe('deleteProduct', () => {
    it('должен удалить продукт успешно', async () => {
      mockReadJsonFile.mockResolvedValueOnce(mockProducts);
      mockWriteJsonFile.mockResolvedValueOnce();

      const result = await ProductService.deleteProduct('1');

      expect(result).toBe(true);
      expect(mockWriteJsonFile).toHaveBeenCalled();
      expect(mockClearCache).toHaveBeenCalledWith('products.json');
    });

    it('должен вернуть false при удалении несуществующего продукта', async () => {
      mockReadJsonFile.mockResolvedValueOnce(mockProducts);

      const result = await ProductService.deleteProduct('999');

      expect(result).toBe(false);
    });
  });

  describe('getProductsWithPagination', () => {
    it('должен вернуть продукты с пагинацией', async () => {
      mockReadJsonFile.mockResolvedValueOnce(mockProducts);

      const result = await ProductService.getProductsWithPagination({ limit: 2, offset: 0 });

      expect(result.products).toHaveLength(2);
      expect(result.total).toBe(4);
      expect(result.hasMore).toBe(true);
    });

    it('должен вернуть продукты со смещением', async () => {
      mockReadJsonFile.mockResolvedValueOnce(mockProducts);

      const result = await ProductService.getProductsWithPagination({ limit: 2, offset: 2 });

      expect(result.products).toHaveLength(2);
      expect(result.hasMore).toBe(false);
    });
  });

  describe('getProductsStats', () => {
    it('должен вернуть статистику по продуктам', async () => {
      mockReadJsonFile.mockResolvedValueOnce(mockProducts);

      const result = await ProductService.getProductsStats();

      expect(result.total).toBe(4);
      expect(result.inStock).toBe(3);
      expect(result.outOfStock).toBe(1);
      expect(result.categories).toHaveProperty('electronics', 2);
      expect(result.categories).toHaveProperty('sports', 1);
      expect(result.categories).toHaveProperty('books', 1);
    });
  });

  describe('getCategories', () => {
    it('должен вернуть список уникальных категорий', async () => {
      mockReadJsonFile.mockResolvedValue(mockProducts);

      const result = await ProductService.getCategories();

      expect(result).toContain('electronics');
      expect(result).toContain('sports');
      expect(result).toContain('books');
      expect(result).toHaveLength(3);
    });
  });

  describe('productExists', () => {
    it('должен вернуть true для существующего продукта', async () => {
      mockReadJsonFile.mockResolvedValue(mockProducts);

      const result = await ProductService.productExists('1');

      expect(result).toBe(true);
    });

    it('должен вернуть false для несуществующего продукта', async () => {
      mockReadJsonFile.mockResolvedValue(mockProducts);

      const result = await ProductService.productExists('999');

      expect(result).toBe(false);
    });
  });
});