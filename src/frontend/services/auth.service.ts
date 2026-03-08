/**
 * Сервис аутентификации - L_Shop Frontend
 * Сервис для операций аутентификации
 */

import { api } from './api.js';
import { AUTH_ENDPOINTS } from '../types/api.js';
import { User, LoginUserData, RegisterUserData } from '../types/user.js';

/**
 * Ответ API при входе
 */
interface LoginApiResponse {
  user: User;
  message: string;
}

/**
 * Ответ API при регистрации
 */
interface RegisterApiResponse {
  user: User;
  message: string;
}

/**
 * Ответ API при выходе
 */
interface LogoutApiResponse {
  message: string;
}

/**
 * Ответ API при обновлении профиля
 */
interface UpdateProfileResponse {
  user: User;
  message: string;
}

/**
 * Ответ API при смене пароля
 */
interface UpdatePasswordResponse {
  message: string;
}

/**
 * Данные для обновления профиля
 */
export interface UpdateProfileData {
  name?: string;
  email?: string;
}

/**
 * Данные для смены пароля
 */
export interface UpdatePasswordData {
  currentPassword: string;
  newPassword: string;
}

/**
 * Сервис аутентификации для обработки операций
 */
export class AuthService {
  /**
   * Войти в систему
   * @param credentials - Учетные данные для входа
   * @returns Аутентифицированный пользователь
   * @throws ApiError при ошибке
   */
  public static async login(credentials: LoginUserData): Promise<User> {
    console.log('[AuthService] Login attempt:', {
      login: credentials.loginOrEmail,
      passwordLength: credentials.password?.length,
    });

    const response = await api.post<LoginApiResponse>(AUTH_ENDPOINTS.LOGIN, {
      login: credentials.loginOrEmail,
      password: credentials.password,
    });

    console.log('[AuthService] Login response:', response);

    // Бэкенд возвращает { message, user }
    return response.user;
  }

  /**
   * Зарегистрировать нового пользователя
   * @param userData - Данные для регистрации
   * @returns Созданный пользователь
   * @throws ApiError при ошибке
   */
  public static async register(userData: RegisterUserData): Promise<User> {
    const response = await api.post<RegisterApiResponse>(AUTH_ENDPOINTS.REGISTER, {
      name: userData.name,
      login: userData.login,
      email: userData.email,
      phone: userData.phone,
      password: userData.password,
      confirmPassword: userData.confirmPassword,
    });

    return response.user;
  }

  /**
   * Выйти из системы
   * @throws ApiError при ошибке
   */
  public static async logout(): Promise<void> {
    await api.post<LogoutApiResponse>(AUTH_ENDPOINTS.LOGOUT);
  }

  /**
   * Получить текущего аутентифицированного пользователя
   * @returns Текущий пользователь или null если не аутентифицирован
   */
  public static async getCurrentUser(): Promise<User | null> {
    try {
      // Бэкенд возвращает пользователя напрямую, без обёртки { user: ... }
      const response = await api.get<User>(AUTH_ENDPOINTS.ME);
      return response;
    } catch (error) {
      // Возвращать null при ошибках авторизации
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
   * Проверить, аутентифицирован ли пользователь
   * @returns True если у пользователя активная сессия
   */
  public static async isAuthenticated(): Promise<boolean> {
    try {
      const user = await this.getCurrentUser();
      return user !== null;
    } catch {
      return false;
    }
  }

  /**
   * Обновить профиль пользователя
   * @param data - Данные для обновления профиля
   * @returns Обновлённый пользователь
   * @throws ApiError при ошибке
   */
  public static async updateProfile(data: UpdateProfileData): Promise<User> {
    const response = await api.put<UpdateProfileResponse>(AUTH_ENDPOINTS.PROFILE, data);
    return response.user;
  }

  /**
   * Сменить пароль пользователя
   * @param data - Данные для смены пароля
   * @throws ApiError при ошибке
   */
  public static async updatePassword(data: UpdatePasswordData): Promise<void> {
    await api.put<UpdatePasswordResponse>(AUTH_ENDPOINTS.PASSWORD, data);
  }
}

/**
 * Типы событий аутентификации
 */
export type AuthEventType = 'login' | 'logout' | 'register' | 'session_expired';

/**
 * Слушатель событий аутентификации
 */
export type AuthEventListener = (event: AuthEventType, user?: User) => void;

/**
 * Эмиттер событий аутентификации для уведомления компонентов об изменениях
 */
export class AuthEventEmitter {
  private static listeners: Set<AuthEventListener> = new Set();

  /**
   * Подписаться на события аутентификации
   * @param listener - Функция слушателя событий
   * @returns Функция отписки
   */
  public static subscribe(listener: AuthEventListener): () => void {
    this.listeners.add(listener);

    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Отправить событие аутентификации
   * @param event - Тип события
   * @param user - Данные пользователя (опционально)
   */
  public static emit(event: AuthEventType, user?: User): void {
    this.listeners.forEach((listener) => {
      try {
        listener(event, user);
      } catch (error) {
        console.error('Ошибка слушателя события аутентификации:', error);
      }
    });
  }
}
