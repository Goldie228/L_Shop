import { SessionService } from '../session.service';
import { readJsonFile, writeJsonFile } from '../../utils/file.utils';
import { Session } from '../../models/session.model';

// Мок для утилит работы с файлами
jest.mock('../../utils/file.utils');

const mockReadJsonFile = readJsonFile as jest.MockedFunction<typeof readJsonFile>;
const mockWriteJsonFile = writeJsonFile as jest.MockedFunction<typeof writeJsonFile>;

describe('SessionService', () => {
  let sessionService: SessionService;

  beforeEach(() => {
    sessionService = new SessionService();
    jest.clearAllMocks();
  });

  describe('createSession', () => {
    it('должен создавать новую сессию и возвращать токен', async () => {
      mockReadJsonFile.mockResolvedValue([]);
      mockWriteJsonFile.mockResolvedValue();

      const token = await sessionService.createSession('user-123');

      expect(token).toBeDefined();
      expect(mockWriteJsonFile).toHaveBeenCalledWith(
        'sessions.json',
        expect.arrayContaining([
          expect.objectContaining({
            token,
            userId: 'user-123',
          }),
        ]),
      );
    });
  });

  describe('getUserIdByToken', () => {
    it('должен возвращать userId для валидного токена', async () => {
      const mockSessions: Session[] = [
        {
          token: 'valid-token',
          userId: 'user-123',
          expiresAt: new Date(Date.now() + 600000).toISOString(),
        },
      ];
      mockReadJsonFile.mockResolvedValue(mockSessions);

      const userId = await sessionService.getUserIdByToken('valid-token');

      expect(userId).toBe('user-123');
    });

    it('должен возвращать null для истёкшего токена', async () => {
      const mockSessions: Session[] = [
        {
          token: 'expired-token',
          userId: 'user-123',
          expiresAt: new Date(Date.now() - 600000).toISOString(),
        },
      ];
      mockReadJsonFile.mockResolvedValue(mockSessions);

      const userId = await sessionService.getUserIdByToken('expired-token');

      expect(userId).toBeNull();
    });

    it('должен возвращать null для несуществующего токена', async () => {
      mockReadJsonFile.mockResolvedValue([]);

      const userId = await sessionService.getUserIdByToken('non-existent');

      expect(userId).toBeNull();
    });
  });

  describe('deleteSession', () => {
    it('должен удалять сессию по токену', async () => {
      const mockSessions: Session[] = [
        { token: 'token-1', userId: 'user-1', expiresAt: new Date().toISOString() },
        { token: 'token-2', userId: 'user-2', expiresAt: new Date().toISOString() },
      ];
      mockReadJsonFile.mockResolvedValue(mockSessions);
      mockWriteJsonFile.mockResolvedValue();

      await sessionService.deleteSession('token-1');

      expect(mockWriteJsonFile).toHaveBeenCalledWith(
        'sessions.json',
        [mockSessions[1]],
      );
    });
  });
});
