import { BusinessError } from './business-error.base';

/**
 * Ошибка внешней зависимости
 * Сбой в стороннем сервисе или базе данных
 */
export class DependencyError extends BusinessError {
  code = 'DEPENDENCY_ERROR';

  /**
   * Создает ошибку внешней зависимости
   * @param message - Сообщение об ошибке
   * @param details - Дополнительные детали ошибки
   */
  constructor(message: string, details?: unknown) {
    super(message, 503, details);
  }
}
