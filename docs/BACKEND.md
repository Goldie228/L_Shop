# Документация бэкенда L_Shop

## Содержание

1. [Обзор архитектуры](#обзор-архитектуры)
2. [Структура проекта](#структура-проекта)
3. [Слои приложения](#слои-приложения)
4. [Модели данных](#модели-данных)
5. [API маршруты](#api-маршруты)
6. [Сервисы](#сервисы)
7. [Аутентификация](#аутентификация)
8. [Middleware](#middleware)
9. [Хранение данных](#хранение-данных)
10. [Конфигурация](#конфигурация)
11. [Тестирование](#тестирование)
12. [Запуск и разработка](#запуск-и-разработка)

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
│   └── order.controller.ts   # Контроллер заказов
├── middleware/
│   ├── auth.middleware.ts    # Проверка аутентификации
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
│   └── order.routes.ts       # Маршруты заказов
├── services/
│   ├── user.service.ts       # Сервис пользователей
│   ├── session.service.ts    # Сервис сессий
│   ├── cart.service.ts       # Сервис корзины
│   └── order.service.ts      # Сервис заказов
├── scripts/
│   └── seed.ts               # Начальные данные
├── utils/
│   ├── file.utils.ts         # Работа с файлами
│   ├── hash.utils.ts         # Хеширование паролей
│   ├── id.utils.ts           # Генерация UUID
│   └── validators.ts         # Валидация данных
├── types/
│   └── express.d.ts          # Расширения типов Express
├── data/                     # JSON файлы данных
│   └── .gitkeep
└── __tests__/                # Тесты
    └── api.smoke.test.ts
```

---

## Слои приложения

### 1. Routes (Маршруты)

Определяют HTTP эндпоинты и связывают их с контроллерами.

**Пример (`cart.routes.ts`):**
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
- Извлечение данных из запроса (req.body, req.params, req.query)
- Валидация входных данных
- Вызов соответствующего сервиса
- Формирование HTTP ответа
- Обработка ошибок

**Пример (`cart.controller.ts`):**
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
- Работа с хранилищем данных
- Взаимодействие с другими сервисами
- Выброс ошибок для контроллеров

### 4. Models (Модели)

TypeScript интерфейсы, описывающие структуру данных.

---

## Модели данных

### User (Пользователь)

```typescript
interface User {
  id: string;              // UUID
  name: string;            // Отображаемое имя
  email: string;           // Email (уникальный)
  login: string;           // Логин (уникальный)
  phone: string;           // Телефон (+1234567890)
  passwordHash: string;    // Хеш пароля (bcrypt)
  role: 'user' | 'admin';  // Роль
  createdAt: string;       // ISO 8601
  updatedAt: string;       // ISO 8601
}
```

### Product (Продукт)

```typescript
interface Product {
  id: string;                  // UUID
  name: string;                // Название
  description: string;         // Описание
  price: number;               // Цена
  category: string;            // Категория
  inStock: boolean;            // Наличие на складе
  discountPercent?: number;    // Скидка 0-100 (Вариант 21)
  imageUrl?: string;           // URL изображения
  createdAt: string;           // ISO 8601
  updatedAt?: string;          // ISO 8601
}

type ProductStatus = 'active' | 'inactive' | 'discontinued';
```

### Cart (Корзина)

```typescript
interface Cart {
  userId: string;           // ID пользователя
  items: CartItem[];        // Элементы корзины
  updatedAt: string;        // Дата обновления
}

interface CartItem {
  productId: string;        // ID продукта
  quantity: number;         // Количество
}

// Расширенный элемент для ответа API
interface CartItemWithProduct extends CartItem {
  name: string;             // Название продукта
  price: number;            // Цена
  discountPercent?: number; // Скидка
  total: number;            // Итоговая сумма
}

interface CartWithProducts extends Cart {
  items: CartItemWithProduct[];
  totalSum: number;         // Общая сумма корзины
}
```

### Order (Заказ)

```typescript
interface Order {
  id: string;                                  // UUID
  userId: string;                              // ID пользователя
  items: OrderItem[];                          // Элементы заказа
  deliveryAddress: string;                     // Адрес доставки
  phone: string;                               // Телефон
  email: string;                               // Email
  paymentMethod: 'cash' | 'card' | 'online';  // Способ оплаты
  deliveryType?: 'courier' | 'pickup';        // Тип доставки (Вариант 24)
  comment?: string;                            // Комментарий (Вариант 24)
  status: OrderStatus;                         // Статус
  totalSum: number;                            // Общая сумма
  createdAt: string;                           // Дата создания
  updatedAt?: string;                          // Дата обновления
}

type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

interface OrderItem {
  productId: string;
  name: string;             // Название на момент заказа
  price: number;            // Цена на момент заказа
  quantity: number;
  discountPercent?: number; // Скидка на момент заказа
}
```

### Session (Сессия)

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

### Авторизация (`/api/auth`)

| Метод | Путь | Описание | Авторизация |
|-------|------|----------|-------------|
| POST | `/register` | Регистрация | Нет |
| POST | `/login` | Вход | Нет |
| POST | `/logout` | Выход | Да |
| GET | `/me` | Текущий пользователь | Да |

### Корзина (`/api/cart`)

| Метод | Путь | Описание | Авторизация |
|-------|------|----------|-------------|
| GET | `/` | Получить корзину | Да |
| POST | `/items` | Добавить товар | Да |
| PUT | `/items/:productId` | Изменить количество | Да |
| DELETE | `/items/:productId` | Удалить товар | Да |

### Заказы (`/api/orders`)

| Метод | Путь | Описание | Авторизация |
|-------|------|----------|-------------|
| POST | `/` | Создать заказ | Да |
| GET | `/` | Список заказов | Да |
| GET | `/:orderId` | Получить заказ | Да |

### Продукты (планируется)

| Метод | Путь | Описание | Авторизация |
|-------|------|----------|-------------|
| GET | `/api/products` | Список продуктов | Нет |
| GET | `/api/products/:id` | Получить продукт | Нет |

---

## Сервисы

### UserService

Управление пользователями.

```typescript
class UserService {
  // Создать пользователя
  async create(data: CreateUserData): Promise<User>
  
  // Найти по ID
  async findById(id: string): Promise<User | null>
  
  // Найти по логину или email
  async findByLoginOrEmail(loginOrEmail: string): Promise<User | null>
  
  // Проверить существование логина/email
  async exists(login: string, email: string): Promise<{ loginExists: boolean, emailExists: boolean }>
}
```

### SessionService

Управление сессиями пользователей.

```typescript
class SessionService {
  // Создать сессию
  async create(userId: string): Promise<string>
  
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

Управление заказами.

```typescript
class OrderService {
  // Создать заказ из корзины
  async createOrder(userId: string, data: CreateOrderData): Promise<Order>
  
  // Получить все заказы пользователя
  async getOrders(userId: string): Promise<Order[]>
  
  // Получить заказ по ID
  async getOrderById(userId: string, orderId: string): Promise<Order | null>
}
```

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
   - Извлечение токена из cookie
   - Поиск сессии в базе
   - Проверка срока действия
   - Добавление userId в request

4. **Выход:**
   - Удаление сессии
   - Очистка cookie

### Session Cookie

```typescript
// Установка cookie при входе/регистрации
res.cookie('sessionToken', token, {
  httpOnly: true,      // Недоступен для JavaScript
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
  req.userId = userId;
  next();
}
```

### errorHandler

Глобальный обработчик ошибок.

```typescript
export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  console.error('[ErrorHandler]', err);

  res.status(500).json({
    message: 'Внутренняя ошибка сервера',
    error: 'INTERNAL_ERROR',
  });
}
```

---

## Хранение данных

### Файловое хранилище

Данные хранятся в JSON файлах в директории `src/backend/data/`:

| Файл | Содержимое |
|------|------------|
| `users.json` | Массив пользователей |
| `products.json` | Массив продуктов |
| `carts.json` | Массив корзин |
| `orders.json` | Массив заказов |
| `sessions.json` | Массив сессий |

### Утилиты для работы с файлами

```typescript
// Чтение JSON файла
async function readJsonFile<T>(filename: string): Promise<T[]>

// Запись в JSON файл
async function writeJsonFile<T>(filename: string, data: T[]): Promise<void>

// Создание файлов при отсутствии
async function ensureDataFiles(): Promise<void>
```

### Seed данные

При первом запуске создаются начальные данные:

```typescript
// Пример seed данных для продуктов
const sampleProducts: Product[] = [
  {
    id: generateId(),
    name: 'Смартфон Samsung Galaxy',
    description: 'Флагманский смартфон',
    price: 1500,
    category: 'electronics',
    inStock: true,
    discountPercent: 10,
    createdAt: new Date().toISOString(),
  },
  // ...
];
```

---

## Конфигурация

### config/constants.ts

```typescript
export const config = {
  port: parseInt(process.env.PORT || '3001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  isProduction: process.env.NODE_ENV === 'production',
  sessionDurationMinutes: 10,
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
│   └── api.smoke.test.ts     # Smoke тесты API
├── services/__tests__/
│   ├── user.service.test.ts
│   ├── session.service.test.ts
│   ├── cart.service.test.ts
│   └── order.service.test.ts
└── utils/__tests__/
    ├── hash.utils.test.ts
    ├── id.utils.test.ts
    └── validators.test.ts
```

### Запуск тестов

```bash
# Все тесты бэкенда
npm test

# Конкретный файл
npm test -- user.service.test.ts

# С покрытием
npm test -- --coverage
```

---

## Запуск и разработка

### Команды

```bash
# Development режим с перезапуском
npm run dev:backend

# Production запуск
npm run start:backend

# Сборка
npm run build:backend

# Тесты
npm test

# Линтинг
npm run lint
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
| Продукты | Никита П. | 🔄 В разработке |
| Корзина | Тимофей | ✅ Готово |
| Заказы | Никита Т. | ✅ Готово |

---

*Документ создан: март 2026*