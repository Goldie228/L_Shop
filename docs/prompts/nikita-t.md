# Промпт для Никиты Т. (Вариант 24) - Модуль заказов/доставки

## Введение

Ты разрабатываешь модуль заказов и доставки для интернет-магазина L_Shop. Проект уже содержит базовую инфраструктуру, созданную тимлидом (Глебом):

- ✅ Базовый компонент `Component` с жизненным циклом и state management
- ✅ Router для навигации
- ✅ Store для управления состоянием
- ✅ API клиент с типизацией
- ✅ AuthService для аутентификации
- ✅ UI компоненты: Button, Input, Modal
- ✅ Layout компоненты: Header, Footer, Layout
- ✅ Jest конфигурация для frontend и backend тестов

К моменту твоей работы модули продуктов и корзины уже реализованы. Твоя задача — реализовать backend и frontend для оформления заказов.

## Существующая структура проекта

```
src/
├── backend/
│   ├── controllers/       # Контроллеры (auth.controller.ts готов)
│   ├── services/           # Сервисы (user.service.ts, session.service.ts)
│   ├── routes/             # Маршруты (auth.routes.ts готов)
│   ├── models/             # Модели (user.model.ts, session.model.ts)
│   ├── utils/              # Утилиты (file.utils.ts, id.utils.ts, validators.ts)
│   └── __tests__/          # Backend тесты
├── frontend/
│   ├── components/
│   │   ├── base/           # Component.ts - базовый класс
│   │   ├── ui/             # Button.ts, Input.ts, Modal.ts
│   │   ├── layout/         # Header.ts, Footer.ts, Layout.ts
│   │   └── auth/           # AuthModal.ts, LoginForm.ts, RegisterForm.ts
│   ├── services/           # api.ts, auth.service.ts
│   ├── store/              # store.ts - управление состоянием
│   ├── router/             # router.ts - маршрутизация
│   ├── types/              # user.ts, api.ts
│   └── __tests__/          # Frontend тесты
```

## Вариант 24 - Особенности

Для твоего варианта добавь:
- Выбор типа доставки: `deliveryType: 'courier' | 'pickup'`
- Комментарий к заказу: `comment?: string`

## Backend

### Файлы для создания:

1. `src/backend/models/order.model.ts` - модель заказа
2. `src/backend/controllers/order.controller.ts` - контроллер
3. `src/backend/services/order.service.ts` - сервис
4. `src/backend/routes/order.routes.ts` - маршруты

### API Endpoints:

#### POST /api/orders

Создать заказ.

**Требует:** Авторизацию

**Тело запроса:**
```json
{
  "deliveryAddress": "ул. Пушкина, д. 10, кв. 5",
  "phone": "+375291234567",
  "email": "ivan@example.com",
  "paymentMethod": "cash",
  "deliveryType": "courier",
  "comment": "Позвонить перед доставкой"
}
```

**Логика:**
1. Получить корзину текущего пользователя
2. Если корзина пуста — ошибка 400
3. Создать заказ с копией продуктов из корзины
4. Установить статус `pending`
5. Очистить корзину пользователя
6. Вернуть созданный заказ

**Ответ 201:**
```json
{
  "id": "uuid",
  "userId": "uuid",
  "items": [...],
  "deliveryAddress": "ул. Пушкина, д. 10, кв. 5",
  "phone": "+375291234567",
  "email": "ivan@example.com",
  "paymentMethod": "cash",
  "deliveryType": "courier",
  "comment": "Позвонить перед доставкой",
  "status": "pending",
  "createdAt": "2026-02-19T10:00:00Z"
}
```

#### GET /api/orders

Список заказов текущего пользователя.

**Требует:** Авторизацию

**Ответ:**
```json
[
  {
    "id": "uuid",
    "status": "pending",
    "createdAt": "2026-02-19T10:00:00Z",
    ...
  }
]
```

