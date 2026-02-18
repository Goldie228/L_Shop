// Модель сессии
export interface Session {
  token: string;
  userId: string;
  expiresAt: string; // ISO date
}
