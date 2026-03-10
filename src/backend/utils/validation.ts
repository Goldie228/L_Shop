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
 * Схема для белорусского телефона
 * Формат: +375 + ровно 9 цифр (например, +375291234567)
 */
const belarusPhoneSchema = z
  .string()
  .min(12, 'Белорусский телефон должен содержать 12 символов (+375 + 9 цифр)')
  .max(12, 'Белорусский телефон должен содержать ровно 12 символов')
  .regex(/^\+375\d{9}$/, 'Некорректный формат белорусского телефона. Ожидается: +375291234567')
  .transform((val) => val.trim());

/**
 * Схема для цены
 * Положительное число с двумя знаками после запятой
 */
const priceSchema = z
  .number()
  .min(0.01, 'Цена не может быть меньше 0.01')
  .max(999999.99, 'Цена не может превышать 999999.99')
  .transform((val) => Math.round(val * 100) / 100); // Округление до 2 знаков

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
 * Схема для ID пользователя
 */
export const userIdSchema = z.string().min(1, 'ID пользователя обязателен');

/**
 * Схема для обновления роли пользователя
 */
export const updateUserRoleSchema = z.object({
  role: z.enum(['user', 'admin'], {
    message: 'Некорректная роль. Допустимые значения: user, admin',
  }),
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
  firstName: nameSchema,
  deliveryAddress: z
    .string()
    .min(10, 'Адрес доставки должен содержать минимум 10 символов')
    .max(500, 'Адрес доставки слишком длинный')
    .transform((val) => val.trim()),
  phone: phoneSchema,
  email: emailSchema,
  paymentMethod: z.enum(['cash', 'card', 'online'], {
    message: 'Некорректный способ оплаты. Допустимые: cash, card, online',
  }),
  deliveryType: z.enum(['courier', 'pickup']).optional(),
  comment: z
    .string()
    .max(1000, 'Комментарий слишком длинный')
    .transform((val) => val?.trim() || '')
    .optional(),
});

/**
 * Схема для обновления статуса заказа (админ)
 */
export const updateOrderStatusSchema = z.object({
  status: z.enum(['pending', 'processing', 'shipped', 'delivered', 'cancelled'], {
    message: 'Некорректный статус заказа',
  }),
});

/**
 * Схема для создания продукта
 */
export const createProductSchema = z.object({
  name: z
    .string()
    .min(1, 'Название продукта обязательно')
    .max(200, 'Название слишком длинное')
    .transform((val) => val.trim()),
  description: z
    .string()
    .min(10, 'Описание должно содержать минимум 10 символов')
    .max(2000, 'Описание слишком длинное')
    .transform((val) => val.trim()),
  price: z.number().min(0, 'Цена не может быть отрицательной').max(1000000, 'Цена слишком большая'),
  category: z
    .string()
    .min(1, 'Категория обязательна')
    .max(100, 'Категория слишком длинная')
    .transform((val) => val.trim()),
  inStock: z.boolean(),
  imageUrl: z
    .string()
    .url('Некорректный URL изображения')
    .max(500, 'URL изображения слишком длинный')
    .transform((val) => val.trim())
    .optional(),
  discountPercent: z
    .number()
    .min(0, 'Скидка не может быть отрицательной')
    .max(100, 'Скидка не может превышать 100%')
    .optional(),
  rating: z
    .number()
    .min(1, 'Рейтинг должен быть от 1 до 5')
    .max(5, 'Рейтинг должен быть от 1 до 5')
    .optional(),
  reviewsCount: z
    .number()
    .int('Количество отзывов должно быть целым числом')
    .min(0, 'Количество отзывов не может быть отрицательным')
    .optional(),
  brand: z
    .string()
    .min(1, 'Бренд обязателен')
    .max(100, 'Бренд слишком длинный')
    .transform((val) => val.trim()),
  warranty: z
    .string()
    .min(1, 'Гарантия обязательна')
    .max(50, 'Гарантия слишком длинная')
    .transform((val) => val.trim()),
  specifications: z.record(z.string(), z.unknown()).optional().default({}),
  currency: z.string().default('BYN'),
});

