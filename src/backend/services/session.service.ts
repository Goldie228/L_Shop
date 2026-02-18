import { readJsonFile, writeJsonFile } from '../utils/file.utils';
import { Session } from '../models/session.model';
import { generateId } from '../utils/id.utils';

const SESSIONS_FILE = 'sessions.json';

// Сервис работы с сессиями
export class SessionService {
  // Создание новой сессии
  async createSession(userId: string): Promise<string> {
    const sessions = await readJsonFile<Session>(SESSIONS_FILE);
    const token = generateId();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();
    sessions.push({ token, userId, expiresAt });
    await writeJsonFile(SESSIONS_FILE, sessions);
    return token;
  }

  // Получение userId по токену
  async getUserIdByToken(token: string): Promise<string | null> {
    const sessions = await readJsonFile<Session>(SESSIONS_FILE);
    const session = sessions.find(s => s.token === token && new Date(s.expiresAt) > new Date());
    return session?.userId || null;
  }

  // Удаление сессии
  async deleteSession(token: string): Promise<void> {
    const sessions = await readJsonFile<Session>(SESSIONS_FILE);
    const filtered = sessions.filter(s => s.token !== token);
    await writeJsonFile(SESSIONS_FILE, filtered);
  }

  // Очистка истекших сессий
  async cleanExpired(): Promise<void> {
    const sessions = await readJsonFile<Session>(SESSIONS_FILE);
    const valid = sessions.filter(s => new Date(s.expiresAt) > new Date());
    await writeJsonFile(SESSIONS_FILE, valid);
  }
}
