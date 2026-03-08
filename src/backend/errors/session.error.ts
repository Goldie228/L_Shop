import { BusinessError } from './business-error.base';

/**
 * Ошибка сессии
 * Сессия не найдена или истекла
 */
export class SessionError extends BusinessError {
  code = 'SESSION_ERROR';

  /**
   * Создает ошибку сессии
   * @param message - Сообщение об ошибке (по умолчанию "Ошибка сессии")
   * @param details - Дополнительные детали ошибки
   */
  constructor(message = 'Ошибка сессии', details?: unknown) {
    super(message, 400, details);
  }
}
