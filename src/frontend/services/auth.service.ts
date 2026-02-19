/**
 * Auth Service - L_Shop Frontend
 * Service for authentication operations
 */

import { api } from './api.js';
import { AUTH_ENDPOINTS } from '../types/api.js';
import {
  User,
  LoginUserData,
  RegisterUserData
} from '../types/user.js';

/**
 * Login response from API
 */
interface LoginApiResponse {
  user: User;
  message: string;
}

/**
 * Register response from API
 */
interface RegisterApiResponse {
  user: User;
  message: string;
}

/**
 * Logout response from API
 */
interface LogoutApiResponse {
  message: string;
}

/**
 * Me response from API
 */
interface MeApiResponse {
  user: User;
}

/**
 * Auth service for handling authentication operations
 */
export class AuthService {
  /**
   * Login user
   * @param credentials - Login credentials
   * @returns Authenticated user
   * @throws ApiError on failure
   */
  public static async login(credentials: LoginUserData): Promise<User> {
    const response = await api.post<LoginApiResponse>(AUTH_ENDPOINTS.LOGIN, {
      login: credentials.loginOrEmail,
      password: credentials.password
    });
    
    return response.user;
  }

  /**
   * Register new user
   * @param userData - Registration data
   * @returns Created user
   * @throws ApiError on failure
   */
  public static async register(userData: RegisterUserData): Promise<User> {
    const response = await api.post<RegisterApiResponse>(
      AUTH_ENDPOINTS.REGISTER,
      {
        name: userData.name,
        login: userData.login,
        email: userData.email,
        phone: userData.phone,
        password: userData.password,
        confirmPassword: userData.confirmPassword
      }
    );
    
    return response.user;
  }

  /**
   * Logout current user
   * @throws ApiError on failure
   */
  public static async logout(): Promise<void> {
    await api.post<LogoutApiResponse>(AUTH_ENDPOINTS.LOGOUT);
  }

  /**
   * Get current authenticated user
   * @returns Current user or null if not authenticated
   */
  public static async getCurrentUser(): Promise<User | null> {
    try {
      const response = await api.get<MeApiResponse>(AUTH_ENDPOINTS.ME);
      return response.user;
    } catch (error) {
      // Return null for unauthorized errors
      if (error instanceof Error && 'statusCode' in error) {
        const apiError = error as { statusCode: number };
        if (apiError.statusCode === 401) {
          return null;
        }
      }
      throw error;
    }
  }

  /**
   * Check if user is authenticated
   * @returns True if user has active session
   */
  public static async isAuthenticated(): Promise<boolean> {
    try {
      const user = await this.getCurrentUser();
      return user !== null;
    } catch {
      return false;
    }
  }
}

/**
 * Auth event types
 */
export type AuthEventType = 'login' | 'logout' | 'register' | 'session_expired';

/**
 * Auth event listener
 */
export type AuthEventListener = (event: AuthEventType, user?: User) => void;

/**
 * Auth event emitter for notifying components about auth changes
 */
export class AuthEventEmitter {
  private static listeners: Set<AuthEventListener> = new Set();

  /**
   * Subscribe to auth events
   * @param listener - Event listener function
   * @returns Unsubscribe function
   */
  public static subscribe(listener: AuthEventListener): () => void {
    this.listeners.add(listener);
    
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Emit auth event
   * @param event - Event type
   * @param user - User data (optional)
   */
  public static emit(event: AuthEventType, user?: User): void {
    this.listeners.forEach(listener => {
      try {
        listener(event, user);
      } catch (error) {
        console.error('Auth event listener error:', error);
      }
    });
  }
}