/**
 * Модель сессии пользователя
 */
export interface Session {
  token: string;
  userId: string;
  expiresAt: string; // ISO дата истечения
}
