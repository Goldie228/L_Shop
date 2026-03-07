/**
 * Сервис управления сессиями пользователей
 */

import { readJsonFile, modifyJsonFile } from '../utils/file.utils';
import { Session } from '../models/session.model';
import { generateId } from '../utils/id.utils';
import { config } from '../config/constants';
import { UserService } from './user.service';
import { createContextLogger } from '../utils/logger';

const logger = createContextLogger('SessionService');
const SESSIONS_FILE = 'sessions.json';

export class SessionService {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  /**
   * Создаёт новую сессию для пользователя
   * Сохраняет роль пользователя для быстрой проверки
   */
  async createSession(userId: string): Promise<string> {
    try {
      const token = generateId();
      const expiresAt = new Date(Date.now() + config.sessionDurationMs).toISOString();

      // Получаем пользователя для получения его роли
      const user = await this.userService.getUserById(userId);
      const role = user?.role ?? 'user'; // По умолчанию 'user' если пользователь не найден

      await modifyJsonFile<Session>(SESSIONS_FILE, (sessions) => {
        sessions.push({
          token,
          userId,
          role,
          expiresAt,
        });
        return sessions;
      });

      logger.debug({ userId, role }, 'Сессия создана');

      return token;
    } catch (error) {
      logger.error({ error, userId }, 'Ошибка создания сессии');
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
      logger.error({ error }, 'Ошибка получения сессии');
      return null;
    }
  }

  /**
   * Получает роль пользователя по токену сессии
   * Возвращает null если сессия не найдена или истекла
   */
  async getRoleByToken(token: string): Promise<string | null> {
    try {
      const sessions = await readJsonFile<Session>(SESSIONS_FILE);
      const now = new Date();

      const session = sessions.find((s) => s.token === token && new Date(s.expiresAt) > now);

      return session?.role || null;
    } catch (error) {
      logger.error({ error }, 'Ошибка получения роли из сессии');
      return null;
    }
  }

  /**
   * Удаляет сессию по токену
   */
  async deleteSession(token: string): Promise<void> {
    try {
      await modifyJsonFile<Session>(SESSIONS_FILE, (sessions) =>
        sessions.filter((s) => s.token !== token),
      );

      logger.debug('Сессия удалена');
    } catch (error) {
      // Не выбрасываем ошибку, чтобы не блокировать logout
      logger.error({ error }, 'Ошибка удаления сессии');
    }
  }

  /**
   * Удаляет все истёкшие сессии
   */
  async cleanExpired(): Promise<number> {
    try {
      let removedCount = 0;

      await modifyJsonFile<Session>(SESSIONS_FILE, (sessions) => {
        const now = new Date();
        const valid = sessions.filter((s) => new Date(s.expiresAt) > now);
        removedCount = sessions.length - valid.length;
        return valid;
      });

      if (removedCount > 0) {
        logger.info({ count: removedCount }, 'Удалено истёкших сессий');
      }

      return removedCount;
    } catch (error) {
      logger.error({ error }, 'Ошибка очистки сессий');
      return 0;
    }
  }

  /**
   * Продлевает сессию (обновляет expiresAt)
   */
  async extendSession(token: string): Promise<boolean> {
    try {
      let found = false;

      await modifyJsonFile<Session>(SESSIONS_FILE, (sessions) => {
        const sessionIndex = sessions.findIndex((s) => s.token === token);

        if (sessionIndex !== -1) {
          // eslint-disable-next-line no-param-reassign
          sessions[sessionIndex].expiresAt = new Date(
            Date.now() + config.sessionDurationMs,
          ).toISOString();
          found = true;
        }

        return sessions;
      });

      return found;
    } catch (error) {
      logger.error({ error }, 'Ошибка продления сессии');
      return false;
    }
  }
}
