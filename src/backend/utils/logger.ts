/**
 * Структурированный логгер на базе Pino
 * Разные уровни логирования для development и production
 * В production используется ротация файлов логов
 */

import pino from 'pino';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';
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
let loggerInstance: pino.Logger;

if (config.isProduction) {
  // В production используем простой файловый транспорт (временно без pino-roll)
  // TODO: добавить pino-roll после исправления типов
  const logFile = join(config.logsDir, 'lshop.log');
  if (!existsSync(config.logsDir)) {
    mkdirSync(config.logsDir, { recursive: true });
  }
  loggerConfig.transport = {
    target: 'pino/file',
    options: { destination: logFile },
  };
  loggerInstance = pino(loggerConfig);
} else {
  // В development используем pino-pretty для читаемого вывода в консоль
  loggerInstance = pino(loggerConfig);
}

export const logger = loggerInstance;

/**
 * Создать дочерний логгер с контекстом
 * @param context - Контекст (например, имя модуля)
 * @returns Дочерний логгер
 */
export function createContextLogger(context: string): pino.Logger {
  return logger.child({ context });
}

export default logger;
