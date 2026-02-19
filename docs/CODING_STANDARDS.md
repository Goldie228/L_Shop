# Стандарты оформления кода L_Shop

## Содержание

1. [Общие принципы](#общие-принципы)
2. [TypeScript соглашения](#typescript-соглашения)
3. [Именование](#именование)
4. [Форматирование кода](#форматирование-кода)
5. [Комментарии](#комментарии)
6. [Работа с ошибками](#работа-с-ошибками)
7. [Тестирование](#тестирование)
8. [Git коммиты](#git-коммиты)
9. [Code review чеклист](#code-review-чеклист)

---

## Общие принципы

### DRY (Don't Repeat Yourself)

Не повторяйте код. Если логика используется более 2 раз - выделите в функцию.

```typescript
// ПЛОХО
function validateEmail(email: string): boolean {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

function validateUserEmail(email: string): boolean {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

// ХОРОШО
function validateEmail(email: string): boolean {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}
```

### KISS (Keep It Simple, Stupid)

Держите код простым. Не усложняйте там, где это не нужно.

```typescript
// ПЛОХО
const getUserName = (user: User): string => {
  return user && user.name ? user.name : 'Unknown';
};

// ХОРОШО
const getUserName = (user: User): string => user?.name ?? 'Unknown';
```

### SOLID

Принципы SOLID для чистой архитектуры:

| Принцип | Описание |
|---------|----------|
| **S**ingle Responsibility | Один класс/функция - одна ответственность |
| **O**pen/Closed | Открыт для расширения, закрыт для изменения |
| **L**iskov Substitution | Подтипы должны заменять базовые типы |
| **I**nterface Segregation | Много специализированных интерфейсов лучше одного общего |
| **D**ependency Inversion | Зависимость от абстракций, не от конкретных классов |

---

## TypeScript соглашения

### Типизация

Всегда указывайте типы для функций и переменных.

```typescript
// ПЛОХО
function getUser(id) {
  return users.find(u => u.id === id);
}

// ХОРОШО
function getUser(id: string): User | undefined {
  return users.find((u: User) => u.id === id);
}
```

### Запрет any

Использование `any` запрещено. Используйте конкретные типы или `unknown`.

```typescript
// ПЛОХО
function processData(data: any): void {
  console.log(data.value);
}

// ХОРОШО
interface ProcessData {
  value: string;
}

function processData(data: ProcessData): void {
  console.log(data.value);
}

// Если тип неизвестен
function processUnknown(data: unknown): void {
  if (typeof data === 'object' && data !== null && 'value' in data) {
    console.log((data as { value: string }).value);
  }
}
```

### Interface и Type

Используйте `interface` для объектов и `type` для объединений/примитивов.

```typescript
// Interface для объектов
interface User {
  id: string;
  name: string;
  email: string;
}

// Type для объединений
type Status = 'pending' | 'completed' | 'cancelled';

// Type для применения utility
type ReadonlyUser = Readonly<User>;
```

### Возвращаемые значения

Всегда указывайте возвращаемый тип функции.

```typescript
// ПЛОХО
function calculateTotal(items) {
  return items.reduce((sum, item) => sum + item.price, 0);
}

// ХОРОШО
function calculateTotal(items: CartItem[]): number {
  return items.reduce((sum: number, item: CartItem) => sum + item.price, 0);
}
```

### Null и Undefined

Используйте `strictNullChecks`. Явно обрабатывайте `null` и `undefined`.

```typescript
// Используйте optional chaining
const userName = user?.name;

// Используйте nullish coalescing
const displayName = userName ?? 'Guest';

// Явная проверка
if (user !== null && user !== undefined) {
  // ...
}
```

---

## Именование

### Переменные

Используйте camelCase. Имена должны быть осмысленными.

```typescript
// ПЛОХО
const d = new Date();
const u = getUser(id);
const flag = true;

// ХОРОШО
const currentDate = new Date();
const foundUser = getUser(id);
const isAuthenticated = true;
```

### Функции

Используйте camelCase. Имена функций должны начинаться с глагола.

```typescript
// ПЛОХО
function user() { }
function data() { }

// ХОРОШО
function getUser() { }
function fetchData() { }
function calculateTotal() { }
function validateEmail() { }
```

### Классы и Интерфейсы

Используйте PascalCase.

```typescript
// Классы
class UserService { }
class AuthMiddleware { }

// Интерфейсы (без префикса I)
interface User { }
interface CartItem { }
```

### Константы

Используйте UPPER_SNAKE_CASE для глобальных констант.

```typescript
// Глобальные константы
const SESSION_DURATION_MINUTES = 10;
const MAX_CART_ITEMS = 100;
const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  NOT_FOUND: 404,
  INTERNAL_ERROR: 500,
} as const;

// Локальные константы - camelCase
const maxRetries = 3;
const defaultTimeout = 5000;
```

### Файлы

Используйте kebab-case для имен файлов.

```
// ПЛОХО
UserService.ts
authMiddleware.ts
auth-request.ts

// ХОРОШО
user.service.ts
auth.middleware.ts
auth-request.ts
```

### Переменные окружения

Используйте UPPER_SNAKE_CASE.

```env
DATABASE_URL=http://localhost:5432
API_KEY=secret123
NODE_ENV=development
```

---

## Форматирование кода

### Отступы

Используйте 2 пробела для отступов.

```typescript
// ПЛОХО (4 пробела)
function example() {
    const x = 1;
    if (x > 0) {
        return x;
    }
}

// ХОРОШО (2 пробела)
function example() {
  const x = 1;
  if (x > 0) {
    return x;
  }
}
```

### Скобки

Открывающая скобка на той же строке.

```typescript
// ПЛОХО
if (condition)
{
  // ...
}

// ХОРОШО
if (condition) {
  // ...
}
```

### Строки

Максимальная длина строки - 100 символов.

```typescript
// ПЛОХО
const veryLongVariableName = someFunctionWithLongName(param1, param2, param3, param4, param5);

// ХОРОШО
const veryLongVariableName = someFunctionWithLongName(
  param1,
  param2,
  param3,
  param4,
  param5,
);
```

### Переносы строк

- Пустая строка между функциями
- Пустая строка перед `return`
- Группировка связанного кода

```typescript
function getUser(id: string): User | undefined {
  const users = readUsersFromFile();
  const user = users.find(u => u.id === id);

  return user;
}

function createUser(data: CreateUserData): User {
  const id = generateId();
  const hashedPassword = hashPassword(data.password);

  const user: User = {
    id,
    name: data.name,
    email: data.email,
    password: hashedPassword,
    createdAt: new Date().toISOString(),
  };

  saveUser(user);

  return user;
}
```

### Импорты

Группируйте импорты:
1. Внешние модули
2. Внутренние модули
3. Типы

```typescript
// Внешние модули
import express, { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';

// Внутренние модули
import { User } from '../models/user.model';
import { createUser, findUserByEmail } from '../services/user.service';

// Типы
import type { AuthRequest } from '../middleware/auth-request';
```

### Кавычки

Используйте одинарные кавычки для строк.

```typescript
// ПЛОХО
const message = "Hello, World!";

// ХОРОШО
const message = 'Hello, World!';

// Исключение: строки с вставками
const greeting = `Hello, ${name}!`;
```

### Точка с запятой

Не ставьте точку с запятой в конце строк (если используется Prettier).

```typescript
// ПЛОХО
const x = 1;
const y = 2;

// ХОРОШО (Prettier автоматически добавляет)
const x = 1
const y = 2
```

---

## Комментарии

### JSDoc для функций

Все публичные функции должны иметь JSDoc комментарий.

```typescript
/**
 * Создает нового пользователя в системе.
 * 
 * @param data - Данные для создания пользователя
 * @returns Созданный пользователь
 * @throws {Error} Если пользователь с таким email уже существует
 * 
 * @example
 * ```typescript
 * const user = createUser({
 *   name: 'Иван',
 *   email: 'ivan@example.com',
 *   password: 'secret123'
 * });
 * ```
 */
function createUser(data: CreateUserData): User {
  // ...
}
```

### Русские комментарии

Все комментарии в коде должны быть на русском языке.

```typescript
// ПЛОХО
// Check if user exists
if (!user) {
  return null;
}

// ХОРОШО
// Проверяем существование пользователя
if (!user) {
  return null;
}
```

### Комментарии для сложной логики

```typescript
// Хешируем пароль перед сохранением в базу
// Используем bcrypt с 10 раундами соли
const hashedPassword = await bcrypt.hash(password, 10);

// Фильтруем товары по категории и цене
// Сортируем по возрастанию цены
const filteredProducts = products
  .filter(p => p.category === category)
  .filter(p => p.price >= minPrice && p.price <= maxPrice)
  .sort((a, b) => a.price - b.price);
```

### TODO комментарии

```typescript
// TODO: Добавить валидацию телефона
// FIXME: Использовать транзакции при создании заказа
// HACK: Временное решение, переписать при возможности
```

### Хорошие комментарии (использовать)

#### 1. Юридические комментарии

Заявления о правах в начале файлов, ссылки на лицензии.

```typescript
/*
 * Copyright (c) 2026 L_Shop
 * Licensed under the MIT License
 * See LICENSE file for details
 */
```

#### 2. Информативные комментарии

Пояснения к сложным частям кода, особенно к регулярным выражениям.

```typescript
// Format daty: DD.MM.YYYY HH:mm
const dateRegex = /^(\d{2})\.(\d{2})\.(\d{4})\s(\d{2}):(\d{2})$/;

// URL validation: protocol + domain + optional path
const urlRegex = /^(https?:\/\/)?([\w-]+\.)+[\w-]+(\/[\w-./?%&=]*)?$/;
```

#### 3. Комментарии с пояснением намерений

Объяснение бизнес-логики и причин неочевидных решений.

```typescript
// Используем 10 раундов соли для баланса между безопасностью и производительностью
// См. https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html
const SALT_ROUNDS = 10;

// Session istekaet cherez 10 minut neaktivnosti v sootvetstvii s trebovanijami bezopasnosti
const SESSION_DURATION_MINUTES = 10;
```

#### 4. TODO комментарии

Пометки на будущее для рефакторинга или нереализованной функциональности.

```typescript
// TODO: Perenesti v konfiguraciju pri migracii na .env
// FIXME: Dobavit' obrabotku krajnih sluchaev
// TODO(auth): Implement password reset functionality
```

#### 5. JSDoc в публичных API

Документация методов и классов для автогенерации документации.

```typescript
/**
 * Sozdaet novuju sessiju dlja pol'zovatelja.
 * 
 * @param userId - ID pol'zovatelja
 * @param userAgent - User-Agent browsera
 * @returns Sozdannaja sessija s tokenom
 * @throws {Error} Esli pol'zovatel' ne najden
 * 
 * @example
 * ```typescript
 * const session = await createSession('user-123', 'Mozilla/5.0...');
 * console.log(session.token);
 * ```
 */
export async function createSession(
  userId: string,
  userAgent: string,
): Promise<Session> {
  // ...
}
```

#### 6. Комментарии усиления

Подчёркивание важности неочевидных обстоятельств.

```typescript
// VAZHNO: Ne izmenjat' porjadok proverok!
// Snachala proverjaem prava, potom sushhestvovanie resursa
// Inache vozmozhna utechka informacii o sushhestvovanii ob'ektov

// VNIMANIE: Eto kritichno dlja bezopasnosti!
// Pri izmenenii etoj logiki objazatel'no provesti security review
```

#### 7. Предупреждения о последствиях

Предупреждения о возможных проблемах при изменениях.

```typescript
// OSTOROZHNO: Izmenenie etoj funkcii povlijaet na vse moduli avtorizacii
// Pered izmeneniem proverit' zavisimosti: auth.middleware.ts, session.service.ts

// WARNING: Ehtot kod vyzyvaetsja v neskol'kih potokah
// Izbegajte izmenenija global'nogo sostojanija
```

### Плохие комментарии (избегать)

#### 1. Бормотание и шум

Непонятные комментарии, шутки, возмущения.

```typescript
// ПЛОХО
// Это просто ужасный код, но мне лень его переписывать
// TODO: как-нибудь разберусь
// Magic happens here :)

// ХОРОШО - просто удалить такие комментарии
```

#### 2. Избыточные комментарии

Дублирование того, что очевидно из кода.

```typescript
// ПЛОХО
// Получаем пользователя по ID
function getUserById(id: string) {
  return users.find(u => u.id === id); // Ищем пользователя
}

// ХОРОШО
function getUserById(id: string) {
  return users.find(u => u.id === id);
}
```

#### 3. Журнальные комментарии

Указание авторов и задач (есть Git для этого).

```typescript
// ПЛОХО
// Added by Ivan 19 февраля 2026 года
// Fixed bug #123 - John 19 февраля 2026 года
// Refactored - Mike 19 февраля 2026 года

// ХОРОШО - используйте git blame и git history
```

#### 4. Закомментированный код

Старый код должен удаляться, а не комментироваться.

```typescript
// ПЛОХО
function calculateTotal(items: CartItem[]): number {
  // const oldWay = items.reduce((sum, item) => sum + item.price, 0);
  // console.log('debug:', oldWay);
  // if (oldWay > 1000) {
  //   return oldWay * 0.9;
  // }
  return items.reduce((sum, item) => sum + item.total, 0);
}

// ХОРОШО - просто удалить старый код (он есть в Git)
function calculateTotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.total, 0);
}
```

#### 5. Позиционные маркеры

Разделители блоков (лучше вынести в метод).

```typescript
// ПЛОХО
function processOrder(order: Order) {
  // ==================== VALIDATION ====================
  if (!order.items.length) throw new Error('Empty order');
  if (!order.userId) throw new Error('No user');
  
  // ==================== CALCULATION ====================
  const total = calculateTotal(order.items);
  const tax = total * 0.2;
  
  // ==================== SAVING ====================
  saveOrder(order);
}

// ХОРОШО - вынести в отдельные методы
function processOrder(order: Order) {
  validateOrder(order);
  const { total, tax } = calculateOrderTotals(order);
  saveOrder(order);
}
```

#### 6. Комментарии за закрывающей скобкой

Вместо этого использовать методы.

```typescript
// ПЛОХО
if (user.isAuthenticated) {
  if (user.hasPermission('admin')) {
    if (user.isActive) {
      // ... много кода ...
    } // if user.isActive
  } // if hasPermission
} // if isAuthenticated

// ХОРОШО - вынести в метод с говорящим именем
if (canUserAccessAdminPanel(user)) {
  // ... код ...
}
```

#### 7. Недостоверные комментарии

Устаревшие или неверные комментарии.

```typescript
// ПЛОХО
// Возвращает список всех пользователей
function getActiveUsers(): User[] {
  return users.filter(u => u.isActive); // А комментарий говорит "всех"!
}

// ХОРОШО
// Возвращает список активных пользователей
function getActiveUsers(): User[] {
  return users.filter(u => u.isActive);
}
```

#### 8. Обязательные комментарии

Не заставлять писать комментарии ради комментариев.

```typescript
// ПЛОХО - комментарий ради комментария
/**
 * Имя пользователя.
 */
name: string;

/**
 * Email пользователя.
 */
email: string;

// ХОРОШО - комментарий только если добавляет ценность
/**
 * Email пользователя. Используется для авторизации и уведомлений.
 * Должен быть уникальным в рамках системы.
 */
email: string;
```

---

## Работа с ошибками

### Try-Catch

Все async функции должны иметь обработку ошибок.

```typescript
// PLOHO
async function getUser(id: string): Promise<User> {
  const response = await fetch(`/api/users/${id}`);
  return response.json();
}

// ХОРОШО
async function getUser(id: string): Promise<User | null> {
  try {
    const response = await fetch(`/api/users/${id}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }
    
    return response.json();
  } catch (error) {
    console.error('[UserService] Error fetching user:', error);
    return null;
  }
}
```

### Пользовательские ошибки

Создавайте специфические ошибки для разных ситуаций.

```typescript
// Классы ошибок
class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

class NotFoundError extends Error {
  constructor(resource: string) {
    super(`${resource} not found`);
    this.name = 'NotFoundError';
  }
}

class AuthenticationError extends Error {
  constructor(message: string = 'Authentication failed') {
    super(message);
    this.name = 'AuthenticationError';
  }
}
```

### Обработка в middleware

```typescript
// error.middleware.ts
export function errorHandler(
  error: Error,
  req: Request,
  res: Response,
  _next: NextFunction,
): void {
  console.error('[ErrorHandler]', error);

  if (error instanceof ValidationError) {
    res.status(400).json({ error: error.message });
    return;
  }

  if (error instanceof AuthenticationError) {
    res.status(401).json({ error: error.message });
    return;
  }

  if (error instanceof NotFoundError) {
    res.status(404).json({ error: error.message });
    return;
  }

  // Неизвестная ошибка
  res.status(500).json({ error: 'Internal server error' });
}
```

---

## Тестирование

### Структура теста

Используйте паттерн AAA (Arrange, Act, Assert).

```typescript
describe('UserService', () => {
  describe('createUser', () => {
    it('dolzhen sozdat polzovatelja s korrektnymi dannymi', () => {
      // Arrange
      const userData = {
        name: 'Ivan',
        email: 'ivan@test.com',
        password: 'password123',
      };

      // Act
      const user = createUser(userData);

      // Assert
      expect(user).toBeDefined();
      expect(user.name).toBe('Ivan');
      expect(user.email).toBe('ivan@test.com');
    });
  });
});
```

### Именование тестов

Тесты должны описывать ожидаемое поведение.

```typescript
// ПЛОХО
it('test1', () => { });
it('works', () => { });

// ХОРОШО
it('должен вернуть пользователя по ID', () => { });
it('должен выкинуть ошибку при некорректном email', () => { });
it('при пустом списке должен вернуть пустой массив', () => { });
```

### Покрытие тестами

Минимальное покрытие - 80%.

```bash
# Проверка покрытия
npm run test:coverage
```

### Mockи

Используйте mockи для внешних зависимостей.

```typescript
// Mock funkcii
const mockReadFile = jest.fn();
jest.mock('../utils/file.utils', () => ({
  readJsonFile: mockReadFile,
}));

// Mock vremeni
jest.useFakeTimers();
jest.setSystemTime(new Date('2026-02-19'));
```

---

## Git коммиты

### Conventional Commits

Формат: `<тип>(<область>): <описание>`

### Типы коммитов

| Тип | Описание | Пример |
|-----|----------|--------|
| `feat` | Новая функция | `feat(auth): add password reset` |
| `fix` | Исправление бага | `fix(cart): correct total calculation` |
| `docs` | Документация | `docs(api): update endpoints` |
| `style` | Форматирование | `style: fix indentation` |
| `refactor` | Рефакторинг | `refactor(user): extract validation` |
| `test` | Тесты | `test(auth): add login tests` |
| `chore` | Обслуживание | `chore: update dependencies` |

### Правила

1. **Единица изменений**: Один коммит - одно логическое изменение
2. **Описание**: На русском языке, в повествовательном наклонении
3. **Длина**: Не более 72 символов в заголовке

```bash
# ПЛОХО
git commit -m "fix"
git commit -m "исправил баги"
git commit -m "feat: добавил новую функциональность которая позволяет пользователям..."

# ХОРОШО
git commit -m "feat(auth): add session expiration check"
git commit -m "fix(cart): correct item quantity validation"
git commit -m "docs: add development guide"
```

---

## Code review чеклист

### Перед отправкой на review

- [ ] Код проходит `npm run lint` без ошибок
- [ ] Код отформатирован `npm run format`
- [ ] Все тесты проходят `npm test`
- [ ] Нет `any` типов
- [ ] Все функции типизированы
- [ ] Добавлены комментарии к сложной логике
- [ ] Обновлена документация (если нужно)

### При просмотре кода

- [ ] Код читается легко
- [ ] Имена переменных и функций понятны
- [ ] Нет дублирования кода
- [ ] Обработаны все возможные ошибки
- [ ] Нет утечек памяти (в async функциях)
- [ ] Логика разбита на функции
- [ ] Тесты покрывают новый код
- [ ] Нет hardcoded значений (используйте константы)

### После review

- [ ] Все замечания исправлены
- [ ] Проведена самопроверка
- [ ] Коммит соответствует conventional commits

---

## Пример качественного кода

```typescript
/**
 * Сервис для работы с пользователями.
 * Содержит методы для создания, поиска и обновления пользователей.
 */
import bcrypt from 'bcryptjs';
import { User } from '../models/user.model';
import { readJsonFile, writeJsonFile } from '../utils/file.utils';
import { generateId } from '../utils/id.utils';

// Константы
const USERS_FILE = 'users.json';
const SALT_ROUNDS = 10;

/**
 * Данные для создания нового пользователя.
 */
interface CreateUserData {
  name: string;
  email: string;
  login: string;
  phone: string;
  password: string;
}

/**
 * Создает нового пользователя в системе.
 * 
 * @param data - Данные для создания пользователя
 * @returns Созданный пользователь
 * @throws {Error} Если пользователь с таким email уже существует
 */
export async function createUser(data: CreateUserData): Promise<User> {
  try {
    // Получаем список существующих пользователей
    const users = await readJsonFile<User[]>(USERS_FILE);
    
    // Проверяем уникальность email
    const existingUser = users.find((u: User) => u.email === data.email);
    if (existingUser) {
      throw new Error('Пользователь с таким email уже существует');
    }
    
    // Хешируем пароль
    const hashedPassword = await bcrypt.hash(data.password, SALT_ROUNDS);
    
    // Создаем нового пользователя
    const newUser: User = {
      id: generateId(),
      name: data.name,
      email: data.email,
      login: data.login,
      phone: data.phone,
      password: hashedPassword,
      createdAt: new Date().toISOString(),
    };
    
    // Сохраняем в файл
    users.push(newUser);
    await writeJsonFile(USERS_FILE, users);
    
    return newUser;
  } catch (error) {
    console.error('[UserService] Error creating user:', error);
    throw error;
  }
}

/**
 * Ищет пользователя по email.
 * 
 * @param email - Email пользователя
 * @returns Пользователь или undefined, если не найден
 */
export async function findUserByEmail(email: string): Promise<User | undefined> {
  try {
    const users = await readJsonFile<User[]>(USERS_FILE);
    return users.find((u: User) => u.email === email);
  } catch (error) {
    console.error('[UserService] Error finding user:', error);
    return undefined;
  }
}
```

---

## Дополнительные ресурсы

- [TypeScript Best Practices](https://www.typescriptlang.org/docs/handbook/declaration-files/do-s-and-don-ts.html)
- [ESLint Rules](https://eslint.org/docs/rules/)
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Conventional Commits](https://www.conventionalcommits.org/)