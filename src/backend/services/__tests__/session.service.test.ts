/**
 * Тесты для SessionService
 */

import { SessionService } from '../session.service';
import { readJsonFile, modifyJsonFile } from '../../utils/file.utils';
import { Session } from '../../models/session.model';
import { User } from '../../models/user.model';

jest.mock('../../utils/file.utils');

const mockReadJsonFile = readJsonFile as jest.MockedFunction<typeof readJsonFile>;
const mockModifyJsonFile = modifyJsonFile as jest.MockedFunction<typeof modifyJsonFile>;

describe('Тесты SessionService', () => {
  let sessionService: SessionService;

  beforeEach(() => {
    jest.clearAllMocks();
    sessionService = new SessionService();
  });

  describe('Создание сессии', () => {
    it('должен создавать новую сессию', async () => {
      const mockUser: User = {
        id: 'user-1',
        name: 'Тест',
        email: 'test@example.com',
        login: 'test',
        phone: '+1234567890',
        password: 'hash',
        createdAt: '2026-02-19',
        updatedAt: '2026-02-19',
        role: 'user',
      };

      mockModifyJsonFile.mockImplementation(async (_filename, modifier) => {
        const sessions: Session[] = [];
        return modifier(sessions);
      });

      // Мокаем getUserById чтобы возвращать mockUser
      const mockGetUserById = jest.fn().mockResolvedValue(mockUser);
      (sessionService as unknown as { userService: { getUserById: typeof mockGetUserById } }).userService = {
        getUserById: mockGetUserById,
      } as never;

      const token = await sessionService.createSession('user-1');

      expect(token).toBeDefined();
      expect(mockModifyJsonFile).toHaveBeenCalled();
    });
  });

  describe('Получение ID пользователя по токену', () => {
    it('должен возвращать ID пользователя для валидного токена', async () => {
      const futureDate = new Date(Date.now() + 86400000).toISOString();
      const mockSessions: Session[] = [
        { token: 'valid-token', userId: 'user-1', role: 'user', expiresAt: futureDate },
      ];
      mockReadJsonFile.mockResolvedValue(mockSessions);

      const userId = await sessionService.getUserIdByToken('valid-token');

      expect(userId).toBe('user-1');
      expect(mockReadJsonFile).toHaveBeenCalledWith('sessions.json');
    });

    it('должен возвращать null для невалидного токена', async () => {
      mockReadJsonFile.mockResolvedValue([]);

      const userId = await sessionService.getUserIdByToken('invalid-token');

      expect(userId).toBeNull();
    });

    it('должен возвращать null для истёкшей сессии', async () => {
      const pastDate = new Date(Date.now() - 1000).toISOString();
      const mockSessions: Session[] = [
        { token: 'expired-token', userId: 'user-1', role: 'user', expiresAt: pastDate },
      ];
      mockReadJsonFile.mockResolvedValue(mockSessions);

      const userId = await sessionService.getUserIdByToken('expired-token');

      expect(userId).toBeNull();
    });
  });

  describe('Получение роли по токену', () => {
    it('должен возвращать роль для валидного токена', async () => {
      const futureDate = new Date(Date.now() + 86400000).toISOString();
      const mockSessions: Session[] = [
        { token: 'valid-token', userId: 'user-1', role: 'admin', expiresAt: futureDate },
      ];
      mockReadJsonFile.mockResolvedValue(mockSessions);

      const role = await sessionService.getRoleByToken('valid-token');

      expect(role).toBe('admin');
    });

    it('должен возвращать null для невалидного токена', async () => {
      mockReadJsonFile.mockResolvedValue([]);

      const role = await sessionService.getRoleByToken('invalid-token');

      expect(role).toBeNull();
    });
  });

  describe('Удаление сессии', () => {
    it('должен удалять сессию по токену', async () => {
      const mockSessions: Session[] = [
        { token: 'token-1', userId: 'user-1', role: 'user', expiresAt: '2027-01-01' },
        { token: 'token-2', userId: 'user-2', role: 'user', expiresAt: '2027-01-01' },
      ];

      mockModifyJsonFile.mockImplementation(async (_filename, modifier) => {
        return modifier(mockSessions);
      });

      await sessionService.deleteSession('token-1');

      expect(mockModifyJsonFile).toHaveBeenCalled();
    });
  });

  describe('Очистка истёкших сессий', () => {
    it('должен удалять истёкшие сессии', async () => {
      const futureDate = new Date(Date.now() + 86400000).toISOString();
      const pastDate = new Date(Date.now() - 1000).toISOString();
      const mockSessions: Session[] = [
        { token: 'token-1', userId: 'user-1', role: 'user', expiresAt: futureDate },
        { token: 'token-2', userId: 'user-2', role: 'user', expiresAt: pastDate },
      ];

      mockModifyJsonFile.mockImplementation(async (_filename, modifier) => {
        return modifier(mockSessions);
      });

      const removedCount = await sessionService.cleanExpired();

      expect(removedCount).toBe(1);
      expect(mockModifyJsonFile).toHaveBeenCalled();
    });
  });
});
