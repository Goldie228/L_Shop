/**
 * Пользовательские классы ошибок для бизнес-логики L_Shop
 *
 * Используются для точной обработки ошибок в контроллерах и middleware.
 * Все классы наследуются от Error и реализуют интерфейс IAppError.
 */

/**
 * Интерфейс для всех прикладных ошибок
 */
export interface IAppError {
  /** Уникальный код ошибки */
  code: string;
  /** HTTP статус код */
  statusCode: number;
  /** Детали ошибки (опционально) */
  details?: unknown;
}

/**
 * Базовый класс для всех бизнес-ошибок
 */
export abstract class BusinessError extends Error implements IAppError {
  abstract code: string;

  statusCode: number;

  details?: unknown;

  constructor(message: string, statusCode = 500, details?: unknown) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.details = details;
    Error.captureStackTrace?.(this, this.constructor);
  }

  toJSON() {
    const result: { code: string; message: string; statusCode: number; details?: unknown } = {
      code: this.code,
      message: this.message,
      statusCode: this.statusCode,
    };
    if (this.details !== undefined && this.details !== null) {
      result.details = this.details;
    }
    return result;
  }
}
