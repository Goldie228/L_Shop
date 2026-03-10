/**
 * Unit-тесты для ProductController - L_Shop
 * Тестирование endpoints API продуктов
 */

import { Request, Response } from 'express';
import { Product } from '../../models/product.model';

// Мокаем сервис до импорта контроллера
const mockGetProductsWithPagination = jest.fn();
const mockGetProductById = jest.fn();

jest.mock('../../services/product.service', () => {
  return {
    ProductService: {
      getProductsWithPagination: mockGetProductsWithPagination,
      getProductById: mockGetProductById,
    },
  };
});

// Импортируем контроллер после мокания
import { getProducts, getProductById } from '../product.controller';

describe('ProductController', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockJson: jest.Mock;
  let mockStatus: jest.Mock;

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
  ];

  const mockPaginatedResult = {
    products: mockProducts,
    total: 2,
    limit: 20,
    offset: 0,
    hasMore: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();

    mockJson = jest.fn();
    mockStatus = jest.fn().mockReturnThis();

    mockRequest = {
      query: {},
      params: {},
    };

    mockResponse = {
      json: mockJson,
      status: mockStatus,
    };
  });

  describe('getProducts', () => {
    it('должен вернуть список продуктов с пагинацией', async () => {
      mockGetProductsWithPagination.mockResolvedValue(mockPaginatedResult);

      await getProducts(mockRequest as Request, mockResponse as Response);

      expect(mockGetProductsWithPagination).toHaveBeenCalled();
      expect(mockJson).toHaveBeenCalledWith({
        products: mockProducts,
        pagination: {
          total: 2,
          limit: 20,
          offset: 0,
          hasMore: false,
        },
      });
    });

    it('должен передать параметры пагинации', async () => {
      mockGetProductsWithPagination.mockResolvedValue(mockPaginatedResult);

      mockRequest.query = {
        limit: '10',
        offset: '5',
      };

      await getProducts(mockRequest as Request, mockResponse as Response);

      expect(mockGetProductsWithPagination).toHaveBeenCalledWith(
        expect.objectContaining({
          limit: 10,
          offset: 5,
        }),
      );
    });

    it('должен вернуть 400 при некорректном параметре sort', async () => {
      mockRequest.query = { sort: 'invalid_sort' };

      await getProducts(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        message: 'Некорректный параметр sort. Допустимые значения: price_asc, price_desc',
        error: 'INVALID_SORT_PARAMETER',
        field: 'sort',
      });
    });

    it('должен вернуть 400 при некорректном параметре inStock', async () => {
      mockRequest.query = { inStock: 'yes' };

      await getProducts(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        message: 'Некорректный параметр',
        error: 'INVALID_PARAMETER',
        field: 'inStock',
      });
    });

    it('должен вернуть 400 при некорректном minRating (не число)', async () => {
      mockRequest.query = { minRating: 'abc' };

      await getProducts(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        message: 'Некорректный параметр',
        error: 'INVALID_PARAMETER',
        field: 'minRating',
      });
    });

    it('должен вернуть 400 при minRating меньше 1', async () => {
      mockRequest.query = { minRating: '0' };

      await getProducts(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        message: 'Некорректный параметр',
        error: 'INVALID_PARAMETER',
        field: 'minRating',
      });
    });

    it('должен вернуть 400 при minRating больше 5', async () => {
      mockRequest.query = { minRating: '6' };

      await getProducts(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        message: 'Некорректный параметр',
        error: 'INVALID_PARAMETER',
        field: 'minRating',
      });
    });

    it('должен принять корректный minRating (Вариант 17)', async () => {
      mockGetProductsWithPagination.mockResolvedValue({
        ...mockPaginatedResult,
        products: [mockProducts[0]],
      });

      mockRequest.query = { minRating: '4.2' };

      await getProducts(mockRequest as Request, mockResponse as Response);

      expect(mockGetProductsWithPagination).toHaveBeenCalledWith(
        expect.objectContaining({
          minRating: 4.2,
        }),
      );
    });

    it('должен вернуть 500 при ошибке сервиса', async () => {
      mockGetProductsWithPagination.mockRejectedValue(new Error('Database error'));

      await getProducts(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        message: 'Ошибка при получении продуктов',
        error: 'GET_PRODUCTS_ERROR',
      });
    });
  });

  describe('getProductById', () => {
    it('должен вернуть продукт по id', async () => {
      mockGetProductById.mockResolvedValue(mockProducts[0]);

      mockRequest.params = { id: '1' };

      await getProductById(mockRequest as Request, mockResponse as Response);

      expect(mockGetProductById).toHaveBeenCalledWith('1');
      expect(mockJson).toHaveBeenCalledWith(mockProducts[0]);
    });

    it('должен вернуть 404 для несуществующего продукта', async () => {
      mockGetProductById.mockResolvedValue(null);

      mockRequest.params = { id: '999' };

      await getProductById(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({
        message: 'Product not found',
        error: 'PRODUCT_NOT_FOUND',
      });
    });

    it('должен вернуть 400 если id не указан', async () => {
      mockRequest.params = {};

      await getProductById(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        message: 'ID продукта не указан',
        error: 'MISSING_PRODUCT_ID',
      });
    });

    it('должен вернуть 500 при ошибке сервиса', async () => {
      mockGetProductById.mockRejectedValue(new Error('Database error'));

      mockRequest.params = { id: '1' };

      await getProductById(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        message: 'Ошибка при получении продукта',
        error: 'GET_PRODUCT_ERROR',
      });
    });
  });
});
