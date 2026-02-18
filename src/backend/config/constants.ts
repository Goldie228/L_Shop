import dotenv from 'dotenv';
import path from 'path';

// Загружаем переменные окружения из файла .env
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

/**
 * Конфигурация приложения
 * Все значения берутся из переменных окружения с значениями по умолчанию
 */
export const config = {
  /** Порт сервера */
  port: parseInt(process.env.PORT || '3000', 10),

  /** Режим окружения (development, production) */
  nodeEnv: process.env.NODE_ENV || 'development',

  /** URL-адрес фронтенда для настройки CORS */
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:8080',

  /** Длительность сессии в минутах */
  sessionDurationMinutes: parseInt(process.env.SESSION_DURATION_MINUTES || '10', 10),

  /** Директория для хранения данных */
  dataDir: process.env.DATA_DIR || path.join(__dirname, '../data'),

  /** Длительность сессии в миллисекундах (вычисляемое значение) */
  get sessionDurationMs(): number {
    return this.sessionDurationMinutes * 60 * 1000;
  },

  /** Проверка, запущено ли приложение в продакшн-режиме */
  get isProduction(): boolean {
    return this.nodeEnv === 'production';
  },
} as const;
