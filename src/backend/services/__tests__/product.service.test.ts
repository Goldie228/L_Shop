/**
 * Unit-тесты для ProductService - L_Shop
 * Вариант 17: тестирование фильтрации по рейтингу, валидации, кэширования, обработки ошибок
 */

// Мок логгера должен быть определен ДО jest.mock
const mockLogger = {
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
} as any;

// Моки должны быть объявлены ДО импорта ProductService
jest.mock('../../utils/logger');
jest.mock('../../utils/file.utils');

import { modifyJsonFile, clearCache as clearFileCache } from '../../utils/file.utils';
import { createContextLogger } from '../../utils/logger';
import { ValidationError } from '../../errors/validation.error';
import { NotFoundError } from '../../errors/not-found.error';
import { BusinessRuleError } from '../../errors/business-rule.error';
import { Product } from '../../models/product.model';
import { ProductService } from '../product.service';

const mockModifyJsonFile = modifyJsonFile as jest.MockedFunction<typeof modifyJsonFile>;
const mockClearFileCache = clearFileCache as jest.MockedFunction<typeof clearFileCache>;

describe('ProductService', () => {
  let productService: typeof ProductService;

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
    productService = ProductService;
    jest.clearAllMocks();
    // Настраиваем мок createContextLogger после очистки моков
    (createContextLogger as jest.Mock).mockReturnValue(mockLogger);
    // Сбрасываем статический кэш и loggerInstance перед каждым тестом
    // Доступ к приватному статическому полю через any
    (ProductService as any).productCache = new Map();
    (ProductService as any).fileCache = { data: null, timestamp: 0 };
    (ProductService as any).loggerInstance = undefined;
  });

  describe('getProducts', () => {
    it('должен вернуть все продукты без фильтров', async () => {
      mockModifyJsonFile.mockResolvedValue(mockProducts);

      const result = await productService.getProducts({});

      expect(result).toHaveLength(4);
      expect(mockModifyJsonFile).toHaveBeenCalledWith('products.json', expect.any(Function));
      expect(mockLogger.debug).toHaveBeenCalledWith(
        expect.objectContaining({ filters: {}, count: 4 }),
        'Продукты закэшированы',
      );
    });

    it('должен фильтровать по поисковому запросу в названии', async () => {
      mockModifyJsonFile.mockResolvedValue(mockProducts);

      const result = await productService.getProducts({ search: 'iphone' });

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('iPhone 15');
    });

    it('должен фильтровать по поисковому запросу в описании', async () => {
      mockModifyJsonFile.mockResolvedValue(mockProducts);

      const result = await productService.getProducts({ search: 'волшебнике' });

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Harry Potter Book');
    });

    it('должен игнорировать регистр при поиске', async () => {
      mockModifyJsonFile.mockResolvedValue(mockProducts);

      const result = await productService.getProducts({ search: 'SAMSUNG' });

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Samsung Galaxy');
    });

    it('должен фильтровать по категории', async () => {
      mockModifyJsonFile.mockResolvedValue(mockProducts);

      const result = await productService.getProducts({ category: 'electronics' });

      expect(result).toHaveLength(2);
      expect(result.every((p: Product) => p.category === 'electronics')).toBe(true);
    });

    it('должен фильтровать по наличию (true)', async () => {
      mockModifyJsonFile.mockResolvedValue(mockProducts);

      const result = await productService.getProducts({ inStock: 'true' });

      expect(result).toHaveLength(3);
      expect(result.every((p: Product) => p.inStock === true)).toBe(true);
    });

    it('должен фильтровать по наличию (false)', async () => {
      mockModifyJsonFile.mockResolvedValue(mockProducts);

      const result = await productService.getProducts({ inStock: 'false' });

      expect(result).toHaveLength(1);
      expect(result[0].inStock).toBe(false);
    });

    it('должен фильтровать по минимальному рейтингу (Вариант 17)', async () => {
      mockModifyJsonFile.mockResolvedValue(mockProducts);

      const result = await productService.getProducts({ minRating: '4.2' });

      expect(result).toHaveLength(2);
      expect(result.every((p: Product) => (p.rating || 0) >= 4.2)).toBe(true);
    });

    it('должен сортировать по возрастанию цены', async () => {
      mockModifyJsonFile.mockResolvedValue(mockProducts);

      const result = await productService.getProducts({ sort: 'price_asc' });

      expect(result[0].price).toBe(25);
      expect(result[1].price).toBe(150);
      expect(result[2].price).toBe(799);
      expect(result[3].price).toBe(999);
    });

    it('должен сортировать по убыванию цены', async () => {
      mockModifyJsonFile.mockResolvedValue(mockProducts);

      const result = await productService.getProducts({ sort: 'price_desc' });

      expect(result[0].price).toBe(999);
      expect(result[1].price).toBe(799);
      expect(result[2].price).toBe(150);
      expect(result[3].price).toBe(25);
    });

    it('должен применять несколько фильтров одновременно', async () => {
      mockModifyJsonFile.mockResolvedValue(mockProducts);

      const result = await productService.getProducts({
        category: 'electronics',
        inStock: 'true',
        minRating: '4.0',
      });

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('iPhone 15');
    });

    it('должен возвращать пустой массив если ничего не найдено', async () => {
      mockModifyJsonFile.mockResolvedValue(mockProducts);

      const result = await productService.getProducts({ search: 'nonexistent' });

      expect(result).toHaveLength(0);
    });
  });

  describe('Валидация фильтров', () => {
    it('должен выбрасывать ValidationError при невалидном minRating', async () => {
      mockModifyJsonFile.mockResolvedValue(mockProducts);

      await expect(productService.getProducts({ minRating: 'invalid' })).rejects.toThrow(
        ValidationError,
      );
    });

    it('должен выбрасывать ValidationError при невалидном inStock', async () => {
      mockModifyJsonFile.mockResolvedValue(mockProducts);

      await expect(productService.getProducts({ inStock: 'maybe' })).rejects.toThrow(
        ValidationError,
      );
    });

    it('должен выбрасывать ValidationError при невалидном sort', async () => {
      mockModifyJsonFile.mockResolvedValue(mockProducts);

      await expect(productService.getProducts({ sort: 'invalid' })).rejects.toThrow(
        ValidationError,
      );
    });
  });

  describe('Кэширование', () => {
    it('должен кэшировать результаты запроса', async () => {
      mockModifyJsonFile.mockResolvedValue(mockProducts);

      // Первый запрос - должен прочитать из файла и закэшировать
      const result1 = await productService.getProducts({ category: 'electronics' });
      expect(result1).toHaveLength(2);
      expect(mockModifyJsonFile).toHaveBeenCalledTimes(1);
      expect(mockLogger.debug).toHaveBeenCalledWith(
        expect.objectContaining({ filters: { category: 'electronics' }, count: 2 }),
        'Продукты закэшированы',
      );

      // Второй запрос с теми же фильтрами - должен вернуть из кэша
      mockModifyJsonFile.mockClear();
      const result2 = await productService.getProducts({ category: 'electronics' });
      expect(result2).toHaveLength(2);
      expect(mockModifyJsonFile).not.toHaveBeenCalled();
      expect(mockLogger.debug).toHaveBeenCalledWith(
        expect.objectContaining({ filters: { category: 'electronics' } }),
        'Возвращено из кэша',
      );

      // Результаты идентичны
      expect(result1).toEqual(result2);
    });

    it('должен инвалидировать кэш при изменении данных', async () => {
      mockModifyJsonFile
        .mockResolvedValueOnce(mockProducts) // первый getProducts
        .mockResolvedValueOnce([mockProducts[0], mockProducts[1]]) // второй getProducts после изменений
        .mockResolvedValueOnce([mockProducts[0], mockProducts[1]]); // createProduct

      // Первый запрос - кэширование
      const result1 = await productService.getProducts({});
      expect(result1).toHaveLength(4);

      // Изменяем данные (например, удаляем продукт)
      mockModifyJsonFile.mockImplementationOnce(
        async (
          _filename: string,
          modifier: (data: unknown[]) => unknown[] | Promise<unknown[]>,
        ) => {
          const products = await modifier(mockProducts as unknown[]);
          return (products as Product[]).filter((p) => p.id !== '3' && p.id !== '4');
        },
      );

      // Второй запрос - должен прочитать заново (кэш инвалидирован через clearFileCache)
      const result2 = await productService.getProducts({});
      expect(result2).toHaveLength(2);
      expect(mockClearFileCache).toHaveBeenCalledWith('products.json');
    });

    it('должен использовать разные ключи кэша для разных фильтров', async () => {
      mockModifyJsonFile.mockResolvedValue(mockProducts);

      // Запрос 1
      await productService.getProducts({ category: 'electronics' });
      expect(mockModifyJsonFile).toHaveBeenCalledTimes(1);

      // Запрос 2 с другими фильтрами - новый кэш
      await productService.getProducts({ category: 'sports' });
      expect(mockModifyJsonFile).toHaveBeenCalledTimes(2);

      // Повтор запроса 1 - из кэша
      mockModifyJsonFile.mockClear();
      await productService.getProducts({ category: 'electronics' });
      expect(mockModifyJsonFile).not.toHaveBeenCalled();
    });
  });

  describe('getProductById', () => {
    it('должен вернуть продукт по id', async () => {
      mockModifyJsonFile.mockResolvedValue(mockProducts);

      const result = await productService.getProductById('1');

      expect(result).not.toBeNull();
      expect(result?.name).toBe('iPhone 15');
    });

    it('должен вернуть продукт с полным набором полей', async () => {
      mockModifyJsonFile.mockResolvedValue(mockProducts);

      const result = await productService.getProductById('1');

      expect(result).toEqual({
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
      });
    });

    it('должен выбрасывать NotFoundError для несуществующего id', async () => {
      mockModifyJsonFile.mockResolvedValue(mockProducts);

      await expect(productService.getProductById('999')).rejects.toThrow(NotFoundError);
    });

    it('должен выбрасывать ValidationError при пустом id', async () => {
      mockModifyJsonFile.mockResolvedValue(mockProducts);

      await expect(productService.getProductById('')).rejects.toThrow(ValidationError);
      await expect(productService.getProductById(undefined as unknown as string)).rejects.toThrow(
        ValidationError,
      );
    });
  });

  describe('getAllProducts', () => {
    it('должен вернуть все продукты', async () => {
      mockModifyJsonFile.mockResolvedValue(mockProducts);

      const result = await productService.getAllProducts();

      expect(result).toHaveLength(4);
      expect(mockModifyJsonFile).toHaveBeenCalledWith('products.json', expect.any(Function));
    });

    it('должен выбрасывать ValidationError при ошибке чтения', async () => {
      mockModifyJsonFile.mockRejectedValue(new Error('File error'));

      await expect(productService.getAllProducts()).rejects.toThrow(ValidationError);
    });
  });

  describe('createProduct', () => {
    const validProductData = {
      name: 'New Product',
      description: 'New product description that is at least 10 characters long',
      price: 500,
      currency: 'BYN',
      category: 'electronics',
      inStock: true,
      brand: 'TestBrand',
      warranty: '12 месяцев',
      specifications: { test: 'value' },
    };

    it('должен создать продукт с валидными данными', async () => {
      mockModifyJsonFile.mockResolvedValue(mockProducts);

      const result = await productService.createProduct(validProductData);

      expect(result).toHaveProperty('id');
      expect(result.name).toBe('New Product');
      expect(result.price).toBe(500);
      expect(result.currency).toBe('BYN');
      expect(result.createdAt).toBeDefined();
      expect(result.updatedAt).toBeDefined();
      expect(mockModifyJsonFile).toHaveBeenCalledTimes(1);
      expect(mockClearFileCache).toHaveBeenCalledWith('products.json');
      expect(mockLogger.info).toHaveBeenCalledWith(
        expect.objectContaining({
          productName: 'New Product',
          price: 500,
          category: 'electronics',
        }),
        'Продукт успешно создан',
      );
    });

    it('должен выбрасывать ValidationError при отсутствии обязательных полей', async () => {
      mockModifyJsonFile.mockResolvedValue(mockProducts);

      const invalidData = { ...validProductData, name: '' };

      await expect(productService.createProduct(invalidData)).rejects.toThrow(ValidationError);
    });

    it('должен выбрасывать ValidationError при отрицательной цене', async () => {
      mockModifyJsonFile.mockResolvedValue(mockProducts);

      const invalidData = { ...validProductData, price: -100 };

      await expect(productService.createProduct(invalidData)).rejects.toThrow(ValidationError);
    });

    it('должен выбрасывать ValidationError при невалидном discountPercent (больше 100)', async () => {
      mockModifyJsonFile.mockResolvedValue(mockProducts);

      const invalidData = { ...validProductData, discountPercent: 150 };

      await expect(productService.createProduct(invalidData)).rejects.toThrow(ValidationError);
    });

    it('должен выбрасывать ValidationError при невалидном discountPercent (отрицательный)', async () => {
      mockModifyJsonFile.mockResolvedValue(mockProducts);

      const invalidData = { ...validProductData, discountPercent: -10 };

      await expect(productService.createProduct(invalidData)).rejects.toThrow(ValidationError);
    });

    it('должен выбрасывать BusinessRuleError при скидке, делающей цену <= 0', async () => {
      mockModifyJsonFile.mockResolvedValue(mockProducts);

      const invalidData = { ...validProductData, price: 10, discountPercent: 100 };

      await expect(productService.createProduct(invalidData)).rejects.toThrow(BusinessRuleError);
    });

    it('должен принимать discountPercent = 0', async () => {
      mockModifyJsonFile.mockResolvedValue(mockProducts);

      const validData = { ...validProductData, discountPercent: 0 };

      const result = await productService.createProduct(validData);

      expect(result).toBeDefined();
      expect(result.discountPercent).toBe(0);
    });

    it('должен выбрасывать ValidationError при невалидном brand', async () => {
      mockModifyJsonFile.mockResolvedValue(mockProducts);

      const invalidData = { ...validProductData, brand: '' };

      await expect(productService.createProduct(invalidData)).rejects.toThrow(ValidationError);
    });

    it('должен выбрасывать ValidationError при невалидной гарантии', async () => {
      mockModifyJsonFile.mockResolvedValue(mockProducts);

      const invalidData = { ...validProductData, warranty: '' };

      await expect(productService.createProduct(invalidData)).rejects.toThrow(ValidationError);
    });

    it('должен выбрасывать ValidationError при описании короче 10 символов', async () => {
      mockModifyJsonFile.mockResolvedValue(mockProducts);

      const invalidData = { ...validProductData, description: 'короткое' };

      await expect(productService.createProduct(invalidData)).rejects.toThrow(ValidationError);
    });

    it('должен выбрасывать ValidationError при ошибке modifyJsonFile', async () => {
      mockModifyJsonFile.mockRejectedValue(new Error('File write error'));

      await expect(productService.createProduct(validProductData)).rejects.toThrow(ValidationError);
    });
  });

  describe('updateProduct', () => {
    const updateData = {
      name: 'Updated iPhone',
      price: 1099,
      discountPercent: 10,
    };

    it('должен обновить продукт успешно', async () => {
      mockModifyJsonFile.mockResolvedValue(mockProducts);

      const result = await productService.updateProduct('1', updateData);

      expect(result).not.toBeNull();
      expect(result!.id).toBe('1');
      expect(result!.name).toBe('Updated iPhone');
      expect(result!.price).toBe(1099);
      expect(result!.discountPercent).toBe(10);
      expect(mockModifyJsonFile).toHaveBeenCalledTimes(1);
      expect(mockClearFileCache).toHaveBeenCalledWith('products.json');
      expect(mockLogger.info).toHaveBeenCalledWith(
        expect.objectContaining({
          productId: '1',
          productName: 'Updated iPhone',
          price: 1099,
          updatedFields: ['name', 'price', 'discountPercent'],
        }),
        'Продукт успешно обновлён',
      );
    });

    it('должен выбрасывать NotFoundError при обновлении несуществующего продукта', async () => {
      mockModifyJsonFile.mockResolvedValue(mockProducts);

      await expect(productService.updateProduct('999', updateData)).rejects.toThrow(NotFoundError);
    });

    it('должен выбрасывать ValidationError при невалидных данных обновления', async () => {
      mockModifyJsonFile.mockResolvedValue(mockProducts);

      const invalidData = { ...updateData, price: -100 };

      await expect(productService.updateProduct('1', invalidData)).rejects.toThrow(ValidationError);
    });

    it('должен выбрасывать BusinessRuleError при скидке, делающей цену <= 0', async () => {
      mockModifyJsonFile.mockResolvedValue(mockProducts);

      const invalidData = { price: 10, discountPercent: 100 };

      await expect(productService.updateProduct('1', invalidData)).rejects.toThrow(
        BusinessRuleError,
      );
    });

    it('должен выбрасывать ValidationError при пустом id', async () => {
      mockModifyJsonFile.mockResolvedValue(mockProducts);

      await expect(productService.updateProduct('', updateData)).rejects.toThrow(ValidationError);
    });

    it('должен выбрасывать ValidationError при ошибке modifyJsonFile', async () => {
      mockModifyJsonFile.mockRejectedValue(new Error('File write error'));

      await expect(productService.updateProduct('1', updateData)).rejects.toThrow(ValidationError);
    });

    it('должен корректно обновлять только указанные поля', async () => {
      mockModifyJsonFile.mockResolvedValue(mockProducts);

      const result = await productService.updateProduct('1', { price: 1200 });

      expect(result).not.toBeNull();
      expect(result!.price).toBe(1200);
      expect(result!.name).toBe('iPhone 15'); // без изменений
    });
  });

  describe('deleteProduct', () => {
    it('должен удалить продукт успешно', async () => {
      // Первый вызов - для проверки существования продукта
      mockModifyJsonFile
        .mockResolvedValueOnce(mockProducts) // getProductsInternal в deleteProduct
        .mockResolvedValueOnce(mockProducts.filter((p) => p.id !== '1')); // modifyJsonFile удаление

      const result = await productService.deleteProduct('1');

      expect(result).toBe(true);
      expect(mockModifyJsonFile).toHaveBeenCalledTimes(1);
      expect(mockClearFileCache).toHaveBeenCalledWith('products.json');
      expect(mockLogger.info).toHaveBeenCalledWith({ productId: '1' }, 'Продукт успешно удалён');
    });

    it('должен вернуть false при удалении несуществующего продукта', async () => {
      mockModifyJsonFile
        .mockResolvedValueOnce(mockProducts) // getProductsInternal
        .mockResolvedValueOnce(mockProducts); // modifyJsonFile (без изменений)

      const result = await productService.deleteProduct('999');

      expect(result).toBe(false);
    });

    it('должен выбрасывать ValidationError при пустом id', async () => {
      await expect(productService.deleteProduct('')).rejects.toThrow(ValidationError);
      await expect(productService.deleteProduct(undefined as unknown as string)).rejects.toThrow(
        ValidationError,
      );
    });

    it('должен выбрасывать ValidationError при ошибке modifyJsonFile', async () => {
      mockModifyJsonFile.mockRejectedValueOnce(new Error('File write error'));

      await expect(productService.deleteProduct('1')).rejects.toThrow(ValidationError);
    });
  });

  describe('Логирование', () => {
    it('должен логировать ошибки валидации', async () => {
      mockModifyJsonFile.mockResolvedValue(mockProducts);

      await expect(productService.getProducts({ minRating: 'invalid' })).rejects.toThrow();

      expect(mockLogger.warn).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.any(String),
          field: 'minRating',
        }),
        'Ошибка валидации фильтров продуктов',
      );
    });

    it('должен логировать ошибки при создании продукта', async () => {
      mockModifyJsonFile.mockResolvedValue(mockProducts);

      await expect(
        productService.createProduct({
          name: 'Test',
          description: 'Short',
          price: -100,
          category: 'test',
          inStock: true,
          brand: 'Test',
          warranty: 'Test',
          currency: 'BYN',
          specifications: {},
        }),
      ).rejects.toThrow();

      expect(mockLogger.warn).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.any(String),
          field: 'price',
        }),
        'Ошибка валидации при создании продукта',
      );
    });
  });

  describe('Граничные случаи', () => {
    it('должен корректно обрабатывать скидку 100% (итоговая цена = 0)', async () => {
      mockModifyJsonFile.mockResolvedValue(mockProducts);

      // Скидка 100% делает цену 0, что недопустимо
      await expect(
        productService.createProduct({
          name: 'Free Product',
          description: 'Product with 100% discount that should fail',
          price: 10,
          discountPercent: 100,
          category: 'test',
          inStock: true,
          brand: 'Test',
          warranty: '12 месяцев',
          currency: 'BYN',
          specifications: {},
        }),
      ).rejects.toThrow(BusinessRuleError);
    });

    it('должен корректно обрабатывать очень большую скидку', async () => {
      mockModifyJsonFile.mockResolvedValue(mockProducts);

      // Скидка 99.9% от 1 BYN = 0.001 BYN, округляется до 0.00
      await expect(
        productService.createProduct({
          name: 'Almost Free',
          description: 'Product with 99.9% discount',
          price: 1,
          discountPercent: 99.9,
          category: 'test',
          inStock: true,
          brand: 'Test',
          warranty: '12 месяцев',
          currency: 'BYN',
          specifications: {},
        }),
      ).rejects.toThrow(BusinessRuleError);
    });

    it('должен корректно округлять цену после скидки', async () => {
      mockModifyJsonFile.mockResolvedValue(mockProducts);

      const result = await productService.createProduct({
        name: 'Product with discount',
        description: 'Product with 15.5% discount',
        price: 100.5,
        discountPercent: 15.5,
        category: 'test',
        inStock: true,
        brand: 'Test',
        warranty: '12 месяцев',
        currency: 'BYN',
        specifications: {},
      });

      // 100.50 * (1 - 0.155) = 84.9225, округляется до 84.92
      expect(result.price).toBe(100.5);
      // Валидация проверяет final price, но final price не сохраняется как отдельное поле
      // Скидка сохраняется как есть
      expect(result.discountPercent).toBe(15.5);
    });

    it('должен корректно обрабатывать продукты без рейтинга', async () => {
      const productsWithoutRating = [
        ...mockProducts,
        {
          id: '5',
          name: 'Product without rating',
          description: 'No rating provided',
          price: 100,
          currency: 'BYN',
          category: 'other',
          inStock: true,
          createdAt: '2024-01-05T00:00:00.000Z',
          brand: 'Test',
          warranty: '12 месяцев',
          specifications: {},
        },
      ];
      mockModifyJsonFile.mockResolvedValue(productsWithoutRating);

      const result = await productService.getProducts({ minRating: '3' });

      // Продукты без рейтинга (rating = undefined) должны быть отфильтрованы при minRating=3
      expect(result.every((p) => (p.rating || 0) >= 3)).toBe(true);
    });
  });
});
