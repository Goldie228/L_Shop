import { BusinessError } from './business-error.base';

/**
 * Ошибка авторизации
 * Доступ запрещен (пользователь не имеет прав)
 */
export class AuthorizationError extends BusinessError {
  code = 'AUTHORIZATION_ERROR';

  /**
   * Создает ошибку авторизации
   * @param message - Сообщение об ошибке (по умолчанию "Доступ запрещен")
   */
  constructor(message = 'Доступ запрещен') {
    super(message, 403);
  }
}
