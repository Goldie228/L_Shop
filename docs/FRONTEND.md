# Документация фронтенда L_Shop

## Содержание

1. [Обзор архитектуры](#обзор-архитектуры)
2. [Технологии](#технологии)
3. [Структура проекта](#структура-проекта)
4. [Архитектурные слои](#архитектурные-слои)
5. [Роутинг](#роутинг)
6. [Управление состоянием](#управление-состоянием)
7. [Компоненты](#компоненты)
8. [Сервисы](#сервисы)
9. [Типы данных](#типы-данных)
10. [Стили и дизайн-система](#стили-и-дизайн-система)
11. [Работа с API](#работа-с-api)
12. [Тестирование](#тестирование)
13. [Запуск и разработка](#запуск-и-разработка)

---

## Обзор архитектуры

L_Shop фронтенд построен как **SPA (Single Page Application)** на TypeScript с компонентным подходом.

```
┌─────────────────────────────────────────────────────────────┐
│                          App                                 │
│                   (Инициализация приложения)                 │
├─────────────────────────────────────────────────────────────┤
│                        Router                                │
│              (Управление навигацией)                         │
├─────────────────────────────────────────────────────────────┤
│                        Layout                                │
│         (Header, Main Content, Footer)                       │
├─────────────────────────────────────────────────────────────┤
│                       Pages                                  │
│      (HomePage, CartPage, DeliveryPage, ProfilePage)         │
├─────────────────────────────────────────────────────────────┤
│                     Components                               │
│    (UI компоненты, формы, модальные окна, карточки)          │
├─────────────────────────────────────────────────────────────┤
│                       Store                                  │
│             (Глобальное состояние)                           │
├─────────────────────────────────────────────────────────────┤
│                      Services                                │
│        (API клиент, AuthService, OrderService)               │
└─────────────────────────────────────────────────────────────┘
```

### Ключевые принципы

- **Компонентный подход** - переиспользуемые UI компоненты
- **Реактивность** - подписка на изменения состояния
- **Типобезопасность** - TypeScript без `any`
- **Разделение ответственности** - чёткое разделение слоёв
- **Data-атрибуты** - для E2E тестирования

---

## Технологии

| Технология | Версия | Назначение |
|------------|--------|------------|
| TypeScript | 5.x | Основной язык |
| Vite | 5.x | Сборка и dev-сервер |
| ESLint | 8.x | Линтинг |
| Jest | 29.x | Unit тестирование |
| Cypress | 13.x | E2E тестирование |

---

## Структура проекта

```
src/frontend/
├── index.html                 # HTML точка входа
├── app.ts                     # TypeScript точка входа
├── vite-env.d.ts              # Типы для Vite
├── tsconfig.json              # Конфигурация TypeScript
│
├── components/
│   ├── base/
│   │   └── Component.ts       # Базовый класс компонента
│   │
│   ├── auth/
│   │   ├── AuthModal.ts       # Модальное окно авторизации
│   │   ├── LoginForm.ts       # Форма входа
│   │   └── RegisterForm.ts    # Форма регистрации
│   │
│   ├── layout/
│   │   ├── Layout.ts          # Основной макет
│   │   ├── Header.ts          # Шапка сайта
│   │   └── Footer.ts          # Подвал сайта
│   │
│   ├── ui/
│   │   ├── Button.ts          # Кнопка
│   │   ├── Input.ts           # Поле ввода
│   │   └── Modal.ts           # Модальное окно
│   │
│   ├── cart/
│   │   ├── CartItem.ts        # Элемент корзины
│   │   ├── CartList.ts        # Список корзины
│   │   └── CartSummary.ts     # Итого корзины
│   │
│   ├── order/
│   │   ├── DeliveryForm.ts    # Форма доставки
│   │   └── OrderSummary.ts    # Сводка заказа
│   │
│   └── pages/
│       ├── CartPage.ts        # Страница корзины
│       ├── DeliveryPage.ts    # Страница оформления
│       └── ProfilePage.ts     # Страница профиля
│
├── router/
│   └── router.ts              # Клиентский роутер
│
├── services/
│   ├── api.ts                 # HTTP клиент
│   ├── auth.service.ts        # Сервис авторизации
│   └── order.service.ts       # Сервис заказов
│
├── store/
│   └── store.ts               # Глобальное состояние
│
├── styles/
│   ├── main.css               # Основные стили
│   ├── design-tokens.css      # Дизайн-токены
│   ├── variables.css          # CSS переменные
│   ├── utilities.css          # Utility классы
│   │
│   ├── components/            # Стили компонентов
│   │   ├── button.css
│   │   ├── input.css
│   │   ├── modal.css
│   │   ├── header.css
│   │   ├── forms.css
│   │   ├── layout.css
│   │   └── cart.css
│   │
│   └── pages/                 # Стили страниц
│       ├── profile.css
│       └── delivery.css
│
├── types/
│   ├── user.ts                # Типы пользователя
│   ├── api.ts                 # Типы API
│   ├── cart.ts                # Типы корзины
│   └── order.ts               # Типы заказа
│
└── __tests__/
    ├── setup.ts               # Настройка тестов
    └── ...                    # Тесты
```

---

## Архитектурные слои

### 1. App (Точка входа)

Класс `App` инициализирует приложение:

```typescript
class App {
  private layout: Layout | null = null;
  private authModal: AuthModal | null = null;

  async init(): Promise<void> {
    // 1. Проверить авторизацию
    await this.checkAuth();

    // 2. Настроить роутер
    this.setupRouter();

    // 3. Отрендерить макет
    this.renderLayout();

    // 4. Инициализировать роутер
    router.init();
  }
}
```

### 2. Router (Маршрутизация)

Клиентский роутер на History API:

```typescript
class Router {
  register(path: string, handler: () => void): void;
  registerRoutes(routes: Route[]): void;
  navigate(path: string): void;
  subscribe(listener: RouteChangeListener): () => void;
  init(): void;
}
```

### 3. Store (Состояние)

Singleton класс для управления состоянием:

```typescript
class Store {
  getState(): AppState;
  getUser(): User | null;
  isAuthenticated(): boolean;
  setUser(user: User | null): void;
  subscribe(key, listener): () => void;
  startSessionTimer(): void;
}
```

---

## Роутинг

### Определение маршрутов

```typescript
export const APP_ROUTES: Route[] = [
  { path: '/', component: 'HomePage', title: 'Главная' },
  { 
    path: '/profile', 
    component: 'ProfilePage', 
    title: 'Профиль',
    requiresAuth: true, 
    authRedirect: '/' 
  },
  { 
    path: '/cart', 
    component: 'CartPage', 
    title: 'Корзина',
    requiresAuth: true, 
    authRedirect: '/' 
  },
  { 
    path: '/delivery', 
    component: 'DeliveryPage', 
    title: 'Оформление заказа',
    requiresAuth: true, 
    authRedirect: '/' 
  },
  { 
    path: '/orders', 
    component: 'OrdersPage', 
    title: 'Мои заказы',
    requiresAuth: true, 
    authRedirect: '/' 
  },
  { path: '*', component: 'NotFoundPage', title: 'Страница не найдена' }
];
```

### Защищённые маршруты

Маршруты с `requiresAuth: true` проверяют авторизацию:

```typescript
if (route.requiresAuth && !store.isAuthenticated()) {
  router.navigate(route.authRedirect || '/');
  return;
}
```

### Использование роутера

```typescript
// Программная навигация
router.navigate('/cart');

// Подписка на изменения
router.subscribe((route) => {
  console.log('Текущий маршрут:', route.path);
});
```

---

## Управление состоянием

### Интерфейс состояния

```typescript
interface AppState {
  user: UserState;
  route: string;
  modal: {
    isOpen: boolean;
    type: string | null;
  };
}

interface UserState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}
```

### Работа со Store

```typescript
import { store } from './store/store.js';

// Получить состояние
const state = store.getState();
const user = store.getUser();
const isAuth = store.isAuthenticated();

// Изменить состояние
store.setUser(user);
store.setLoading(true);
store.setError('Ошибка');

// Подписка на изменения
const unsubscribe = store.subscribe('user', (userState) => {
  console.log('User state changed:', userState);
});
```

### Таймер сессии

Автоматический logout через 10 минут:

```typescript
// Запускается автоматически при setUser
store.startSessionTimer();

// Сбросить таймер при активности пользователя
store.resetSessionTimer();

// Остановить таймер
store.clearSessionTimer();
```

---

## Компоненты

### Базовый компонент

Абстрактный класс для всех компонентов:

```typescript
export abstract class Component<T = {}> {
  protected element: HTMLElement;
  protected props: T;

  constructor(props: T, tagName: string = 'div', className: string = '') {
    this.props = props;
    this.element = document.createElement(tagName);
    if (className) {
      this.element.className = className;
    }
  }

  abstract render(): HTMLElement;

  mount(container: HTMLElement): void {
    container.appendChild(this.element);
  }

  destroy(): void {
    this.element.remove();
  }
}
```

### UI компоненты

#### Button

```typescript
interface ButtonProps {
  text: string;
  variant?: 'primary' | 'secondary' | 'danger';
  type?: 'button' | 'submit';
  disabled?: boolean;
  onClick?: () => void;
}

const button = new Button({
  text: 'Войти',
  variant: 'primary',
  onClick: () => console.log('Clicked!')
});
```

#### Input

```typescript
interface InputProps {
  type: 'text' | 'email' | 'password' | 'tel';
  name: string;
  placeholder?: string;
  value?: string;
  required?: boolean;
  error?: string;
  onChange?: (value: string) => void;
}
```

#### Modal

```typescript
interface ModalProps {
  title?: string;
  content: HTMLElement;
  onClose?: () => void;
}

const modal = new Modal(props);
modal.open();
modal.close();
```

### Компоненты аутентификации

#### AuthModal

Модальное окно с вкладками Вход/Регистрация:

```typescript
interface AuthModalProps {
  onAuth?: () => void;
}

const authModal = new AuthModal({ onAuth: handleAuthSuccess });
authModal.open('login');    // Открыть форму входа
authModal.open('register'); // Открыть форму регистрации
```

#### LoginForm

```typescript
interface LoginFormProps {
  onSuccess?: (user: User) => void;
  onSwitchToRegister?: () => void;
}
```

#### RegisterForm

```typescript
interface RegisterFormProps {
  onSuccess?: (user: User) => void;
  onSwitchToLogin?: () => void;
}
```

**Data-атрибут:** `data-registration` на форме.

### Компоненты корзины

#### CartPage

Страница корзины с:
- Списком товаров
- Изменением количества
- Удалением товаров
- Подсчётом итоговой суммы
- Кнопкой оформления заказа

#### CartItem

Карточка товара в корзине:

```typescript
interface CartItemProps {
  item: CartItemWithProduct;
  onQuantityChange?: (quantity: number) => void;
  onRemove?: () => void;
}
```

#### CartSummary

Блок с итоговой суммой и кнопкой оформления.

### Компоненты заказа

#### DeliveryPage

Страница оформления заказа:
- Форма доставки (адрес, телефон, email)
- Выбор способа оплаты
- Выбор типа доставки
- Комментарий к заказу
- Сводка заказа

**Data-атрибут:** `data-delivery` на форме.

#### DeliveryForm

```typescript
interface DeliveryFormProps {
  onSubmit?: (data: DeliveryFormData) => void;
}

interface DeliveryFormData {
  deliveryAddress: string;
  phone: string;
  email: string;
  paymentMethod: 'cash' | 'card' | 'online';
  deliveryType?: 'courier' | 'pickup';
  comment?: string;
}
```

### Компоненты layout

#### Layout

Основной макет приложения:

```typescript
interface LayoutProps {
  onLoginClick?: () => void;
}

const layout = new Layout({ onLoginClick: () => authModal.open() });
layout.getMainContent(); // Получить контейнер для страниц
```

#### Header

Шапка с:
- Логотипом
- Навигацией
- Кнопкой входа / именем пользователя
- Счётчиком корзины

```typescript
interface HeaderProps {
  isAuthenticated: boolean;
  user: User | null;
  cartItemsCount?: number;
  onLoginClick?: () => void;
  onLogoutClick?: () => void;
}
```

---

## Сервисы

### API клиент

Базовый HTTP клиент:

```typescript
class ApiClient {
  async request<T>(endpoint: string, config: RequestConfig): Promise<T>;
  async get<T>(endpoint: string, params?: Record<string, string>): Promise<T>;
  async post<T>(endpoint: string, body?: unknown): Promise<T>;
  async put<T>(endpoint: string, body?: unknown): Promise<T>;
  async delete<T>(endpoint: string): Promise<T>;
}

// Экземпляр по умолчанию
export const api = new ApiClient({
  baseUrl: 'http://localhost:3001'
});
```

**Особенности:**
- Автоматическое включение cookies (`credentials: 'include'`)
- Таймаут 10 секунд
- Обработка ошибок API

### AuthService

Сервис аутентификации:

```typescript
class AuthService {
  // Регистрация
  static async register(data: RegisterUserData): Promise<User>

  // Вход
  static async login(data: LoginUserData): Promise<User>

  // Выход
  static async logout(): Promise<void>

  // Получить текущего пользователя
  static async getCurrentUser(): Promise<User | null>

  // Подписка на события аутентификации
  static on(event: AuthEvent, callback: () => void): void
}

type AuthEvent = 'login' | 'logout' | 'sessionExpired';
```

### OrderService

Сервис заказов:

```typescript
class OrderService {
  // Создать заказ
  static async createOrder(data: CreateOrderData): Promise<Order>

  // Получить список заказов
  static async getOrders(): Promise<Order[]>

  // Получить заказ по ID
  static async getOrderById(orderId: string): Promise<Order>
}
```

---

## Типы данных

### User

```typescript
interface User {
  id: string;
  name: string;
  login: string;
  email: string;
  phone: string;
  role: 'user' | 'admin';
  createdAt: string;
  updatedAt: string;
}

interface RegisterUserData {
  name: string;
  login: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

interface LoginUserData {
  loginOrEmail: string;
  password: string;
}
```

### API Response

```typescript
interface ApiResponse<T = unknown> {
  data?: T;
  message?: string;
  error?: string;
}

interface ApiError {
  message: string;
  error: string;
  status: number;
}

class NetworkError extends Error {
  constructor(message: string = 'Ошибка сети') {
    super(message);
  }
}
```

### Валидация

```typescript
interface ValidationResult {
  isValid: boolean;
  error: string | null;
}

// Функции валидации
function validateEmail(email: string): ValidationResult;
function validateLogin(loginOrEmail: string): ValidationResult;
function validatePassword(password: string): ValidationResult;
function validatePhone(phone: string): ValidationResult;
function validateName(name: string): ValidationResult;
function validatePasswordConfirmation(password: string, confirm: string): ValidationResult;
```

---

## Стили и дизайн-система

### Дизайн-токены (design-tokens.css)

```css
:root {
  /* Цвета */
  --color-primary: #2563eb;
  --color-primary-hover: #1d4ed8;
  --color-success: #22c55e;
  --color-warning: #f59e0b;
  --color-error: #ef4444;

  /* Фоновые цвета */
  --color-bg-primary: #ffffff;
  --color-bg-secondary: #f8fafc;
  --color-bg-tertiary: #f1f5f9;

  /* Текст */
  --color-text-primary: #1e293b;
  --color-text-secondary: #64748b;
  --color-text-muted: #94a3b8;

  /* Границы */
  --color-border: #e2e8f0;
  --color-border-focus: #2563eb;

  /* Типографика */
  --font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  --font-size-xs: 0.75rem;   /* 12px */
  --font-size-sm: 0.875rem;  /* 14px */
  --font-size-base: 1rem;    /* 16px */
  --font-size-lg: 1.125rem;  /* 18px */
  --font-size-xl: 1.25rem;   /* 20px */

  /* Отступы */
  --spacing-xs: 0.25rem;  /* 4px */
  --spacing-sm: 0.5rem;   /* 8px */
  --spacing-md: 1rem;     /* 16px */
  --spacing-lg: 1.5rem;   /* 24px */
  --spacing-xl: 2rem;     /* 32px */

  /* Скругления */
  --radius-sm: 0.25rem;   /* 4px */
  --radius-md: 0.5rem;    /* 8px */
  --radius-lg: 0.75rem;   /* 12px */

  /* Тени */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);
}
```

### Тёмная тема

```css
.dark-theme {
  --color-bg-primary: #0f172a;
  --color-bg-secondary: #1e293b;
  --color-text-primary: #f8fafc;
  --color-text-secondary: #94a3b8;
  --color-border: #334155;
}

.light-theme {
  --color-bg-primary: #ffffff;
  --color-bg-secondary: #f8fafc;
  --color-text-primary: #1e293b;
  --color-text-secondary: #64748b;
  --color-border: #e2e8f0;
}
```

### Utility классы

```css
.text-center { text-align: center; }
.text-secondary { color: var(--color-text-secondary); }
.container { max-width: 1200px; margin: 0 auto; padding: var(--spacing-md); }
```

---

## Работа с API

### Примеры использования

```typescript
import { api } from './services/api.js';

// GET запрос
const products = await api.get<Product[]>('/api/products');

// POST запрос
const user = await api.post<User>('/api/auth/login', {
  login: 'ivan123',
  password: 'secret'
});

// PUT запрос
const cart = await api.put<Cart>('/api/cart/items/product-id', {
  quantity: 2
});

// DELETE запрос
await api.delete('/api/cart/items/product-id');
```

### Обработка ошибок

```typescript
import { ApiError, NetworkError } from './types/api.js';

try {
  const user = await api.post('/api/auth/login', credentials);
} catch (error) {
  if (error instanceof ApiError) {
    console.error('API Error:', error.message, error.status);
    
    if (error.error === 'INVALID_CREDENTIALS') {
      // Показать ошибку авторизации
    }
  } else if (error instanceof NetworkError) {
    // Показать ошибку сети
  }
}
```

---

## Тестирование

### Data-атрибуты для E2E

| Атрибут | Элемент |
|---------|---------|
| `data-registration` | Форма регистрации |
| `data-delivery` | Форма доставки |
| `data-title` | Название товара на главной |
| `data-price` | Цена товара на главной |
| `data-title="basket"` | Название товара в корзине |
| `data-price="basket"` | Цена товара в корзине |

### Unit тесты (Jest)

```typescript
// Пример теста
describe('Validators', () => {
  test('validateEmail should return true for valid email', () => {
    const result = validateEmail('test@example.com');
    expect(result.isValid).toBe(true);
  });

  test('validateEmail should return false for invalid email', () => {
    const result = validateEmail('invalid-email');
    expect(result.isValid).toBe(false);
  });
});
```

### E2E тесты (Cypress)

```typescript
// cypress/e2e/auth.cy.ts
describe('Authentication', () => {
  it('should register a new user', () => {
    cy.visit('/');
    cy.get('[data-testid="login-btn"]').click();
    cy.get('[data-testid="register-tab"]').click();
    cy.get('[data-registration]').within(() => {
      cy.get('input[name="name"]').type('Test User');
      cy.get('input[name="email"]').type('test@example.com');
      cy.get('input[name="login"]').type('testuser');
      cy.get('input[name="phone"]').type('+375291234567');
      cy.get('input[name="password"]').type('password123');
      cy.get('input[name="confirmPassword"]').type('password123');
      cy.get('button[type="submit"]').click();
    });
    cy.get('[data-testid="user-name"]').should('contain', 'Test User');
  });
});
```

---

## Запуск и разработка

### Команды

```bash
# Development режим
npm run dev

# Сборка для production
npm run build

# Preview production сборки
npm run preview

# Unit тесты фронтенда
npm run test:frontend

# E2E тесты
npm run test:e2e

# Линтинг
npm run lint
```

### Порты

- **Frontend (Vite)**: 5173
- **Backend API**: 3001

### Переменные окружения

```env
# .env.local
VITE_API_URL=http://localhost:3001
```

### Структура страницы

При загрузке приложения:

1. `index.html` загружается браузером
2. `app.ts` инициализирует приложение
3. Проверяется авторизация (`AuthService.getCurrentUser()`)
4. Рендерится `Layout` (Header, Main, Footer)
5. Роутер определяет текущую страницу
6. Страница рендерится в Main Content

---

## Ответственность за модули

| Модуль | Ответственный | Статус |
|--------|---------------|--------|
| Аутентификация | Глеб | ✅ Готово |
| Layout/Header/Footer | Глеб | ✅ Готово |
| Роутинг | Глеб | ✅ Готово |
| Store | Глеб | ✅ Готово |
| Корзина | Тимофей | ✅ Готово |
| Заказы | Никита Т. | ✅ Готово |
| Каталог продуктов | Никита П. | 🔄 В разработке |

---

*Документ создан: март 2026*