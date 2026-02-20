/**
 * Типы пользователей - L_Shop Frontend
 * TypeScript интерфейсы для данных, связанных с пользователями
 */

/**
 * Перечисление ролей пользователя
 */
export type UserRole = 'user' | 'admin';

/**
 * Объект пользователя, возвращаемый из API
 */
export interface User {
  /** Уникальный идентификатор пользователя */
  id: string;
  /** Отображаемое имя пользователя */
  name: string;
  /** Логин пользователя */
  login: string;
  /** Адрес электронной почты */
  email: string;
  /** Номер телефона в формате +1234567890 */
  phone: string;
  /** Роль пользователя */
  role: UserRole;
  /** Время создания аккаунта */
  createdAt: string;
  /** Время последнего обновления */
  updatedAt: string;
}

/**
 * Данные пользователя для регистрации
 */
export interface RegisterUserData {
  /** Отображаемое имя пользователя */
  name: string;
  /** Логин пользователя */
  login: string;
  /** Адрес электронной почты */
  email: string;
  /** Номер телефона в формате +1234567890 */
  phone: string;
  /** Пароль пользователя (мин. 6 символов) */
  password: string;
  /** Подтверждение пароля (должно совпадать с password) */
  confirmPassword: string;
}

/**
 * Данные пользователя для входа
 */
export interface LoginUserData {
  /** Логин или email */
  loginOrEmail: string;
  /** Пароль пользователя */
  password: string;
}

/**
 * Состояние пользователя для фронтенд-стора
 */
export interface UserState {
  /** Текущий пользователь (null если не аутентифицирован) */
  user: User | null;
  /** Статус аутентификации */
  isAuthenticated: boolean;
  /** Состояние загрузки для операций аутентификации */
  isLoading: boolean;
  /** Сообщение об ошибке от последней операции аутентификации */
  error: string | null;
}

/**
 * Информация для отображения пользователя в хедере
 */
export interface UserDisplayInfo {
  /** Инициалы пользователя для аватара */
  initials: string;
  /** Отображаемое имя пользователя (урезанное при необходимости) */
  displayName: string;
}

/**
 * Получить информацию для отображения из объекта пользователя
 * @param user - Объект пользователя
 * @returns Информация для UI
 */
export function getUserDisplayInfo(user: User): UserDisplayInfo {
  const nameParts = user.name.trim().split(/\s+/);
  const initials = nameParts
    .slice(0, 2)
    .map(part => part.charAt(0).toUpperCase())
    .join('');
  
  const displayName = user.name.length > 20 
    ? `${user.name.substring(0, 17)}...` 
    : user.name;
  
  return {
    initials: initials || user.login.charAt(0).toUpperCase(),
    displayName
  };
}

/**
 * Результат валидации пользовательского ввода
 */
export interface ValidationResult {
  /** Валиден ли ввод */
  isValid: boolean;
  /** Сообщение об ошибке (если невалиден) */
  error: string | null;
}

/**
 * Валидировать формат email
 * @param email - Email для валидации
 * @returns Результат валидации
 */
export function validateEmail(email: string): ValidationResult {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!email.trim()) {
    return { isValid: false, error: 'Email обязателен' };
  }
  
  if (!emailRegex.test(email)) {
    return { isValid: false, error: 'Неверный формат email' };
  }
  
  return { isValid: true, error: null };
}

/**
 * Валидировать формат логина
 * @param login - Логин для валидации
 * @returns Результат валидации
 */
export function validateLogin(login: string): ValidationResult {
  if (!login.trim()) {
    return { isValid: false, error: 'Логин обязателен' };
  }
  
  if (login.length < 3) {
    return { isValid: false, error: 'Логин должен содержать минимум 3 символа' };
  }
  
  if (login.length > 30) {
    return { isValid: false, error: 'Логин должен содержать максимум 30 символов' };
  }
  
  const loginRegex = /^[a-zA-Z0-9_]+$/;
  if (!loginRegex.test(login)) {
    return { isValid: false, error: 'Логин может содержать только буквы, цифры и подчеркивания' };
  }
  
  return { isValid: true, error: null };
}

/**
 * Валидировать сложность пароля
 * @param password - Пароль для валидации
 * @returns Результат валидации
 */
export function validatePassword(password: string): ValidationResult {
  if (!password) {
    return { isValid: false, error: 'Пароль обязателен' };
  }
  
  if (password.length < 6) {
    return { isValid: false, error: 'Пароль должен содержать минимум 6 символов' };
  }
  
  if (password.length > 100) {
    return { isValid: false, error: 'Пароль слишком длинный' };
  }
  
  return { isValid: true, error: null };
}

/**
 * Валидировать формат номера телефона
 * @param phone - Телефон для валидации
 * @returns Результат валидации
 */
export function validatePhone(phone: string): ValidationResult {
  const phoneRegex = /^\+\d{10,15}$/;
  
  if (!phone.trim()) {
    return { isValid: false, error: 'Номер телефона обязателен' };
  }
  
  if (!phoneRegex.test(phone)) {
    return { isValid: false, error: 'Телефон должен быть в формате +1234567890' };
  }
  
  return { isValid: true, error: null };
}

/**
 * Валидировать имя
 * @param name - Имя для валидации
 * @returns Результат валидации
 */
export function validateName(name: string): ValidationResult {
  if (!name.trim()) {
    return { isValid: false, error: 'Имя обязательно' };
  }
  
  if (name.length < 2) {
    return { isValid: false, error: 'Имя должно содержать минимум 2 символа' };
  }
  
  if (name.length > 50) {
    return { isValid: false, error: 'Имя должно содержать максимум 50 символов' };
  }
  
  return { isValid: true, error: null };
}

/**
 * Валидировать подтверждение пароля
 * @param password - Исходный пароль
 * @param confirmPassword - Пароль подтверждения
 * @returns Результат валидации
 */
export function validatePasswordConfirmation(
  password: string, 
  confirmPassword: string
): ValidationResult {
  if (!confirmPassword) {
    return { isValid: false, error: 'Подтверждение пароля обязательно' };
  }
  
  if (password !== confirmPassword) {
    return { isValid: false, error: 'Пароли не совпадают' };
  }
  
  return { isValid: true, error: null };
}