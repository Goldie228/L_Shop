/**
 * Unit-тесты для ProductController - L_Shop
 * Тестирование endpoints API продуктов
 */

import { Request, Response } from 'express';
import { Product } from '../../models/product.model';

// Мокаем сервис до импорта контроллера
const mockGetProducts = jest.fn();
const mockGetProductById = jest.fn();

jest.mock('../../services/product.service', () => {
  return {
    ProductService: jest.fn().mockImplementation(() => ({
      getProducts: mockGetProducts,
      getProductById: mockGetProductById,
    })),
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
  ];

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
    it('должен вернуть список продуктов без фильтров', async () => {
      mockGetProducts.mockResolvedValue(mockProducts);

      await getProducts(mockRequest as Request, mockResponse as Response);

      expect(mockGetProducts).toHaveBeenCalledWith({});
      expect(mockJson).toHaveBeenCalledWith(mockProducts);
    });

    it('должен передать все фильтры в сервис', async () => {
      mockGetProducts.mockResolvedValue(mockProducts);

      mockRequest.query = {
        search: 'iphone',
        sort: 'price_asc',
        category: 'electronics',
        inStock: 'true',
        minRating: '4.0',
      };

      await getProducts(mockRequest as Request, mockResponse as Response);

      expect(mockGetProducts).toHaveBeenCalledWith({
        search: 'iphone',
        sort: 'price_asc',
        category: 'electronics',
        inStock: 'true',
        minRating: '4.0',
      });
    });

    it('должен вернуть 400 при некорректном параметре sort', async () => {
      mockRequest.query = { sort: 'invalid_sort' };

      await getProducts(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        message: 'Некорректный параметр sort. Допустимые значения: price_asc, price_desc',
        error: 'INVALID_SORT_PARAMETER',
      });
    });

    it('должен вернуть 400 при некорректном параметре inStock', async () => {
      mockRequest.query = { inStock: 'yes' };

      await getProducts(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        message: 'Некорректный параметр inStock. Допустимые значения: true, false',
        error: 'INVALID_INSTOCK_PARAMETER',
      });
    });

    it('должен вернуть 400 при некорректном minRating (не число)', async () => {
      mockRequest.query = { minRating: 'abc' };

      await getProducts(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        message: 'Некорректный параметр minRating. Допустимые значения: число от 1 до 5',
        error: 'INVALID_MINRATING_PARAMETER',
      });
    });

    it('должен вернуть 400 при minRating меньше 1', async () => {
      mockRequest.query = { minRating: '0' };

      await getProducts(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        message: 'Некорректный параметр minRating. Допустимые значения: число от 1 до 5',
        error: 'INVALID_MINRATING_PARAMETER',
      });
    });

    it('должен вернуть 400 при minRating больше 5', async () => {
      mockRequest.query = { minRating: '6' };

      await getProducts(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        message: 'Некорректный параметр minRating. Допустимые значения: число от 1 до 5',
        error: 'INVALID_MINRATING_PARAMETER',
      });
    });

    it('должен принять корректный minRating (Вариант 17)', async () => {
      mockGetProducts.mockResolvedValue([mockProducts[0]]);

      mockRequest.query = { minRating: '4.2' };

      await getProducts(mockRequest as Request, mockResponse as Response);

      expect(mockGetProducts).toHaveBeenCalledWith({ minRating: '4.2' });
      expect(mockJson).toHaveBeenCalledWith([mockProducts[0]]);
    });

    it('должен вернуть 500 при ошибке сервиса', async () => {
      mockGetProducts.mockRejectedValue(new Error('Database error'));

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
