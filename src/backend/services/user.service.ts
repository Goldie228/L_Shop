/**
 * Сервис работы с пользователями
 */

import { readJsonFile, modifyJsonFile } from '../utils/file.utils';
import { User } from '../models/user.model';
import { generateId } from '../utils/id.utils';
import { hashPassword } from '../utils/hash.utils';
import { createContextLogger } from '../utils/logger';

const logger = createContextLogger('UserService');
const USERS_FILE = 'users.json';

export class UserService {
  /**
   * Получить всех пользователей из файловой базы
   * @returns Массив всех пользователей
   * @throws {Error} При ошибке чтения файла
   */
  async getAllUsers(): Promise<User[]> {
    return readJsonFile<User>(USERS_FILE);
  }

  /**
   * Найти пользователя по ID
   * @param id - ID пользователя
   * @returns Пользователь или null если не найден
   * @throws {Error} При ошибке чтения файла
   */
  async getUserById(id: string): Promise<User | null> {
    const users = await this.getAllUsers();
    return users.find((u) => u.id === id) || null;
  }

  /**
   * Найти пользователя по email или логину (для проверки уникальности)
   * @param email - Email для поиска
   * @param login - Логин для поиска
   * @returns Пользователь или null если не найден
   * @throws {Error} При ошибке чтения файла
   */
  async findByEmailOrLogin(email: string, login: string): Promise<User | null> {
    const users = await this.getAllUsers();
    return users.find((u) => u.email === email || u.login === login) || null;
  }

  /**
   * Поиск пользователя по логину или email для аутентификации
   * @param loginOrEmail - Логин или email пользователя
   * @returns Пользователь или null если не найден
   */
  async findByLoginOrEmail(loginOrEmail: string): Promise<User | null> {
    const users = await this.getAllUsers();
    return users.find((u) => u.login === loginOrEmail || u.email === loginOrEmail) || null;
  }

  /**
   * Создать нового пользователя
   * @param data - Данные пользователя (имя, email, логин, телефон, пароль, опционально firstName, role)
   * @returns Созданный пользователь с хешированным паролем
   * @throws {Error} При ошибке записи файла или если email/login уже существуют
   */
  async createUser(data: {
    name: string;
    email: string;
    login: string;
    phone: string;
    password: string;
    /** Имя (отдельное поле) */
    firstName?: string; // Опционально, по умолчанию берётся из name
    role?: string; // Опционально, по умолчанию 'user'
  }): Promise<User> {
    const now = new Date().toISOString();

    // Пароль хешируется перед сохранением
    const hashedPassword = await hashPassword(data.password);

    const newUser: User = {
      id: generateId(),
      name: data.name.trim(),
      /** Имя (отдельное поле) */
      firstName: data.firstName?.trim() ?? data.name.trim(),
      email: data.email.toLowerCase().trim(),
      login: data.login.trim(),
      phone: data.phone.trim(),
      password: hashedPassword,
      role: data.role ?? 'user', // Роль по умолчанию 'user'
      createdAt: now,
      updatedAt: now,
    };

    await modifyJsonFile<User>(USERS_FILE, (users) => {
      users.push(newUser);
      return users;
    });

    logger.debug({ userId: newUser.id, email: newUser.email }, 'Пользователь создан');

    return newUser;
  }

  /**
   * Обновить данные пользователя (кроме пароля)
   * @param id - ID пользователя
   * @param data - Частичные данные пользователя (имя, email, логин, телефон, роль)
   * @returns Обновлённый пользователь или null если не найден
   * @throws {Error} При ошибке записи файла
   */
  async updateUser(
    id: string,
    data: Partial<Omit<User, 'id' | 'createdAt'>>,
  ): Promise<User | null> {
    let updatedUser: User | null = null;

    // eslint-disable-next-line no-param-reassign
    await modifyJsonFile<User>(USERS_FILE, (users) => {
      const index = users.findIndex((u) => u.id === id);

      if (index === -1) {
        return users; // Не найден - возвращаем без изменений
      }

      // Не позволяем обновлять пароль через этот метод
      const { password, ...updateData } = data;

      // eslint-disable-next-line no-param-reassign
      users[index] = {
        ...users[index],
        ...updateData,
        updatedAt: new Date().toISOString(),
      };

      updatedUser = users[index];
      return users;
    });

    if (updatedUser) {
      logger.debug({ userId: id }, 'Пользователь обновлён');
    }

    return updatedUser;
  }

