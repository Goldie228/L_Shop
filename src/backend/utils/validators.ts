/**
 * Утилиты для валидации данных
 */

// Формат: любой email с @ и доменом
export const isValidEmail = (email: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

// Формат: опциональный + и 10-15 цифр (например, +375291234567)
export const isValidPhone = (phone: string): boolean => /^\+?\d{10,15}$/.test(phone);
