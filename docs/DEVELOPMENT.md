# Инструкция по разработке L_Shop

## Содержание

1. [Введение](#введение)
2. [Требования к окружению](#требования-к-окружению)
3. [Установка и запуск проекта](#установка-и-запуск-проекта)
4. [Структура проекта](#структура-проекта)
5. [Работа с Git](#работа-с-git)
6. [Запуск тестов](#запуск-тестов)
7. [Отладка и логирование](#отладка-и-логирование)
8. [Частые проблемы и решения](#частые-проблемы-и-решения)
9. [Полезные команды](#полезные-команды)
10. [Дополнительные ресурсы](#дополнительные-ресурсы)

---

## Введение

L_Shop — это прототип интернет-магазина, разработанный на Express + TypeScript (backend) и SPA на чистом TypeScript (frontend). Проект использует файловое хранение данных (JSON) без внешних баз данных.

### Цель проекта

Создание функционального прототипа интернет-магазина с:
- Полноценной системой аутентификации
- Каталогом товаров с фильтрацией
- Корзиной покупок
- Оформлением заказов

### Команда разработчиков

| Разработчик | Роль | Вариант | Ответственность |
|--------------|------|---------|-----------------|
| **Глеб** | Тимлид | 8 | Инфраструктура, аутентификация, интеграция |
| **Никита П.** | Backend/Frontend | 17 | Модуль продуктов |
| **Тимофей** | Backend/Frontend | 21 | Модуль корзины |
| **Никита Т.** | Backend/Frontend | 24 | Модуль заказов/доставки |

---

## Требования к окружению

### Обязательные требования

| Программное обеспечение | Минимальная версия | Рекомендуемая версия |
|-------------------------|---------------------|----------------------|
| Node.js | v18.0.0 | v20.x LTS |
| npm | v9.0.0 | v10.x |

### Проверка версий

```bash
# Проверить версию Node.js
node --version

# Проверить версию npm
npm --version
```

### Рекомендуемые инструменты

- **VS Code** — редактор кода
- **Git** — система контроля версий
- **Postman** или **Insomnia** — тестирование API

### Расширения VS Code (рекомендуемые)

- ESLint
- Prettier — Code formatter
- TypeScript Hero
- Thunder Client (для тестирования API)

---

## Установка и запуск проекта

### Первичная установка

```bash
# 1. Клонировать репозиторий
git clone <url-репозитория>
cd L_Shop

# 2. Установить зависимости
npm install

# 3. Скопировать файл окружения
cp .env.example .env

# 4. Редактировать .env при необходимости
```

### Конфигурация окружения (.env)

Проект использует файл `.env` для конфигурации. Скопируйте пример и настройте при необходимости:

```bash
cp .env.example .env
```

#### Переменные окружения

| Переменная | По умолчанию | Описание |
|------------|--------------|----------|
| `PORT` | `3001` | Порт backend сервера |
| `FRONTEND_PORT` | `3000` | Порт frontend сервера |
| `FRONTEND_URL` | `http://localhost:3000` | URL frontend для CORS |
| `VITE_API_URL` | `http://localhost:3001` | URL API для frontend (используется в Vite) |
| `NODE_ENV` | `development` | Режим работы |
| `SESSION_DURATION_MINUTES` | `10` | Время жизни сессии (минуты) |
| `DATA_DIR` | `./src/backend/data` | Директория для JSON-файлов |

#### Пример .env файла

```env
# Server Configuration
PORT=3001
NODE_ENV=development

# Frontend Configuration
FRONTEND_PORT=3000
FRONTEND_URL=http://localhost:3000

# API Configuration (for Vite frontend)
VITE_API_URL=http://localhost:3001

# Session Configuration
SESSION_DURATION_MINUTES=10

# Data Storage
DATA_DIR=./src/backend/data
```

### Запуск в режиме разработки

**Рекомендуемый способ** — одновременный запуск frontend и backend:

```bash
# Запуск frontend и backend параллельно (через concurrently)
npm run dev
```

Эта команда запускает оба сервера:
- Backend: `http://localhost:3001`
- Frontend: `http://localhost:3000`

**Альтернативные способы:**

```bash
# Только backend с автоперезагрузкой (nodemon)
npm run dev:backend

# Только frontend
npm run dev:frontend

# Запуск frontend на конкретном порту
FRONTEND_PORT=8080 npm run dev:frontend
```

### Компиляция проекта

```bash
# Сгенерировать JavaScript файлы в dist/
npm run build
```

### Запуск production версии

```bash
# Запуск скомпилированного проекта
npm start
```

### Заполнение тестовыми данными

```bash
# Создать тестовых пользователей и данные
npm run seed
```

---

## Структура проекта

```
L_Shop/
├── src/
│   ├── backend/                 # Backend на Express + TypeScript
│   │   ├── app.ts               # Точка входа, конфигурация сервера
│   │   ├── config/              # Конфигурационные файлы
│   │   │   └── constants.ts     # Константы проекта
│   │   ├── controllers/         # Контроллеры (обработка HTTP-запросов)
│   │   │   ├── auth.controller.ts
│   │   │   ├── cart.controller.ts
│   │   │   ├── order.controller.ts
│   │   │   └── product.controller.ts
│   │   ├── data/                # JSON-файлы с данными
│   │   │   ├── users.json
│   │   │   ├── sessions.json
│   │   │   ├── products.json
│   │   │   ├── carts.json
│   │   │   └── orders.json
│   │   ├── middleware/          # Middleware (промежуточная обработка)
│   │   │   ├── auth.middleware.ts    # Проверка авторизации
│   │   │   ├── error.middleware.ts   # Обработка ошибок
│   │   │   └── auth-request.ts      # Расширение Request
│   │   ├── models/              # Модели данных (TypeScript interfaces)
│   │   │   ├── user.model.ts
│   │   │   ├── session.model.ts
│   │   │   ├── product.model.ts
│   │   │   ├── cart.model.ts
│   │   │   └── order.model.ts
│   │   ├── routes/              # Маршруты API
│   │   │   ├── auth.routes.ts
│   │   │   ├── cart.routes.ts
│   │   │   ├── order.routes.ts
│   │   │   └── product.routes.ts
│   │   ├── scripts/             # Скрипты
│   │   │   └── seed.ts          # Заполнение тестовыми данными
│   │   ├── services/            # Бизнес-логика
│   │   │   ├── user.service.ts
│   │   │   ├── session.service.ts
│   │   │   ├── cart.service.ts
│   │   │   ├── order.service.ts
│   │   │   └── product.service.ts
│   │   ├── types/               # TypeScript типы и декларации
│   │   │   └── express.d.ts     # Расширение Express Request
│   │   ├── utils/               # Вспомогательные функции
│   │   │   ├── file.utils.ts    # Работа с файлами
│   │   │   ├── hash.utils.ts    # Хеширование паролей
│   │   │   ├── id.utils.ts      # Генерация ID
│   │   │   └── validators.ts    # Валидация данных
│   │   └── __tests__/           # Тесты
│   │
│   └── frontend/                # Frontend приложение
│       ├── index.html           # HTML точка входа
│       ├── app.ts               # TypeScript точка входа
│       ├── components/          # UI компоненты
│       │   ├── auth/            # Компоненты авторизации
│       │   ├── base/            # Базовый компонент
│       │   ├── cart/            # Компоненты корзины
│       │   ├── layout/          # Компоненты layout
│       │   ├── order/           # Компоненты заказа
│       │   ├── pages/           # Страницы
│       │   ├── product/         # Компоненты продуктов
│       │   └── ui/              # UI элементы
│       ├── router/              # Клиентский роутер
│       ├── services/            # API сервисы
│       ├── store/               # Состояние приложения
│       ├── styles/              # CSS стили
│       └── types/               # TypeScript типы
│
├── docs/                        # Документация
│   ├── API.md                   # API документация
│   ├── ARCHITECTURE.md          # Архитектура проекта
│   ├── BACKEND.md               # Документация бэкенда
│   ├── FRONTEND.md              # Документация фронтенда
│   ├── USE_CASES.md             # Use Cases
│   ├── CODING_STANDARDS.md      # Стандарты кода
│   ├── DESIGN_SYSTEM.md         # Дизайн-система
│   ├── DEVELOPMENT.md           # Этот файл
│   └── CONTRIBUTING.md          # Правила вклада
│
├── cypress/                     # E2E тесты
├── plans/                       # Планы разработки
├── dist/                        # Скомпилированный код (создаётся автоматически)
├── node_modules/                # Зависимости (не версионируется)
├── .env.example                 # Пример конфигурации
├── .eslintrc.js                 # Настройки ESLint
├── .prettierrc.js               # Настройки Prettier
├── .gitignore                   # Игнорируемые файлы Git
├── jest.config.js               # Настройки Jest
├── jest.frontend.config.js      # Настройки Jest для frontend
├── cypress.config.ts            # Настройки Cypress
├── package.json                 # Описание проекта и скрипты
├── tsconfig.json                # Настройки TypeScript
├── vite.config.ts               # Настройки Vite
└── LICENSE                      # Лицензия MIT
```

### Описание каталогов

#### `src/backend/`

Основной каталог backend. Содержит весь код серверной части.

#### `src/backend/config/`

Конфигурационные файлы с константами и настройками.

#### `src/backend/controllers/`

Контроллеры принимают HTTP-запросы, проводят валидацию входных данных и возвращают ответы. Не должны содержать бизнес-логику.

#### `src/backend/middleware/`

Middleware — промежуточные функции, которые выполняются до контроллеров:
- `auth.middleware.ts` — проверка аутентификации
- `error.middleware.ts` — централизованная обработка ошибок

#### `src/backend/models/`

TypeScript интерфейсы и типы данных. Описывают структуру хранимых объектов.

#### `src/backend/routes/`

Описание маршрутов API. Связывают URL с контроллерами.

#### `src/backend/services/`

Бизнес-логика приложения. Работа с данными, выполнение операций.

#### `src/backend/utils/`

Вспомогательные функции:
- хеширование паролей
- генерация ID
- валидация данных
- работа с файлами

#### `src/backend/data/`

JSON-файлы с данными пользователей, сессий, товаров и т.д.

---

## Работа с Git

### Ветки

| Ветка | Назначение |
|-------|------------|
| `main` | Защищённая ветка, только через PR |
| `review` | Пустая ветка для ревью |
| `feature/<модуль>-<имя>` | Feature-ветки для новых функций |
| `fix/<описание>` | Ветки для исправления багов |

### Создание feature-ветки

```bash
# Создать новую ветку от main
git checkout main
git pull origin main
git checkout -b feature/auth-login

# Работать в ветке
git add .
git commit -m "feat(auth): add login functionality"

# Отправить ветку в репозиторий
git push origin feature/auth-login
```

### Conventional Commits

Используем формат conventional commits:

```
<тип>(<область>): <описание>

[необязательное тело]
```

#### Типы коммитов

| Тип | Описание |
|-----|----------|
| `feat` | Новая функция |
| `fix` | Исправление бага |
| `docs` | Изменение документации |
| `style` | Форматирование, недостающие точки с запятой |
| `refactor` | Рефакторинг без изменения функциональности |
| `test` | Добавление или исправление тестов |
| `chore` | Обновление зависимостей, конфигурации |

#### Примеры

```bash
feat(auth): add password hashing
fix(cart): correct item quantity calculation
docs(api): update authentication endpoints
refactor(user): extract validation to utils
test(session): add unit tests for session service
```

### Pull Request

1. Создать ветку от `main`
2. Внести изменения
3. Открыть Pull Request в `main`
4. Ждать code review
5. Исправить замечания
6. Смержить после одобрения

---

## Запуск тестов

### Все тесты

```bash
npm test
```

### Режим слежения

```bash
npm run test:watch
```

### Отчёт о покрытии

```bash
npm run test:coverage
```

### E2E тесты (Cypress)

```bash
# Headless режим
npm run test:e2e

# Интерактивный режим
npm run test:e2e:open
```

### Структура тестов

Тесты располагаются в каталогах `__tests__`:

```
src/backend/
├── services/
│   └── __tests__/
│       ├── user.service.test.ts
│       ├── session.service.test.ts
│       ├── cart.service.test.ts
│       ├── order.service.test.ts
│       └── product.service.test.ts
├── controllers/
│   └── __tests__/
│       └── product.controller.test.ts
└── utils/
    └── __tests__/
        ├── validators.test.ts
        ├── id.utils.test.ts
        └── hash.utils.test.ts

src/frontend/
└── __tests__/
    └── setup.ts

cypress/
└── e2e/
    └── auth.cy.ts
```

### Именование тестов

- Файлы тестов: `<имя>.test.ts`
- Описывают поведение: "должен...", "при ... должен..."

---

## Отладка и логирование

### Логирование в контроллерах

```typescript
// Используйте console.log для отладки
console.log('[AuthController] Login attempt:', { login });

// Используйте console.error для ошибок
console.error('[AuthController] Login error:', error);
```

### Отладка в VS Code

1. Открыть файл для отладки
2. Поставить точку останова (F9)
3. Запустить отладку (F5)
4. Выбрать конфигурацию "Node.js"

### Конфигурация отладки (.vscode/launch.json)

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Dev",
      "runtimeExecutable": "npm",
      "runtimeArgs": ["run", "dev"],
      "console": "integratedTerminal"
    }
  ]
}
```

---

## Частые проблемы и решения

### Порт уже используется

**Ошибка:** `Error: listen EADDRINUSE: address already in use :::3000`

**Решение:**
```bash
# Найти процесс на порту 3000
lsof -i :3000

# Убить процесс
kill -9 <PID>
```

### Модули не найдены

**Ошибка:** `Cannot find module '...'`

**Решение:**
```bash
# Переустановить зависимости
rm -rf node_modules package-lock.json
npm install
```

### Ошибки TypeScript

**Ошибка:** `Type '...' is not assignable to type '...'`

**Решение:**
- Проверьте соответствие типов
- Используйте типизацию аргументов и возвращаемых значений
- Избегайте `any`

### ESLint ошибки

**Ошибка:** `ESLint: ...`

**Решение:**
```bash
# Автоматически исправить простые ошибки
npm run lint -- --fix

# Отформатировать код
npm run format
```

### Тесты не проходят

**Ошибка:** Тесты падают

**Решение:**
- Проверьте, что все зависимости установлены
- Проверьте, что файлы данных существуют
- Запустите `npm run seed` для создания тестовых данных

---

## Полезные команды

### Разработка

```bash
# Одновременный запуск frontend и backend (рекомендуется)
npm run dev

# Запуск только backend с автоперезагрузкой
npm run dev:backend

# Запуск только frontend
npm run dev:frontend

# Запуск frontend на конкретном порту
FRONTEND_PORT=8080 npm run dev:frontend

# Проверка кода
npm run lint

# Форматирование кода
npm run format

# Компиляция
npm run build
```

### Доступные URL

При запуске `npm run dev`:

| Сервис | URL | Описание |
|--------|-----|----------|
| Backend API | `http://localhost:3001` | Express server |
| Frontend | `http://localhost:3000` | SPA приложение |

**Примечание:** Порты можно изменить через переменные окружения в `.env` файле.

### Тестирование

```bash
# Запуск всех тестов
npm test

# Запуск конкретного теста
npm test -- --testPathPattern=validators

# Режим слежения
npm run test:watch

# Отчёт о покрытии
npm run test:coverage

# E2E тесты
npm run test:e2e
npm run test:e2e:open
```

### Git

```bash
# Статус
git status

# История коммитов
git log --oneline -10

# Разница
git diff

# Отправить изменения
git add .
git commit -m "feat: description"
git push origin <branch>
```

### NPM

```bash
# Проверить устаревшие пакеты
npm outdated

# Обновить пакеты
npm update

# Установить конкретную версию
npm install package@version
```

---

## Дополнительные ресурсы

- [Архитектура проекта](ARCHITECTURE.md)
- [API документация](API.md)
- [Стандарты оформления кода](CODING_STANDARDS.md)
- [Правила вклада](CONTRIBUTING.md)
- [Дизайн-система](DESIGN_SYSTEM.md)

---

*Документ обновлён: март 2026*