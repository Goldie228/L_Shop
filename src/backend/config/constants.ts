/**
 * Конфигурация приложения
 * Значения берутся из переменных окружения с fallback на defaults
 */

import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const config = {
  port: parseInt(process.env.PORT || '3001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',

  // Длительность сессии в минутах (по умолчанию 10 минут)
  sessionDurationMinutes: parseInt(process.env.SESSION_DURATION_MINUTES || '10', 10),

  dataDir: process.env.DATA_DIR || path.join(__dirname, '../data'),

  // Вычисляемые значения
  get sessionDurationMs(): number {
    return this.sessionDurationMinutes * 60 * 1000;
  },

  get isProduction(): boolean {
    return this.nodeEnv === 'production';
  },
} as const;
