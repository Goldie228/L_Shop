import fs from 'fs/promises';
import path from 'path';
import { config } from '../config/constants';

/**
 * Директория для хранения данных
 */
const DATA_DIR = config.dataDir;

/**
 * Тип для JSON-данных
 */
type JsonData = Record<string, unknown> | unknown[];

/**
 * Гарантирует существование папки data и всех необходимых JSON-файлов
 * Выполняется при старте сервера
 */
export async function ensureDataFiles(): Promise<void> {
  const files = [
    'users.json',
    'products.json',
    'carts.json',
    'orders.json',
    'sessions.json',
  ];

  try {
    // Создание директории
    await fs.mkdir(DATA_DIR, { recursive: true });

    // Инициализация каждого файла
    for (const file of files) {
      const filePath = path.join(DATA_DIR, file);

      try {
        await fs.access(filePath);
      } catch {
        // Файл не существует — создаём пустой массив
        await fs.writeFile(filePath, JSON.stringify([], null, 2));
        console.log(`Created: ${file}`);
      }
    }
  } catch (error) {
    console.error('Failed to initialize data files:', error);
    throw new Error('Data initialization failed');
  }
}

/**
 * Читает JSON-файл и возвращает массив объектов
 * @param filename — Имя файла (например, 'users.json')
 * @returns Массив объектов типа T
 * @throws Error если файл не найден или содержит невалидный JSON
 */
export async function readJsonFile<T>(filename: string): Promise<T[]> {
  const filePath = path.join(DATA_DIR, filename);

  try {
    const data = await fs.readFile(filePath, 'utf-8');

    if (!data.trim()) {
      // Пустой файл — возвращаем пустой массив
      return [] as T[];
    }

    const parsed: unknown = JSON.parse(data);

    if (!Array.isArray(parsed)) {
      console.warn(`File ${filename} does not contain an array, returning empty array`);
      return [] as T[];
    }

    return parsed as T[];
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      console.warn(`File ${filename} not found, returning empty array`);
      return [] as T[];
    }

    console.error(`Error reading ${filename}:`, error);
    throw new Error(`Failed to read ${filename}`);
  }
}

/**
 * Записывает массив объектов в JSON-файл
 * @param filename — Имя файла (например, 'users.json')
 * @param data — Массив объектов для записи
 * @throws Error если не удалось записать файл
 */
export async function writeJsonFile<T>(filename: string, data: T[]): Promise<void> {
  const filePath = path.join(DATA_DIR, filename);

  try {
    const jsonData = JSON.stringify(data, null, 2);
    await fs.writeFile(filePath, jsonData, 'utf-8');
  } catch (error) {
    console.error(`Error writing ${filename}:`, error);
    throw new Error(`Failed to write ${filename}`);
  }
}

/**
 * Проверяет существование файла
 * @param filename — Имя файла
 * @returns true если файл существует
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
