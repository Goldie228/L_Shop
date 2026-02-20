/**
 * API Types - L_Shop Frontend
 * TypeScript interfaces for API requests and responses
 */

import { User } from './user.js';

/**
 * Base API response structure
 */
export interface ApiResponse<T = unknown> {
  /** Whether the request was successful */
  success: boolean;
  /** Response data (if successful) */
  data?: T;
  /** Error message (if failed) */
  error?: string;
  /** Error details (validation errors) */
  errors?: ValidationError[];
}

/**
 * Validation error from API
 */
export interface ValidationError {
  /** Field that has error */
  field: string;
  /** Error message */
  message: string;
}

/**
 * Login response data
 */
export interface LoginResponse {
  /** Authenticated user */
  user: User;
  /** Session token (if using token-based auth) */
  token?: string;
}

/**
 * Register response data
 */
export interface RegisterResponse {
  /** Created user */
  user: User;
}

/**
 * Current user response data
 */
export interface MeResponse {
  /** Current authenticated user */
  user: User;
}

/**
 * Logout response data
 */
export interface LogoutResponse {
  /** Success message */
  message: string;
}

/**
 * API error types
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
 * Custom API error class
 */
export class ApiError extends Error {
  /** HTTP status code */
  public readonly statusCode: number;
  /** Error type */
  public readonly type: ApiErrorType;
  /** Validation errors (if any) */
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

    // Maintain proper stack trace
    Object.setPrototypeOf(this, ApiError.prototype);
  }

  /**
   * Create ApiError from HTTP response
   * @param response - Fetch Response object
   * @returns ApiError instance
   */
  public static async fromResponse(response: Response): Promise<ApiError> {
    let message = 'An error occurred';
    let errors: ValidationError[] = [];

    try {
      const body = (await response.json()) as ApiResponse;
      message = body.error || message;
      errors = body.errors || [];
    } catch {
      // Response body is not JSON
      message = response.statusText || message;
    }

    const type = ApiError.getTypeFromStatus(response.status);

    return new ApiError(message, response.status, type, errors);
  }

  /**
   * Determine error type from HTTP status
   * @param status - HTTP status code
   * @returns Error type
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
 * Network error (when fetch fails)
 */
export class NetworkError extends Error {
  constructor(message: string = 'Network error. Please check your connection.') {
    super(message);
    this.name = 'NetworkError';
    Object.setPrototypeOf(this, NetworkError.prototype);
  }
}

/**
 * Request configuration
 */
export interface RequestConfig {
  /** HTTP method */
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  /** Request headers */
  headers?: Record<string, string>;
  /** Request body */
  body?: unknown;
  /** Query parameters */
  params?: Record<string, string>;
  /** Abort signal for cancellation */
  signal?: AbortSignal;
}

/**
 * API client configuration
 */
export interface ApiClientConfig {
  /** Base URL for API requests */
  baseUrl: string;
  /** Default headers */
  defaultHeaders?: Record<string, string>;
  /** Request timeout in milliseconds */
  timeout?: number;
}

/**
 * Auth API endpoints
 */
export const AUTH_ENDPOINTS = {
  /** Login endpoint */
  LOGIN: '/api/auth/login',
  /** Register endpoint */
  REGISTER: '/api/auth/register',
  /** Logout endpoint */
  LOGOUT: '/api/auth/logout',
  /** Get current user endpoint */
  ME: '/api/auth/me',
} as const;

/**
 * HTTP status codes
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
