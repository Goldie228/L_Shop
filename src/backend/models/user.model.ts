/**
 * Модель пользователя
 */
export interface User {
  id: string;
  name: string;
  email: string;
  login: string;
  phone: string;
  password: string; // Хешированный пароль
  createdAt: string;
  updatedAt: string;
}
