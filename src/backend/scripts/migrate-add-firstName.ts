/**
 * Миграция: Добавление поля firstName в существующие заказы
 *
 * Этот скрипт добавляет обязательное поле `firstName` во все существующие заказы.
 * Для заказов без firstName значение устанавливается на основе email или как "Неизвестно".
 *
 * Запуск: npm run seed (или npx tsx src/backend/scripts/migrate-add-firstName.ts)
 */

import path from 'path';
import { config } from '../config/constants';
import { createContextLogger } from '../utils/logger';
import { runMigration } from './migration-utils';
import { Order } from '../models/order.model';

const logger = createContextLogger('MigrateFirstName');

/**
 * Извлекает имя из email или возвращает значение по умолчанию
 */
function extractFirstName(email: string): string {
  // Пытаемся извлечь имя из email (часть до @)
  const emailPart = email.split('@')[0];
  if (emailPart) {
    // Убираем цифры и заменяем точки/подчеркивания на пробелы
    const name = emailPart.replace(/[0-9]/g, '').replace(/[._]/g, ' ');
    // Берем первое слово
    const firstName = name.trim().split(' ')[0];
    if (firstName && firstName.length > 0) {
      return firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase();
    }
  }
  return 'Неизвестно';
}

/**
 * Основная функция миграции
 */
async function migrate(): Promise<void> {
  try {
    logger.info('Запуск миграции: добавление firstName в заказы...');
    logger.info(`Директория данных: ${config.dataDir}`);

    await runMigration<Order>({
      filename: 'orders.json',
      entityName: 'заказов',
      transformer: (orders): Order[] => {
        let migratedCount = 0;
        let skippedCount = 0;

        const result = orders.map((order): Order => {
          // Проверяем, есть ли уже firstName (может быть undefined в данных)
          if (order.firstName === undefined || order.firstName.trim() === '') {
            migratedCount++;
            const email = order.email;

            if (typeof email !== 'string' || !email.trim()) {
              return { ...order, firstName: 'Неизвестно' };
            }

            return { ...order, firstName: extractFirstName(email) };
          }

          skippedCount++;
          return order;
        });

        // Логируем детали после трансформации
        result.forEach((order) => {
          if (order.id) {
            logger.debug(`Заказ ${order.id}: firstName = "${order.firstName}"`);
          }
        });

        logger.info(`Обработано: ${orders.length} заказов`);
        logger.info(`Обновлено: ${migratedCount} заказов`);
        logger.info(`Пропущено: ${skippedCount} заказов`);

        return result;
      },
    });

    logger.info(`Файл обновлен: ${path.join(config.dataDir, 'orders.json')}`);
    logger.info('Миграция firstName завершена успешно');
  } catch (error) {
    logger.error({ error }, 'Ошибка при выполнении миграции');
    throw error;
  }
}

// Запуск миграции
migrate().catch((error) => {
  logger.error({ error }, 'Критическая ошибка запуска миграции');
  process.exit(1);
});