/**
 * Схема для обновления продукта (частичное обновление)
 */
export const updateProductSchema = z.object({
  name: z
    .string()
    .min(1, 'Название продукта обязательно')
    .max(200, 'Название слишком длинное')
    .transform((val) => val.trim())
    .optional(),
  description: z
    .string()
    .min(10, 'Описание должно содержать минимум 10 символов')
    .max(2000, 'Описание слишком длинное')
    .transform((val) => val.trim())
    .optional(),
  price: z
    .number()
    .min(0, 'Цена не может быть отрицательной')
    .max(1000000, 'Цена слишком большая')
    .optional(),
  category: z
    .string()
    .min(1, 'Категория обязательна')
    .max(100, 'Категория слишком длинная')
    .transform((val) => val.trim())
    .optional(),
  inStock: z.boolean().optional(),
  imageUrl: z
    .string()
    .url('Некорректный URL изображения')
    .max(500, 'URL изображения слишком длинный')
    .transform((val) => val.trim())
    .optional(),
  discountPercent: z
    .number()
    .min(0, 'Скидка не может быть отрицательной')
    .max(100, 'Скидка не может превышать 100%')
    .optional(),
  rating: z
    .number()
    .min(1, 'Рейтинг должен быть от 1 до 5')
    .max(5, 'Рейтинг должен быть от 1 до 5')
    .optional(),
  reviewsCount: z
    .number()
    .int('Количество отзывов должно быть целым числом')
    .min(0, 'Количество отзывов не может быть отрицательным')
    .optional(),
  brand: z
    .string()
    .min(1, 'Бренд обязателен')
    .max(100, 'Бренд слишком длинный')
    .transform((val) => val.trim())
    .optional(),
  warranty: z
    .string()
    .min(1, 'Гарантия обязательна')
    .max(50, 'Гарантия слишком длинная')
    .transform((val) => val.trim())
    .optional(),
  specifications: z.record(z.string(), z.unknown()).optional(),
});

/**
 * Схема для фильтрации продуктов (query параметры)
 */
export const productFiltersSchema = z.object({
  search: z.string().optional(),
  sort: z.enum(['price_asc', 'price_desc']).optional(),
  category: z.string().optional(),
  inStock: z.enum(['true', 'false']).optional(),
  minRating: z
    .string()
    .regex(/^\d+(\.\d+)?$/, 'minRating должно быть числом')
    .refine(
      (val) => {
        const num = Number(val);
        return num >= 1 && num <= 5;
      },
      { message: 'minRating должно быть от 1 до 5' },
    )
    .optional(),
});

export type ProductFiltersInput = z.infer<typeof productFiltersSchema>;

/**
 * Типы, выведенные из схем
 */
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginRequestSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type UserIdInput = z.infer<typeof userIdSchema>;
export type UpdateUserRoleInput = z.infer<typeof updateUserRoleSchema>;
export type AddToCartInput = z.infer<typeof addToCartSchema>;
export type UpdateCartQuantityInput = z.infer<typeof updateCartQuantitySchema>;
export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;
export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;

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
    return { error: result.error ?? 'Ошибка валидации', field: result.field };
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

/**
 * Проверка белорусского телефона
 */
export const isValidBelarusPhone = (phone: string): boolean => {
  const result = belarusPhoneSchema.safeParse(phone);
  return result.success;
};

/**
 * Проверка цены
 */
export const isValidPrice = (price: unknown): boolean => {
  // Для priceSchema используем safeParse, который принимает number
  // Если передана строка, пытаемся преобразовать в число
  if (price === null || price === undefined) return false;
  let value = price;
  if (typeof price === 'string') {
    const num = parseFloat(price);
    if (Number.isNaN(num)) return false;
    value = num;
  }
  const result = priceSchema.safeParse(value);
  return result.success;
};
