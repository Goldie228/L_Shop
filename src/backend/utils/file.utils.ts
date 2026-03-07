/**
 * Утилиты для работы с файлами данных
 * Включает защиту от гонки данных через мьютекс
 */

import fs from 'fs/promises';
import path from 'path';
import { Mutex } from 'async-mutex';
import { config } from '../config/constants';
import { createContextLogger } from './logger';

const logger = createContextLogger('FileUtils');
const DATA_DIR = config.dataDir;

/**
 * Мьютексы для каждого файла данных
 * Предотвращают гонку данных при параллельных операциях записи
 */
const fileMutexes = new Map<string, Mutex>();

/**
 * Получить или создать мьютекс для файла
 */
function getMutex(filename: string): Mutex {
  if (!fileMutexes.has(filename)) {
    fileMutexes.set(filename, new Mutex());
  }
  return fileMutexes.get(filename)!;
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
 */
export async function readJsonFile<T>(filename: string): Promise<T[]> {
  const filePath = path.join(DATA_DIR, filename);

  try {
    const data = await fs.readFile(filePath, 'utf-8');

    if (!data.trim()) {
      return [] as T[];
    }

    const parsed: unknown = JSON.parse(data);

    if (!Array.isArray(parsed)) {
      logger.warn(`Файл ${filename} не содержит массив`);
      return [] as T[];
    }

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
 */
export async function writeJsonFile<T>(filename: string, data: T[]): Promise<void> {
  const filePath = path.join(DATA_DIR, filename);
  const mutex = getMutex(filename);

  // Используем мьютекс для защиты от параллельной записи
  await mutex.runExclusive(async () => {
    try {
      const jsonData = JSON.stringify(data, null, 2);
      await fs.writeFile(filePath, jsonData, 'utf-8');
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
      return modified;
    } catch (error) {
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
