# Руководство для новых разработчиков L_Shop

Добро пожаловать в команду L_Shop! Этот документ поможет вам быстро освоиться в проекте.

## Содержание

1. [Быстрый старт](#быстрый-старт)
2. [Стек технологий](#стек-технологий)
3. [Структура проекта](#структура-проекта)
4. [Настройка окружения](#настройка-окружения)
5. [Запуск проекта](#запуск-проекта)
6. [Разработка](#разработка)
7. [Тестирование](#тестирование)
8. [Работа с Git](#работа-с-git)
9. [Дизайн-система](#дизайн-система)
10. [Код-ревью](#код-ревью)
11. [Частые вопросы](#частые-вопросы)
12. [Куда обращаться](#куда-обращаться)

---

## Быстрый старт

```bash
# 1. Клонировать репозиторий
git clone <url-репозитория>
cd L_Shop

# 2. Установить зависимости
npm install

# 3. Создать .env файл
cp .env.example .env

# 4. Заполнить тестовые данные
npm run seed

# 5. Запустить проект
npm run dev
```

После запуска:
- **Frontend**: http://localhost:3002 (или порт из FRONTEND_PORT)
- **Backend API**: http://localhost:3001 (или порт из PORT)

---

## Стек технологий

### Backend
| Технология | Назначение |
|------------|------------|
| **Node.js** | Runtime среда (v18+) |
| **Express** | Web-фреймворк |
| **TypeScript** | Типизация |
| **bcryptjs** | Хеширование паролей |

### Frontend
| Технология | Назначение |
|------------|------------|
| **TypeScript** | Типизация |
| **Vite** | Сборщик и dev-сервер |
| **CSS Variables** | Дизайн-токены |

### Тестирование
| Инструмент | Назначение |
|------------|------------|
| **Jest** | Unit-тесты |
| **Cypress** | E2E тесты |
| **Playwright** | Визуальные тесты |

---

## Структура проекта

```
L_Shop/
├── src/
│   ├── backend/           # Backend (Express + TypeScript)
│   │   ├── app.ts         # Точка входа сервера
│   │   ├── controllers/   # Обработчики HTTP запросов
│   │   ├── services/      # Бизнес-логика
│   │   ├── models/        # TypeScript интерфейсы
│   │   ├── routes/        # Маршруты API
│   │   ├── middleware/    # Middleware функции
│   │   ├── utils/         # Вспомогательные функции
│   │   └── data/          # JSON-хранилище данных
│   │
│   └── frontend/          # Frontend (SPA на TypeScript)
│       ├── app.ts         # Точка входа приложения
│       ├── components/    # UI компоненты
│       │   ├── ui/        # Базовые элементы (Button, Input, Modal)
│       │   ├── auth/      # Компоненты авторизации
│       │   ├── cart/      # Компоненты корзины
│       │   ├── layout/    # Layout (Header, Footer)
│       │   ├── order/     # Компоненты заказа
│       │   ├── pages/     # Страницы приложения
│       │   └── product/   # Компоненты продуктов
│       ├── router/        # Клиентский роутер
│       ├── services/      # API сервисы
│       ├── store/         # Состояние приложения
│       ├── styles/        # CSS стили
│       │   ├── design-tokens.css  # Дизайн-токены
│       │   ├── main.css           # Основные стили
│       │   └── components/        # Стили компонентов
│       └── types/         # TypeScript типы
│
├── docs/                  # Документация
│   ├── API.md             # API документация
│   ├── DESIGN_SYSTEM.md   # Дизайн-система
│   ├── DEVELOPMENT.md     # Инструкция по разработке
│   └── ...
│
├── cypress/               # E2E тесты
├── plans/                 # Планы разработки
├── package.json           # Скрипты и зависимости
├── tsconfig.json          # Настройки TypeScript
└── vite.config.ts         # Настройки Vite
```

---

## Настройка окружения

### Требования
- **Node.js** v18.0.0 или выше
- **npm** v9.0.0 или выше
- **Git**

### Проверка версий
```bash
node --version
npm --version
git --version
```

### Переменные окружения (.env)

```env
# Server Configuration
PORT=3001                    # Порт backend
NODE_ENV=development         # Режим работы

# Frontend Configuration
FRONTEND_PORT=3000           # Порт frontend (Vite может изменить)
FRONTEND_URL=http://localhost:3000

# Session Configuration
SESSION_DURATION_MINUTES=10  # Время жизни сессии

# Data Storage
DATA_DIR=./src/backend/data  # Директория для JSON файлов
```

---

## Запуск проекта

### Режим разработки
```bash
# Запуск frontend и backend параллельно
npm run dev

# Только backend (с автоперезагрузкой)
npm run dev:backend

# Только frontend
npm run dev:frontend
```

### Production сборка
```bash
# Скомпилировать TypeScript
npm run build

# Запустить production версию
npm start
```

### Заполнение тестовыми данными
```bash
npm run seed
```

Создаёт:
- Тестового пользователя `testuser` / `password123`
- Администратора `admin` / `admin123`
- 10 тестовых продуктов

---

## Разработка

### Создание нового компонента

1. **Создать файл компонента** в соответствующей папке `src/frontend/components/`

```typescript
// src/frontend/components/ui/NewComponent.ts
import { Component, ComponentProps } from '../base/Component.js';

export interface NewComponentProps extends ComponentProps {
  text: string;
}

export class NewComponent extends Component<NewComponentProps> {
  public render(): HTMLElement {
    const element = this.createElement('div', {
      className: 'new-component',
    });
    element.textContent = this.props.text;
    return element;
  }
}
```

2. **Создать CSS стили** в `src/frontend/styles/components/`

```css
/* src/frontend/styles/components/new-component.css */
.new-component {
  padding: var(--spacing-md);
  background: var(--color-bg-primary);
  border-radius: var(--radius-md);
}
```

3. **Импортировать стили** в `src/frontend/styles/main.css`

4. **Добавить визуальные тесты** при необходимости

### Стиль кода

- Используем **ESLint** и **Prettier**
- Именование классов: **БЭМ-подобное** (`.block__element--modifier`)
- Именование файлов: **PascalCase** для компонентов, **kebab-case** для стилей

```bash
# Проверка кода
npm run lint

# Автоматическое исправление
npm run lint -- --fix

# Форматирование
npm run format
```

### Conventional Commits

```
<тип>(<область>): <описание>
```

Типы:
- `feat` — новая функция
- `fix` — исправление бага
- `docs` — документация
- `refactor` — рефакторинг
- `test` — тесты
- `chore` — конфигурация

Примеры:
```
feat(auth): add password reset
fix(cart): correct quantity calculation
docs(api): update endpoints documentation
```

---

## Тестирование

### Unit тесты (Jest)
```bash
# Все тесты
npm test

# Режим слежения
npm run test:watch

# С покрытием
npm run test:coverage

# Только backend
npm run test:backend

# Только frontend
npm run test:frontend
```

### E2E тесты (Cypress)
```bash
# Headless режим
npm run test:e2e

# Интерактивный режим
npm run test:e2e:open
```

### Визуальные тесты (Playwright)
```bash
# Запуск тестов
npm run test:visual

# Обновить baseline скриншоты
npm run test:visual -- --update-snapshots

# Только компоненты
npm run test:visual:components

# Посмотреть отчёт
npm run test:visual:report
```

### Структура тестов
- Unit тесты: рядом с тестируемым кодом в папках `__tests__/`
- E2E тесты: `cypress/e2e/`
- Визуальные тесты: `src/frontend/__visual_tests__/`

---

## Работа с Git

### Ветки

| Ветка | Назначение |
|-------|------------|
| `main` | Защищённая, только через PR |
| `feature/<модуль>-<имя>` | Новые функции |
| `fix/<описание>` | Исправление багов |

### Рабочий процесс

```bash
# 1. Обновить main
git checkout main
git pull origin main

# 2. Создать feature-ветку
git checkout -b feature/auth-oauth

# 3. Разрабатывать с коммитами
git add .
git commit -m "feat(auth): add OAuth integration"

# 4. Отправить ветку
git push origin feature/auth-oauth

# 5. Создать Pull Request в GitHub

# 6. После одобрения - смержить
```

### Pull Request

1. Создать PR из feature-ветки в `main`
2. Дождаться прохождения CI тестов
3. Получить одобрение от тимлида
4. Исправить замечания (если есть)
5. Смержить после одобрения

---

## Дизайн-система

### Дизайн-токены

Все CSS-переменные определены в `src/frontend/styles/design-tokens.css`.

#### Цвета
```css
--color-primary-600      /* Основной синий */
--color-secondary-500    /* Фиолетовый акцент */
--color-success-500      /* Успех */
--color-error-500        /* Ошибка */
--color-warning-500      /* Предупреждение */
```

#### Отступы
```css
--spacing-2   /* 8px */
--spacing-4   /* 16px */
--spacing-6   /* 24px */
--spacing-8   /* 32px */
```

#### Типографика
```css
--font-size-sm      /* 14px */
--font-size-base    /* 16px */
--font-size-lg      /* 18px */
--font-size-xl      /* 20px */
```

### Иерархия компонентов

```
Атомы:          Button, Input, Icon
Молекулы:       FormField, SearchBar, CartItem
Организмы:      Header, ProductCard, CartList
Шаблоны:        Layout
Страницы:       MainPage, CartPage, ProfilePage
```

### Тёмная тема

Проект поддерживает тёмную тему. Все компоненты должны иметь стили для `.dark-theme`.

```css
:root.dark-theme .my-component {
  background: var(--color-bg-secondary-dark);
  color: var(--color-text-primary-dark);
}
```

---

## Код-ревью

### Чеклист для ревьюера

- [ ] Код следует стайлгайду
- [ ] Есть необходимые тесты
- [ ] Нет hardcoded значений (используются токены)
- [ ] Компоненты reusable и хорошо типизированы
- [ ] Нет security проблем
- [ ] Документация обновлена при необходимости

### Чеклист для автора PR

- [ ] Код компилируется без ошибок
- [ ] Все тесты проходят
- [ ] Линтер не выдаёт ошибок
- [ ] Описание PR понятно
- [ ] Связанные issues указаны

---

## Частые вопросы

### Порт занят
```bash
# Найти процесс
lsof -i :3001

# Убить процесс
kill -9 <PID>
```

### Модули не найдены
```bash
rm -rf node_modules package-lock.json
npm install
```

### Тесты падают
- Проверьте, что сервер запущен
- Проверьте, что seed данные созданы
- Очистите кэш: `npm test -- --clearCache`

### CSS переменные не работают
- Убедитесь, что `design-tokens.css` импортирован в `main.css`
- Проверьте, что стили загружаются в правильном порядке

---

## Куда обращаться

| Вопрос | Куда обратиться |
|--------|-----------------|
| Технические вопросы | Тимлид (Глеб) |
| Backend модуль продуктов | Никита П. |
| Backend модуль корзины | Тимофей |
| Backend модуль заказов | Никита Т. |
| Документация | Создать issue в репозитории |

### Полезные ссылки

- [API документация](API.md)
- [Дизайн-система](DESIGN_SYSTEM.md)
- [Инструкция по разработке](DEVELOPMENT.md)
- [Стандарты кода](CODING_STANDARDS.md)
- [Визуальное тестирование](VISUAL_TESTING.md)

---

*Документ создан: март 2026*