/**
 * Утилиты для работы с файлами данных
 */

import fs from 'fs/promises';
import path from 'path';
import { config } from '../config/constants';

const DATA_DIR = config.dataDir;

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
          console.warn(`[FileUtils] Создан файл: ${file}`);
        }
      }),
    );
  } catch (error) {
    console.error('[FileUtils] Ошибка инициализации файлов:', error);
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
      console.warn(`[FileUtils] Файл ${filename} не содержит массив`);
      return [] as T[];
    }

    return parsed as T[];
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      console.warn(`[FileUtils] Файл ${filename} не найден`);
      return [] as T[];
    }

    console.error(`[FileUtils] Ошибка чтения ${filename}:`, error);
    throw new Error(`Ошибка чтения ${filename}`);
  }
}

/**
 * Записывает массив объектов в JSON-файл
 */
export async function writeJsonFile<T>(filename: string, data: T[]): Promise<void> {
  const filePath = path.join(DATA_DIR, filename);

  try {
    const jsonData = JSON.stringify(data, null, 2);
    await fs.writeFile(filePath, jsonData, 'utf-8');
  } catch (error) {
    console.error(`[FileUtils] Ошибка записи ${filename}:`, error);
    throw new Error(`Ошибка записи ${filename}`);
  }
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