### Реализация модели:

```typescript
// src/backend/models/order.model.ts

/**
 * Элемент заказа (копия из корзины)
 */
export interface OrderItem {
  /** ID продукта */
  productId: string;
  /** Название продукта на момент заказа */
  name: string;
  /** Цена на момент заказа */
  price: number;
  /** Количество */
  quantity: number;
  /** Скидка на момент заказа */
  discountPercent?: number;
}

/**
 * Статус заказа
 */
export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

/**
 * Способ оплаты
 */
export type PaymentMethod = 'cash' | 'card' | 'online';

/**
 * Тип доставки - Вариант 24
 */
export type DeliveryType = 'courier' | 'pickup';

/**
 * Заказ
 */
export interface Order {
  /** Уникальный идентификатор */
  id: string;
  /** ID пользователя */
  userId: string;
  /** Элементы заказа */
  items: OrderItem[];
  /** Адрес доставки */
  deliveryAddress: string;
  /** Телефон */
  phone: string;
  /** Email */
  email: string;
  /** Способ оплаты */
  paymentMethod: PaymentMethod;
  /** Тип доставки (Вариант 24) */
  deliveryType?: DeliveryType;
  /** Комментарий к заказу (Вариант 24) */
  comment?: string;
  /** Статус заказа */
  status: OrderStatus;
  /** Общая сумма */
  totalSum: number;
  /** Дата создания */
  createdAt: string;
  /** Дата обновления */
  updatedAt?: string;
}

/**
 * Данные для создания заказа
 */
export interface CreateOrderData {
  deliveryAddress: string;
  phone: string;
  email: string;
  paymentMethod: PaymentMethod;
  deliveryType?: DeliveryType;
  comment?: string;
}
```

### Реализация сервиса:

```typescript
// src/backend/services/order.service.ts
import { readJsonFile, writeJsonFile } from '../utils/file.utils';
import { Order, OrderItem, CreateOrderData } from '../models/order.model';
import { Cart } from '../models/cart.model';
import { Product } from '../models/product.model';
import { generateId } from '../utils/id.utils';

const ORDERS_FILE = 'orders.json';
const CARTS_FILE = 'carts.json';
const PRODUCTS_FILE = 'products.json';

export class OrderService {
  async createOrder(userId: string, data: CreateOrderData): Promise<Order> {
    // 1. Получить корзину
    const carts = await readJsonFile<Cart>(CARTS_FILE);
    const cart = carts.find(c => c.userId === userId);
    
    if (!cart || cart.items.length === 0) {
      throw new Error('Cart is empty');
    }
    
    // 2. Получить продукты для копирования данных
    const products = await readJsonFile<Product>(PRODUCTS_FILE);
    
    // 3. Создать элементы заказа с копией данных продуктов
    const orderItems: OrderItem[] = cart.items.map(item => {
      const product = products.find(p => p.id === item.productId);
      return {
        productId: item.productId,
        name: product?.name || 'Unknown',
        price: product?.price || 0,
        quantity: item.quantity,
        discountPercent: product?.discountPercent,
      };
    });
    
    // 4. Рассчитать общую сумму
    const totalSum = orderItems.reduce((sum, item) => {
      const discount = item.discountPercent || 0;
      return sum + item.price * item.quantity * (1 - discount / 100);
    }, 0);
    
    // 5. Создать заказ
    const orders = await readJsonFile<Order>(ORDERS_FILE);
    const newOrder: Order = {
      id: generateId(),
      userId,
      items: orderItems,
      ...data,
      status: 'pending',
      totalSum,
      createdAt: new Date().toISOString(),
    };
    
    orders.push(newOrder);
    await writeJsonFile(ORDERS_FILE, orders);
    
    // 6. Очистить корзину пользователя
    const updatedCarts = carts.map(c => 
      c.userId === userId ? { ...c, items: [], updatedAt: new Date().toISOString() } : c
    );
    await writeJsonFile(CARTS_FILE, updatedCarts);
    
    return newOrder;
  }
  
  async getOrders(userId: string): Promise<Order[]> {
    const orders = await readJsonFile<Order>(ORDERS_FILE);
    return orders
      .filter(o => o.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
  
  async getOrderById(userId: string, orderId: string): Promise<Order | null> {
    const orders = await readJsonFile<Order>(ORDERS_FILE);
    return orders.find(o => o.userId === userId && o.id === orderId) || null;
  }
}
```

