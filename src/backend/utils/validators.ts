// Валидация email
export const isValidEmail = (email: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

// Валидация телефона
export const isValidPhone = (phone: string): boolean => /^\+?\d{10,15}$/.test(phone);
