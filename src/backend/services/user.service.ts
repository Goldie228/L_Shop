/**
 * Сервис работы с пользователями
 */

import { readJsonFile, writeJsonFile } from '../utils/file.utils';
import { User } from '../models/user.model';
import { generateId } from '../utils/id.utils';
import { hashPassword } from '../utils/hash.utils';

const USERS_FILE = 'users.json';

export class UserService {
  async getAllUsers(): Promise<User[]> {
    return readJsonFile<User>(USERS_FILE);
  }

  async getUserById(id: string): Promise<User | null> {
    const users = await this.getAllUsers();
    return users.find((u) => u.id === id) || null;
  }

  async findByEmailOrLogin(email: string, login: string): Promise<User | null> {
    const users = await this.getAllUsers();
    return users.find((u) => u.email === email || u.login === login) || null;
  }

  /**
   * Поиск пользователя по логину или email для аутентификации
   */
  async findByLoginOrEmail(loginOrEmail: string): Promise<User | null> {
    const users = await this.getAllUsers();
    return users.find((u) => u.login === loginOrEmail || u.email === loginOrEmail) || null;
  }

  async createUser(data: {
    name: string;
    email: string;
    login: string;
    phone: string;
    password: string;
  }): Promise<User> {
    const users = await this.getAllUsers();
    const now = new Date().toISOString();

    // Пароль хешируется перед сохранением
    const hashedPassword = await hashPassword(data.password);

    const newUser: User = {
      id: generateId(),
      name: data.name.trim(),
      email: data.email.toLowerCase().trim(),
      login: data.login.trim(),
      phone: data.phone.trim(),
      password: hashedPassword,
      createdAt: now,
      updatedAt: now,
    };

    users.push(newUser);
    await writeJsonFile(USERS_FILE, users);

    return newUser;
  }

  async updateUser(
    id: string,
    data: Partial<Omit<User, 'id' | 'createdAt'>>,
  ): Promise<User | null> {
    const users = await this.getAllUsers();
    const index = users.findIndex((u) => u.id === id);

    if (index === -1) {
      return null;
    }

    users[index] = {
      ...users[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };

    await writeJsonFile(USERS_FILE, users);
    return users[index];
  }
}