### Подключение маршрутов:

Добавь в `src/backend/app.ts`:
```typescript
import orderRoutes from './routes/order.routes';
// ...
app.use('/api/orders', orderRoutes);
```

## Frontend

### Использование существующей инфраструктуры

#### Базовый компонент

Все твои компоненты должны наследоваться от базового класса:

```typescript
import { Component, ComponentProps } from '../components/base/Component';

interface DeliveryFormProps extends ComponentProps {
  onSubmit?: (data: DeliveryFormData) => void;
}

export class DeliveryForm extends Component<DeliveryFormProps> {
  // Реализация
}
```

#### Store для состояния

Используй существующий Store для управления состоянием:

```typescript
import { Store } from '../store/store';

// Получить текущее состояние
const user = Store.getState().user;
const isAuthenticated = Store.getState().isAuthenticated;

// Обновить состояние после создания заказа
Store.setState({ lastOrder: newOrder });
```

#### API клиент

Используй существующий API клиент:

```typescript
import { api } from '../services/api';

// POST запрос - создать заказ
const order = await api.post<Order>('/api/orders', orderData);

// GET запрос - получить список заказов
const orders = await api.get<Order[]>('/api/orders');
```

#### Router

Используй существующий Router:

```typescript
import { Router } from '../router/router';

// Навигация после создания заказа
Router.navigate('/orders');

// Редирект неавторизованных
if (!Store.getState().isAuthenticated) {
  Router.navigate('/');
}
```

### Структура файлов для создания:

```
src/frontend/
├── components/
│   └── order/
│       ├── DeliveryForm.ts     # Форма доставки
│       └── OrderSummary.ts     # Сводка заказа
├── pages/
│   └── DeliveryPage.ts         # Страница доставки
├── types/
│   └── order.ts                # Типы заказа
├── styles/
│   └── components/
│       └── delivery.css        # Стили доставки
```

### Компоненты:

#### DeliveryForm
- Адрес доставки
- Телефон
- Email
- Способ оплаты (cash, card, online)
- **Вариант 24:** Выбор типа доставки (courier, pickup)
- **Вариант 24:** Поле для комментария
- Атрибут `data-delivery` на форме

#### DeliveryPage
- Только для авторизованных
- Форма доставки
- Сводка заказа (из корзины)
- Кнопка подтверждения

### Пример реализации DeliveryForm:

