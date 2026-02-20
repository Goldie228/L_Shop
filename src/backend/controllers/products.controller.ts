/**
 * Контроллер для работы с товарами
 * Обрабатывает запросы на получение списка товаров и деталей товара
 */

import { Request, Response } from 'express';

// Простая модель товара для внутреннего использования
interface SimpleProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  inStock: boolean;
  imageUrl?: string;
}

// Тестовые данные
const TEST_PRODUCTS: SimpleProduct[] = [
  {
    id: '1',
    name: 'Смартфон iPhone 15',
    description: 'Новейший iPhone с улучшенной камерой и процессором',
    price: 999,
    category: 'электроника',
    inStock: true,
    imageUrl: '/images/iphone15.jpg',
  },
  {
    id: '2',
    name: 'Ноутбук MacBook Pro',
    description: 'Мощный ноутбук для профессиональной работы',
    price: 1999,
    category: 'электроника',
    inStock: true,
    imageUrl: '/images/macbook.jpg',
  },
  {
    id: '3',
    name: 'Наушники AirPods Pro',
    description: 'Беспроводные наушники с активным шумоподавлением',
    price: 249,
    category: 'аксессуары',
    inStock: false,
    imageUrl: '/images/airpods.jpg',
  },
];

/**
 * Получить все товары
 * GET /api/products
 */
export async function getAllProducts(_req: Request, res: Response): Promise<void> {
  try {
    res.json({
      message: 'Товары получены успешно',
      products: TEST_PRODUCTS,
      count: TEST_PRODUCTS.length,
    });
  } catch (error) {
    console.error('[ProductsController] Ошибка получения товаров:', error);
    res.status(500).json({
      message: 'Ошибка при получении товаров',
      error: 'PRODUCTS_FETCH_ERROR',
    });
  }
}

/**
 * Получить товар по ID
 * GET /api/products/:id
 */
export async function getProductById(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    if (!id) {
      res.status(400).json({
        message: 'ID товара обязателен',
        error: 'MISSING_PRODUCT_ID',
      });
      return;
    }

    const product = TEST_PRODUCTS.find((p) => p.id === id) || null;

    if (!product) {
      res.status(404).json({
        message: 'Товар не найден',
        error: 'PRODUCT_NOT_FOUND',
      });
      return;
    }

    res.json({
      message: 'Товар получен успешно',
      product,
    });
  } catch (error) {
    console.error('[ProductsController] Ошибка получения товара:', error);
    res.status(500).json({
      message: 'Ошибка при получении товара',
      error: 'PRODUCT_FETCH_ERROR',
    });
  }
}
