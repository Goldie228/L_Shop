/**
 * API Клиент - L_Shop Frontend
 * Базовый HTTP клиент для API запросов
 */

import {
  RequestConfig,
  ApiClientConfig,
  ApiError,
  NetworkError,
} from '../types/api.js';
import { store } from '../store/store.js';

/**
 * Ошибка отмены запроса
 */
export class CancelError extends Error {
  constructor(message = 'Request was cancelled') {
    super(message);
    this.name = 'CancelError';
    Object.setPrototypeOf(this, CancelError.prototype);
  }
}

/**
 * Конфигурация API клиента по умолчанию
 */
const DEFAULT_CONFIG: ApiClientConfig = {
  baseUrl: '',
  defaultHeaders: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  timeout: 10000,
};

/**
 * Класс API клиента для выполнения HTTP запросов
 */
export class ApiClient {
  private readonly config: ApiClientConfig;

  /**
   * Создать экземпляр API клиента
   * @param config - Конфигурация клиента
   */
  constructor(config: Partial<ApiClientConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Выполнить HTTP запрос
   * @param endpoint - API эндпоинт (относительно базового URL)
   * @param config - Конфигурация запроса
   * @returns Данные ответа
   * @throws ApiError при HTTP ошибках, NetworkError при ошибках соединения
   */
  public async request<T = unknown>(
    endpoint: string,
    config: RequestConfig = { method: 'GET' },
  ): Promise<T> {
    const url = this.buildUrl(endpoint, config.params);
    const headers = this.buildHeaders(config.headers);

    const fetchOptions: RequestInit = {
      method: config.method,
      headers,
      credentials: 'include', // Включать куки для сессии
      signal: config.signal,
    };

    // Добавить тело для не-GET запросов
    if (config.body && config.method !== 'GET') {
      fetchOptions.body = JSON.stringify(config.body);
    }

    try {
      const response = await this.fetchWithTimeout(url, fetchOptions);

      // Обработать успешные ответы
      if (response.ok) {
        // Обработать пустые ответы (204 No Content)
        if (response.status === 204) {
          return {} as T;
        }

        // Бэкенд возвращает данные напрямую без обёртки
        const data = (await response.json()) as T;
        return data;
      }

      // Обработать ответы с ошибками
      const apiError = await ApiError.fromResponse(response);

      // Обработка 401 - сброс авторизации
      if (response.status === 401) {
        // Для /api/auth/me - это нормальная ситуация для неавторизованного пользователя
        // Возвращаем null вместо ошибки
        if (endpoint === '/api/auth/me') {
          return null as T;
        }

        // Не сбрасываем для запросов авторизации (login, register)
        const authEndpoints = ['/api/auth/login', '/api/auth/register'];
        const isAuthEndpoint = authEndpoints.some((e) => endpoint.startsWith(e));

        if (!isAuthEndpoint) {
          // Сбрасываем авторизацию в store
          store.setUser(null);
        }
      }

      throw apiError;
    } catch (error) {
      // Пробросить ApiError
      if (error instanceof ApiError) {
        throw error;
      }

      // Обработать ошибки отмены
      if (error instanceof Error && error.name === 'AbortError') {
        throw new CancelError();
      }

      // Обработать сетевые ошибки
      if (error instanceof TypeError) {
        throw new NetworkError();
      }

      // Пробросить другие ошибки
      throw error;
    }
  }

  /**
   * GET запрос
   * @param endpoint - API эндпоинт
   * @param params - Query параметры
   * @returns Данные ответа
   */
  public async get<T = unknown>(endpoint: string, params?: Record<string, string>): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET', params });
  }

  /**
   * POST запрос
   * @param endpoint - API эндпоинт
   * @param body - Тело запроса
   * @returns Данные ответа
   */
  public async post<T = unknown>(endpoint: string, body?: unknown): Promise<T> {
    return this.request<T>(endpoint, { method: 'POST', body });
  }

  /**
   * PUT запрос
   * @param endpoint - API эндпоинт
   * @param body - Тело запроса
   * @returns Данные ответа
   */
  public async put<T = unknown>(endpoint: string, body?: unknown): Promise<T> {
    return this.request<T>(endpoint, { method: 'PUT', body });
  }

  /**
   * PATCH запрос
   * @param endpoint - API эндпоинт
   * @param body - Тело запроса
   * @returns Данные ответа
   */
  public async patch<T = unknown>(endpoint: string, body?: unknown): Promise<T> {
    return this.request<T>(endpoint, { method: 'PATCH', body });
  }

  /**
   * DELETE запрос
   * @param endpoint - API эндпоинт
   * @returns Данные ответа
   */
  public async delete<T = unknown>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  /**
   * Построить полный URL с query параметрами
   * @param endpoint - API эндпоинт
   * @param params - Query параметры
   * @returns Полный URL
   */
  private buildUrl(endpoint: string, params?: Record<string, string>): string {
    const url = this.config.baseUrl + endpoint;

    if (!params || Object.keys(params).length === 0) {
      return url;
    }

    const searchParams = new URLSearchParams(params);
    return `${url}?${searchParams.toString()}`;
  }

  /**
   * Построить объект заголовков
   * @param customHeaders - Кастомные заголовки для объединения
   * @returns Объект Headers
   */
  private buildHeaders(customHeaders?: Record<string, string>): Headers {
    const headers = new Headers();

    // Добавить заголовки по умолчанию
    const defaultHeaders = this.config.defaultHeaders || {};
    for (const [key, value] of Object.entries(defaultHeaders)) {
      headers.set(key, value);
    }

    // Добавить кастомные заголовки
    if (customHeaders) {
      for (const [key, value] of Object.entries(customHeaders)) {
        headers.set(key, value);
      }
    }

    return headers;
  }

  /**
   * Fetch с таймаутом
   * @param url - URL запроса
   * @param options - Опции fetch
   * @returns Response
   */
  private async fetchWithTimeout(url: string, options: RequestInit): Promise<Response> {
    const timeout = this.config.timeout || 10000;

    // Создать AbortController для таймаута
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    // Объединить сигналы если предоставлены
    let { signal } = controller;
    if (options.signal) {
      // Создать новый контроллер, который отменяется при любом сигнале
      const externalController = new AbortController();

      options.signal.addEventListener('abort', () => {
        externalController.abort();
      });
      controller.signal.addEventListener('abort', () => {
        externalController.abort();
      });

      signal = externalController.signal;
    }

    try {
      const response = await fetch(url, { ...options, signal });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }
}

/**
 * Базовый URL для API запросов
 * В development режиме используем пустую строку для работы через Vite proxy
 * В production режиме используем VITE_API_URL или fallback
 */
const API_BASE_URL = import.meta.env.PROD ? import.meta.env.VITE_API_URL || '' : '';

/**
 * Экземпляр API клиента по умолчанию
 */
export const api = new ApiClient({
  baseUrl: API_BASE_URL,
});
