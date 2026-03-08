/**
 * Утилиты для работы с файлами данных
 * Включает защиту от гонки данных через мьютекс и кэширование чтений
 */

import fs from 'fs/promises';
import path from 'path';
import { Mutex } from 'async-mutex';
import { config } from '../config/constants';
import { createContextLogger } from './logger';
import { BusinessError } from '../errors/business-error.base';

const logger = createContextLogger('FileUtils');
const DATA_DIR = config.dataDir;

/**
 * Мьютексы для каждого файла данных
 * Предотвращают гонку данных при параллельных операциях записи
 */
const fileMutexes = new Map<string, Mutex>();

/**
 * Кэш для хранения содержимого файлов
 * Ключ: путь к файлу
 * Значение: { data: unknown[], mtime: number, timestamp: number }
 * mtime - время последней модификации файла (из файловой системы)
 * timestamp - время добавления в кэш (для TTL)
 */
const fileCache = new Map<string, { data: unknown[]; mtime: number; timestamp: number }>();

/**
 * Время жизни кэша в миллисекундах (5 секунд)
 */
const CACHE_TTL = 5_000;

/**
 * Получить или создать мьютекс для файла
 */
function getMutex(filename: string): Mutex {
  if (!fileMutexes.has(filename)) {
    fileMutexes.set(filename, new Mutex());
  }
  const mutex = fileMutexes.get(filename);
  if (!mutex) {
    throw new Error(`Мьютекс для файла ${filename} не найден`);
  }
  return mutex;
}

/**
 * Проверить, актуален ли кэш для файла
 * Кэш актуален если:
 * - Файл есть в кэше
 * - Время жизни кэша не истекло
 * - Время модификации файла (mtime) совпадает с сохранённым
 */
async function isCacheValid(filename: string): Promise<boolean> {
  const cacheEntry = fileCache.get(filename);
  if (!cacheEntry) {
    return false;
  }

  // Проверяем TTL
  const now = Date.now();
  if (now - cacheEntry.timestamp > CACHE_TTL) {
    fileCache.delete(filename);
    return false;
  }

  // Проверяем mtime файла
  try {
    const filePath = path.join(DATA_DIR, filename);
    const stats = await fs.stat(filePath);
    if (stats.mtimeMs !== cacheEntry.mtime) {
      fileCache.delete(filename);
      return false;
    }
    return true;
  } catch {
    // Если файл не существует, кэш невалиден
    fileCache.delete(filename);
    return false;
  }
}

/**
 * Очистить кэш для конкретного файла или весь кэш
 */
export function clearCache(filename?: string): void {
  if (filename) {
    fileCache.delete(filename);
    logger.debug(`Кэш очищен для файла: ${filename}`);
  } else {
    fileCache.clear();
    logger.debug('Весь кэш очищен');
  }
}

/**
 * Создаёт директорию data и инициализирует JSON-файлы при первом запуске
 */
export async function ensureDataFiles(): Promise<void> {
  const files = ['users.json', 'products.json', 'carts.json', 'orders.json', 'sessions.json'];

  try {
    await fs.mkdir(DATA_DIR, { recursive: true });

    await Promise.all(
      files.map(async (file) => {
        const filePath = path.join(DATA_DIR, file);

        try {
          await fs.access(filePath);
        } catch {
          // Файл не существует — создаём пустой массив
          await fs.writeFile(filePath, JSON.stringify([], null, 2));
          logger.warn(`Создан файл: ${file}`);
        }
      }),
    );
  } catch (error) {
    logger.error({ error }, 'Ошибка инициализации файлов');
    throw new Error('Ошибка инициализации данных');
  }
}

/**
 * Читает JSON-файл и возвращает массив объектов
 * При отсутствии файла возвращает пустой массив
 * Использует кэширование для повышения производительности
 */
