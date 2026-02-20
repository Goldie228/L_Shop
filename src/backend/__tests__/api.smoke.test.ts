/**
 * Smoke tests для API
 * Проверяет критические пути: авторизацию, продукты, health check
 */

import request from 'supertest';
import express, { Express } from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';

// Импортируем маршруты
import authRoutes from '../routes/auth.routes';
import productsRoutes from '../routes/products.routes';

// Создаём тестовое приложение
function createTestApp(): Express {
  const app = express();

  app.use(cors({ origin: true, credentials: true }));
  app.use(express.json());
  app.use(cookieParser());

  // Health check
  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // API маршруты
  app.use('/api/auth', authRoutes);
  app.use('/api/products', productsRoutes);

  return app;
}

describe('API Smoke Tests', () => {
  let app: Express;

  beforeAll(() => {
    app = createTestApp();
  });

  describe('Health Check', () => {
    it('должен вернуть статус OK на /health', async () => {
      const response = await request(app).get('/health');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'ok');
      expect(response.body).toHaveProperty('timestamp');
    });
  });

  describe('Products API', () => {
    it('должен вернуть список товаров на GET /api/products', async () => {
      const response = await request(app).get('/api/products');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('products');
      expect(response.body.products).toBeInstanceOf(Array);
      expect(response.body.products.length).toBeGreaterThan(0);
    });

    it('должен вернуть товар по ID на GET /api/products/:id', async () => {
      const response = await request(app).get('/api/products/1');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('product');
      expect(response.body.product).toHaveProperty('id', '1');
      expect(response.body.product).toHaveProperty('name');
      expect(response.body.product).toHaveProperty('price');
    });

    it('должен вернуть 404 для несуществующего товара', async () => {
      const response = await request(app).get('/api/products/nonexistent');

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'PRODUCT_NOT_FOUND');
    });

    it('товар должен содержать все обязательные поля', async () => {
      const response = await request(app).get('/api/products/1');
      const product = response.body.product;

      expect(product).toHaveProperty('id');
      expect(product).toHaveProperty('name');
      expect(product).toHaveProperty('description');
      expect(product).toHaveProperty('price');
      expect(product).toHaveProperty('category');
      expect(product).toHaveProperty('inStock');

      expect(typeof product.id).toBe('string');
      expect(typeof product.name).toBe('string');
      expect(typeof product.price).toBe('number');
      expect(typeof product.inStock).toBe('boolean');
    });
  });

  describe('Auth API', () => {
    it('должен вернуть ошибку при регистрации с пустыми данными', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('должен вернуть ошибку при входе с пустыми данными', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('должен вернуть ошибку для неавторизованного пользователя на /api/auth/me', async () => {
      const response = await request(app).get('/api/auth/me');

      // Без куки сессии возвращается 401 Unauthorized
      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });

    it('должен вернуть ошибку при выходе без сессии', async () => {
      const response = await request(app).post('/api/auth/logout');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message');
    });
  });

  describe('Регистрация и вход', () => {
    const testUser = {
      name: 'Тестовый Пользователь',
      email: `test${Date.now()}@example.com`,
      login: `testuser${Date.now()}`,
      phone: '+375291234567',
      password: 'TestPassword123!',
    };

    it('должен зарегистрировать нового пользователя', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send(testUser);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('email', testUser.email);
      expect(response.body.user).not.toHaveProperty('password');
    });

    it('должен вернуть ошибку при повторной регистрации с тем же email', async () => {
      // Первая регистрация
      await request(app).post('/api/auth/register').send(testUser);

      // Повторная регистрация
      const response = await request(app)
        .post('/api/auth/register')
        .send(testUser);

      // 409 Conflict - пользователь уже существует
      expect(response.status).toBe(409);
      expect(response.body).toHaveProperty('error');
    });

    it('должен войти с правильными credentials', async () => {
      // Сначала регистрируем
      const uniqueUser = {
        ...testUser,
        email: `login${Date.now()}@example.com`,
        login: `loginuser${Date.now()}`,
      };

      await request(app).post('/api/auth/register').send(uniqueUser);

      // Затем входим
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          login: uniqueUser.login,
          password: uniqueUser.password,
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('user');
      expect(response.headers['set-cookie']).toBeDefined();
    });

    it('должен вернуть ошибку при входе с неправильным паролем', async () => {
      const uniqueUser = {
        ...testUser,
        email: `wrongpass${Date.now()}@example.com`,
        login: `wrongpassuser${Date.now()}`,
      };

      await request(app).post('/api/auth/register').send(uniqueUser);

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          login: uniqueUser.login,
          password: 'WrongPassword123!',
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });
  });
});
