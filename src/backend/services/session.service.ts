/**
 * Сервис управления сессиями пользователей
 */

import { readJsonFile, writeJsonFile } from '../utils/file.utils';
import { Session } from '../models/session.model';
import { generateId } from '../utils/id.utils';
import { config } from '../config/constants';

const SESSIONS_FILE = 'sessions.json';

export class SessionService {
  /**
   * Создаёт новую сессию для пользователя
   */
  async createSession(userId: string): Promise<string> {
    try {
      const sessions = await readJsonFile<Session>(SESSIONS_FILE);
      const token = generateId();
      const expiresAt = new Date(Date.now() + config.sessionDurationMs).toISOString();

      sessions.push({ token, userId, expiresAt });
      await writeJsonFile(SESSIONS_FILE, sessions);

      return token;
    } catch (error) {
      console.error('[SessionService] Ошибка создания сессии:', error);
      throw new Error('Ошибка создания сессии');
    }
  }

  /**
   * Получает ID пользователя по токену сессии
   * Возвращает null если сессия не найдена или истекла
   */
  async getUserIdByToken(token: string): Promise<string | null> {
    try {
      const sessions = await readJsonFile<Session>(SESSIONS_FILE);
      const now = new Date();

      const session = sessions.find((s) => s.token === token && new Date(s.expiresAt) > now);

      return session?.userId || null;
    } catch (error) {
      console.error('[SessionService] Ошибка получения сессии:', error);
      return null;
    }
  }

  /**
   * Удаляет сессию по токену
   */
  async deleteSession(token: string): Promise<void> {
    try {
      const sessions = await readJsonFile<Session>(SESSIONS_FILE);
      const filtered = sessions.filter((s) => s.token !== token);
      await writeJsonFile(SESSIONS_FILE, filtered);
    } catch (error) {
      // Не выбрасываем ошибку, чтобы не блокировать logout
      console.error('[SessionService] Ошибка удаления сессии:', error);
    }
  }

  /**
   * Удаляет все истёкшие сессии
   */
  async cleanExpired(): Promise<number> {
    try {
      const sessions = await readJsonFile<Session>(SESSIONS_FILE);
      const now = new Date();

      const valid = sessions.filter((s) => new Date(s.expiresAt) > now);
      const removedCount = sessions.length - valid.length;

      if (removedCount > 0) {
        await writeJsonFile(SESSIONS_FILE, valid);
        console.warn(`[SessionService] Удалено истёкших сессий: ${removedCount}`);
      }

      return removedCount;
    } catch (error) {
      console.error('[SessionService] Ошибка очистки сессий:', error);
      return 0;
    }
  }

  /**
   * Продлевает сессию (обновляет expiresAt)
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
      console.error('[SessionService] Ошибка продления сессии:', error);
      return false;
    }
  }
}
