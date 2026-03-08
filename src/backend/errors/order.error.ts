import { BusinessError } from './business-error.base';

/**
 * Ошибка заказа
 * Проблемы при создании или обработке заказа
 */
export class OrderError extends BusinessError {
  code = 'ORDER_ERROR';

  /**
   * Создает ошибку заказа
   * @param message - Сообщение об ошибке
   * @param details - Дополнительные детали ошибки
   */
  constructor(message: string, details?: unknown) {
    super(message, 400, details);
  }
}
