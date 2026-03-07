# Changelog

Все заметные изменения проекта L_Shop документируются в этом файле.

Формат основан на [Keep a Changelog](https://keepachangelog.com/ru/1.0.0/),
версионирование следует [SemVer](https://semver.org/lang/ru/).

---

## [Unreleased]

### Добавлено

- Документация по развёртыванию (`DEPLOYMENT.md`)
- Аудит документации (`DOCUMENTATION_AUDIT.md`)

---

## [1.0.0] - 2026-03-06

### Добавлено

#### Backend

- **Модель пользователей** (`user.model.ts`)
  - Поля: id, name, email, login, phone, passwordHash, role, createdAt, updatedAt
  - Роли: user, admin

- **Модель сессий** (`session.model.ts`)
  - Поля: id, userId, token, expiresAt, createdAt
  - Автоматическое продление при активности

- **Модель продуктов** (`product.model.ts`)
  - Поля: id, name, description, price, category, inStock, discountPercent, imageUrl, createdAt
  - Поддержка скидок (discountPercent 0-100)

- **Модель корзины** (`cart.model.ts`)
  - Поля: userId, items[], updatedAt
  - Расчёт итоговой суммы с учётом скидок

- **Модель заказов** (`order.model.ts`)
  - Поля: id, userId, items[], deliveryAddress, phone, email, paymentMethod, deliveryType, comment, status, totalSum
  - Статусы: pending, processing, shipped, delivered, cancelled

- **API авторизации**
  - `POST /api/auth/register` - регистрация пользователя
  - `POST /api/auth/login` - вход в систему
  - `POST /api/auth/logout` - выход из системы
  - `GET /api/auth/me` - получение текущего пользователя

- **API продуктов**
  - `GET /api/products` - список продуктов с фильтрацией и сортировкой
  - `GET /api/products/:id` - получение продукта по ID

- **API корзины**
  - `GET /api/cart` - получение корзины
  - `POST /api/cart/items` - добавление товара
  - `PUT /api/cart/items/:productId` - изменение количества
  - `DELETE /api/cart/items/:productId` - удаление товара

- **API заказов**
  - `POST /api/orders` - создание заказа
  - `GET /api/orders` - список заказов пользователя
  - `GET /api/orders/:orderId` - получение заказа по ID

- **Middleware**
  - `auth.middleware.ts` - проверка авторизации
  - `error.middleware.ts` - обработка ошибок
  - `auth-request.ts` - добавление пользователя в request

- **Утилиты**
  - `file.utils.ts` - работа с JSON файлами
  - `hash.utils.ts` - хэширование паролей (bcrypt)
  - `id.utils.ts` - генерация UUID
  - `validators.ts` - валидация email, phone, password

- **Seed скрипт** для начальных данных

#### Frontend

- **Базовый компонент** (`Component.ts`)
  - Жизненный цикл: mount, unmount, update
  - State management
  - Event handling

- **UI компоненты**
  - `Button.ts` - кнопка с вариантами (primary, secondary, danger) и размерами
  - `Input.ts` - поле ввода с валидацией и состояниями
  - `Modal.ts` - модальное окно

- **Auth компоненты**
  - `AuthModal.ts` - модальное окно авторизации
  - `LoginForm.ts` - форма входа
  - `RegisterForm.ts` - форма регистрации

- **Cart компоненты**
  - `CartItem.ts` - элемент корзины с управлением количеством
  - `CartList.ts` - список товаров в корзине
  - `CartSummary.ts` - итоговая сумма корзины

- **Order компоненты**
  - `DeliveryForm.ts` - форма доставки
  - `OrderSummary.ts` - сводка заказа

- **Product компоненты**
  - `ProductCard.ts` - карточка продукта
  - `ProductList.ts` - список продуктов
  - `ProductFilters.ts` - фильтры и сортировка

- **Layout компоненты**
  - `Header.ts` - шапка с навигацией и авторизацией
  - `Footer.ts` - подвал
  - `Layout.ts` - основной layout

- **Pages**
  - `MainPage.ts` - главная страница с каталогом
  - `CartPage.ts` - страница корзины
  - `DeliveryPage.ts` - страница оформления заказа
  - `ProfilePage.ts` - страница профиля пользователя
  - `PlaygroundPage.ts` - страница для тестирования компонентов

- **Сервисы**
  - `api.ts` - HTTP клиент с обработкой ошибок
  - `auth.service.ts` - сервис авторизации
  - `order.service.ts` - сервис заказов

- **Store** (`store.ts`)
  - Управление глобальным состоянием
  - Подписка на изменения
  - Персистентность в localStorage

- **Router** (`router.ts`)
  - Клиентская маршрутизация
  - Защищённые маршруты

- **Стили**
  - `design-tokens.css` - CSS переменные (цвета, отступы, тени)
  - `variables.css` - дополнительные переменные
  - `utilities.css` - utility классы
  - Компонентные стили: button, input, modal, cart, product-card, header, forms, layout
  - Страницы: delivery, profile

- **Тёмная тема**
  - Автоматическое определение системных настроек
  - Ручное переключение

#### Тесты

- **Backend тесты**
  - Unit тесты для всех сервисов
  - Unit тесты для утилит
  - Smoke тесты API

- **Frontend тесты**
  - Unit тесты для Store
  - Unit тесты для валидаторов

- **Визуальные тесты** (Playwright)
  - Тестирование UI компонентов (Button, Input, ProductCard)
  - Тестирование страниц (MainPage, CartPage, DeliveryPage, ProfilePage)
  - Тестирование тёмной темы
  - Тестирование адаптивности (desktop, tablet, mobile)
  - Тестирование состояний (loading, empty, filled)

#### Документация

- `ARCHITECTURE.md` - архитектура проекта
- `API.md` - документация API
- `BACKEND.md` - документация backend
- `FRONTEND.md` - документация frontend
- `DEVELOPMENT.md` - руководство по разработке
- `CODING_STANDARDS.md` - стандарты кодирования
- `CONTRIBUTING.md` - правила внесения вклада
- `DESIGN_SYSTEM.md` - дизайн-система
- `USE_CASES.md` - варианты использования
- `USER_GUIDE.md` - руководство пользователя
- `ONBOARDING.md` - онбординг для разработчиков
- `VISUAL_TESTING.md` - визуальное тестирование
- `CODE_REVIEW.md` - результаты code review
- `FRONTEND_PLAN.md` - план разработки фронтенда

- **Промпты для разработчиков**
  - `nikita-p.md` - Вариант 17 (Модуль продуктов)
  - `nikita-t.md` - Вариант 24 (Модуль заказов/доставки)
  - `timofey.md` - Вариант 21 (Модуль корзины)

### Безопасность

- Хэширование паролей с bcrypt
- HttpOnly cookies для сессий
- CORS настройка для production
- Валидация всех входных данных
- Защита от XSS через санитизацию

---

## Типы изменений

- `Добавлено` - новые функции
- `Изменено` - изменения в существующих функциях
- `Устарело` - функции, которые будут удалены
- `Удалено` - удалённые функции
- `Исправлено` - исправления ошибок
- `Безопасность` - изменения безопасности

---

## Ссылки

[Unreleased]: https://github.com/Goldie228/L_Shop/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/Goldie228/L_Shop/releases/tag/v1.0.0

---

*Последнее обновление: 6 марта 2026*