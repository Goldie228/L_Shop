import fs from 'fs/promises';
import path from 'path';

const DATA_DIR = path.join(__dirname, '../data');

// Гарантируем существование папки data и файлов при старте
export async function ensureDataFiles(): Promise<void> {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    const files = ['users.json', 'products.json', 'carts.json', 'orders.json', 'sessions.json'];
    for (const file of files) {
      const filePath = path.join(DATA_DIR, file);
      try {
        await fs.access(filePath);
      } catch {
        await fs.writeFile(filePath, JSON.stringify([]));
      }
    }
  } catch (err) {
    console.error('Failed to initialize data files:', err);
  }
}

export async function readJsonFile<T>(filename: string): Promise<T[]> {
  const filePath = path.join(DATA_DIR, filename);
  const data = await fs.readFile(filePath, 'utf-8');
  return JSON.parse(data) as T[];
}

export async function writeJsonFile<T>(filename: string, data: T[]): Promise<void> {
  const filePath = path.join(DATA_DIR, filename);
  await fs.writeFile(filePath, JSON.stringify(data, null, 2));
}
