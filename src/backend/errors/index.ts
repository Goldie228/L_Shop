/**
 * Barrel export для всех классов ошибок
 * Обеспечивает обратную совместимость с существующим кодом
 */

// Базовый класс и интерфейс
export { BusinessError, IAppError } from './business-error.base';

// Конкретные классы ошибок
export { ValidationError } from './validation.error';
export { NotFoundError } from './not-found.error';
export { BusinessRuleError } from './business-rule.error';
export { AuthenticationError } from './authentication.error';
export { AuthorizationError } from './authorization.error';
export { ConflictError } from './conflict.error';
export { DependencyError } from './dependency.error';
export { SessionError } from './session.error';
export { CartError } from './cart.error';
export { OrderError } from './order.error';
export { RateLimitError } from './rate-limit.error';
