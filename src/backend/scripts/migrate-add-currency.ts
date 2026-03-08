/**
 * Миграция: Добавление поля currency в продукты и заказы
 * Запуск: npm run migrate
 *
 * Идемпотентная миграция - можно запускать многократно
 * - Добавляет currency: "BYN" во все продукты, если поле отсутствует
 * - Добавляет currency: "BYN" во все заказы, если поле отсутствует
 * - Добавляет currency: "BYN" во все элементы заказов, если поле отсутствует
 */

import { Product } from '../models/product.model';
import { Order } from '../models/order.model';
import { createContextLogger } from '../utils/logger';
import { runMigration, runComplexMigration } from './migration-utils';

const logger = createContextLogger('MigrateCurrency');

async function migrateProducts(): Promise<void> {
  await runMigration<Product>({
    filename: 'products.json',
    entityName: 'продуктов',
    transformer: (products) =>
      products.map((product) =>
        product.currency ? product : { ...product, currency: 'BYN' as const },
      ),
  });
}

async function migrateOrders(): Promise<void> {
  await runComplexMigration<Order>({
    filename: 'orders.json',
    entityName: 'заказов',
    subEntityNames: ['элементов заказов'],
    transformer: (orders) =>
      orders.map((order) => {
        const orderNeedsUpdate = !order.currency;
        const updatedOrder = orderNeedsUpdate ? { ...order, currency: 'BYN' as const } : order;

        const itemsNeedsUpdate = order.items.some((item) => !item.currency);
        if (!orderNeedsUpdate && !itemsNeedsUpdate) {
          return updatedOrder;
        }

        const migratedItems = order.items.map((item) =>
          item.currency ? item : { ...item, currency: 'BYN' as const },
        );

        return {
          ...updatedOrder,
          items: migratedItems,
        };
      }),
    countUpdater: (original, transformed) => {
      const ordersUpdated = transformed.filter((_order, i) => !original[i].currency).length;
      const itemsUpdated = transformed.reduce((sum, order, index) => {
        const originalItems = original[index].items;
        return sum + order.items.filter((_item, j) => !originalItems[j].currency).length;
      }, 0);
      return {
        заказов: { updated: ordersUpdated, skipped: original.length - ordersUpdated },
        'элементов заказов': { updated: itemsUpdated, skipped: 0 },
      };
    },
  });
}

async function migrate(): Promise<void> {
  logger.info('=== Начало миграции currency ===');

  try {
    await migrateProducts();
    await migrateOrders();

    logger.info('=== Миграция currency завершена успешно ===');
  } catch (error) {
    logger.error({ error }, 'Ошибка выполнения миграции');
    throw error;
  }
}

migrate().catch((error) => {
  logger.error({ error }, 'Критическая ошибка миграции');
  process.exit(1);
});
