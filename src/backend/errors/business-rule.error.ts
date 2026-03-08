import { BusinessError } from './business-error.base';

/**
 * Ошибка бизнес-правила
 * Нарушение доменной логики (например, недостаточно товара на складе)
 */
export class BusinessRuleError extends BusinessError {
  code = 'BUSINESS_RULE_ERROR';

  /**
   * Создает ошибку бизнес-правила
   * @param message - Сообщение об ошибке
   * @param details - Дополнительные детали ошибки
   */
  constructor(message: string, details?: unknown) {
    super(message, 409, details);
  }
}
