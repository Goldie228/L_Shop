/**
 * Точка входа в приложение L_Shop
 * Express сервер с авторизацией на основе сессий
 */

import express, { Express } from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import authRoutes from './routes/auth.routes';
import { errorHandler } from './middleware/error.middleware';
import { ensureDataFiles } from './utils/file.utils';
import { config } from './config/constants';

const app: Express = express();

// CORS с поддержкой credentials для передачи httpOnly cookies
app.use(
  cors({
    origin: config.frontendUrl,
    credentials: true,
  }),
);

app.use(express.json());
app.use(cookieParser());

// Health check для проверки работоспособности сервера
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv,
  });
});

// API маршруты
app.use('/api/auth', authRoutes);

// TODO: Подключить маршруты продуктов (Никита П.)
// TODO: Подключить маршруты корзины (Тимофей)
// TODO: Подключить маршруты заказов (Никита Т.)

// Обработчик ошибок должен быть последним middleware
app.use(errorHandler);

// Обработчик 404 для несуществующих маршрутов
app.use((_req, res) => {
  res.status(404).json({
    message: 'Not Found',
    error: 'ROUTE_NOT_FOUND',
  });
});

/**
 * Инициализирует файлы данных и запускает HTTP сервер
 */
async function startServer(): Promise<void> {
  try {
    await ensureDataFiles();
    // eslint-disable-next-line no-console
    console.log('[Server] Файлы данных инициализированы');

    const server = app.listen(config.port, () => {
      // eslint-disable-next-line no-console
      console.log(`[Server] Сервер запущен на http://localhost:${config.port}`);
      // eslint-disable-next-line no-console
      console.log(`[Server] Окружение: ${config.nodeEnv}`);
    });

    // Graceful shutdown позволяет завершить текущие запросы перед остановкой
    const gracefulShutdown = (signal: string): void => {
      // eslint-disable-next-line no-console
      console.log(`\n[Server] Получен сигнал ${signal}. Завершение работы...`);

      server.close(() => {
        // eslint-disable-next-line no-console
        console.log('[Server] HTTP-сервер закрыт');
        process.exit(0);
      });

      // Принудительное завершение через 10 секунд, если сервер не успел завершить запросы
      setTimeout(() => {
        console.error('[Server] Принудительное завершение после таймаута');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  } catch (error) {
    console.error('[Server] Ошибка запуска:', error);
    process.exit(1);
  }
}

startServer();
