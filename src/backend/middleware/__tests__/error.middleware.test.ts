/**
 * Тесты для error middleware
 * Покрывает: errorHandler, createError, asyncHandler
 */

import { Request, Response, NextFunction } from 'express';
import { errorHandler, createError, asyncHandler, ErrorResponse } from '../error.middleware';
import { logger } from '../../utils/logger';
import { config } from '../../config/constants';
import { ValidationError, NotFoundError, ConflictError, RateLimitError } from '../../errors';

// Моки зависимостей
jest.mock('../../utils/logger', () => ({
  logger: {
    error: jest.fn(),
  },
}));
jest.mock('../../config/constants', () => ({
  config: {
    nodeEnv: 'test' as 'development' | 'production' | 'test',
    get isProduction(): boolean {
      return this.nodeEnv === 'production';
    },
  },
}));

describe('Обработчик ошибок', () => {
  beforeEach(() => {
    // Сбрасываем моки перед каждым тестом
    (logger.error as jest.Mock).mockClear();
    (config as any).nodeEnv = 'development';
  });

  describe('errorHandler', () => {
    const mockReq = {} as Request;
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;
    const mockNext = jest.fn() as NextFunction;

    describe('BusinessError и наследники', () => {
      it('ValidationError: возвращает правильный статус, код и сообщение', () => {
        // Arrange
        const error = new ValidationError('Невалидные данные', {
          field: 'email',
          message: 'Неверный формат',
        });
        (config as any).nodeEnv = 'development';

        // Act
        errorHandler(error, mockReq, mockRes, mockNext);

        // Assert
        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Невалидные данные',
            details: { field: 'email', message: 'Неверный формат' },
          },
          stack: expect.any(String),
        });
      });

      it('NotFoundError: возвращает правильный статус и код по умолчанию', () => {
        // Arrange
        const error = new NotFoundError();
        (config as any).nodeEnv = 'development';

        // Act
        errorHandler(error, mockReq, mockRes, mockNext);

        // Assert
        expect(mockRes.status).toHaveBeenCalledWith(404);
        expect(mockRes.json).toHaveBeenCalledWith({
          error: {
            code: 'NOT_FOUND_ERROR',
            message: 'Ресурс не найден',
          },
          stack: expect.any(String),
        });
      });

      it('ConflictError: возвращает статус 409', () => {
        // Arrange
        const error = new ConflictError('Пользователь уже существует');
        (config as any).nodeEnv = 'development';

        // Act
        errorHandler(error, mockReq, mockRes, mockNext);

        // Assert
        expect(mockRes.status).toHaveBeenCalledWith(409);
        expect(mockRes.json).toHaveBeenCalledWith({
          error: {
            code: 'CONFLICT_ERROR',
            message: 'Пользователь уже существует',
          },
          stack: expect.any(String),
        });
      });

      it('RateLimitError: возвращает статус 429', () => {
        // Arrange
        const error = new RateLimitError();
        (config as any).nodeEnv = 'development';

        // Act
        errorHandler(error, mockReq, mockRes, mockNext);

        // Assert
        expect(mockRes.status).toHaveBeenCalledWith(429);
        expect(mockRes.json).toHaveBeenCalledWith({
          error: {
            code: 'RATE_LIMIT_ERROR',
            message: 'Превышен лимит запросов',
          },
          stack: expect.any(String),
        });
      });

      it('ValidationError с null details: не включает details в ответ', () => {
        // Arrange
        const error = new ValidationError('Ошибка');
        (error as any).details = null;
        (config as any).isProduction = false;

        // Act
        errorHandler(error, mockReq, mockRes, mockNext);

        // Assert
        expect(mockRes.json).toHaveBeenCalledWith(
          expect.objectContaining({
            error: expect.objectContaining({
              code: 'VALIDATION_ERROR',
              message: 'Ошибка',
            }),
          }),
        );
        const response = (mockRes.json as jest.Mock).mock.calls[0][0] as ErrorResponse;
        expect(response.error).not.toHaveProperty('details');
      });

      it('ValidationError с undefined details: не включает details в ответ', () => {
        // Arrange
        const error = new ValidationError('Ошибка');
        (config as any).isProduction = false;

        // Act
        errorHandler(error, mockReq, mockRes, mockNext);

        // Assert
        const response = (mockRes.json as jest.Mock).mock.calls[0][0] as ErrorResponse;
        expect(response.error).not.toHaveProperty('details');
      });
    });

    describe('Обычная Error', () => {
      it('возвращает статус 500 и код INTERNAL_ERROR', () => {
        // Arrange
        const error = new Error('Произошла ошибка') as any;
        (config as any).isProduction = false;

        // Act
        errorHandler(error, mockReq, mockRes, mockNext);

        // Assert
        expect(mockRes.status).toHaveBeenCalledWith(500);
        expect(mockRes.json).toHaveBeenCalledWith({
          error: {
            code: 'INTERNAL_ERROR',
            message: 'Произошла ошибка',
          },
          stack: expect.any(String),
        });
      });

      it('без сообщения: использует сообщение по умолчанию', () => {
        // Arrange
        const error = new Error('') as any;
        error.message = '';
        (config as any).isProduction = false;

        // Act
        errorHandler(error, mockReq, mockRes, mockNext);

        // Assert
        expect(mockRes.json).toHaveBeenCalledWith(
          expect.objectContaining({
            error: expect.objectContaining({
              message: 'Внутренняя ошибка сервера',
            }),
          }),
        );
      });

      it('корректно обрабатывает Error без stack', () => {
        // Arrange
        const error = new Error('Ошибка без стека') as any;
        error.stack = undefined;
        (config as any).nodeEnv = 'development';

        // Act
        errorHandler(error, mockReq, mockRes, mockNext);

        // Assert
        const response = (mockRes.json as jest.Mock).mock.calls[0][0] as ErrorResponse;
        expect(response.stack).toBeUndefined();
      });
    });

    describe('Режимы работы', () => {
      it('development режим: включает stack в ответ', () => {
        // Arrange
        const error = new Error('Тестовая ошибка') as any;
        error.stack = 'Error: Тестовая ошибка\n    at Object.<anonymous> (test.ts:10:10)';
        (config as any).nodeEnv = 'development';

        // Act
        errorHandler(error, mockReq, mockRes, mockNext);

        // Assert
        const response = (mockRes.json as jest.Mock).mock.calls[0][0] as ErrorResponse;
        expect(response.stack).toBe(error.stack);
      });

      it('production режим: не включает stack в ответ', () => {
        // Arrange
        const error = new Error('Тестовая ошибка') as any;
        error.stack = 'Error: Тестовая ошибка\n    at Object.<anonymous> (test.ts:10:10)';
        (config as any).nodeEnv = 'production';

        // Act
        errorHandler(error, mockReq, mockRes, mockNext);

        // Assert
        const response = (mockRes.json as jest.Mock).mock.calls[0][0] as ErrorResponse;
        expect(response).not.toHaveProperty('stack');
      });
    });

    describe('Логирование', () => {
      it('логирует BusinessError с правильными параметрами', () => {
        // Arrange
        const error = new ValidationError('Ошибка валидации', { field: 'name' });
        (config as any).isProduction = false;

        // Act
        errorHandler(error, mockReq, mockRes, mockNext);

        // Assert
        expect(logger.error).toHaveBeenCalledWith(
          { err: error },
          'Ошибка VALIDATION_ERROR (400): Ошибка валидации',
          {
            statusCode: 400,
            code: 'VALIDATION_ERROR',
            message: 'Ошибка валидации',
            details: { field: 'name' },
            stack: expect.any(String),
          },
        );
      });

      it('логирует обычную Error с кодом INTERNAL_ERROR', () => {
        // Arrange
        const error = new Error('Критическая ошибка') as any;
        (config as any).isProduction = false;

        // Act
        errorHandler(error, mockReq, mockRes, mockNext);

        // Assert
        expect(logger.error).toHaveBeenCalledWith(
          { err: error },
          'Ошибка INTERNAL_ERROR (500): Критическая ошибка',
          {
            statusCode: 500,
            code: 'INTERNAL_ERROR',
            message: 'Критическая ошибка',
            stack: expect.any(String),
          },
        );
      });

      it('в production режиме не логирует stack', () => {
        // Arrange
        const error = new Error('Ошибка') as any;
        error.stack = 'stack trace';
        (config as any).isProduction = true;

        // Act
        errorHandler(error, mockReq, mockRes, mockNext);

        // Assert
        expect(logger.error).toHaveBeenCalledWith(
          { err: error },
          'Ошибка INTERNAL_ERROR (500): Ошибка',
          {
            statusCode: 500,
            code: 'INTERNAL_ERROR',
            message: 'Ошибка',
          },
        );
      });
    });
  });

  describe('createError', () => {
    it('создаёт ошибку с кастомными параметрами', () => {
      // Act
      const error = createError('Кастомная ошибка', 400, 'CUSTOM_CODE', { field: 'test' });

      // Assert
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe('Кастомная ошибка');
      expect(error.statusCode).toBe(400);
      expect(error.code).toBe('CUSTOM_CODE');
      expect(error.details).toEqual({ field: 'test' });
    });

    it('использует значения по умолчанию', () => {
      // Act
      const error = createError('Ошибка по умолчанию');

      // Assert
      expect(error.message).toBe('Ошибка по умолчанию');
      expect(error.statusCode).toBe(500);
      expect(error.code).toBe('INTERNAL_ERROR');
      expect(error.details).toBeUndefined();
    });

    it('создаёт ошибку без details', () => {
      // Act
      const error = createError('Без деталей', 422, 'VALIDATION_FAILED');

      // Assert
      expect(error.details).toBeUndefined();
    });

    it('имеет правильный name', () => {
      // Act
      const error = createError('Тест', 500, 'TEST');

      // Assert
      expect(error.name).toBe('Error');
    });
  });

  describe('asyncHandler', () => {
    const mockReq = {} as Request;
    const mockRes = {} as Response;
    const mockNext = jest.fn() as NextFunction;

    it('успешно выполняет async функцию', async () => {
      // Arrange
      const asyncFn = jest.fn().mockResolvedValue(undefined);
      const wrapped = asyncHandler(asyncFn);

      // Act
      await wrapped(mockReq, mockRes, mockNext);

      // Assert
      expect(asyncFn).toHaveBeenCalledWith(mockReq, mockRes, mockNext);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('передаёт ошибку в next() при исключении', async () => {
      // Arrange
      const error = new Error('Async ошибка');
      const asyncFn = jest.fn().mockRejectedValue(error);
      const wrapped = asyncHandler(asyncFn);

      // Act
      await wrapped(mockReq, mockRes, mockNext);

      // Assert
      expect(mockNext).toHaveBeenCalledWith(error);
    });

    it('передаёт ValidationError в next()', async () => {
      // Arrange
      const error = new ValidationError('Ошибка валидации');
      const asyncFn = jest.fn().mockRejectedValue(error);
      const wrapped = asyncHandler(asyncFn);

      // Act
      await wrapped(mockReq, mockRes, mockNext);

      // Assert
      expect(mockNext).toHaveBeenCalledWith(error);
    });

    it('корректно типизирован', () => {
      // Arrange & Act
      const wrapped = asyncHandler(async (_req: Request, _res: Response, _next: NextFunction) => {
        // пустая функция для проверки типизации
      });

      // Assert
      expect(typeof wrapped).toBe('function');
    });
  });
});
