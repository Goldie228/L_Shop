/**
 * Точка входа в приложение L_Shop
 * Express сервер с авторизацией на основе сессий
 */

import express, { Express } from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import authRoutes from './routes/auth.routes';
import cartRoutes from './routes/cart.routes';
import orderRoutes from './routes/order.routes';
import productRoutes from './routes/product.routes';
import adminRoutes from './routes/admin.routes';
import { errorHandler } from './middleware/error.middleware';
import { ensureDataFiles } from './utils/file.utils';
import { config } from './config/constants';
import { createContextLogger } from './utils/logger';

const logger = createContextLogger('Server');
const app: Express = express();

/**
 * Настройка безопасности HTTP-заголовков через Helmet
 */
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'https:'],
        connectSrc: ["'self'"],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"],
      },
    },
    crossOriginEmbedderPolicy: true,
    crossOriginOpenerPolicy: true,
    crossOriginResourcePolicy: { policy: 'same-origin' },
    dnsPrefetchControl: { allow: false },
    frameguard: { action: 'deny' },
    hidePoweredBy: true,
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
    ieNoOpen: true,
    noSniff: true,
    originAgentCluster: true,
    permittedCrossDomainPolicies: { permittedPolicies: 'none' },
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    xssFilter: true,
  }),
);

/**
 * Rate limiter для auth endpoints
 * Защита от брутфорса паролей
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 минут
  max: 10, // 10 попыток с одного IP
  message: {
    message: 'Слишком много попыток входа. Попробуйте позже.',
    error: 'RATE_LIMITED',
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn({ ip: req.ip, path: req.path }, 'Rate limit exceeded');
    res.status(429).json({
      message: 'Слишком много попыток входа. Попробуйте позже.',
      error: 'RATE_LIMITED',
    });
  },
});

/**
 * Общий rate limiter для API
 */
const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 минута
  max: 100, // 100 запросов с одного IP в минуту
  message: {
    message: 'Слишком много запросов. Попробуйте позже.',
    error: 'RATE_LIMITED',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Проверяет, разрешён ли origin для CORS запросов.
 * В development режиме разрешает все localhost origins.
 * В production режиме использует строгую проверку по whitelist.
 *
 * @param origin - Заголовок Origin из запроса
 * @param callback - Callback для возврата результата
 */
function corsOriginValidator(
  origin: string | undefined,
  callback: (err: Error | null, allow?: boolean) => void,
): void {
  // Debug логирование для диагностики CORS (только в development)
  if (!config.isProduction) {
    logger.debug({ origin, frontendUrl: config.frontendUrl }, 'CORS request');
  }

  // Разрешаем запросы без origin (например, от Postman, мобильных приложений)
  if (!origin) {
    callback(null, true);
    return;
  }

  // В production режиме используем строгую проверку
  if (config.isProduction) {
    const allowedOrigins = [config.frontendUrl];
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      logger.warn({ origin }, 'CORS blocked: origin not in whitelist');
      callback(new Error('Not allowed by CORS'), false);
    }
    return;
  }

  // В development режиме разрешаем любой localhost origin
  const localhostRegex = /^http:\/\/localhost(:\d+)?$/;
  if (localhostRegex.test(origin)) {
    callback(null, true);
  } else {
    logger.warn({ origin }, 'CORS blocked: not localhost');
    callback(new Error('Not allowed by CORS'), false);
  }
}

// CORS с поддержкой credentials для передачи httpOnly cookies
app.use(
  cors({
    origin: corsOriginValidator,
    credentials: true,
  }),
);

// Применяем общий rate limiter ко всем API маршрутам
app.use('/api', apiLimiter);

app.use(express.json({ limit: '10kb' })); // Ограничение размера JSON body
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
app.use('/api/auth', authLimiter, authRoutes); // Auth с дополнительным rate limiter
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/products', productRoutes);
app.use('/api/admin', adminRoutes);

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
    logger.info('Файлы данных инициализированы');

    const server = app.listen(config.port, () => {
      logger.info({ port: config.port, env: config.nodeEnv }, 'Сервер запущен');
    });

    // Graceful shutdown позволяет завершить текущие запросы перед остановкой
    const gracefulShutdown = (signal: string): void => {
      logger.info({ signal }, 'Получен сигнал завершения');

      server.close(() => {
        logger.info('HTTP-сервер закрыт');
        process.exit(0);
      });

      // Принудительное завершение через 10 секунд, если сервер не успел завершить запросы
      setTimeout(() => {
        logger.error('Принудительное завершение после таймаута');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  } catch (error) {
    logger.error({ error }, 'Ошибка запуска сервера');
    process.exit(1);
  }
}

startServer();
