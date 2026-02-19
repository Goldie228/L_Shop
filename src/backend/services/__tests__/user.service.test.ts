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

describe('UserService', () => {
  let userService: UserService;

  beforeEach(() => {
    userService = new UserService();
    jest.clearAllMocks();
    mockHashPassword.mockResolvedValue('hashed-password');
  });

  describe('getAllUsers', () => {
    it('должен возвращать всех пользователей', async () => {
      const mockUsers: User[] = [
        {
          id: '1',
          name: 'Test',
          email: 'test@example.com',
          login: 'test',
          phone: '+1234567890',
          password: 'hash',
          createdAt: '2024-01-01',
          updatedAt: '2024-01-01',
        },
      ];
      mockReadJsonFile.mockResolvedValue(mockUsers);

      const users = await userService.getAllUsers();

      expect(users).toEqual(mockUsers);
      expect(mockReadJsonFile).toHaveBeenCalledWith('users.json');
    });
  });

  describe('getUserById', () => {
    it('должен возвращать пользователя по ID', async () => {
      const mockUsers: User[] = [
        {
          id: 'user-1',
          name: 'Test',
          email: 'test@example.com',
          login: 'test',
          phone: '+1234567890',
          password: 'hash',
          createdAt: '2024-01-01',
          updatedAt: '2024-01-01',
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

  describe('findByEmailOrLogin', () => {
    it('должен находить пользователя по email', async () => {
      const mockUsers: User[] = [
        {
          id: '1',
          name: 'Test',
          email: 'test@example.com',
          login: 'test',
          phone: '+1234567890',
          password: 'hash',
          createdAt: '2024-01-01',
          updatedAt: '2024-01-01',
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
          name: 'Test',
          email: 'test@example.com',
          login: 'testuser',
          phone: '+1234567890',
          password: 'hash',
          createdAt: '2024-01-01',
          updatedAt: '2024-01-01',
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

  describe('findByLoginOrEmail', () => {
    it('должен находить пользователя по логину или email', async () => {
      const mockUsers: User[] = [
        {
          id: '1',
          name: 'Test',
          email: 'test@example.com',
          login: 'testuser',
          phone: '+1234567890',
          password: 'hash',
          createdAt: '2024-01-01',
          updatedAt: '2024-01-01',
        },
      ];
      mockReadJsonFile.mockResolvedValue(mockUsers);

      const userByLogin = await userService.findByLoginOrEmail('testuser');
      const userByEmail = await userService.findByLoginOrEmail('test@example.com');

      expect(userByLogin).toEqual(mockUsers[0]);
      expect(userByEmail).toEqual(mockUsers[0]);
    });
  });

  describe('createUser', () => {
    it('должен создавать нового пользователя', async () => {
      mockReadJsonFile.mockResolvedValue([]);
      mockWriteJsonFile.mockResolvedValue();

      const userData = {
        name: '  Test User  ',
        email: '  TEST@EXAMPLE.COM  ',
        login: '  testuser  ',
        phone: '  +1234567890  ',
        password: 'password123',
      };

      const user = await userService.createUser(userData);

      expect(user.name).toBe('Test User');
      expect(user.email).toBe('test@example.com');
      expect(user.login).toBe('testuser');
      expect(user.phone).toBe('+1234567890');
      expect(user.password).toBe('hashed-password');
      expect(mockHashPassword).toHaveBeenCalledWith('password123');
      expect(mockWriteJsonFile).toHaveBeenCalled();
    });
  });

  describe('updateUser', () => {
    it('должен обновлять пользователя', async () => {
      const mockUsers: User[] = [
        {
          id: 'user-1',
          name: 'Old Name',
          email: 'test@example.com',
          login: 'testuser',
          phone: '+1234567890',
          password: 'hash',
          createdAt: '2024-01-01',
          updatedAt: '2024-01-01',
        },
      ];
      mockReadJsonFile.mockResolvedValue(mockUsers);
      mockWriteJsonFile.mockResolvedValue();

      const updatedUser = await userService.updateUser('user-1', { name: 'New Name' });

      expect(updatedUser?.name).toBe('New Name');
      expect(mockWriteJsonFile).toHaveBeenCalled();
    });

    it('должен возвращать null если пользователь не найден', async () => {
      mockReadJsonFile.mockResolvedValue([]);

      const result = await userService.updateUser('non-existent', { name: 'New Name' });

      expect(result).toBeNull();
    });
  });
});
