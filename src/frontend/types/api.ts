/**
 * Типы API - L_Shop Frontend
 * TypeScript интерфейсы для запросов и ответов API
 */

import { User } from './user.js';

/**
 * Структура ошибки в ответе API
 */
export interface ApiErrorResponse {
  /** Код ошибки */
  code?: string;
  /** Сообщение об ошибке */
  message?: string;
  /** Детали ошибки */
  details?: unknown;
}

/**
 * Базовая структура ответа API
 */
export interface ApiResponse<T = unknown> {
  /** Успешен ли запрос */
  success?: boolean;
  /** Данные ответа (при успехе) */
  data?: T;
  /** Сообщение (при успехе) */
  message?: string;
  /** Ошибка (при неудаче) - может быть строкой или объектом */
  error?: string | ApiErrorResponse;
  /** Детали ошибок (ошибки валидации) */
  errors?: ValidationError[];
}

/**
 * Ошибка валидации от API
 */
export interface ValidationError {
  /** Поле с ошибкой */
  field: string;
  /** Сообщение об ошибке */
  message: string;
}

/**
 * Данные ответа при входе
 */
export interface LoginResponse {
  /** Аутентифицированный пользователь */
  user: User;
  /** Токен сессии (при использовании токен-аутентификации) */
  token?: string;
}

/**
 * Данные ответа при регистрации
 */
export interface RegisterResponse {
  /** Созданный пользователь */
  user: User;
}

/**
 * Данные ответа с текущим пользователем
 */
export interface MeResponse {
  /** Текущий аутентифицированный пользователь */
  user: User;
}

/**
 * Данные ответа при выходе
 */
export interface LogoutResponse {
  /** Сообщение об успехе */
  message: string;
}

/**
 * Типы ошибок API
 */
export type ApiErrorType =
  | 'validation'
  | 'unauthorized'
  | 'forbidden'
  | 'not_found'
  | 'conflict'
  | 'server_error'
  | 'network';

/**
 * Пользовательский класс ошибок API
 */
export class ApiError extends Error {
  /** HTTP статус код */
  public readonly statusCode: number;

  /** Тип ошибки */
  public readonly type: ApiErrorType;

  /** Ошибки валидации (если есть) */
  public readonly errors: ValidationError[];

  constructor(
    message: string,
    statusCode: number,
    type: ApiErrorType,
    errors: ValidationError[] = [],
  ) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.type = type;
    this.errors = errors;

    // Сохранить правильный стек вызовов
    Object.setPrototypeOf(this, ApiError.prototype);
  }

  /**
   * Создать ApiError из HTTP ответа
   * @param response - Объект Fetch Response
   * @returns Экземпляр ApiError
   */
  public static async fromResponse(response: Response): Promise<ApiError> {
    let message = 'Произошла ошибка';
    let errors: ValidationError[] = [];

    try {
      const body = (await response.json()) as ApiResponse;
      // Бэкенд возвращает { error: { code, message, details } }
      if (typeof body.error === 'string') {
        message = body.error;
      } else if (body.error && typeof body.error === 'object' && 'message' in body.error) {
        const errorObj = body.error as { message?: string; code?: string; details?: unknown };
        message = errorObj.message || message;
        // Если details содержит field, добавляем в errors
        if (
          errorObj.details
          && typeof errorObj.details === 'object'
          && 'field' in errorObj.details
        ) {
          const details = errorObj.details as { field?: string };
          if (details.field) {
            errors = [{ field: details.field, message }];
          }
        }
      }
      errors = body.errors || errors;
    } catch {
      // Тело ответа не в формате JSON - используем статус-текст как сообщение
      message = response.statusText || message;
    }

    const type = ApiError.getTypeFromStatus(response.status);

    return new ApiError(message, response.status, type, errors);
  }

  /**
   * Определить тип ошибки по HTTP статусу
   * @param status - HTTP статус код
   * @returns Тип ошибки
   */
  private static getTypeFromStatus(status: number): ApiErrorType {
    if (status === 400) return 'validation';
    if (status === 401) return 'unauthorized';
    if (status === 403) return 'forbidden';
    if (status === 404) return 'not_found';
    if (status === 409) return 'conflict';
    if (status >= 500) return 'server_error';
    return 'server_error';
  }
}

/**
 * Сетевая ошибка (когда fetch завершился неудачей)
 */
export class NetworkError extends Error {
  constructor(message = 'Ошибка сети. Проверьте подключение к интернету.') {
    super(message);
    this.name = 'NetworkError';
    Object.setPrototypeOf(this, NetworkError.prototype);
  }
}

/**
 * Конфигурация запроса
 */
export interface RequestConfig {
  /** HTTP метод */
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  /** Заголовки запроса */
  headers?: Record<string, string>;
  /** Тело запроса */
  body?: unknown;
  /** Параметры запроса (query) */
  params?: Record<string, string>;
  /** Сигнал отмены запроса */
  signal?: AbortSignal;
}

/**
 * Конфигурация API клиента
 */
export interface ApiClientConfig {
  /** Базовый URL для запросов API */
  baseUrl: string;
  /** Заголовки по умолчанию */
  defaultHeaders?: Record<string, string>;
  /** Таймаут запроса в миллисекундах */
  timeout?: number;
}

/**
 * Эндпоинты API аутентификации
 */
export const AUTH_ENDPOINTS = {
  /** Эндпоинт входа */
  LOGIN: '/api/auth/login',
  /** Эндпоинт регистрации */
  REGISTER: '/api/auth/register',
  /** Эндпоинт выхода */
  LOGOUT: '/api/auth/logout',
  /** Эндпоинт получения текущего пользователя */
  ME: '/api/auth/me',
  /** Эндпоинт обновления профиля */
  PROFILE: '/api/auth/profile',
  /** Эндпоинт смены пароля */
  PASSWORD: '/api/auth/password',
} as const;

/**
 * Эндпоинты API администрирования
 */
export const ADMIN_ENDPOINTS = {
  /** Эндпоинт товаров */
  PRODUCTS: '/api/admin/products',
  /** Эндпоинт заказов */
  ORDERS: '/api/admin/orders',
  /** Эндпоинт пользователей */
  USERS: '/api/admin/users',
} as const;

/**
 * HTTP статус коды
 */
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
} as const;
