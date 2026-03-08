import { BusinessError } from './business-error.base';

/**
 * Ресурс не найден
 * Возвращается при отсутствии запрашиваемого объекта (заказ, товар и т.д.)
 */
export class NotFoundError extends BusinessError {
  code = 'NOT_FOUND_ERROR';

  /**
   * Создает ошибку "не найдено"
   * @param message - Сообщение об ошибке (по умолчанию "Ресурс не найден")
   * @param details - Дополнительные детали ошибки
   */
  constructor(message = 'Ресурс не найден', details?: unknown) {
    super(message, 404, details);
  }
}
