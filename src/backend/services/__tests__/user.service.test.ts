/**
 * Тесты для UserService
 */

import { UserService } from '../user.service';
import { readJsonFile, writeJsonFile } from '../../utils/file.utils';
import { User } from '../../models/user.model';
import { hashPassword } from '../../utils/hash.utils';

jest.mock('../../utils/file.utils');
jest.mock('../../utils/hash.utils');

const mockReadJsonFile = readJsonFile as jest.MockedFunction<typeof readJsonFile>;
const mockWriteJsonFile = writeJsonFile as jest.MockedFunction<typeof writeJsonFile>;
const mockHashPassword = hashPassword as jest.MockedFunction<typeof hashPassword>;

describe('Тесты UserService', () => {
  let userService: UserService;

  beforeEach(() => {
    userService = new UserService();
    jest.clearAllMocks();
    mockHashPassword.mockResolvedValue('hashed-password');
  });

  describe('Получение всех пользователей', () => {
    it('должен возвращать всех пользователей', async () => {
      const mockUsers: User[] = [
        {
          id: '1',
          name: 'Тест',
          email: 'test@example.com',
          login: 'test',
          phone: '+1234567890',
          password: 'hash',
          createdAt: '2026-02-19',
          updatedAt: '2026-02-19',
        },
      ];
      mockReadJsonFile.mockResolvedValue(mockUsers);

      const users = await userService.getAllUsers();

      expect(users).toEqual(mockUsers);
      expect(mockReadJsonFile).toHaveBeenCalledWith('users.json');
    });
  });

  describe('Получение пользователя по ID', () => {
    it('должен возвращать пользователя по ID', async () => {
      const mockUsers: User[] = [
        {
          id: 'user-1',
          name: 'Тест',
          email: 'test@example.com',
          login: 'test',
          phone: '+1234567890',
          password: 'hash',
          createdAt: '2026-02-19',
          updatedAt: '2026-02-19',
        },
      ];
      mockReadJsonFile.mockResolvedValue(mockUsers);

      const user = await userService.getUserById('user-1');

      expect(user).toEqual(mockUsers[0]);
    });

    it('должен возвращать null если пользователь не найден', async () => {
      mockReadJsonFile.mockResolvedValue([]);

      const user = await userService.getUserById('non-existent');

      expect(user).toBeNull();
    });
  });

  describe('Поиск по email или логину', () => {
    it('должен находить пользователя по email', async () => {
      const mockUsers: User[] = [
        {
          id: '1',
          name: 'Тест',
          email: 'test@example.com',
          login: 'test',
          phone: '+1234567890',
          password: 'hash',
          createdAt: '2026-02-19',
          updatedAt: '2026-02-19',
        },
      ];
      mockReadJsonFile.mockResolvedValue(mockUsers);

      const user = await userService.findByEmailOrLogin('test@example.com', 'other');

      expect(user).toEqual(mockUsers[0]);
    });

    it('должен находить пользователя по логину', async () => {
      const mockUsers: User[] = [
        {
          id: '1',
          name: 'Тест',
          email: 'test@example.com',
          login: 'testuser',
          phone: '+1234567890',
          password: 'hash',
          createdAt: '2026-02-19',
          updatedAt: '2026-02-19',
        },
      ];
      mockReadJsonFile.mockResolvedValue(mockUsers);

      const user = await userService.findByEmailOrLogin('other@example.com', 'testuser');

      expect(user).toEqual(mockUsers[0]);
    });

    it('должен возвращать null если пользователь не найден', async () => {
      mockReadJsonFile.mockResolvedValue([]);

      const user = await userService.findByEmailOrLogin('none@example.com', 'none');

      expect(user).toBeNull();
    });
  });

  describe('Поиск по логину или email', () => {
    it('должен находить пользователя по логину или email', async () => {
      const mockUsers: User[] = [
        {
          id: '1',
          name: 'Тест',
          email: 'test@example.com',
          login: 'testuser',
          phone: '+1234567890',
          password: 'hash',
          createdAt: '2026-02-19',
          updatedAt: '2026-02-19',
        },
      ];
      mockReadJsonFile.mockResolvedValue(mockUsers);

      const userByLogin = await userService.findByLoginOrEmail('testuser');
      const userByEmail = await userService.findByLoginOrEmail('test@example.com');

      expect(userByLogin).toEqual(mockUsers[0]);
      expect(userByEmail).toEqual(mockUsers[0]);
    });
  });

  describe('Создание пользователя', () => {
    it('должен создавать нового пользователя', async () => {
      mockReadJsonFile.mockResolvedValue([]);
      mockWriteJsonFile.mockResolvedValue();

      const userData = {
        name: '  Тестовый Пользователь  ',
        email: '  TEST@EXAMPLE.COM  ',
        login: '  testuser  ',
        phone: '  +1234567890  ',
        password: 'password123',
      };

      const user = await userService.createUser(userData);

      expect(user.name).toBe('Тестовый Пользователь');
      expect(user.email).toBe('test@example.com');
      expect(user.login).toBe('testuser');
      expect(user.phone).toBe('+1234567890');
      expect(user.password).toBe('hashed-password');
      expect(mockHashPassword).toHaveBeenCalledWith('password123');
      expect(mockWriteJsonFile).toHaveBeenCalled();
    });
  });

  describe('Обновление пользователя', () => {
    it('должен обновлять пользователя', async () => {
      const mockUsers: User[] = [
        {
          id: 'user-1',
          name: 'Старое Имя',
          email: 'test@example.com',
          login: 'testuser',
          phone: '+1234567890',
          password: 'hash',
          createdAt: '2026-02-19',
          updatedAt: '2026-02-19',
        },
      ];
      mockReadJsonFile.mockResolvedValue(mockUsers);
      mockWriteJsonFile.mockResolvedValue();

      const updatedUser = await userService.updateUser('user-1', { name: 'Новое Имя' });

      expect(updatedUser?.name).toBe('Новое Имя');
      expect(mockWriteJsonFile).toHaveBeenCalled();
    });

    it('должен возвращать null если пользователь не найден', async () => {
      mockReadJsonFile.mockResolvedValue([]);

      const result = await userService.updateUser('non-existent', { name: 'Новое Имя' });

      expect(result).toBeNull();
    });
  });
});
