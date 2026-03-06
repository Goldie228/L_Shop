/**
 * Скрипт для заполнения базы тестовыми данными
 * Запуск: npm run seed
 */

import { UserService } from '../services/user.service';
import { writeJsonFile, readJsonFile } from '../utils/file.utils';
import { config } from '../config/constants';
import { Product } from '../models/product.model';
import { generateId } from '../utils/id.utils';

const userService = new UserService();

async function seedUsers(): Promise<void> {
  console.log('[Seed] Создание тестовых пользователей...');

  const testUsers = [
    {
      name: 'Тестовый Пользователь',
      email: 'test@example.com',
      login: 'testuser',
      phone: '+375291234567',
      password: 'password123',
    },
    {
      name: 'Администратор',
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

async function seedProducts(): Promise<void> {
  console.log('[Seed] Создание тестовых продуктов...');

  const existingProducts = await readJsonFile<Product>('products.json');
  if (existingProducts.length > 0) {
    console.log(`[Seed] Продукты уже существуют (${existingProducts.length} шт.)`);
    return;
  }

  const testProducts: Product[] = [
    {
      id: generateId(),
      name: 'iPhone 15 Pro',
      description: 'Флагманский смартфон Apple с чипом A17 Pro',
      price: 129990,
      category: 'electronics',
      inStock: true,
      imageUrl: '/images/iphone15.jpg',
      rating: 4.8,
      reviewsCount: 256,
      createdAt: new Date().toISOString(),
    },
    {
      id: generateId(),
      name: 'Samsung Galaxy S24 Ultra',
      description: 'Премиальный смартфон Samsung с S Pen',
      price: 114990,
      category: 'electronics',
      inStock: true,
      imageUrl: '/images/samsung-s24.jpg',
      rating: 4.7,
      reviewsCount: 189,
      createdAt: new Date().toISOString(),
    },
    {
      id: generateId(),
      name: 'MacBook Pro 16"',
      description: 'Профессиональный ноутбук Apple с M3 Max',
      price: 349990,
      category: 'electronics',
      inStock: true,
      imageUrl: '/images/macbook-pro.jpg',
      rating: 4.9,
      reviewsCount: 145,
      discountPercent: 10,
      createdAt: new Date().toISOString(),
    },
    {
      id: generateId(),
      name: 'Nike Air Max 270',
      description: 'Комфортные кроссовки для повседневной носки',
      price: 14990,
      category: 'sports',
      inStock: true,
      imageUrl: '/images/nike-air-max.jpg',
      rating: 4.5,
      reviewsCount: 324,
      createdAt: new Date().toISOString(),
    },
    {
      id: generateId(),
      name: 'Adidas Ultraboost 23',
      description: 'Беговые кроссовки с технологией Boost',
      price: 17990,
      category: 'sports',
      inStock: false,
      imageUrl: '/images/adidas-ultraboost.jpg',
      rating: 4.6,
      reviewsCount: 198,
      createdAt: new Date().toISOString(),
    },
    {
      id: generateId(),
      name: 'Гарри Поттер. Полное издание',
      description: 'Все 7 книг о мальчике-волшебнике в одном томе',
      price: 4990,
      category: 'books',
      inStock: true,
      imageUrl: '/images/harry-potter.jpg',
      rating: 4.9,
      reviewsCount: 567,
      createdAt: new Date().toISOString(),
    },
    {
      id: generateId(),
      name: 'Властелин колец',
      description: 'Трилогия Дж. Р. Р. Толкина',
      price: 2990,
      category: 'books',
      inStock: true,
      imageUrl: '/images/lotr.jpg',
      rating: 4.8,
      reviewsCount: 432,
      createdAt: new Date().toISOString(),
    },
    {
      id: generateId(),
      name: 'Philips Air Fryer XXL',
      description: 'Аэрофритюрница для здорового приготовления',
      price: 24990,
      category: 'home',
      inStock: true,
      imageUrl: '/images/air-fryer.jpg',
      rating: 4.4,
      reviewsCount: 89,
      createdAt: new Date().toISOString(),
    },
    {
      id: generateId(),
      name: 'Dyson V15 Detect',
      description: 'Беспроводной пылесос с лазерным датчиком',
      price: 69990,
      category: 'home',
      inStock: true,
      imageUrl: '/images/dyson-v15.jpg',
      rating: 4.7,
      reviewsCount: 156,
      createdAt: new Date().toISOString(),
    },
    {
      id: generateId(),
      name: 'Sony PlayStation 5',
      description: 'Игровая консоль нового поколения',
      price: 54990,
      category: 'electronics',
      inStock: false,
      imageUrl: '/images/ps5.jpg',
      rating: 4.8,
      reviewsCount: 892,
      createdAt: new Date().toISOString(),
    },
  ];

  await writeJsonFile('products.json', testProducts);
  console.log(`[Seed] Создано ${testProducts.length} продуктов`);
}

async function seed(): Promise<void> {
  console.log('[Seed] Начало заполнения данными...');
  console.log(`[Seed] Окружение: ${config.nodeEnv}`);

  await seedUsers();
  await seedProducts();

  console.log('[Seed] Заполнение завершено!');
}

seed().catch((error) => {
  console.error('[Seed] Ошибка:', error);
  process.exit(1);
});
