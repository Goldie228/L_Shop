# Промпт для Никиты Т. (Вариант 24) - Модуль заказов/доставки

## Введение

Ты разрабатываешь модуль заказов и доставки для интернет-магазина L_Shop. Проект уже содержит базовую инфраструктуру, аутентификацию и (к моменту твоей работы) модули продуктов и корзины. Твоя задача — реализовать backend и frontend для оформления заказов.

## Вариант 24 - Особенности

Для твоего варианта добавь:
- Выбор типа доставки: `deliveryType: 'courier' | 'pickup'`
- Комментарий к заказу: `comment?: string`

## Backend

### Обновление модели:

Добавь в `src/backend/models/order.model.ts`:
```typescript
interface Order {
  // ... базовые поля
  deliveryType?: 'courier' | 'pickup';
  comment?: string;
}
```

### Файлы для создания:

1. `src/backend/controllers/order.controller.ts`
2. `src/backend/services/order.service.ts`
3. `src/backend/routes/order.routes.ts`

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

### Реализация сервиса:

```typescript
// order.service.ts
import { readJsonFile, writeJsonFile } from '../utils/file.utils';
import { Order } from '../models/order.model';
import { Cart } from '../models/cart.model';
import { generateId } from '../utils/id.utils';

const ORDERS_FILE = 'orders.json';
const CARTS_FILE = 'carts.json';

export class OrderService {
  async createOrder(
    userId: string,
    data: {
      deliveryAddress: string;
      phone: string;
      email: string;
      paymentMethod: 'cash' | 'card' | 'online';
      deliveryType?: 'courier' | 'pickup';
      comment?: string;
    }
  ) {
    // 1. Получить корзину
    const carts = await readJsonFile<Cart>(CARTS_FILE);
    const cart = carts.find(c => c.userId === userId);
    
    if (!cart || cart.items.length === 0) {
      throw new Error('Cart is empty');
    }
    
    // 2. Создать заказ
    const orders = await readJsonFile<Order>(ORDERS_FILE);
    const newOrder: Order = {
      id: generateId(),
      userId,
      items: cart.items,
      ...data,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    
    orders.push(newOrder);
    await writeJsonFile(ORDERS_FILE, orders);
    
    // 3. Очистить корзину
    const updatedCarts = carts.map(c => 
      c.userId === userId ? { ...c, items: [] } : c
    );
    await writeJsonFile(CARTS_FILE, updatedCarts);
    
    return newOrder;
  }
  
  async getOrders(userId: string) {
    const orders = await readJsonFile<Order>(ORDERS_FILE);
    return orders
      .filter(o => o.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
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

### Структура файлов:

```
src/frontend/
  pages/
    DeliveryPage.ts
    OrdersPage.ts
  components/
    DeliveryForm.ts
    OrderCard.ts
  services/
    orderApi.ts
```

### Компоненты:

#### DeliveryForm

Форма оформления доставки с полями:
- Адрес доставки (textarea)
- Телефон (input)
- Email (input)
- Способ оплаты (radio: cash, card, online)
- Тип доставки (radio: courier, pickup) - вариант 24
- Комментарий (textarea) - вариант 24
- Кнопка "Оформить заказ"

**Атрибут:** `data-delivery` на элементе `<form>`

#### OrdersPage

Список заказов пользователя (опционально).

### Data-атрибуты:

На форме доставки:
- `data-delivery` - на элементе формы

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

## Финальный чек-лист

- [ ] Backend: controller, service, routes
- [ ] API: POST /api/orders
- [ ] API: GET /api/orders
- [ ] Frontend: Страница доставки
- [ ] Frontend: Компонент DeliveryForm
- [ ] Data-атрибуты: data-delivery
- [ ] Вариант 24: deliveryType, comment
- [ ] Git: ветка, коммиты, PR
