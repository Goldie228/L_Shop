/**
 * Утилиты для выполнения миграций
 * Предоставляют общую логику для чтения, преобразования и записи данных
 */

import { readJsonFile, writeJsonFile } from '../utils/file.utils';
import { createContextLogger } from '../utils/logger';

const logger = createContextLogger('MigrationUtils');

/**
 * Параметры для выполнения миграции
 */
export interface MigrationParams<T> {
  /** Имя файла для миграции (например, 'products.json') */
  filename: string;
  /** Логическое имя для логов (например, 'продуктов') */
  entityName: string;
  /** Функция трансформации данных */
  transformer: (items: T[]) => Promise<T[]> | T[];
  /** Дополнительные логические имена для вложенных сущностей (например, ['элементов заказов']) */
  subEntityNames?: string[];
}

/**
 * Результат выполнения миграции
 */
export interface MigrationResult {
  /** Общее количество обработанных записей */
  totalCount: number;
  /** Количество обновлённых записей по каждому имени сущности */
  updatedCounts: Record<string, number>;
  /** Количество пропущенных записей (уже актуальные) */
  skippedCounts: Record<string, number>;
}

/**
 * Выполнить миграцию с общей логикой
 * Автоматически обрабатывает:
 * - Чтение файла
 * - Трансформацию данных
 * - Запись результата
 * - Логирование
 */
export async function runMigration<T>(params: MigrationParams<T>): Promise<MigrationResult> {
  const { filename, entityName, transformer } = params;

  logger.info(`Начало миграции ${entityName}...`);

  try {
    const data = await readJsonFile<T>(filename);

    if (!Array.isArray(data) || data.length === 0) {
      logger.info(`${entityName} нет для миграции`);
      return {
        totalCount: 0,
        updatedCounts: { [entityName]: 0 },
        skippedCounts: { [entityName]: 0 },
      };
    }

    logger.info(`Найдено ${data.length} ${entityName} для миграции`);

    // Выполняем трансформацию
    const result = await transformer(data);

    // Подсчитываем изменения (трансформер должен возвращать новый массив)
    // Для простоты предполагаем, что если массив изменился, то все записи обновлены
    // В более сложных случаях трансформер может возвращать объект с метаданными
    const isChanged = result !== data;
    const updatedCount = isChanged ? data.length : 0;
    const skippedCount = isChanged ? 0 : data.length;

    if (isChanged) {
      await writeJsonFile(filename, result);
      logger.info(`Обновлено ${updatedCount} ${entityName}`);
    } else {
      logger.info(`Все ${entityName} уже актуальны`);
    }

    return {
      totalCount: data.length,
      updatedCounts: { [entityName]: updatedCount },
      skippedCounts: { [entityName]: skippedCount },
    };
  } catch (error) {
    logger.error({ error }, `Ошибка выполнения миграции ${entityName}`);
    throw error;
  }
}

/**
 * Выполнить миграцию с поддержкой вложенных сущностей
 * Полезно для миграции сложных структур (например, заказы с элементами)
 */
export async function runComplexMigration<T>(
  params: MigrationParams<T> & {
    /** Функция для подсчёта изменений в подсущностях */
    countUpdater?: (
      original: T[],
      transformed: T[],
    ) => Record<string, { updated: number; skipped: number }>;
  },
): Promise<MigrationResult> {
  const { filename, entityName, transformer, countUpdater } = params;

  logger.info(`Начало сложной миграции ${entityName}...`);

  try {
    const data = await readJsonFile<T>(filename);

    if (!Array.isArray(data) || data.length === 0) {
      logger.info(`${entityName} нет для миграции`);
      return {
        totalCount: 0,
        updatedCounts: {},
        skippedCounts: {},
      };
    }

    logger.info(`Найдено ${data.length} ${entityName} для миграции`);

    // Выполняем трансформацию
    const result = await transformer(data);

    // Подсчитываем изменения
    let updatedCounts: Record<string, number> = { [entityName]: 0 };
    let skippedCounts: Record<string, number> = { [entityName]: 0 };

    if (countUpdater) {
      const counts = countUpdater(data, result);
      for (const [key, count] of Object.entries(counts)) {
        updatedCounts[key] = count.updated;
        skippedCounts[key] = count.skipped;
      }
    } else {
      // Простой случай: весь массив обновился
      const isChanged = result !== data;
      if (isChanged) {
        updatedCounts[entityName] = data.length;
      } else {
        skippedCounts[entityName] = data.length;
      }
    }

    const totalUpdated = Object.values(updatedCounts).reduce((sum, count) => sum + count, 0);

    if (totalUpdated > 0) {
      await writeJsonFile(filename, result);
      for (const [entity, count] of Object.entries(updatedCounts)) {
        if (count > 0) {
          logger.info(`Обновлено ${count} ${entity}`);
        }
      }
    } else {
      logger.info(`Все ${entityName} и подсущности уже актуальны`);
    }

    return {
      totalCount: data.length,
      updatedCounts,
      skippedCounts,
    };
  } catch (error) {
    logger.error({ error }, `Ошибка выполнения сложной миграции ${entityName}`);
    throw error;
  }
}
