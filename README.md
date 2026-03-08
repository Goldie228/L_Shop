# L_Shop - Интернет-магазин (Прототип)

## Описание проекта

L_Shop - это прототип интернет-магазина, разработанный на Express + TypeScript (backend) и SPA на чистом TypeScript (frontend). Проект использует JSON-файловое хранилище данных.

## Команда разработчиков

| Разработчик | Роль | Вариант | Ответственность |
|--------------|------|---------|-----------------|
| **Глеб** | Тимлид | 8 | Инфраструктура, аутентификация, интеграция |
| **Никита П.** | Backend/Frontend | 17 | Модуль продуктов |
| **Тимофей** | Backend/Frontend | 21 | Модуль корзины |
| **Никита Т.** | Backend/Frontend | 24 | Модуль заказов/доставки |

## Технологии

### Backend
- **Node.js** (v18+)
- **Express.js** - веб-сервер
- **TypeScript** (strict mode)
- **cookie-parser** - работа с куками
- **cors** - CORS настройки

### Frontend
- **TypeScript** (SPA без фреймворков)
- Компонентный подход
- URL-маршрутизация

### Инструменты
- **ESLint** + **Prettier** - код-стайл
- **ts-node** + **nodemon** - разработка

## Структура проекта

```
L_Shop/
├── src/
│   ├── backend/           # Backend на Express + TypeScript
│   │   ├── app.ts         # Точка входа
│   │   ├── config/        # Конфигурация
│   │   ├── controllers/   # Контроллеры
│   │   ├── errors/        # Классы ошибок
│   │   ├── middleware/    # Middleware
│   │   ├── models/        # Модели данных
│   │   ├── routes/        # Маршруты
│   │   ├── services/      # Бизнес-логика
│   │   ├── types/         # TypeScript типы
│   │   ├── utils/         # Вспомогательные функции
│   │   ├── data/          # JSON-файлы с данными
│   ├── frontend/          # SPA frontend
├── docs/                  # Документация
├── package.json
├── tsconfig.json
├── .eslintrc.js
├── .prettierrc
```

## Установка и запуск

### Требования
- Node.js v18+
- npm v9+

### Установка зависимостей
```bash
npm install
```

### Конфигурация окружения
Скопируйте файл `.env.example` в `.env` и настройте при необходимости:

```bash
cp .env.example .env
```

#### Переменные окружения

| Переменная | По умолчанию | Описание |
|------------|--------------|----------|
| `PORT` | `3001` | Порт backend сервера |
| `FRONTEND_PORT` | `3000` | Порт frontend сервера |
| `FRONTEND_URL` | `http://localhost:3000` | URL frontend для CORS |
| `VITE_API_URL` | `http://localhost:3001` | URL API для frontend |
| `NODE_ENV` | `development` | Режим работы |
| `SESSION_DURATION_MINUTES` | `10` | Время жизни сессии (минуты) |
| `DATA_DIR` | `./src/backend/data` | Директория для JSON-файлов |

### Запуск в режиме разработки

**Рекомендуемый способ** — одновременный запуск frontend и backend:

```bash
npm run dev
```

Эта команда запускает оба сервера параллельно через `concurrently`:
- Backend: `http://localhost:3001`
- Frontend: `http://localhost:3000`

**Альтернативные способы:**

```bash
# Только backend с автоперезагрузкой
npm run dev:backend

# Только frontend
npm run dev:frontend
```

### Компиляция
```bash
npm run build
```

### Запуск продакшн версии
```bash
npm start
```

### Миграции и начальные данные

Для обновления структуры данных и заполнения базы тестовыми данными:

```bash
# Заполнение базы тестовыми данными (продукты, пользователи)
npm run seed

# Применение миграций
npx ts-node src/backend/scripts/migrate-add-currency.ts
npx ts-node src/backend/scripts/migrate-add-firstName.ts
```

**Важно:** Запускайте миграции в указанном порядке, затем seed для заполнения данных.

### Проверка кода
```bash
npm run lint
npm run format
```

## Тестирование

Проект использует два уровня тестирования:

### Unit тесты (Jest)

Unit тесты проверяют отдельные модули backend: сервисы, утилиты, контроллеры.

```bash
# Запуск всех unit тестов
npm test

# Запуск в режиме наблюдения
npm run test:watch

# Запуск с отчётом покрытия
npm run test:coverage

# Подробный вывод
npm run test:verbose
```

**Структура unit тестов:**
- `src/backend/services/__tests__/` - тесты сервисов
- `src/backend/utils/__tests__/` - тесты утилит

### E2E тесты (Cypress)

E2E тесты проверяют критические пользовательские сценарии: авторизацию, просмотр товаров.

