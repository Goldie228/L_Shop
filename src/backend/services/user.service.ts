import { readJsonFile, writeJsonFile } from '../utils/file.utils';
import { User } from '../models/user.model';
import { generateId } from '../utils/id.utils';
import { hashPassword } from '../utils/hash.utils';

const USERS_FILE = 'users.json';

/**
 * Сервис для работы с пользователями
 */
export class UserService {
  /**
   * Получить всех пользователей
   */
  async getAllUsers(): Promise<User[]> {
    return readJsonFile<User>(USERS_FILE);
  }

  /**
   * Найти пользователя по ID
   */
  async getUserById(id: string): Promise<User | null> {
    const users = await this.getAllUsers();
    return users.find((u) => u.id === id) || null;
  }

  /**
   * Найти пользователя по email или login
   */
  async findByEmailOrLogin(email: string, login: string): Promise<User | null> {
    const users = await this.getAllUsers();
    return users.find((u) => u.email === email || u.login === login) || null;
  }

  /**
   * Найти пользователя по login или email для аутентификации
   */
  async findByLoginOrEmail(loginOrEmail: string): Promise<User | null> {
    const users = await this.getAllUsers();
    return users.find((u) => u.login === loginOrEmail || u.email === loginOrEmail) || null;
  }

  /**
   * Создать нового пользователя
   */
  async createUser(data: {
    name: string;
    email: string;
    login: string;
    phone: string;
    password: string;
  }): Promise<User> {
    const users = await this.getAllUsers();
    const now = new Date().toISOString();

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

  /**
   * Обновить пользователя
   */
  async updateUser(id: string, data: Partial<Omit<User, 'id' | 'createdAt'>>): Promise<User | null> {
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
