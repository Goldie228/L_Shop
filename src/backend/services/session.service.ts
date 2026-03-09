/**
 * Сервис управления сессиями пользователей
 */

import { readJsonFile, modifyJsonFile } from '../utils/file.utils';
import { Session } from '../models/session.model';
import { generateId } from '../utils/id.utils';
import { config } from '../config/constants';
import { UserService } from './user.service';
import { createContextLogger } from '../utils/logger';
import { SessionError } from '../errors/session.error';
import { NotFoundError } from '../errors';

const logger = createContextLogger('SessionService');
const SESSIONS_FILE = 'sessions.json';

export class SessionService {
  private userService: UserService;

  constructor(userService?: UserService) {
    this.userService = userService ?? new UserService();
  }

  /**
   * Создаёт новую сессию для пользователя
   * Сохраняет роль пользователя для быстрой проверки
   * @param userId - ID пользователя
   * @returns Токен сессии
   * @throws {SessionError} При ошибке создания сессии
   * @throws {NotFoundError} Если пользователь не найден
   */
  async createSession(userId: string): Promise<string> {
    try {
      const token = generateId();
      const expiresAt = new Date(Date.now() + config.sessionDurationMs).toISOString();

      // Получаем пользователя для получения его роли
      const user = await this.userService.getUserById(userId);
      
      // Выбрасываем ошибку если пользователь не найден
      if (!user) {
        throw new NotFoundError('Пользователь не найден', { userId });
      }
      
      const role = user.role;

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
      if (error instanceof NotFoundError) {
        throw error;
      }
      logger.error({ error, userId }, 'Ошибка создания сессии');
      throw new SessionError('Не удалось создать сессию для пользователя', { userId });
    }
  }

  /**
   * Получает ID пользователя по токену сессии
   * Возвращает null если сессия не найдена или истекла
   * @param token - Токен сессии
   * @returns ID пользователя или null
   * @throws {SessionError} При критической ошибке чтения файла сессий
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
   * @param token - Токен сессии
   * @returns Роль пользователя или null
   * @throws {SessionError} При критической ошибке чтения файла сессий
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
   * @param token - Токен сессии для удаления
   * @throws {SessionError} При ошибке удаления сессии (не критично, логируется)
   */
  async deleteSession(token: string): Promise<void> {
    try {
      await modifyJsonFile<Session>(SESSIONS_FILE, (sessions) => sessions.filter((s) => s.token !== token));

      logger.debug('Сессия удалена');
    } catch (error) {
      // Не выбрасываем ошибку, чтобы не блокировать logout
      logger.error({ error }, 'Ошибка удаления сессии');
    }
  }

  /**
   * Удаляет все истёкшие сессии
   * @returns Количество удалённых сессий
   * @throws {SessionError} При критической ошибке чтения или записи файла сессий
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
   * @param token - Токен сессии для продления
   * @returns true если сессия найдена и продлена, false если не найдена
   * @throws {SessionError} При критической ошибке чтения или записи файла сессий
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

  /**
   * Удаляет все сессии пользователя
   * @param userId - ID пользователя
   * @returns Количество удалённых сессий
   */
  async deleteAllUserSessions(userId: string): Promise<number> {
    try {
      let removedCount = 0;

      await modifyJsonFile<Session>(SESSIONS_FILE, (sessions) => {
        const userSessions = sessions.filter((s) => s.userId === userId);
        removedCount = userSessions.length;
        return sessions.filter((s) => s.userId !== userId);
      });

      if (removedCount > 0) {
        logger.info({ userId, count: removedCount }, 'Удалены все сессии пользователя');
      }

      return removedCount;
    } catch (error) {
      logger.error({ error, userId }, 'Ошибка удаления сессий пользователя');
      return 0;
    }
  }

  /**
   * Получает все активные сессии пользователя
   * @param userId - ID пользователя
   * @returns Массив активных сессий
   */
  async getUserSessions(userId: string): Promise<Session[]> {
    try {
      const sessions = await readJsonFile<Session>(SESSIONS_FILE);
      const now = new Date();

      return sessions.filter(
        (s) => s.userId === userId && new Date(s.expiresAt) > now,
      );
    } catch (error) {
      logger.error({ error, userId }, 'Ошибка получения сессий пользователя');
      return [];
    }
  }

  /**
   * Получает количество активных сессий
   * @returns Количество активных сессий
   */
  async getActiveSessionsCount(): Promise<number> {
    try {
      const sessions = await readJsonFile<Session>(SESSIONS_FILE);
      const now = new Date();

      return sessions.filter((s) => new Date(s.expiresAt) > now).length;
    } catch (error) {
      logger.error({ error }, 'Ошибка получения количества сессий');
      return 0;
    }
  }
}
