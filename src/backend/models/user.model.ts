/**
 * Модель пользователя
 */
export interface User {
  /** Уникальный идентификатор */
  id: string;
  /** Имя пользователя */
  name: string;
  /** Email */
  email: string;
  /** Логин */
  login: string;
  /** Телефон */
  phone: string;
  /** Хешированный пароль */
  password: string;
  /** Дата создания */
  createdAt: string;
  /** Дата обновления */
  updatedAt: string;
}
