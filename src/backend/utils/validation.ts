/**
 * Схемы валидации с использованием Zod
 * Централизованная валидация входных данных API
 */

import { z } from 'zod';

/**
 * Кастомное сообщение об ошибке для email
 */
const emailSchema = z
  .string()
  .min(1, 'Email обязателен')
  .max(255, 'Email слишком длинный')
  .email('Некорректный формат email')
  .transform((val) => val.toLowerCase().trim());

/**
 * Кастомное сообщение об ошибке для пароля
 */
const passwordSchema = z
  .string()
  .min(6, 'Пароль должен содержать минимум 6 символов')
  .max(128, 'Пароль слишком длинный');

/**
 * Схема для логина
 */
const loginSchema = z
  .string()
  .min(3, 'Логин должен содержать минимум 3 символа')
  .max(50, 'Логин слишком длинный')
  .regex(/^[a-zA-Z0-9_-]+$/, 'Логин может содержать только буквы, цифры, _ и -')
  .transform((val) => val.trim());

/**
 * Схема для имени пользователя
 */
const nameSchema = z
  .string()
  .min(2, 'Имя должно содержать минимум 2 символа')
  .max(100, 'Имя слишком длинное')
  .transform((val) => val.trim());

/**
 * Схема для телефона
 */
const phoneSchema = z
  .string()
  .min(10, 'Телефон должен содержать минимум 10 цифр')
  .max(15, 'Телефон слишком длинный')
  .regex(/^\+?\d{10,15}$/, 'Некорректный формат телефона. Ожидается: +1234567890 (10-15 цифр)')
  .transform((val) => val.trim());

/**
 * Схема регистрации пользователя
 */
export const registerSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  login: loginSchema,
  phone: phoneSchema,
  password: passwordSchema,
});

/**
 * Схема входа в систему
 */
export const loginRequestSchema = z.object({
  login: z
    .string()
    .min(1, 'Логин обязателен')
    .transform((val) => val.trim()),
  password: z.string().min(1, 'Пароль обязателен'),
});

/**
 * Схема обновления профиля пользователя
 */
export const updateProfileSchema = z.object({
  name: nameSchema.optional(),
  email: emailSchema.optional(),
  phone: phoneSchema.optional(),
});

/**
 * Схема смены пароля
 */
export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Текущий пароль обязателен'),
  newPassword: passwordSchema,
});

/**
 * Схема для ID продукта
 */
export const productIdSchema = z.string().min(1, 'ID продукта обязателен');

/**
 * Схема для добавления товара в корзину
 */
export const addToCartSchema = z.object({
  productId: productIdSchema,
  quantity: z
    .number()
    .int('Количество должно быть целым числом')
    .min(1, 'Минимальное количество: 1')
    .max(99, 'Максимальное количество: 99'),
});

/**
 * Схема для обновления количества товара в корзине
 */
export const updateCartQuantitySchema = z.object({
  quantity: z
    .number()
    .int('Количество должно быть целым числом')
    .min(0, 'Минимальное количество: 0')
    .max(99, 'Максимальное количество: 99'),
});

/**
 * Схема для оформления заказа
 */
export const createOrderSchema = z.object({
  deliveryAddress: z
    .string()
    .min(10, 'Адрес доставки должен содержать минимум 10 символов')
    .max(500, 'Адрес доставки слишком длинный')
    .transform((val) => val.trim()),
  comment: z
    .string()
    .max(1000, 'Комментарий слишком длинный')
    .transform((val) => val?.trim() || '')
    .optional(),
  phone: phoneSchema.optional(),
});

/**
 * Схема для обновления статуса заказа (админ)
 */
export const updateOrderStatusSchema = z.object({
  status: z.enum(['new', 'processing', 'shipped', 'delivered', 'cancelled'], {
    message: 'Некорректный статус заказа',
  }),
});

/**
 * Типы, выведенные из схем
 */
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginRequestSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type AddToCartInput = z.infer<typeof addToCartSchema>;
export type UpdateCartQuantityInput = z.infer<typeof updateCartQuantitySchema>;
export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;

/**
 * Результат валидации
 */
export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  error?: string;
  field?: string;
}

/**
 * Утилита для валидации данных
 * @param schema - Zod схема
 * @param data - Данные для валидации
 * @returns Результат валидации
 */
export function validate<T>(schema: z.ZodSchema<T>, data: unknown): ValidationResult<T> {
  try {
    const result = schema.safeParse(data);

    if (result.success) {
      return { success: true, data: result.data };
    }

    // Формируем читаемое сообщение об ошибке
    const firstError = result.error.issues[0];
    return {
      success: false,
      error: firstError.message,
      field: firstError.path.join('.'),
    };
  } catch (error) {
    return {
      success: false,
      error: 'Ошибка валидации данных',
    };
  }
}

/**
 * middleware-подобная функция для валидации тела запроса
 * Возвращает результат валидации или null если валидация успешна
 */
export function validateBody<T>(
  schema: z.ZodSchema<T>,
  body: unknown,
): { error: string; field?: string } | null {
  const result = validate(schema, body);
  if (!result.success) {
    return { error: result.error!, field: result.field };
  }
  return null;
}

/**
 * Экспорт отдельных функций валидации для обратной совместимости
 */

/**
 * Проверка email (улучшенная версия)
 */
export const isValidEmail = (email: string): boolean => {
  const result = emailSchema.safeParse(email);
  return result.success;
};

/**
 * Проверка телефона
 */
export const isValidPhone = (phone: string): boolean => {
  const result = phoneSchema.safeParse(phone);
  return result.success;
};

/**
 * Проверка логина
 */
export const isValidLogin = (login: string): boolean => {
  const result = loginSchema.safeParse(login);
  return result.success;
};
