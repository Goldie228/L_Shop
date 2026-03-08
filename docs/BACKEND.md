# Документация бэкенда L_Shop

## Содержание

1. [Обзор архитектуры](#обзор-архитектуры)
2. [Структура проекта](#структура-проекта)
3. [Слои приложения](#слои-приложения)
4. [Модели данных](#модели-данных)
5. [API маршруты](#api-маршруты)
6. [Сервисы](#сервисы)
7. [Обработка ошибок](#обработка-ошибок)
8. [Логирование](#логирование)
9. [Миграции и Seed](#миграции-и-seed)
10. [Аутентификация](#аутентификация)
11. [Middleware](#middleware)
12. [Хранение данных](#хранение-данных)
13. [Конфигурация](#конфигурация)
14. [Тестирование](#тестирование)
15. [Запуск и разработка](#запуск-и-разработка)

---

## Обзор архитектуры

L_Shop бэкенд построен на **Express.js** с TypeScript и следует многослойной архитектуре:

```
┌─────────────────────────────────────────────────────────────┐
│                         Routes                               │
│            (Определение HTTP маршрутов)                      │
├─────────────────────────────────────────────────────────────┤
│                      Controllers                             │
│     (Обработка запросов, валидация, формирование ответа)     │
├─────────────────────────────────────────────────────────────┤
│                        Services                              │
│           (Бизнес-логика, работа с данными)                  │
├─────────────────────────────────────────────────────────────┤
│                        Models                                │
│              (TypeScript интерфейсы данных)                  │
├─────────────────────────────────────────────────────────────┤
│                  Data Storage (JSON Files)                   │
│         users.json, products.json, carts.json, etc.          │
└─────────────────────────────────────────────────────────────┘
```

### Технологии

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Storage**: JSON файлы (файловое хранилище)
- **Authentication**: Session-based с httpOnly cookies
- **Testing**: Jest

---

## Структура проекта

```
src/backend/
├── app.ts                    # Точка входа приложения
├── config/
│   └── constants.ts          # Константы и конфигурация
├── controllers/
│   ├── auth.controller.ts    # Контроллер аутентификации
│   ├── cart.controller.ts    # Контроллер корзины
│   ├── order.controller.ts   # Контроллер заказов
│   └── product.controller.ts # Контроллер продуктов
├── errors/
│   ├── index.ts              # Barrel export всех ошибок
│   ├── business-error.base.ts # Базовый класс BusinessError
│   ├── validation.error.ts   # Ошибки валидации
│   ├── not-found.error.ts    # Ошибка "не найдено"
│   ├── authentication.error.ts # Ошибки аутентификации
│   ├── authorization.error.ts # Ошибки авторизации
│   ├── conflict.error.ts     # Конфликтующие данные
│   ├── cart.error.ts         # Ошибки корзины
│   ├── order.error.ts        # Ошибки заказов
│   ├── session.error.ts      # Ошибки сессий
│   └── rate-limit.error.ts   # Ошибки лимитов
├── middleware/
│   ├── auth.middleware.ts    # Проверка аутентификации
│   ├── admin.middleware.ts   # Проверка прав администратора
│   ├── auth-request.ts       # Расширение Express Request
│   └── error.middleware.ts   # Глобальный обработчик ошибок
├── models/
│   ├── user.model.ts         # Интерфейс пользователя
│   ├── product.model.ts      # Интерфейс продукта
│   ├── cart.model.ts         # Интерфейс корзины
│   ├── order.model.ts        # Интерфейс заказа
│   └── session.model.ts      # Интерфейс сессии
├── routes/
│   ├── auth.routes.ts        # Маршруты аутентификации
│   ├── cart.routes.ts        # Маршруты корзины
│   ├── order.routes.ts       # Маршруты заказов
│   ├── product.routes.ts     # Маршруты продуктов
│   └── admin.routes.ts       # Маршруты админ-панели
├── services/
│   ├── user.service.ts       # Сервис пользователей
│   ├── session.service.ts    # Сервис сессий
│   ├── cart.service.ts       # Сервис корзины
│   ├── order.service.ts      # Сервис заказов
│   └── product.service.ts    # Сервис продуктов
├── scripts/
│   ├── seed.ts               # Заполнение БД тестовыми данными
│   ├── migrate-add-currency.ts # Миграция: добавление currency
│   └── migrate-add-firstName.ts # Миграция: добавление firstName
├── utils/
│   ├── file.utils.ts         # Работа с файлами (JSON)
│   ├── hash.utils.ts         # Хеширование паролей (bcrypt)
│   ├── id.utils.ts           # Генерация UUID
│   ├── logger.ts             # Структурированный логгер (Pino)
│   ├── validation.ts         # Валидация данных
│   └── validators.ts         # Утилиты валидации
├── types/
│   └── express.d.ts          # Расширения типов Express
├── data/                     # JSON файлы данных
│   ├── users.json
│   ├── products.json
│   ├── carts.json
│   ├── orders.json
│   └── sessions.json
└── __tests__/                # Тесты
    ├── api.smoke.test.ts
    ├── controllers/
    ├── services/
    └── utils/
```

---

## Слои приложения

### 1. Routes (Маршруты)

Определяют HTTP эндпоинты и связывают их с контроллерами.

**Пример ([`cart.routes.ts`](src/backend/routes/cart.routes.ts:1)):**
```typescript
import { Router } from 'express';
import { getCart, addItem, updateItem, removeItem } from '../controllers/cart.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// Все маршруты требуют авторизации
router.get('/', authMiddleware, getCart);
router.post('/items', authMiddleware, addItem);
router.put('/items/:productId', authMiddleware, updateItem);
router.delete('/items/:productId', authMiddleware, removeItem);

export default router;
```

### 2. Controllers (Контроллеры)

Обрабатывают HTTP запросы, выполняют валидацию и формируют ответы.

**Обязанности контроллера:**
- Извлечение данных из запроса (`req.body`, `req.params`, `req.query`)
- Валидация входных данных
- Вызов соответствующего сервиса
- Формирование HTTP ответа
- Обработка ошибок (передача в `errorHandler`)

**Пример ([`cart.controller.ts`](src/backend/controllers/cart.controller.ts:1)):**
```typescript
export async function getCart(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { userId } = req;

    if (!userId) {
      res.status(401).json({
        message: 'Не авторизован',
        error: 'UNAUTHORIZED',
      });
      return;
    }

    const cart = await cartService.getCart(userId);
    res.json(cart);
  } catch (error) {
    console.error('[CartController] Ошибка:', error);
    res.status(500).json({
      message: 'Ошибка при получении корзины',
      error: 'GET_CART_ERROR',
    });
  }
}
```

### 3. Services (Сервисы)

Содержат бизнес-логику и работают с данными.

**Обязанности сервиса:**
- Реализация бизнес-логики
- Работа с хранилищем данных (JSON файлы)
- Взаимодействие с другими сервисами
- Выброс кастомных ошибок (`throw new NotFoundError()`)

### 4. Models (Модели)

TypeScript интерфейсы, описывающие структуру данных. Хранятся в [`src/backend/models/`](src/backend/models).

### 5. Data Storage (Хранение данных)

Данные хранятся в JSON файлах в директории [`src/backend/data/`](src/backend/data). Утилиты для работы с файлами: [`file.utils.ts`](src/backend/utils/file.utils.ts).

---

## Модели данных

### User (Пользователь)

**Файл:** [`user.model.ts`](src/backend/models/user.model.ts)

```typescript
interface User {
  id: string;              // UUID
  name: string;            // Отображаемое имя
  firstName?: string;      // Имя (отдельное поле, по умолчанию = name)
  email: string;           // Email (уникальный)
  login: string;           // Логин (уникальный)
  phone: string;           // Телефон (+1234567890)
  passwordHash: string;    // Хеш пароля (bcrypt)
  role: 'user' | 'admin';  // Роль
  isBlocked?: boolean;     // Статус блокировки
  createdAt: string;       // ISO 8601
  updatedAt: string;       // ISO 8601
}
```

### Product (Продукт)

**Файл:** [`product.model.ts`](src/backend/models/product.model.ts)

```typescript
interface Product {
  id: string;                  // UUID
  name: string;                // Название
  description: string;         // Описание
  price: number;               // Цена в BYN
  currency: 'BYN';             // Валюта (BYN)
  category: string;            // Категория
  inStock: boolean;            // Наличие на складе
  imageUrl?: string;           // URL изображения
  discountPercent?: number;    // Скидка 0-100
  rating?: number;             // Рейтинг 1-5 (Вариант 17)
  reviewsCount?: number;       // Количество отзывов (Вариант 17)
  brand: string;               // Бренд
  warranty: string;            // Гарантия
  specifications: Record<string, unknown>; // Технические характеристики
  createdAt: string;           // ISO 8601
  updatedAt?: string;          // ISO 8601
}

type ProductStatus = 'active' | 'inactive' | 'discontinued';
```

### Cart (Корзина)

**Файл:** [`cart.model.ts`](src/backend/models/cart.model.ts)

```typescript
interface Cart {
  userId: string;           // ID пользователя
  items: CartItem[];        // Элементы корзины
  updatedAt: string;        // Дата обновления
  currency: 'BYN';          // Валюта (BYN)
}

interface CartItem {
  productId: string;        // ID продукта
  quantity: number;         // Количество
}

// Расширенный элемент для ответа API
interface CartItemWithProduct extends CartItem {
  name: string;             // Название продукта
  price: number;            // Цена (BYN)
  discountPercent?: number; // Скидка
  total: number;            // Итоговая сумма (BYN)
  currency: 'BYN';          // Валюта (BYN)
  imageUrl?: string;        // URL изображения
}

interface CartWithProducts extends Cart {
  items: CartItemWithProduct[];
  totalSum: number;         // Общая сумма корзины (BYN)
}
```

### Order (Заказ)

**Файл:** [`order.model.ts`](src/backend/models/order.model.ts)

```typescript
interface Order {
  id: string;                                  // UUID
  userId: string;                              // ID пользователя
  firstName: string;                           // Имя получателя
  items: OrderItem[];                          // Элементы заказа
  deliveryAddress: string;                     // Адрес доставки
  phone: string;                               // Телефон
  email: string;                               // Email
  paymentMethod: 'cash' | 'card' | 'online';  // Способ оплаты
  deliveryType?: 'courier' | 'pickup';        // Тип доставки (Вариант 24)
  comment?: string;                            // Комментарий (Вариант 24)
  status: OrderStatus;                         // Статус
  currency: 'BYN';                             // Валюта (BYN)
  totalSum: number;                            // Общая сумма (BYN)
  createdAt: string;                           // Дата создания
  updatedAt?: string;                          // Дата обновления
}

type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

interface OrderItem {
  productId: string;
  name: string;             // Название на момент заказа
  price: number;            // Цена на момент заказа (BYN)
  currency: 'BYN';          // Валюта (BYN)
  quantity: number;
  discountPercent?: number; // Скидка на момент заказа
}

export interface CreateOrderData {
  firstName: string;
  deliveryAddress: string;
  phone: string;
  email: string;
  paymentMethod: PaymentMethod;
  deliveryType?: DeliveryType;
  comment?: string;
}
```

### Session (Сессия)

**Файл:** [`session.model.ts`](src/backend/models/session.model.ts)

```typescript
interface Session {
  token: string;            // Уникальный токен сессии
  userId: string;           // ID пользователя
  expiresAt: string;        // Дата истечения (ISO 8601)
  createdAt: string;        // Дата создания
}
```

---

## API маршруты

### Аутентификация (`/api/auth`)

| Метод | Путь | Описание | Авторизация |
|-------|------|----------|-------------|
| POST | `/register` | Регистрация нового пользователя | Нет |
| POST | `/login` | Вход в систему | Нет |
| POST | `/logout` | Выход из системы | Да |
| GET | `/me` | Получить данные текущего пользователя | Да |

### Продукты (`/api/products`)

| Метод | Путь | Описание | Авторизация |
|-------|------|----------|-------------|
| GET | `/` | Список продуктов с фильтрацией и сортировкой | Нет |
| GET | `/:id` | Получить продукт по ID | Нет |

**Параметры фильтрации:**
- `search` - поиск по названию и описанию
- `category` - фильтр по категории
- `inStock` - фильтр по наличию (`true`/`false`)
- `sort` - сортировка (`price_asc`, `price_desc`)
- `minRating` - минимальный рейтинг (1-5)

### Корзина (`/api/cart`)

| Метод | Путь | Описание | Авторизация |
|-------|------|----------|-------------|
| GET | `/` | Получить корзину пользователя | Да |
| POST | `/items` | Добавить товар в корзину | Да |
| PUT | `/items/:productId` | Изменить количество товара | Да |
| DELETE | `/items/:productId` | Удалить товар из корзины | Да |

### Заказы (`/api/orders`)

| Метод | Путь | Описание | Авторизация |
|-------|------|----------|-------------|
| POST | `/` | Создать заказ из корзины | Да |
| GET | `/` | Получить список заказов пользователя | Да |
| GET | `/:orderId` | Получить заказ по ID | Да |

### Админ-панель (`/api/admin`)

Все эндпоинты требуют роль `admin`.

| Метод | Путь | Описание | Авторизация |
|-------|------|----------|-------------|
| GET | `/products` | Получить все продукты (админ) | Да (admin) |
| POST | `/products` | Создать новый продукт | Да (admin) |
| PUT | `/products/:id` | Обновить продукт | Да (admin) |
| DELETE | `/products/:id` | Удалить продукт | Да (admin) |
| GET | `/orders` | Получить все заказы (админ) | Да (admin) |
| PUT | `/orders/:id/status` | Обновить статус заказа | Да (admin) |
| DELETE | `/orders/:id` | Удалить заказ | Да (admin) |
| GET | `/users` | Получить всех пользователей (админ) | Да (admin) |
| PUT | `/users/:id/role` | Изменить роль пользователя | Да (admin) |
| PUT | `/users/:id/block` | Заблокировать/разблокировать пользователя | Да (admin) |

---

## Сервисы

### UserService

**Файл:** [`user.service.ts`](src/backend/services/user.service.ts)

Управление пользователями.

```typescript
class UserService {
  // Получить всех пользователей
  async getAllUsers(): Promise<User[]>

  // Найти пользователя по ID
  async getUserById(id: string): Promise<User | null>

  // Найти по email или логину (для аутентификации)
  async findByLoginOrEmail(loginOrEmail: string): Promise<User | null>

  // Найти по email и логину (проверка уникальности)
  async findByEmailOrLogin(email: string, login: string): Promise<User | null>

  // Создать пользователя
  async createUser(data: {
    name: string;
    email: string;
    login: string;
    phone: string;
    password: string;
    firstName?: string;
    role?: string;
  }): Promise<User>

  // Обновить профиль пользователя (имя, email)
  async updateProfile(userId: string, name: string, email: string): Promise<User | null>

  // Обновить пароль пользователя
  async updatePassword(userId: string, newPassword: string): Promise<User | null>

  // Обновить роль пользователя (админ)
  async updateUserRole(userId: string, role: string): Promise<User | null>

  // Переключить блокировку пользователя
  async toggleUserBlock(userId: string): Promise<User | null>

  // Обновить пользователя (частичное обновление)
  async updateUser(
    id: string,
    data: Partial<Omit<User, 'id' | 'createdAt'>>
  ): Promise<User | null>
}
```

### SessionService

**Файл:** [`session.service.ts`](src/backend/services/session.service.ts)

Управление сессиями пользователей.

```typescript
class SessionService {
  // Создать сессию
  async create(userId: string): Promise<string> // возвращает токен

  // Найти сессию по токену
  async findByToken(token: string): Promise<Session | null>

  // Проверить валидность сессии
  async validate(token: string): Promise<string | null> // возвращает userId

  // Удалить сессию (logout)
  async delete(token: string): Promise<void>

  // Очистить истёкшие сессии
  async cleanExpired(): Promise<void>
}
```

### CartService

**Файл:** [`cart.service.ts`](src/backend/services/cart.service.ts)

Управление корзиной пользователя.

```typescript
class CartService {
  // Получить корзину с данными продуктов
  async getCart(userId: string): Promise<CartWithProducts>

  // Добавить товар в корзину
  async addItem(userId: string, productId: string, quantity: number): Promise<CartWithProducts>

  // Изменить количество товара
  async updateItem(userId: string, productId: string, quantity: number): Promise<CartWithProducts>

  // Удалить товар
  async removeItem(userId: string, productId: string): Promise<CartWithProducts>

  // Очистить корзину (используется при создании заказа)
  async clearCart(userId: string): Promise<void>
}
```

### OrderService

**Файл:** [`order.service.ts`](src/backend/services/order.service.ts)

Управление заказами.

```typescript
class OrderService {
  // Создать заказ из корзины
  async createOrder(userId: string, data: CreateOrderData): Promise<Order>

  // Получить все заказы пользователя
  async getOrders(userId: string): Promise<Order[]>

  // Получить заказ по ID
  async getOrderById(userId: string, orderId: string): Promise<Order | null>

  // Обновить статус заказа (админ)
  async updateOrderStatus(orderId: string, status: OrderStatus): Promise<Order | null>

  // Удалить заказ (админ)
  async deleteOrder(orderId: string): Promise<boolean>
}
```

### ProductService

**Файл:** [`product.service.ts`](src/backend/services/product.service.ts)

Управление продуктами.

```typescript
class ProductService {
  // Получить список продуктов с фильтрацией и сортировкой
  async getProducts(filters: ProductFilters = {}): Promise<Product[]>

  // Получить все продукты (без фильтрации)
  async getAllProducts(): Promise<Product[]>

  // Получить продукт по ID
  async getProductById(id: string): Promise<Product | null>

  // Создать новый продукт
  async createProduct(data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product>

  // Обновить продукт по ID
  async updateProduct(
    id: string,
    data: Partial<Omit<Product, 'id' | 'createdAt'>>
  ): Promise<Product | null>

  // Удалить продукт по ID
  async deleteProduct(id: string): Promise<boolean>
}
```

---

## Обработка ошибок

### Кастомные классы ошибок

Все кастомные ошибки находятся в директории [`src/backend/errors/`](src/backend/errors).

**Базовый класс:** [`business-error.base.ts`](src/backend/errors/business-error.base.ts) - `BusinessError`

**Конкретные классы ошибок:**

| Класс ошибки | Файл | Статус код | Назначение |
|--------------|------|------------|------------|
| [`ValidationError`](src/backend/errors/validation.error.ts) | 400 | Ошибки валидации входных данных |
| [`NotFoundError`](src/backend/errors/not-found.error.ts) | 404 | Ресурс не найден |
| [`AuthenticationError`](src/backend/errors/authentication.error.ts) | 401 | Ошибки аутентификации |
| [`AuthorizationError`](src/backend/errors/authorization.error.ts) | 403 | Недостаточно прав |
| [`ConflictError`](src/backend/errors/conflict.error.ts) | 409 | Конфликтующие данные (email уже существует) |
| [`CartError`](src/backend/errors/cart.error.ts) | 400 | Ошибки работы с корзиной |
| [`OrderError`](src/backend/errors/order.error.ts) | 400 | Ошибки работы с заказами |
| [`SessionError`](src/backend/errors/session.error.ts) | 401 | Ошибки сессии |
| [`RateLimitError`](src/backend/errors/rate-limit.error.ts) | 429 | Превышен лимит запросов |
| [`DependencyError`](src/backend/errors/dependency.error.ts) | 400 | Ошибка зависимого ресурса |
| [`BusinessRuleError`](src/backend/errors/business-rule.error.ts) | 400 | Нарушение бизнес-правил |

### Использование ошибок в сервисах и контроллерах

**Пример использования в сервисе:**
```typescript
import { NotFoundError, ValidationError } from '../errors';

class ProductService {
  async getProductById(id: string): Promise<Product | null> {
    const products = await readJsonFile<Product>(PRODUCTS_FILE);
    const product = products.find((p) => p.id === id);

    if (!product) {
      throw new NotFoundError('Продукт не найден', { productId: id });
    }

    return product;
  }

  async createProduct(data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> {
    // Валидация цены
    if (data.price <= 0) {
      throw new ValidationError('Цена должна быть больше 0', { field: 'price', value: data.price });
    }

    // ... создание продукта
  }
}
```

**Пример использования в контроллере:**
```typescript
import { asyncHandler } from '../middleware/error.middleware';

export const getProduct = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  if (!id) {
    throw new ValidationError('ID продукта обязателен');
  }

  const product = await productService.getProductById(id);

  if (!product) {
    throw new NotFoundError('Продукт не найден', { productId: id });
  }

  res.json(product);
});
```

### Error Middleware

**Файл:** [`error.middleware.ts`](src/backend/middleware/error.middleware.ts)

Централизованный обработчик ошибок. Должен быть последним middleware в цепочке.

```typescript
// В app.ts
import { errorHandler } from './middleware/error.middleware';
app.use(errorHandler);
```

**Особенности:**
- Автоматически определяет тип ошибки (BusinessError или стандартная Error)
- Логирует ошибки с разным уровнем в зависимости от типа
- Формирует структурированный JSON ответ
- В development режиме включает stack trace
- В production скрывает детали внутренних ошибок

**Формат ответа:**
```json
{
  "error": {
    "code": "PRODUCT_NOT_FOUND",
    "message": "Продукт не найден"
  },
  "stack": "..."
}
```

---

## Логирование

**Файл:** [`logger.ts`](src/backend/utils/logger.ts)

Структурированный логгер на базе **Pino**.

### Конфигурация

- **Development режим:** Использует `pino-pretty` для читаемого вывода в консоль с цветами
- **Production режим:** Использует `pino-roll` для ротации логов по размеру и времени

### Использование

**Базовый логгер:**
```typescript
import { logger } from './utils/logger';

logger.info('Пользователь авторизован', { userId, email });
logger.error('Ошибка подключения к БД', { error });
logger.debug('Отладочная информация', { data });
logger.warn('Потенциальная проблема', { warning });
```

**Дочерний логгер с контекстом:**
```typescript
import { createContextLogger } from './utils/logger';

const userServiceLogger = createContextLogger('UserService');
userServiceLogger.debug('Создание пользователя', { email });
```

### Ротация логов (Production)

- **Формат файлов:** `lshop-YYYY-MM-DD.log`
- **Ротация:** Ежедневно + по размеру (10 МБ)
- **Хранение:** 14 дней
- **Сжатие:** Автоматическое сжатие старых логов

---

## Миграции и Seed

### Seed данные

**Файл:** [`scripts/seed.ts`](src/backend/scripts/seed.ts)

Заполняет базу тестовыми данными:
- Тестовые пользователи (user, admin)
- Каталог продуктов (10+ товаров с изображениями, рейтингами, характеристиками)

**Запуск:**
```bash
npm run seed
```

### Миграции

Миграции используются для эволюционного изменения структуры данных.

**Доступные миграции:**
- [`migrate-add-currency.ts`](src/backend/scripts/migrate-add-currency.ts) - Добавление поля `currency: 'BYN'` во все модели
- [`migrate-add-firstName.ts`](src/backend/scripts/migrate-add-firstName.ts) - Добавление поля `firstName` в модель User

**Запуск миграции:**
```bash
npx ts-node src/backend/scripts/migrate-add-currency.ts
npx ts-node src/backend/scripts/migrate-add-firstName.ts
```

**Важно:** Миграции должны выполняться последовательно и являются идемпотентными (можно выполнять многократно).

---

## Аутентификация

### Механизм работы

1. **Регистрация:**
   - Валидация данных
   - Проверка уникальности email и логина
   - Хеширование пароля (bcrypt)
   - Создание пользователя
   - Создание сессии
   - Установка httpOnly cookie

2. **Вход:**
   - Поиск пользователя по логину/email
   - Проверка пароля (bcrypt.compare)
   - Создание сессии
   - Установка httpOnly cookie

3. **Проверка авторизации:**
   - Извлечение токена из cookie `sessionToken`
   - Поиск сессии в базе
   - Проверка срока действия
   - Добавление `userId` в request

4. **Выход:**
   - Удаление сессии
   - Очистка cookie

### Session Cookie

```typescript
// Установка cookie при входе/регистрации
res.cookie('sessionToken', token, {
  httpOnly: true,      // Недоступен для JavaScript (защита от XSS)
  secure: false,       // true в production (HTTPS)
  sameSite: 'lax',     // Защита от CSRF
  maxAge: 10 * 60 * 1000, // 10 минут
});
```

### Длительность сессии

- **SESSION_DURATION_MINUTES = 10**
- При каждом запросе сессия продлевается
- После истечения - автоматический logout

---

## Middleware

### authMiddleware

**Файл:** [`auth.middleware.ts`](src/backend/middleware/auth.middleware.ts)

Проверяет авторизацию для защищённых маршрутов.

```typescript
export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const token = req.cookies?.sessionToken;

  if (!token) {
    res.status(401).json({
      message: 'Не авторизован',
      error: 'UNAUTHORIZED',
    });
    return;
  }

  const userId = await sessionService.validate(token);

  if (!userId) {
    res.clearCookie('sessionToken');
    res.status(401).json({
      message: 'Сессия истекла',
      error: 'SESSION_EXPIRED',
    });
    return;
  }

  // Добавить userId в request для использования в контроллерах
  (req as AuthRequest).userId = userId;
  next();
}
```

### requireAdmin

**Файл:** [`admin.middleware.ts`](src/backend/middleware/admin.middleware.ts)

Проверяет, что пользователь имеет роль `admin`.

```typescript
export async function requireAdmin(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const userId = req.userId;

  if (!userId) {
    res.status(401).json({
      message: 'Не авторизован',
      error: 'UNAUTHORIZED',
    });
    return;
  }

  const user = await userService.getUserById(userId);

  if (!user || user.role !== 'admin') {
    res.status(403).json({
      message: 'Доступ запрещён',
      error: 'FORBIDDEN',
    });
    return;
  }

  next();
}
```

### asyncHandler

**Файл:** [`error.middleware.ts`](src/backend/middleware/error.middleware.ts)

Обёртка для async middleware, автоматически передаёт ошибки в `next()`.

```typescript
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>
) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
```

**Использование:**
```typescript
export const getProduct = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  // Асинхронный код без try-catch
  const product = await productService.getProductById(req.params.id);
  res.json(product);
});
```

---

## Хранение данных

### Файловое хранилище

Данные хранятся в JSON файлах в директории [`src/backend/data/`](src/backend/data/):

| Файл | Содержимое |
|------|------------|
| `users.json` | Массив пользователей |
| `products.json` | Массив продуктов |
| `carts.json` | Массив корзин |
| `orders.json` | Массив заказов |
| `sessions.json` | Массив сессий |

### Утилиты для работы с файлами

**Файл:** [`file.utils.ts`](src/backend/utils/file.utils.ts)

```typescript
// Чтение JSON файла
async function readJsonFile<T>(filename: string): Promise<T[]>

// Запись в JSON файл
async function writeJsonFile<T>(filename: string, data: T[]): Promise<void>

// Модификация с атомарностью (read-modify-write)
async function modifyJsonFile<T>(
  filename: string,
  modifier: (data: T[]) => T[]
): Promise<void>

// Создание файлов при отсутствии
async function ensureDataFiles(): Promise<void>
```

---

## Конфигурация

### config/constants.ts

**Файл:** [`constants.ts`](src/backend/config/constants.ts)

```typescript
export const config = {
  port: parseInt(process.env.PORT || '3001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  isProduction: process.env.NODE_ENV === 'production',
  sessionDurationMinutes: 10,
  logsDir: 'logs',
};
```

### Переменные окружения (.env)

```env
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

---

## Тестирование

### Структура тестов

```
src/backend/
├── __tests__/
│   ├── api.smoke.test.ts
│   ├── controllers/
│   │   └── product.controller.test.ts
│   ├── services/
│   │   ├── user.service.test.ts
│   │   ├── session.service.test.ts
│   │   ├── cart.service.test.ts
│   │   ├── order.service.test.ts
│   │   └── product.service.test.ts
│   └── utils/
│       ├── hash.utils.test.ts
│       ├── id.utils.test.ts
│       └── validators.test.ts
```

### Запуск тестов

```bash
# Все тесты бэкенда
npm test

# Конкретный файл
npm test -- user.service.test.ts

# С покрытием
npm test -- --coverage

# В watch режиме
npm test -- --watch
```

---

## Запуск и разработка

### Команды

```bash
# Development режим с перезапуском (nodemon)
npm run dev:backend

# Production запуск
npm run start:backend

# Сборка
npm run build:backend

# Тесты
npm test

# Линтинг
npm run lint

# Seed данных
npm run seed
```

### Порты

- **Backend**: 3001 (по умолчанию)
- **Frontend**: 5173 (Vite dev server)

### CORS

В development режиме разрешены запросы с любого `localhost:*`.

В production только с `FRONTEND_URL`.

---

## Ответственность за модули

| Модуль | Ответственный | Статус |
|--------|---------------|--------|
| Аутентификация | Глеб | ✅ Готово |
| Продукты | Никита П. | ✅ Готово |
| Корзина | Тимофей | ✅ Готово |
| Заказы | Никита Т. | ✅ Готово |

---

*Документ создан: март 2026*  
*Последнее обновление: март 2026*
