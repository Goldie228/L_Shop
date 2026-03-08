import { BusinessError } from './business-error.base';

/**
 * Ошибка корзины
 * Проблемы с корзиной (пустая, товар недоступен и т.д.)
 */
export class CartError extends BusinessError {
  code = 'CART_ERROR';

  /**
   * Создает ошибку корзины
   * @param message - Сообщение об ошибке
   * @param details - Дополнительные детали ошибки
   */
  constructor(message: string, details?: unknown) {
    super(message, 400, details);
  }
}