  /**
   * Обновить роль пользователя (только для администраторов)
   * @param userId - ID пользователя
   * @param role - Новая роль ('user' или 'admin')
   * @returns Обновлённый пользователь или null если не найден
   * @throws {Error} При ошибке записи файла
   */
  async updateUserRole(userId: string, role: string): Promise<User | null> {
    let updatedUser: User | null = null;

    // eslint-disable-next-line no-param-reassign
    await modifyJsonFile<User>(USERS_FILE, (users) => {
      const index = users.findIndex((u) => u.id === userId);

      if (index === -1) {
        return users;
      }

      // eslint-disable-next-line no-param-reassign
      users[index] = {
        ...users[index],
        role,
        updatedAt: new Date().toISOString(),
      };

      updatedUser = users[index];
      return users;
    });

    if (updatedUser) {
      logger.info({ userId, newRole: role }, 'Роль пользователя обновлена');
    }

    return updatedUser;
  }

  /**
   * Переключить статус блокировки пользователя
   * @param userId - ID пользователя
   * @returns Обновлённый пользователь или null если не найден
   * @throws {Error} При ошибке записи файла
   */
  async toggleUserBlock(userId: string): Promise<User | null> {
    let updatedUser: User | null = null;

    // eslint-disable-next-line no-param-reassign
    await modifyJsonFile<User>(USERS_FILE, (users) => {
      const index = users.findIndex((u) => u.id === userId);

      if (index === -1) {
        return users;
      }

      const isBlocked = users[index].isBlocked ?? false;

      // eslint-disable-next-line no-param-reassign
      users[index] = {
        ...users[index],
        isBlocked: !isBlocked,
        updatedAt: new Date().toISOString(),
      };

      updatedUser = users[index];
      return users;
    });

    if (updatedUser !== null) {
      const user = updatedUser as User;
      logger.info({ userId, isBlocked: user.isBlocked ?? false }, 'Статус блокировки изменён');
    }

    return updatedUser;
  }

  /**
   * Обновить профиль пользователя (имя, email)
   * @param userId - ID пользователя
   * @param name - Новое имя
   * @param email - Новый email
   * @returns Обновлённый пользователь или null если не найден
   * @throws {Error} Если email уже используется другим пользователем
   */
  async updateProfile(userId: string, name: string, email: string): Promise<User | null> {
    let updatedUser: User | null = null;

    // Проверка уникальности email
    const allUsers = await this.getAllUsers();
    const existingUser = allUsers.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.id !== userId,
    );

    if (existingUser) {
      logger.warn({ userId, email }, 'Email уже используется');
      throw new Error('EMAIL_EXISTS');
    }

    // eslint-disable-next-line no-param-reassign
    await modifyJsonFile<User>(USERS_FILE, (users) => {
      const index = users.findIndex((u) => u.id === userId);

      if (index === -1) {
        return users;
      }

      // eslint-disable-next-line no-param-reassign
      users[index] = {
        ...users[index],
        name: name.trim(),
        email: email.toLowerCase().trim(),
        updatedAt: new Date().toISOString(),
      };

      updatedUser = users[index];
      return users;
    });

    if (updatedUser) {
      logger.info({ userId }, 'Профиль пользователя обновлён');
    }

    return updatedUser;
  }

  /**
   * Обновить пароль пользователя
   * @param userId - ID пользователя
   * @param newPassword - Новый пароль (уже хешированный)
   * @returns Обновлённый пользователь или null если не найден
   * @throws {Error} При ошибке записи файла
   */
  async updatePassword(userId: string, newPassword: string): Promise<User | null> {
    let updatedUser: User | null = null;

    // eslint-disable-next-line no-param-reassign
    await modifyJsonFile<User>(USERS_FILE, (users) => {
      const index = users.findIndex((u) => u.id === userId);

      if (index === -1) {
        return users;
      }

      // eslint-disable-next-line no-param-reassign
      users[index] = {
        ...users[index],
        password: newPassword,
        updatedAt: new Date().toISOString(),
      };

      updatedUser = users[index];
      return users;
    });

    if (updatedUser) {
      logger.info({ userId }, 'Пароль пользователя обновлён');
    }

    return updatedUser;
  }
}
