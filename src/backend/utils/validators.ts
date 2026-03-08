/**
 * Утилиты для валидации данных
 * Улучшенные валидаторы для email и телефона
 */

/**
 * Более строгая регулярка для email
 * - Локальная часть: буквы, цифры, точки, подчёркивания, дефисы
 * - Домен: буквы, цифры, дефисы, точки
 * - TLD: минимум 2 буквы
 */
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

/**
 * Валидация email с более строгими правилами
 * @param email - Email для проверки
 * @returns true если email валиден
 */
export const isValidEmail = (email: string): boolean => {
  if (!email || typeof email !== 'string') {
    return false;
  }

  // Базовая проверка длины
  if (email.length > 255) {
    return false;
  }

  // Проверка формата
  if (!EMAIL_REGEX.test(email)) {
    return false;
  }

  // Дополнительные проверки
  const [localPart, domain] = email.split('@');

  // Локальная часть не должна начинаться или заканчиваться точкой
  if (localPart.startsWith('.') || localPart.endsWith('.')) {
    return false;
  }

  // Домен не должен начинаться или заканчиваться точкой или дефисом
  if (
    domain.startsWith('.')
    || domain.endsWith('.')
    || domain.startsWith('-')
    || domain.endsWith('-')
  ) {
    return false;
  }

  return true;
};

/**
 * Валидация номера телефона
 * Формат: опциональный + и 10-15 цифр (например, +375291234567)
 * @param phone - Телефон для проверки
 * @returns true если телефон валиден
 */
export const isValidPhone = (phone: string): boolean => {
  if (!phone || typeof phone !== 'string') {
    return false;
  }

  return /^\+?\d{10,15}$/.test(phone);
};

/**
 * Валидация пароля
 * @param password - Пароль для проверки
 * @returns Объект с результатом валидации
 */
export const validatePassword = (password: string): { valid: boolean; error?: string } => {
  if (!password || typeof password !== 'string') {
    return { valid: false, error: 'Пароль обязателен' };
  }

  if (password.length < 6) {
    return { valid: false, error: 'Пароль должен содержать минимум 6 символов' };
  }

  if (password.length > 128) {
    return { valid: false, error: 'Пароль слишком длинный' };
  }

  return { valid: true };
};

/**
 * Валидация логина
 * @param login - Логин для проверки
 * @returns Объект с результатом валидации
 */
export const validateLogin = (login: string): { valid: boolean; error?: string } => {
  if (!login || typeof login !== 'string') {
    return { valid: false, error: 'Логин обязателен' };
  }

  const trimmed = login.trim();

  if (trimmed.length < 3) {
    return { valid: false, error: 'Логин должен содержать минимум 3 символа' };
  }

  if (trimmed.length > 50) {
    return { valid: false, error: 'Логин слишком длинный' };
  }

  if (!/^[a-zA-Z0-9_-]+$/.test(trimmed)) {
    return { valid: false, error: 'Логин может содержать только буквы, цифры, _ и -' };
  }

  return { valid: true };
};

/**
 * Валидация имени пользователя
 * @param name - Имя для проверки
 * @returns Объект с результатом валидации
 */
export const validateName = (name: string): { valid: boolean; error?: string } => {
  if (!name || typeof name !== 'string') {
    return { valid: false, error: 'Имя обязательно' };
  }

  const trimmed = name.trim();

  if (trimmed.length < 2) {
    return { valid: false, error: 'Имя должно содержать минимум 2 символа' };
  }

  if (trimmed.length > 100) {
    return { valid: false, error: 'Имя слишком длинное' };
  }

  return { valid: true };
};

/**
 * Регулярное выражение для валидации белорусских телефонных номеров
 * Формат: +375 + ровно 9 цифр (например, +375291234567)
 */
const BELARUS_PHONE_REGEX = /^\+375\d{9}$/;

/**
 * Валидация белорусского телефонного номера
 * @param phone - Телефон для проверки
 * @returns true если телефон валиден
 */
export const isValidBelarusPhone = (phone: string): boolean => {
  if (!phone || typeof phone !== 'string') {
    return false;
  }

  return BELARUS_PHONE_REGEX.test(phone);
};

/**
 * Валидация цены
 * @param price - Цена для проверки (число или строка)
 * @returns true если цена валидна
 */
export const isValidPrice = (price: number | string): boolean => {
  if (price === null || price === undefined) {
    return false;
  }

  // Преобразуем строку в число
  const num = typeof price === 'string' ? parseFloat(price) : price;

  // Проверяем, что это валидное число
  if (Number.isNaN(num) || !Number.isFinite(num)) {
    return false;
  }

  // Проверяем диапазон: минимум 0.01, максимум 999999.99
  return num >= 0.01 && num <= 999999.99;
};
