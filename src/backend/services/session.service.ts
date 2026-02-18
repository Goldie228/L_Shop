import { readJsonFile, writeJsonFile } from '../utils/file.utils';
import { Session } from '../models/session.model';
import { generateId } from '../utils/id.utils';
import { config } from '../config/constants';

const SESSIONS_FILE = 'sessions.json';

/**
 * Сервис для управления сессиями пользователей
 */
export class SessionService {
  /**
   * Создаёт новую сессию для пользователя
   * @param userId — ID пользователя
   * @returns Токен сессии
   */
  async createSession(userId: string): Promise<string> {
    try {
      const sessions = await readJsonFile<Session>(SESSIONS_FILE);
      const token = generateId();
      const expiresAt = new Date(
        Date.now() + config.sessionDurationMs,
      ).toISOString();

      sessions.push({ token, userId, expiresAt });
      await writeJsonFile(SESSIONS_FILE, sessions);

      return token;
    } catch (error) {
      console.error('Failed to create session:', error);
      throw new Error('Session creation failed');
    }
  }

  /**
   * Получает ID пользователя по токену сессии
   * @param token — Токен сессии
   * @returns ID пользователя или null, если сессия не найдена/истекла
   */
  async getUserIdByToken(token: string): Promise<string | null> {
    try {
      const sessions = await readJsonFile<Session>(SESSIONS_FILE);
      const now = new Date();

      const session = sessions.find(
        (s) => s.token === token && new Date(s.expiresAt) > now,
      );

      return session?.userId || null;
    } catch (error) {
      console.error('Failed to get session:', error);
      return null;
    }
  }

  /**
   * Удаляет сессию по токену
   * @param token — Токен сессии
   */
  async deleteSession(token: string): Promise<void> {
    try {
      const sessions = await readJsonFile<Session>(SESSIONS_FILE);
      const filtered = sessions.filter((s) => s.token !== token);
      await writeJsonFile(SESSIONS_FILE, filtered);
    } catch (error) {
      console.error('Failed to delete session:', error);
      // Не выбрасываем ошибку, чтобы не блокировать logout
    }
  }

  /**
   * Удаляет все истёкшие сессии
   * Можно вызывать периодически для очистки
   */
  async cleanExpired(): Promise<number> {
    try {
      const sessions = await readJsonFile<Session>(SESSIONS_FILE);
      const now = new Date();

      const valid = sessions.filter((s) => new Date(s.expiresAt) > now);
      const removedCount = sessions.length - valid.length;

      if (removedCount > 0) {
        await writeJsonFile(SESSIONS_FILE, valid);
        console.warn(`Очищено истёкших сессий: ${removedCount}`);
      }

      return removedCount;
    } catch (error) {
      console.error('Failed to clean expired sessions:', error);
      return 0;
    }
  }

  /**
   * Продлевает сессию (обновляет expiresAt)
   * @param token — Токен сессии
   * @returns true если сессия продлена
   */
  async extendSession(token: string): Promise<boolean> {
    try {
      const sessions = await readJsonFile<Session>(SESSIONS_FILE);
      const sessionIndex = sessions.findIndex((s) => s.token === token);

      if (sessionIndex === -1) {
        return false;
      }

      sessions[sessionIndex].expiresAt = new Date(
        Date.now() + config.sessionDurationMs,
      ).toISOString();

      await writeJsonFile(SESSIONS_FILE, sessions);
      return true;
    } catch (error) {
      console.error('Failed to extend session:', error);
      return false;
    }
  }
}
