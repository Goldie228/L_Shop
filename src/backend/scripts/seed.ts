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
      role: 'user',
    },
    {
      name: 'Администратор',
      email: 'admin@example.com',
      login: 'admin',
      phone: '+375297654321',
      password: 'admin123',
      role: 'admin',
    },
    {
      name: 'Goldie',
      email: 'goldie228@example.com',
      login: 'Goldie228',
      phone: '+375291234568',
      password: 'goldie228',
      role: 'admin',
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

  const now = new Date().toISOString();
  const testProducts: Product[] = [
    {
      id: generateId(),
      name: 'iPhone 15 Pro',
      description: 'Флагманский смартфон Apple с чипом A17 Pro',
      price: 129990,
      currency: 'BYN',
      category: 'electronics',
      inStock: true,
      imageUrl: '/images/iphone15pro.jpg',
      rating: 4.8,
      reviewsCount: 256,
      brand: 'Apple',
      warranty: '24 месяца',
      specifications: { 'Диагональ экрана': '6.1"', Память: '256 ГБ', Процессор: 'A17 Pro' },
      createdAt: now,
      updatedAt: now,
    },
    {
      id: generateId(),
      name: 'Samsung Galaxy S24 Ultra',
      description: 'Премиальный смартфон Samsung с S Pen',
      price: 114990,
      currency: 'BYN',
      category: 'electronics',
      inStock: true,
      imageUrl: '/images/samsung-s24.jpg',
      rating: 4.7,
      reviewsCount: 189,
      brand: 'Samsung',
      warranty: '24 месяца',
      specifications: {
        'Диагональ экрана': '6.8"',
        Память: '512 ГБ',
        Процессор: 'Snapdragon 8 Gen 3',
      },
      createdAt: now,
      updatedAt: now,
    },
    {
      id: generateId(),
      name: 'MacBook Air M3',
      description: 'Лёгкий и мощный ноутбук Apple с чипом M3',
      price: 149990,
      currency: 'BYN',
      category: 'electronics',
      inStock: true,
      imageUrl: '/images/macbook-air.jpg',
      rating: 4.9,
      reviewsCount: 145,
      discountPercent: 10,
      brand: 'Apple',
      warranty: '12 месяцев',
      specifications: { 'Диагональ экрана': '13.6"', Память: '256 ГБ', Процессор: 'Apple M3' },
      createdAt: now,
      updatedAt: now,
    },
    {
      id: generateId(),
      name: 'Nike Air Max 270',
      description: 'Комфортные кроссовки для повседневной носки',
      price: 14990,
      currency: 'BYN',
      category: 'sports',
      inStock: true,
      imageUrl: '/images/nike-airmax.jpg',
      rating: 4.5,
      reviewsCount: 324,
      brand: 'Nike',
      warranty: '6 месяцев',
      specifications: { Размер: '40-46', Материал: 'текстиль', Подошва: 'Air Max' },
      createdAt: now,
      updatedAt: now,
    },
    {
      id: generateId(),
      name: 'Adidas Ultraboost 23',
      description: 'Беговые кроссовки с технологией Boost',
      price: 17990,
      currency: 'BYN',
      category: 'sports',
      inStock: false,
      imageUrl: '/images/adidas-ultraboost.jpg',
      rating: 4.6,
      reviewsCount: 198,
      brand: 'Adidas',
      warranty: '6 месяцев',
      specifications: { Размер: '39-45', Материал: 'Primeknit', Подошва: 'Boost' },
      createdAt: now,
      updatedAt: now,
    },
    {
      id: generateId(),
      name: 'Sony PlayStation 5',
      description: 'Игровая консоль нового поколения',
      price: 54990,
      currency: 'BYN',
      category: 'electronics',
      inStock: true,
      imageUrl: '/images/ps5.jpg',
      rating: 4.8,
      reviewsCount: 892,
      brand: 'Sony',
      warranty: '12 месяцев',
      specifications: { Платформа: 'PS5', Версия: 'Standard', Гарантия: '1 год' },
      createdAt: now,
      updatedAt: now,
    },
    {
      id: generateId(),
      name: 'Dyson V15 Detect',
      description: 'Беспроводной пылесос с лазерным датчиком',
      price: 69990,
      currency: 'BYN',
      category: 'home',
      inStock: true,
      imageUrl: '/images/dyson-v15.jpg',
      rating: 4.7,
      reviewsCount: 156,
      brand: 'Dyson',
      warranty: '24 месяца',
      specifications: { Тип: 'роторный', 'Время работы': '60 мин', Пылесборник: '0.77 л' },
      createdAt: now,
      updatedAt: now,
    },
    {
      id: generateId(),
      name: 'Apple Watch Ultra 2',
      description: 'Прочные смарт-часы для экстремальных условий',
      price: 79990,
      currency: 'BYN',
      category: 'electronics',
      inStock: true,
      imageUrl: '/images/apple-watch.jpg',
      rating: 4.8,
      reviewsCount: 234,
      brand: 'Apple',
      warranty: '24 месяца',
      specifications: { 'Диагональ экрана': '49 мм', Водозащита: '100 м', GPS: 'встроенный' },
      createdAt: now,
      updatedAt: now,
    },
    {
      id: generateId(),
      name: 'Xbox Series X',
      description: 'Мощная игровая консоль от Microsoft',
      price: 49990,
      currency: 'BYN',
      category: 'electronics',
      inStock: false,
      imageUrl: '/images/xbox-seriesx.jpg',
      rating: 4.7,
      reviewsCount: 567,
      brand: 'Microsoft',
      warranty: '12 месяцев',
      specifications: { Платформа: 'Xbox', Версия: 'Series X', Гарантия: '1 год' },
      createdAt: now,
      updatedAt: now,
    },
    {
      id: generateId(),
      name: 'Bose QuietComfort Ultra',
      description: 'Беспроводные наушники с шумоподавлением',
      price: 44990,
      currency: 'BYN',
      category: 'electronics',
      inStock: true,
      imageUrl: '/images/bose-qc.jpg',
      rating: 4.6,
      reviewsCount: 189,
      brand: 'Bose',
      warranty: '12 месяцев',
      specifications: { Тип: 'накладные', Шумоподавление: 'активное', 'Время работы': '24 ч' },
      createdAt: now,
      updatedAt: now,
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
