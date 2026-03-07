/**
 * Модель сессии пользователя
 */
export interface Session {
  token: string;
  userId: string;
  role: string; // Роль пользователя в сессии для быстрой проверки
  expiresAt: string; // ISO дата истечения
}
