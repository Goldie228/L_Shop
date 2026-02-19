/**
 * API Client - L_Shop Frontend
 * Base HTTP client for API requests
 */

import {
  ApiResponse,
  RequestConfig,
  ApiClientConfig,
  ApiError,
  NetworkError
} from '../types/api.js';

/**
 * Default API client configuration
 */
const DEFAULT_CONFIG: ApiClientConfig = {
  baseUrl: '',
  defaultHeaders: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  timeout: 10000
};

/**
 * API Client class for making HTTP requests
 */
export class ApiClient {
  private readonly config: ApiClientConfig;

  /**
   * Create API client instance
   * @param config - Client configuration
   */
  constructor(config: Partial<ApiClientConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Make HTTP request
   * @param endpoint - API endpoint (relative to base URL)
   * @param config - Request configuration
   * @returns Response data
   * @throws ApiError on HTTP errors, NetworkError on connection failures
   */
  public async request<T = unknown>(
    endpoint: string,
    config: RequestConfig = { method: 'GET' }
  ): Promise<T> {
    const url = this.buildUrl(endpoint, config.params);
    const headers = this.buildHeaders(config.headers);
    
    const fetchOptions: RequestInit = {
      method: config.method,
      headers,
      credentials: 'include', // Include cookies for session
      signal: config.signal
    };

    // Add body for non-GET requests
    if (config.body && config.method !== 'GET') {
      fetchOptions.body = JSON.stringify(config.body);
    }

    try {
      const response = await this.fetchWithTimeout(url, fetchOptions);
      
      // Handle successful responses
      if (response.ok) {
        // Handle empty responses (204 No Content)
        if (response.status === 204) {
          return {} as T;
        }
        
        const data = await response.json() as ApiResponse<T>;
        return data.data as T;
      }
      
      // Handle error responses
      throw await ApiError.fromResponse(response);
    } catch (error) {
      // Re-throw ApiError
      if (error instanceof ApiError) {
        throw error;
      }
      
      // Handle abort errors
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Request was cancelled');
      }
      
      // Handle network errors
      if (error instanceof TypeError) {
        throw new NetworkError();
      }
      
      // Re-throw other errors
      throw error;
    }
  }

  /**
   * GET request
   * @param endpoint - API endpoint
   * @param params - Query parameters
   * @returns Response data
   */
  public async get<T = unknown>(
    endpoint: string,
    params?: Record<string, string>
  ): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET', params });
  }

  /**
   * POST request
   * @param endpoint - API endpoint
   * @param body - Request body
   * @returns Response data
   */
  public async post<T = unknown>(
    endpoint: string,
    body?: unknown
  ): Promise<T> {
    return this.request<T>(endpoint, { method: 'POST', body });
  }

  /**
   * PUT request
   * @param endpoint - API endpoint
   * @param body - Request body
   * @returns Response data
   */
  public async put<T = unknown>(
    endpoint: string,
    body?: unknown
  ): Promise<T> {
    return this.request<T>(endpoint, { method: 'PUT', body });
  }

  /**
   * PATCH request
   * @param endpoint - API endpoint
   * @param body - Request body
   * @returns Response data
   */
  public async patch<T = unknown>(
    endpoint: string,
    body?: unknown
  ): Promise<T> {
    return this.request<T>(endpoint, { method: 'PATCH', body });
  }

  /**
   * DELETE request
   * @param endpoint - API endpoint
   * @returns Response data
   */
  public async delete<T = unknown>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  /**
   * Build full URL with query parameters
   * @param endpoint - API endpoint
   * @param params - Query parameters
   * @returns Full URL
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
   * Build headers object
   * @param customHeaders - Custom headers to merge
   * @returns Headers object
   */
  private buildHeaders(customHeaders?: Record<string, string>): Headers {
    const headers = new Headers();
    
    // Add default headers
    const defaultHeaders = this.config.defaultHeaders || {};
    for (const [key, value] of Object.entries(defaultHeaders)) {
      headers.set(key, value);
    }
    
    // Add custom headers
    if (customHeaders) {
      for (const [key, value] of Object.entries(customHeaders)) {
        headers.set(key, value);
      }
    }
    
    return headers;
  }

  /**
   * Fetch with timeout
   * @param url - Request URL
   * @param options - Fetch options
   * @returns Response
   */
  private async fetchWithTimeout(
    url: string,
    options: RequestInit
  ): Promise<Response> {
    const timeout = this.config.timeout || 10000;
    
    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    // Merge signals if provided
    let signal = controller.signal;
    if (options.signal) {
      // Create a new controller that aborts on either signal
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
 * Использует переменную окружения VITE_API_URL с fallback на localhost
 */
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

/**
 * Default API client instance
 */
export const api = new ApiClient({
  baseUrl: API_BASE_URL
});