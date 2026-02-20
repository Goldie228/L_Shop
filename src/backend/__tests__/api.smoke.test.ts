/**
 * Smoke tests для API
 * Проверяет критические пути: авторизацию, health check
 */

import request from 'supertest';
import express, { Express } from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';

// Импортируем маршруты
import authRoutes from '../routes/auth.routes';

// Создаём тестовое приложение
function createTestApp(): Express {
  const app = express();

  app.use(cors({ origin: true, credentials: true }));
  app.use(express.json());
  app.use(cookieParser());

   // Проверка работоспособности
   app.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // API маршруты
  app.use('/api/auth', authRoutes);

  return app;
}

describe('Смоук-тесты API', () => {
  let app: Express;

  beforeAll(() => {
    app = createTestApp();
  });

  describe('Проверка работоспособности', () => {
    it('должен вернуть статус OK на /health', async () => {
      const response = await request(app).get('/health');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'ok');
      expect(response.body).toHaveProperty('timestamp');
    });
  });

  describe('API аутентификации', () => {
    it('должен вернуть ошибку при регистрации с пустыми данными', async () => {
      const response = await request(app).post('/api/auth/register').send({});

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('должен вернуть ошибку при входе с пустыми данными', async () => {
      const response = await request(app).post('/api/auth/login').send({});

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
      const response = await request(app).post('/api/auth/register').send(testUser);

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
      const response = await request(app).post('/api/auth/register').send(testUser);

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
      const response = await request(app).post('/api/auth/login').send({
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

      const response = await request(app).post('/api/auth/login').send({
        login: uniqueUser.login,
        password: 'WrongPassword123!',
      });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });
  });
});
