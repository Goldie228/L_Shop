# L_Shop - Интернет-магазин (Прототип)

## Описание проекта

L_Shop - это прототип интернет-магазина, разработанный на Express + TypeScript (backend) и SPA на чистом TypeScript (frontend). Проект использует файловое хранение данных (JSON).

## Команда разработчиков

| Разработчик | Роль | Вариант | Ответственность |
|--------------|------|---------|-----------------|
| **Глеб** | Тимлид | - | Инфраструктура, аутентификация, интеграция |
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

### Запуск в режиме разработки
```bash
npm run dev
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

## API Endpoints

### Авторизация
| Метод | Endpoint | Описание |
|-------|----------|----------|
| POST | /api/auth/register | Регистрация пользователя |
| POST | /api/auth/login | Вход в систему |
| POST | /api/auth/logout | Выход из системы |
| GET | /api/auth/me | Текущий пользователь |

### Продукты (будет добавлено)
| Метод | Endpoint | Описание |
|-------|----------|----------|
| GET | /api/products | Список товаров с фильтрацией |
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

ISC