```typescript
// src/frontend/components/order/DeliveryForm.ts
import { Component, ComponentProps } from '../base/Component';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { DeliveryFormData } from '../../types/order';

export interface DeliveryFormProps extends ComponentProps {
  onSubmit?: (data: DeliveryFormData) => void;
  isSubmitting?: boolean;
}

export class DeliveryForm extends Component<DeliveryFormProps> {
  private addressInput: Input | null = null;
  private phoneInput: Input | null = null;
  private emailInput: Input | null = null;
  private submitBtn: Button | null = null;
  private deliveryTypeSelect: HTMLSelectElement | null = null;
  private commentInput: HTMLTextAreaElement | null = null;

  protected getDefaultProps(): DeliveryFormProps {
    return {
      ...super.getDefaultProps(),
      isSubmitting: false,
    };
  }

  public render(): HTMLElement {
    this.element = this.createElement('form', {
      className: 'delivery-form',
      'data-delivery': '', // Обязательный атрибут
    });

    // Адрес доставки
    this.addressInput = new Input({
      type: 'text',
      placeholder: 'Адрес доставки',
      name: 'deliveryAddress',
      required: true,
    });
    const addressGroup = this.createElement('div', { className: 'form-group' });
    this.addressInput.mount(addressGroup);

    // Телефон
    this.phoneInput = new Input({
      type: 'tel',
      placeholder: 'Телефон (+375291234567)',
      name: 'phone',
      required: true,
    });
    const phoneGroup = this.createElement('div', { className: 'form-group' });
    this.phoneInput.mount(phoneGroup);

    // Email
    this.emailInput = new Input({
      type: 'email',
      placeholder: 'Email',
      name: 'email',
      required: true,
    });
    const emailGroup = this.createElement('div', { className: 'form-group' });
    this.emailInput.mount(emailGroup);

    // Способ оплаты
    const paymentGroup = this.createElement('div', { className: 'form-group' });
    const paymentLabel = this.createElement('label', {}, ['Способ оплаты:']);
    const paymentSelect = this.createElement('select', {
      name: 'paymentMethod',
    }, [
      this.createElement('option', { value: 'cash' }, ['Наличными']),
      this.createElement('option', { value: 'card' }, ['Картой курьеру']),
      this.createElement('option', { value: 'online' }, ['Онлайн оплата']),
    ]);
    paymentGroup.append(paymentLabel, paymentSelect);

    // Вариант 24: Тип доставки
    const deliveryTypeGroup = this.createElement('div', { className: 'form-group' });
    const deliveryTypeLabel = this.createElement('label', {}, ['Тип доставки:']);
    this.deliveryTypeSelect = this.createElement('select', {
      name: 'deliveryType',
    }, [
      this.createElement('option', { value: 'courier' }, ['Курьер']),
      this.createElement('option', { value: 'pickup' }, ['Самовывоз']),
    ]);
    deliveryTypeGroup.append(deliveryTypeLabel, this.deliveryTypeSelect);

    // Вариант 24: Комментарий
    const commentGroup = this.createElement('div', { className: 'form-group' });
    const commentLabel = this.createElement('label', {}, ['Комментарий:']);
    this.commentInput = this.createElement('textarea', {
      name: 'comment',
      placeholder: 'Комментарий к заказу (необязательно)',
      rows: '3',
    });
    commentGroup.append(commentLabel, this.commentInput);

    // Кнопка отправки
    this.submitBtn = new Button({
      text: this.props.isSubmitting ? 'Оформляем...' : 'Оформить заказ',
      variant: 'primary',
      disabled: this.props.isSubmitting,
      onClick: () => this.handleSubmit(),
    });

    // Собираем форму
    this.element.append(
      addressGroup,
      phoneGroup,
      emailGroup,
      paymentGroup,
      deliveryTypeGroup, // Вариант 24
      commentGroup,       // Вариант 24
    );
    this.submitBtn.mount(this.element);

    // Обработчик отправки
    this.addEventListener(this.element, 'submit', (e) => {
      e.preventDefault();
      this.handleSubmit();
    });

    return this.element;
  }

  private handleSubmit(): void {
    const formData: DeliveryFormData = {
      deliveryAddress: this.addressInput?.getValue() || '',
      phone: this.phoneInput?.getValue() || '',
      email: this.emailInput?.getValue() || '',
      paymentMethod: (this.element.querySelector('[name="paymentMethod"]') as HTMLSelectElement)?.value as 'cash' | 'card' | 'online',
      deliveryType: this.deliveryTypeSelect?.value as 'courier' | 'pickup', // Вариант 24
      comment: this.commentInput?.value || undefined, // Вариант 24
    };

    // Базовая валидация
    if (!formData.deliveryAddress || !formData.phone || !formData.email) {
      alert('Заполните все обязательные поля');
      return;
    }

    this.props.onSubmit?.(formData);
  }
}
```

