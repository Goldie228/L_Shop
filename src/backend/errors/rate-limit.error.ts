import { BusinessError } from './business-error.base';

/**
 * Ошибка превышения лимита запросов
 * Возвращается при превышении квот или частоты запросов
 * HTTP статус: 429 Too Many Requests
 */
export class RateLimitError extends BusinessError {
  code = 'RATE_LIMIT_ERROR';

  /**
   * Создает ошибку превышения лимита запросов
   * @param message - Сообщение об ошибке (по умолчанию "Превышен лимит запросов")
   * @param details - Дополнительные детали ошибки (например, информация о лимитах)
   */
  constructor(message = 'Превышен лимит запросов', details?: unknown) {
    super(message, 429, details);
  }
}
