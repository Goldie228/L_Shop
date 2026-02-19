/**
 * Скрипт для заполнения базы тестовыми данными
 * Запуск: npm run seed
 */

import { UserService } from '../services/user.service';
import { config } from '../config/constants';

const userService = new UserService();

async function seedUsers(): Promise<void> {
  console.log('[Seed] Создание тестовых пользователей...');

  const testUsers = [
    {
      name: 'Test User',
      email: 'test@example.com',
      login: 'testuser',
      phone: '+375291234567',
      password: 'password123',
    },
    {
      name: 'Admin User',
      email: 'admin@example.com',
      login: 'admin',
      phone: '+375297654321',
      password: 'admin123',
    },
  ];

  for (const userData of testUsers) {
    try {
      const existing = await userService.findByEmailOrLogin(userData.email, userData.login);
      if (!existing) {
        await userService.createUser(userData);
        console.log(`[Seed] Создан пользователь: ${userData.login}`);
      } else {
        console.log(`[Seed] Пользователь уже существует: ${userData.login}`);
      }
    } catch (error) {
      console.error(`[Seed] Ошибка создания пользователя ${userData.login}:`, error);
    }
  }
}

async function seed(): Promise<void> {
  console.log('[Seed] Начало заполнения данными...');
  console.log(`[Seed] Окружение: ${config.nodeEnv}`);

  await seedUsers();

  console.log('[Seed] Заполнение завершено!');
}

seed().catch((error) => {
  console.error('[Seed] Ошибка:', error);
  process.exit(1);
});
