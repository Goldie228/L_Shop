/**
 * Структурированный логгер на базе Pino
 * Разные уровни логирования для development и production
 */

import pino from 'pino';
import { config } from '../config/constants';

/**
 * Конфигурация логгера
 */
const loggerConfig: pino.LoggerOptions = {
  level: config.isProduction ? 'info' : 'debug',
  // В development используем pino-pretty для читаемого вывода
  transport: config.isProduction
    ? undefined
    : {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:standard',
          ignore: 'pid,hostname',
        },
      },
  // Базовые поля для всех логов
  base: {
    env: config.nodeEnv,
  },
  // Формат времени ISO 8601
  timestamp: pino.stdTimeFunctions.isoTime,
  // Форматирование ошибок
  formatters: {
    level: (label) => ({ level: label }),
  },
};

/**
 * Экземпляр логгера
 */
export const logger = pino(loggerConfig);

/**
 * Создать дочерний логгер с контекстом
 * @param context - Контекст (например, имя модуля)
 * @returns Дочерний логгер
 */
export function createContextLogger(context: string): pino.Logger {
  return logger.child({ context });
}

export default logger;