## Git

1. Создай ветку: `git checkout -b feature/orders-nikita-t`
2. Делай коммиты на английском
3. Создай PR в `main`

## Комментарии в коде

### Хорошие комментарии (использовать):

- **Юридические** — лицензии, заявления о правах
- **Информативные** — пояснения к сложному коду и регулярным выражениям
- **Пояснения намерений** — объяснение бизнес-логики
- **TODO** — пометки на будущее (`// TODO: реализовать кеширование`)
- **JSDoc** — документация публичных методов
- **Усиление** — подчёркивание важного
- **Предупреждения** — о возможных последствиях

```typescript
// Юридический комментарий
// License: MIT (см. LICENSE файл)

// Информативный комментарий
// Regex для валидации email: local@domain.tld
const EMAIL_REGEX = /^[\w.-]+@[\w.-]+\.\w{2,}$/;

// JSDoc
/**
 * Создаёт новый заказ
 * @param userId - ID пользователя
 * @param data - данные заказа
 * @returns созданный заказ
 */
async function createOrder(userId: string, data: OrderData): Promise<Order>

// TODO
// TODO: добавить обработку ошибок при оплате

// Предупреждение о последствиях
// ВНИМАНИЕ: этот метод удаляет все данные безвозвратно
async function deleteAllData(): Promise<void>
```

### Плохие комментарии (избегать):

- **Бормотание, шутки, шум** — неинформативный текст
- **Избыточные** — дублируют код (`i++; // увеличиваем i`)
- **Журнальные** — авторы, задачи (есть Git)
- **Закомментированный код** — удалять, не хранить
- **Позиционные маркеры** — выносить в методы
- **За закрывающей скобкой** — (`}) // if`)
- **Недостоверные** — устаревшие, противоречат коду
- **Обязательные** — не заставлять писать комментарии

```typescript
// ПЛОХО: Бормотание
// хм, тут что-то надо сделать с этим

// ПЛОХО: Избыточный
const sum = a + b; // складываем a и b

// ПЛОХО: Журнальный
// Author: Ivan, Date: 19 февраля 2026 года, Task: #123

// ПЛОХО: Закомментированный код
// const oldPrice = price;
// price = newPrice;

// ПЛОХО: За закрывающей скобкой
if (isValid) {
  save();
} // if

// ПЛОХО: Недостоверный
// Эта функция валидирует email (но на самом деле она парсит дату)
function parseDate(input: string): Date
```

## Тестирование

### Unit-тесты для OrderService

Создай `src/backend/services/__tests__/order.service.test.ts`:

