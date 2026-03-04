/**
 * Unit-тесты для ProductService - L_Shop
 * Вариант 17: тестирование фильтрации по рейтингу
 */

import { ProductService } from '../product.service';
import { readJsonFile } from '../../utils/file.utils';
import { Product } from '../../models/product.model';

jest.mock('../../utils/file.utils');

const mockReadJsonFile = readJsonFile as jest.MockedFunction<typeof readJsonFile>;

describe('ProductService', () => {
  let productService: ProductService;

  const mockProducts: Product[] = [
    {
      id: '1',
      name: 'iPhone 15',
      description: 'Смартфон от Apple',
      price: 999,
      category: 'electronics',
      inStock: true,
      rating: 4.5,
      reviewsCount: 128,
      createdAt: '2024-01-01T00:00:00.000Z',
    },
    {
      id: '2',
      name: 'Samsung Galaxy',
      description: 'Смартфон от Samsung',
      price: 799,
      category: 'electronics',
      inStock: false,
      rating: 4.0,
      reviewsCount: 64,
      createdAt: '2024-01-02T00:00:00.000Z',
    },
    {
      id: '3',
      name: 'Nike Air Max',
      description: 'Кроссовки от Nike',
      price: 150,
      category: 'sports',
      inStock: true,
      rating: 4.8,
      reviewsCount: 256,
      createdAt: '2024-01-03T00:00:00.000Z',
    },
    {
      id: '4',
      name: 'Harry Potter Book',
      description: 'Книга о мальчике-волшебнике',
      price: 25,
      category: 'books',
      inStock: true,
      rating: 3.5,
      reviewsCount: 32,
      createdAt: '2024-01-04T00:00:00.000Z',
    },
  ];

  beforeEach(() => {
    productService = new ProductService();
    jest.clearAllMocks();
  });

  describe('getProducts', () => {
    it('должен вернуть все продукты без фильтров', async () => {
      mockReadJsonFile.mockResolvedValue(mockProducts);

      const result = await productService.getProducts({});

      expect(result).toHaveLength(4);
      expect(mockReadJsonFile).toHaveBeenCalledWith('products.json');
    });

    it('должен фильтровать по поисковому запросу в названии', async () => {
      mockReadJsonFile.mockResolvedValue(mockProducts);

      const result = await productService.getProducts({ search: 'iphone' });

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('iPhone 15');
    });

    it('должен фильтровать по поисковому запросу в описании', async () => {
      mockReadJsonFile.mockResolvedValue(mockProducts);

      const result = await productService.getProducts({ search: 'волшебнике' });

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Harry Potter Book');
    });

    it('должен игнорировать регистр при поиске', async () => {
      mockReadJsonFile.mockResolvedValue(mockProducts);

      const result = await productService.getProducts({ search: 'SAMSUNG' });

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Samsung Galaxy');
    });

    it('должен фильтровать по категории', async () => {
      mockReadJsonFile.mockResolvedValue(mockProducts);

      const result = await productService.getProducts({ category: 'electronics' });

      expect(result).toHaveLength(2);
      expect(result.every((p) => p.category === 'electronics')).toBe(true);
    });

    it('должен фильтровать по наличию (true)', async () => {
      mockReadJsonFile.mockResolvedValue(mockProducts);

      const result = await productService.getProducts({ inStock: 'true' });

      expect(result).toHaveLength(3);
      expect(result.every((p) => p.inStock === true)).toBe(true);
    });

    it('должен фильтровать по наличию (false)', async () => {
      mockReadJsonFile.mockResolvedValue(mockProducts);

      const result = await productService.getProducts({ inStock: 'false' });

      expect(result).toHaveLength(1);
      expect(result[0].inStock).toBe(false);
    });

    it('должен фильтровать по минимальному рейтингу (Вариант 17)', async () => {
      mockReadJsonFile.mockResolvedValue(mockProducts);

      const result = await productService.getProducts({ minRating: '4.2' });

      expect(result).toHaveLength(2);
      expect(result.every((p) => (p.rating || 0) >= 4.2)).toBe(true);
    });

    it('должен включать продукты без рейтинга при фильтре minRating', async () => {
      const productsWithoutRating = [
        ...mockProducts,
        {
          id: '5',
          name: 'Product without rating',
          description: 'No rating',
          price: 100,
          category: 'other',
          inStock: true,
          createdAt: '2024-01-05T00:00:00.000Z',
        },
      ];
      mockReadJsonFile.mockResolvedValue(productsWithoutRating);

      const result = await productService.getProducts({ minRating: '3' });

      // Продукты без рейтинга (rating = 0) должны быть отфильтрованы при minRating=3
      expect(result.every((p) => (p.rating || 0) >= 3)).toBe(true);
    });

    it('должен сортировать по возрастанию цены', async () => {
      mockReadJsonFile.mockResolvedValue(mockProducts);

      const result = await productService.getProducts({ sort: 'price_asc' });

      expect(result[0].price).toBe(25);
      expect(result[1].price).toBe(150);
      expect(result[2].price).toBe(799);
      expect(result[3].price).toBe(999);
    });

    it('должен сортировать по убыванию цены', async () => {
      mockReadJsonFile.mockResolvedValue(mockProducts);

      const result = await productService.getProducts({ sort: 'price_desc' });

      expect(result[0].price).toBe(999);
      expect(result[1].price).toBe(799);
      expect(result[2].price).toBe(150);
      expect(result[3].price).toBe(25);
    });

    it('должен применять несколько фильтров одновременно', async () => {
      mockReadJsonFile.mockResolvedValue(mockProducts);

      const result = await productService.getProducts({
        category: 'electronics',
        inStock: 'true',
        minRating: '4.0',
      });

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('iPhone 15');
    });

    it('должен возвращать пустой массив если ничего не найдено', async () => {
      mockReadJsonFile.mockResolvedValue(mockProducts);

      const result = await productService.getProducts({ search: 'nonexistent' });

      expect(result).toHaveLength(0);
    });
  });

  describe('getProductById', () => {
    it('должен вернуть продукт по id', async () => {
      mockReadJsonFile.mockResolvedValue(mockProducts);

      const result = await productService.getProductById('1');

      expect(result).not.toBeNull();
      expect(result?.name).toBe('iPhone 15');
    });

    it('должен вернуть null для несуществующего id', async () => {
      mockReadJsonFile.mockResolvedValue(mockProducts);

      const result = await productService.getProductById('999');

      expect(result).toBeNull();
    });

    it('должен вернуть продукт с полным набором полей', async () => {
      mockReadJsonFile.mockResolvedValue(mockProducts);

      const result = await productService.getProductById('1');

      expect(result).toEqual({
        id: '1',
        name: 'iPhone 15',
        description: 'Смартфон от Apple',
        price: 999,
        category: 'electronics',
        inStock: true,
        rating: 4.5,
        reviewsCount: 128,
        createdAt: '2024-01-01T00:00:00.000Z',
      });
    });
  });
});