```bash
# Запуск E2E тестов в headless режиме
npm run test:e2e

# Открытие Cypress Test Runner (интерактивный режим)
npm run test:e2e:open
```

**Структура E2E тестов:**
- `cypress/e2e/auth.cy.ts` - smoke tests для авторизации
- `cypress/e2e/products.cy.ts` - smoke tests для просмотра товаров

### Запуск всех тестов

```bash
# Последовательный запуск unit + e2e тестов
npm run test:all
```

### Требования для E2E тестов

Перед запуском E2E тестов убедитесь, что:
1. Backend сервер запущен на `http://localhost:3001`
2. Frontend сервер запущен на `http://localhost:3000`

```bash
# В одном терминале
npm run dev:backend

# В другом терминале
npm run dev:frontend

# В третьем терминале
npm run test:e2e
```

## API Endpoints

> **Важно:** Все цены указаны в белорусских рублях (BYN).

### Авторизация

- `POST /api/auth/register` - Регистрация нового пользователя
- `POST /api/auth/login` - Вход в систему
- `POST /api/auth/logout` - Выход из системы
- `GET /api/auth/me` - Получение информации о текущем пользователе
- `GET /api/auth/session-config` - Получение конфигурации сессии (публичная)
- `PUT /api/auth/profile` - Обновление профиля пользователя (имя и email)
- `PUT /api/auth/password` - Изменение пароля пользователя

### Продукты

- `GET /api/products` - Получение списка продуктов с фильтрацией и сортировкой
- `GET /api/products/:id` - Получение продукта по ID

### Корзина

> Все эндпоинты требуют авторизации

- `GET /api/cart` - Получить корзину текущего пользователя
- `POST /api/cart/items` - Добавить товар в корзину
- `PUT /api/cart/items/:productId` - Обновить количество товара в корзине
- `DELETE /api/cart/items/:productId` - Удалить товар из корзины

### Заказы

> Все эндпоинты требуют авторизации

- `POST /api/orders` - Создать новый заказ на основе корзины
- `GET /api/orders` - Получить список заказов текущего пользователя
- `GET /api/orders/:id` - Получить заказ по ID
- `PUT /api/orders/:id/cancel` - Отменить заказ

### Админские эндпоинты

> Все эндпоинты требуют роль admin

- `GET /api/admin/products` - Получить список всех продуктов (с фильтрацией и пагинацией)
- `GET /api/admin/products/:id` - Получить продукт по ID
- `POST /api/admin/products` - Создать новый продукт
- `PUT /api/admin/products/:id` - Обновить продукт
- `GET /api/admin/orders` - Получить список всех заказов (с фильтрацией и пагинацией)
- `GET /api/admin/users` - Получить список пользователей (с фильтрацией и пагинацией)

## Модели данных

### User
```typescript
interface User {
  id: string;
  name: string;
  email: string;
  login: string;
  phone: string;
  password: string;
  createdAt: string;
  updatedAt: string;
}
```

### Product
```typescript
interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: 'BYN';
  category: string;
  inStock: boolean;
  imageUrl?: string;
  discountPercent?: number;
  rating?: number;
  reviewsCount?: number;
  brand: string;
  warranty: string;
  specifications: Record<string, unknown>;
  createdAt: string;
  updatedAt?: string;
}
```

### Cart
```typescript
interface Cart {
  userId: string;
  items: CartItem[];
  updatedAt: string;
  currency: 'BYN';
}
```

### Order
```typescript
interface Order {
  id: string;
  userId: string;
  firstName: string;
  items: OrderItem[];
  deliveryAddress: string;
  phone: string;
  email: string;
  paymentMethod: 'cash' | 'card' | 'online';
  deliveryType?: 'courier' | 'pickup';
  comment?: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  currency: 'BYN';
  totalSum: number;
  createdAt: string;
  updatedAt?: string;
}
```

## Авторизация

Проект использует **session-based аутентификацию**:
- При успешном входе сервер создаёт сессию и устанавливает httpOnly cookie `sessionToken`
- Кука `sessionToken` имеет время жизни 10 минут (настраивается через `SESSION_DURATION_MINUTES`)
- После истечения сессии происходит автоматический выход
- Доступ к защищённым эндпоинтам (корзина, заказы) проверяется через middleware аутентификации
- Для админских эндпоинтов требуется дополнительная проверка роли `admin`

## Git workflow

- `main` - защищённая ветка, только через PR
- `review` - пустая ветка для ревью
- Feature-ветки: `feature/<модуль>-<имя>`

## Документация

- [Архитектура проекта](docs/ARCHITECTURE.md)
- [API документация](docs/API.md)
- [Правила вклада](docs/CONTRIBUTING.md)

## Лицензия

MIT