```typescript
import { OrderService } from '../order.service';
import { readJsonFile, writeJsonFile } from '../../utils/file.utils';
import { Order } from '../../models/order.model';
import { Cart } from '../../models/cart.model';
import { Product } from '../../models/product.model';

jest.mock('../../utils/file.utils');

const mockReadJsonFile = readJsonFile as jest.MockedFunction<typeof readJsonFile>;
const mockWriteJsonFile = writeJsonFile as jest.MockedFunction<typeof writeJsonFile>;

describe('OrderService', () => {
  let orderService: OrderService;

  const mockProducts: Product[] = [
    {
      id: 'product-1',
      name: 'iPhone 15',
      description: 'Смартфон',
      price: 1000,
      category: 'electronics',
      inStock: true,
    },
  ];

  const mockCarts: Cart[] = [
    {
      userId: 'user-1',
      items: [{ productId: 'product-1', quantity: 2 }],
      updatedAt: '2026-02-19T10:00:00Z',
    },
  ];

  const mockOrders: Order[] = [];

  beforeEach(() => {
    orderService = new OrderService();
    jest.clearAllMocks();
  });

  describe('createOrder', () => {
    it('должен создать заказ из корзины', async () => {
      mockReadJsonFile
        .mockResolvedValueOnce(mockCarts)     // carts
        .mockResolvedValueOnce(mockProducts)  // products
        .mockResolvedValueOnce(mockOrders);   // orders
      mockWriteJsonFile.mockResolvedValue();

      const result = await orderService.createOrder('user-1', {
        deliveryAddress: 'ул. Пушкина, д. 10',
        phone: '+375291234567',
        email: 'test@example.com',
        paymentMethod: 'cash',
        deliveryType: 'courier', // Вариант 24
        comment: 'Позвонить перед доставкой', // Вариант 24
      });

      expect(result.userId).toBe('user-1');
      expect(result.status).toBe('pending');
      expect(result.items).toHaveLength(1);
      expect(result.deliveryType).toBe('courier'); // Вариант 24
      expect(result.comment).toBe('Позвонить перед доставкой'); // Вариант 24
    });

    it('должен выбросить ошибку для пустой корзины', async () => {
      mockReadJsonFile.mockResolvedValueOnce([]); // пустые корзины

      await expect(orderService.createOrder('user-1', {
        deliveryAddress: 'ул. Пушкина, д. 10',
        phone: '+375291234567',
        email: 'test@example.com',
        paymentMethod: 'cash',
      })).rejects.toThrow('Cart is empty');
    });

    it('должен очистить корзину после создания заказа', async () => {
      mockReadJsonFile
        .mockResolvedValueOnce(mockCarts)
        .mockResolvedValueOnce(mockProducts)
        .mockResolvedValueOnce(mockOrders);
      mockWriteJsonFile.mockResolvedValue();

      await orderService.createOrder('user-1', {
        deliveryAddress: 'ул. Пушкина, д. 10',
        phone: '+375291234567',
        email: 'test@example.com',
        paymentMethod: 'cash',
      });

      // Проверяем, что корзина очищена
      const savedCarts = mockWriteJsonFile.mock.calls.find(
        call => Array.isArray(call[1]) && 'items' in call[1][0]
      )?.[1] as Cart[] | undefined;
      
      expect(savedCarts).toBeDefined();
      expect(savedCarts![0].items).toHaveLength(0);
    });
  });

  describe('getOrders', () => {
    it('должен вернуть заказы пользователя', async () => {
      const mockUserOrders: Order[] = [
        {
          id: 'order-1',
          userId: 'user-1',
          items: [],
          deliveryAddress: 'ул. Пушкина, д. 10',
          phone: '+375291234567',
          email: 'test@example.com',
          paymentMethod: 'cash',
          status: 'pending',
          totalSum: 2000,
          createdAt: '2026-02-19T10:00:00Z',
        },
      ];
      mockReadJsonFile.mockResolvedValueOnce(mockUserOrders);

      const result = await orderService.getOrders('user-1');

      expect(result).toHaveLength(1);
      expect(result[0].userId).toBe('user-1');
    });

    it('должен вернуть пустой массив для пользователя без заказов', async () => {
      mockReadJsonFile.mockResolvedValueOnce([]);

      const result = await orderService.getOrders('user-1');

      expect(result).toHaveLength(0);
    });
  });
});
```

### Запуск тестов

```bash
npm test                    # Запустить все backend тесты
npm run test:frontend       # Запустить frontend тесты
npm run test:watch          # Режим наблюдения
npm run test:coverage       # С отчётом покрытия
```

## Финальный чек-лист

- [ ] Backend: model, controller, service, routes
- [ ] API: POST /api/orders
- [ ] API: GET /api/orders
- [ ] Frontend: Типы заказа (order.ts)
- [ ] Frontend: Страница доставки (DeliveryPage)
- [ ] Frontend: Компоненты DeliveryForm, OrderSummary
- [ ] Data-атрибуты: data-delivery
- [ ] Вариант 24: deliveryType, comment
- [ ] Тесты: unit-тесты для OrderService
- [ ] Git: ветка, коммиты, PR