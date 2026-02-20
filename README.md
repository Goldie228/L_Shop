# L_Shop - Интернет-магазин (Прототип)

## Описание проекта

L_Shop - это прототип интернет-магазина, разработанный на Express + TypeScript (backend) и SPA на чистом TypeScript (frontend). Проект использует файловое хранение данных (JSON).

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
│   │   ├── middleware/    # Middleware
│   │   ├── models/        # Модели данных
│   │   ├── routes/        # Маршруты
│   │   ├── services/      # Бизнес-логика
│   │   ├── utils/         # Вспомогательные функции
│   │   ├── data/          # JSON-файлы с данными
│   ├── frontend/          # SPA frontend (будет добавлено)
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

### Авторизация
| Метод | Endpoint | Описание |
|-------|----------|----------|
| POST | /api/auth/register | Регистрация пользователя |
| POST | /api/auth/login | Вход в систему |
| POST | /api/auth/logout | Выход из системы |
| GET | /api/auth/me | Текущий пользователь |

### Продукты
| Метод | Endpoint | Описание |
|-------|----------|----------|
| GET | /api/products | Список товаров |
| GET | /api/products/:id | Детали товара |

### Корзина (будет добавлено)
| Метод | Endpoint | Описание |
|-------|----------|----------|
| GET | /api/cart | Корзина пользователя |
| POST | /api/cart/items | Добавить товар |
| PUT | /api/cart/items/:productId | Изменить количество |
| DELETE | /api/cart/items/:productId | Удалить товар |

### Заказы (будет добавлено)
| Метод | Endpoint | Описание |
|-------|----------|----------|
| POST | /api/orders | Создание заказа |
| GET | /api/orders | Список заказов |

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
}
```

### Product
```typescript
interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  inStock: boolean;
  imageUrl?: string;
}
```

### Cart
```typescript
interface Cart {
  userId: string;
  items: CartItem[];
  updatedAt: string;
}
```

### Order
```typescript
interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  deliveryAddress: string;
  phone: string;
  email: string;
  paymentMethod: 'cash' | 'card' | 'online';
  status: 'pending' | 'completed';
  createdAt: string;
}
```

## Авторизация

Проект использует сессии на основе httpOnly cookie:
- Кука `sessionToken` с временем жизни 10 минут
- После истечения - автоматический выход
- Доступ к защищённым ресурсам только для авторизованных

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
