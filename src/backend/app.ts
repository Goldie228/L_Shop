import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import authRoutes from './routes/auth.routes';
import { errorHandler } from './middleware/error.middleware';
import { ensureDataFiles } from './utils/file.utils';
import { config } from './config/constants';

const app = express();

/**
 * Настройка CORS
 * Разрешает запросы только с URL фронтенда с поддержкой credentials (cookies)
 */
app.use(cors({
  origin: config.frontendUrl,
  credentials: true,
}));

/**
 * Парсинг JSON-тела запроса
 */
app.use(express.json());

/**
 * Парсинг cookies
 */
app.use(cookieParser());

/**
 * Эндпоинт для проверки работоспособности сервера
 */
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv,
  });
});

/**
 * API маршруты
 */
app.use('/api/auth', authRoutes);
// Здесь позже подключатся остальные модули

/**
 * Middleware обработки ошибок (должен быть последним)
 */
app.use(errorHandler);

/**
 * Общий обработчик 404 для несуществующих маршрутов
 */
app.use((_req, res) => {
  res.status(404).json({
    message: 'Not Found',
    error: 'ROUTE_NOT_FOUND',
  });
});

/**
 * Инициализация и запуск сервера
 */
async function startServer(): Promise<void> {
  try {
    // Инициализация файлов с данными
    await ensureDataFiles();
    // eslint-disable-next-line no-console
    console.log('Файлы данных инициализированы');

    // Запуск сервера
    const server = app.listen(config.port, () => {
      // eslint-disable-next-line no-console
      console.log(`Сервер запущен на http://localhost:${config.port}`);
      // eslint-disable-next-line no-console
      console.log(`Окружение: ${config.nodeEnv}`);
      // eslint-disable-next-line no-console
      console.log(`URL фронтенда: ${config.frontendUrl}`);
    });

    // Плавное завершение работы (graceful shutdown)
    const gracefulShutdown = (signal: string) => {
      // eslint-disable-next-line no-console
      console.log(`\nПолучен сигнал ${signal}. Плавное завершение работы...`);
      server.close(() => {
        // eslint-disable-next-line no-console
        console.log('HTTP-сервер закрыт.');
        process.exit(0);
      });

      // Принудительное завершение через 10 секунд
      setTimeout(() => {
        console.error('Forced shutdown after timeout');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
