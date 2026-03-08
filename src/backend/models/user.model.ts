/**
 * Модель пользователя
 */
export interface User {
  id: string;
  name: string;
  /** Имя (отдельное поле) */
  firstName: string;
  email: string;
  login: string;
  phone: string;
  password: string; // Хешированный пароль
  role: string; // Роль пользователя: 'user', 'admin' и др. По умолчанию 'user'
  isBlocked?: boolean; // Статус блокировки (опционально для обратной совместимости)
  createdAt: string;
  updatedAt: string;
}