export async function readJsonFile<T>(filename: string): Promise<T[]> {
  const filePath = path.join(DATA_DIR, filename);

  try {
    // Проверяем кэш
    if (await isCacheValid(filename)) {
      const cacheEntry = fileCache.get(filename);
      if (!cacheEntry) {
        throw new Error(`Кэш не найден для файла: ${filename}`);
      }
      logger.debug(`Возвращено из кэша: ${filename}`);
      return cacheEntry.data as T[];
    }

    // Читаем файл
    const data = await fs.readFile(filePath, 'utf-8');

    if (!data.trim()) {
      return [] as T[];
    }

    const parsed: unknown = JSON.parse(data);

    if (!Array.isArray(parsed)) {
      logger.warn(`Файл ${filename} не содержит массив`);
      return [] as T[];
    }

    // Сохраняем в кэш с mtime
    const stats = await fs.stat(filePath);
    fileCache.set(filename, {
      data: parsed as unknown[],
      mtime: stats.mtimeMs,
      timestamp: Date.now(),
    });
    logger.debug(`Прочитано и закэшировано: ${filename}`);

    return parsed as T[];
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      logger.warn(`Файл ${filename} не найден`);
      return [] as T[];
    }

    logger.error({ error }, `Ошибка чтения ${filename}`);
    throw new Error(`Ошибка чтения ${filename}`);
  }
}

/**
 * Записывает массив объектов в JSON-файл
 * Использует мьютекс для предотвращения гонки данных
 * Инвалидирует кэш после записи
 */
export async function writeJsonFile<T>(filename: string, data: T[]): Promise<void> {
  const filePath = path.join(DATA_DIR, filename);
  const mutex = getMutex(filename);

  // Используем мьютекс для защиты от параллельной записи
  await mutex.runExclusive(async () => {
    try {
      const jsonData = JSON.stringify(data, null, 2);
      await fs.writeFile(filePath, jsonData, 'utf-8');

      // Инвалидируем кэш для этого файла
      fileCache.delete(filename);
      logger.debug(`Кэш инвалидирован после записи: ${filename}`);
    } catch (error) {
      logger.error({ error }, `Ошибка записи ${filename}`);
      throw new Error(`Ошибка записи ${filename}`);
    }
  });
}

/**
 * Выполняет атомарную операцию чтения-модификации-записи
 * Защищена мьютексом от гонки данных
 *
 * @param filename - Имя файла
 * @param modifier - Функция модификации данных
 * @returns Результат функции модификации
 */
export async function withMutex<T, R>(
  filename: string,
  modifier: (data: T[]) => Promise<R> | R,
): Promise<R> {
  const mutex = getMutex(filename);

  return mutex.runExclusive(async () => {
    const data = await readJsonFile<T>(filename);
    const result = await modifier(data);
    return result;
  });
}

/**
 * Выполняет атомарную операцию чтения-модификации-записи с автоматическим сохранением
 *
 * @param filename - Имя файла
 * @param modifier - Функция модификации данных (должна вернуть модифицированный массив)
 * @returns Модифицированные данные
 */
export async function modifyJsonFile<T>(
  filename: string,
  modifier: (data: T[]) => T[] | Promise<T[]>,
): Promise<T[]> {
  const mutex = getMutex(filename);

  return mutex.runExclusive(async () => {
    const data = await readJsonFile<T>(filename);
    const modified = await modifier(data);
    const filePath = path.join(DATA_DIR, filename);

    try {
      const jsonData = JSON.stringify(modified, null, 2);
      await fs.writeFile(filePath, jsonData, 'utf-8');

      // Инвалидируем кэш для этого файла
      fileCache.delete(filename);
      logger.debug(`Кэш инвалидирован после модификации: ${filename}`);

      return modified;
    } catch (error) {
      // Пробрасываем бизнес-ошибки без обёртки
      if (error instanceof BusinessError) {
        throw error;
      }
      logger.error({ error }, `Ошибка записи ${filename}`);
      throw new Error(`Ошибка записи ${filename}`);
    }
  });
}

/**
 * Проверяет существование файла
 */
export async function fileExists(filename: string): Promise<boolean> {
  const filePath = path.join(DATA_DIR, filename);

  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}
