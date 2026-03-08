import { BusinessError } from './business-error.base';

/**
 * Ошибка конфликта данных
 * Например, попытка создать заказ с уже существующим ID
 */
export class ConflictError extends BusinessError {
  code = 'CONFLICT_ERROR';

  /**
   * Создает ошибку конфликта данных
   * @param message - Сообщение об ошибке
   * @param details - Дополнительные детали ошибки
   */
  constructor(message: string, details?: unknown) {
    super(message, 409, details);
  }
}
