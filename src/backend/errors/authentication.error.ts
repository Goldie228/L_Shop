import { BusinessError } from './business-error.base';

/**
 * Ошибка аутентификации
 * Неверные учетные данные или отсутствие токена
 */
export class AuthenticationError extends BusinessError {
  code = 'AUTHENTICATION_ERROR';

  /**
   * Создает ошибку аутентификации
   * @param message - Сообщение об ошибке (по умолчанию "Ошибка аутентификации")
   */
  constructor(message = 'Ошибка аутентификации') {
    super(message, 401);
  }
}
