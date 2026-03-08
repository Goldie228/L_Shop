import { BusinessError } from './business-error.base';

/**
 * Ошибка валидации входных данных
 * Используется при невалидных параметрах запроса или теле запроса
 */
export class ValidationError extends BusinessError {
  code = 'VALIDATION_ERROR';

  /**
   * Создает ошибку валидации
   * @param message - Сообщение об ошибке валидации
   * @param details - Дополнительные детали ошибки (например, список полей)
   */
  constructor(message: string, details?: unknown) {
    super(message, 400, details);
  }
}
