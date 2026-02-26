# Промпт для Тимофея (Вариант 21) - Модуль корзины

## Введение

Ты разрабатываешь модуль корзины для интернет-магазина L_Shop. Проект уже содержит базовую инфраструктуру, созданную тимлидом (Глебом):

- ✅ Базовый компонент `Component` с жизненным циклом и state management
- ✅ Router для навигации
- ✅ Store для управления состоянием
- ✅ API клиент с типизацией
- ✅ AuthService для аутентификации
- ✅ UI компоненты: Button, Input, Modal
- ✅ Layout компоненты: Header, Footer, Layout
- ✅ Jest конфигурация для frontend и backend тестов

Твоя задача — реализовать backend и frontend для работы с корзиной.

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

## Вариант 21 - Особенности

Для твоего варианта добавь поддержку скидок:
- Добавь поле `discountPercent?: number` (0-100) в модель Product
- Учитывай скидку при расчёте стоимости в корзине
- Отображай старую цену зачёркнутой и новую цену со скидкой

## Backend

### Файлы для создания:

1. `src/backend/models/cart.model.ts` - модель корзины
2. `src/backend/controllers/cart.controller.ts` - контроллер
3. `src/backend/services/cart.service.ts` - сервис
4. `src/backend/routes/cart.routes.ts` - маршруты

### API Endpoints:

#### GET /api/cart

Получить корзину текущего пользователя.

**Требует:** Авторизацию

**Ответ:**
```json
{
  "userId": "uuid",
  "items": [
    {
      "productId": "uuid",
      "quantity": 2,
      "name": "iPhone 15",
      "price": 999,
      "discountPercent": 10,
      "total": 1798.2
    }
  ],
  "totalSum": 1798.2,
  "updatedAt": "2026-02-19T10:00:00Z"
}
```

#### POST /api/cart/items

Добавить продукт в корзину.

**Требует:** Авторизацию

**Тело запроса:**
```json
{
  "productId": "uuid",
  "quantity": 1
}
```

**Логика:**
- Проверить существование продукта
- Проверить наличие на складе (`inStock`)
- Если продукт уже в корзине — увеличить количество

#### PUT /api/cart/items/:productId

Изменить количество продукта.

**Тело запроса:**
```json
{
  "quantity": 3
}
```

#### DELETE /api/cart/items/:productId

Удалить продукт из корзины.

### Реализация модели:

```typescript
// src/backend/models/cart.model.ts

/**
 * Элемент корзины
 */
export interface CartItem {
  /** ID продукта */
  productId: string;
  /** Количество */
  quantity: number;
}

/**
 * Корзина пользователя
 */
export interface Cart {
  /** ID пользователя */
  userId: string;
  /** Элементы корзины */
  items: CartItem[];
  /** Дата обновления */
  updatedAt: string;
}

/**
 * Элемент корзины с данными продукта (для ответа API)
 */
export interface CartItemWithProduct extends CartItem {
  /** Название продукта */
  name: string;
  /** Цена продукта */
  price: number;
  /** Процент скидки (Вариант 21) */
  discountPercent?: number;
  /** Итоговая сумма */
  total: number;
}

/**
 * Корзина с обогащёнными данными (для ответа API)
 */
export interface CartWithProducts extends Cart {
  /** Элементы с данными продуктов */
  items: CartItemWithProduct[];
  /** Общая сумма */
  totalSum: number;
}
```

### Реализация сервиса:

```typescript
// src/backend/services/cart.service.ts
import { readJsonFile, writeJsonFile } from '../utils/file.utils';
import { Cart, CartItem, CartItemWithProduct, CartWithProducts } from '../models/cart.model';
import { Product } from '../models/product.model';

const CARTS_FILE = 'carts.json';
const PRODUCTS_FILE = 'products.json';

export class CartService {
  async getCart(userId: string): Promise<CartWithProducts> {
    const carts = await readJsonFile<Cart>(CARTS_FILE);
    const products = await readJsonFile<Product>(PRODUCTS_FILE);
    
    let cart = carts.find(c => c.userId === userId);
    if (!cart) {
      cart = { userId, items: [], updatedAt: new Date().toISOString() };
    }
    
    // Обогащаем данными продукта
    const items = cart.items.map(item => {
      const product = products.find(p => p.id === item.productId);
      const price = product?.price || 0;
      const discount = product?.discountPercent || 0;
      // Вариант 21: учитываем скидку при расчёте
      const total = item.quantity * price * (1 - discount / 100);
      
      return {
        ...item,
        name: product?.name || 'Unknown',
        price,
        discountPercent: discount,
        total,
      };
    });
    
    const totalSum = items.reduce((sum, item) => sum + item.total, 0);
    
    return { ...cart, items, totalSum };
  }
  
  async addItem(userId: string, productId: string, quantity: number): Promise<CartWithProducts> {
    const carts = await readJsonFile<Cart>(CARTS_FILE);
    const products = await readJsonFile<Product>(PRODUCTS_FILE);
    
    // Проверяем существование продукта
    const product = products.find(p => p.id === productId);
    if (!product) {
      throw new Error('Product not found');
    }
    
    // Проверяем наличие
    if (!product.inStock) {
      throw new Error('Product is out of stock');
    }
    
    // Ищем или создаём корзину
    let cart = carts.find(c => c.userId === userId);
    if (!cart) {
      cart = { userId, items: [], updatedAt: new Date().toISOString() };
      carts.push(cart);
    }
    
    // Добавляем или обновляем элемент
    const existingItem = cart.items.find(i => i.productId === productId);
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.items.push({ productId, quantity });
    }
    
    cart.updatedAt = new Date().toISOString();
    await writeJsonFile(CARTS_FILE, carts);
    
    return this.getCart(userId);
  }
  
  async updateItem(userId: string, productId: string, quantity: number): Promise<CartWithProducts> {
    const carts = await readJsonFile<Cart>(CARTS_FILE);
    const cart = carts.find(c => c.userId === userId);
    
    if (!cart) {
      throw new Error('Cart not found');
    }
    
    const item = cart.items.find(i => i.productId === productId);
    if (!item) {
      throw new Error('Item not found in cart');
    }
    
    if (quantity <= 0) {
      cart.items = cart.items.filter(i => i.productId !== productId);
    } else {
      item.quantity = quantity;
    }
    
    cart.updatedAt = new Date().toISOString();
    await writeJsonFile(CARTS_FILE, carts);
    
    return this.getCart(userId);
  }
  
  async removeItem(userId: string, productId: string): Promise<CartWithProducts> {
    const carts = await readJsonFile<Cart>(CARTS_FILE);
    const cart = carts.find(c => c.userId === userId);
    
    if (!cart) {
      throw new Error('Cart not found');
    }
    
    cart.items = cart.items.filter(i => i.productId !== productId);
    cart.updatedAt = new Date().toISOString();
    await writeJsonFile(CARTS_FILE, carts);
    
    return this.getCart(userId);
  }
}
```

### Подключение маршрутов:

Добавь в `src/backend/app.ts`:
```typescript
import cartRoutes from './routes/cart.routes';
// ...
app.use('/api/cart', cartRoutes);
```

## Frontend

### Использование существующей инфраструктуры

#### Базовый компонент

Все твои компоненты должны наследоваться от базового класса:

```typescript
import { Component, ComponentProps } from '../components/base/Component';

interface CartItemProps extends ComponentProps {
  item: CartItemWithProduct;
  onQuantityChange?: (productId: string, quantity: number) => void;
  onRemove?: (productId: string) => void;
}

export class CartItemComponent extends Component<CartItemProps> {
  // Реализация
}
```

#### Store для состояния

Используй существующий Store для управления состоянием корзины:

```typescript
import { Store } from '../store/store';

// Подписка на изменения корзины
Store.subscribe('cart', (cart) => {
  // Обновить UI
});

// Получить текущее состояние
const user = Store.getState().user;
const isAuthenticated = Store.getState().isAuthenticated;
```

#### API клиент

Используй существующий API клиент:

```typescript
import { api } from '../services/api';

// GET запрос
const cart = await api.get<CartWithProducts>('/api/cart');

// POST запрос
await api.post<CartWithProducts>('/api/cart/items', { productId, quantity });

// PUT запрос
await api.put<CartWithProducts>(`/api/cart/items/${productId}`, { quantity });

// DELETE запрос
await api.delete<CartWithProducts>(`/api/cart/items/${productId}`);
```

#### Router

Используй существующий Router:

```typescript
import { Router } from '../router/router';

// Навигация на страницу доставки
Router.navigate('/delivery');

// Проверка авторизации перед переходом в корзину
if (!Store.getState().isAuthenticated) {
  // Показать модальное окно авторизации
  Router.navigate('/');
}
```

### Структура файлов для создания:

```
src/frontend/
├── components/
│   └── cart/
│       ├── CartItem.ts         # Элемент корзины
│       ├── CartList.ts         # Список корзины
│       └── CartSummary.ts      # Итого корзины
├── pages/
│   └── CartPage.ts             # Страница корзины
├── types/
│   └── cart.ts                 # Типы корзины
├── styles/
│   └── components/
│       └── cart.css            # Стили корзины
```

### Компоненты:

#### CartItem
- Название с атрибутом `data-title="basket"`
- Цена с атрибутом `data-price="basket"`
- Кнопки +/- для количества
- Кнопка удаления
- **Вариант 21:** Отображение скидки (зачёркнутая старая цена, новая цена)

#### CartPage
- Только для авторизованных
- Список товаров
- Кнопка "Оформить доставку"

### Пример реализации CartItem:

```typescript
// src/frontend/components/cart/CartItem.ts
import { Component, ComponentProps } from '../base/Component';
import { Button } from '../ui/Button';
import { CartItemWithProduct } from '../../types/cart';

export interface CartItemProps extends ComponentProps {
  item: CartItemWithProduct;
  onQuantityChange?: (productId: string, quantity: number) => void;
  onRemove?: (productId: string) => void;
}

export class CartItemComponent extends Component<CartItemProps> {
  private decreaseBtn: Button | null = null;
  private increaseBtn: Button | null = null;
  private removeBtn: Button | null = null;

  protected getDefaultProps(): CartItemProps {
    return {
      ...super.getDefaultProps(),
      item: {} as CartItemWithProduct,
    };
  }

  public render(): HTMLElement {
    const { item } = this.props;
    
    this.element = this.createElement('div', {
      className: 'cart-item',
    });

    // Название с data-title="basket"
    const title = this.createElement('h3', {
      className: 'cart-item__title',
      'data-title': 'basket', // Обязательный атрибут
    }, [item.name]);

    // Цена с data-price="basket"
    const priceContainer = this.createElement('div', {
      className: 'cart-item__price-container',
    });

    // Вариант 21: отображение скидки
    if (item.discountPercent && item.discountPercent > 0) {
      const oldPrice = this.createElement('span', {
        className: 'cart-item__price--old',
      }, [`${item.price} ₽`]);
      
      const newPrice = this.createElement('span', {
        className: 'cart-item__price--new',
        'data-price': 'basket', // Обязательный атрибут
      }, [`${(item.price * (1 - item.discountPercent / 100)).toFixed(2)} ₽`]);
      
      const discount = this.createElement('span', {
        className: 'cart-item__discount',
      }, [`-${item.discountPercent}%`]);
      
      priceContainer.append(oldPrice, newPrice, discount);
    } else {
      const price = this.createElement('span', {
        className: 'cart-item__price',
        'data-price': 'basket', // Обязательный атрибут
      }, [`${item.price} ₽`]);
      priceContainer.appendChild(price);
    }

    // Управление количеством
    const quantityControl = this.createElement('div', {
      className: 'cart-item__quantity',
    });

    this.decreaseBtn = new Button({
      text: '-',
      variant: 'secondary',
      onClick: () => this.handleQuantityChange(-1),
    });

    const quantityValue = this.createElement('span', {
      className: 'cart-item__quantity-value',
    }, [String(item.quantity)]);

    this.increaseBtn = new Button({
      text: '+',
      variant: 'secondary',
      onClick: () => this.handleQuantityChange(1),
    });

    this.decreaseBtn.mount(quantityControl);
    quantityControl.appendChild(quantityValue);
    this.increaseBtn.mount(quantityControl);

    // Кнопка удаления
    this.removeBtn = new Button({
      text: 'Удалить',
      variant: 'danger',
      onClick: () => this.props.onRemove?.(item.productId),
    });

    // Итого для позиции
    const total = this.createElement('span', {
      className: 'cart-item__total',
    }, [`Итого: ${item.total.toFixed(2)} ₽`]);

    // Собираем элемент
    this.element.append(title, priceContainer, quantityControl);
    this.removeBtn.mount(this.element);
    this.element.appendChild(total);

    return this.element;
  }

  private handleQuantityChange(delta: number): void {
    const newQuantity = this.props.item.quantity + delta;
    if (newQuantity > 0) {
      this.props.onQuantityChange?.(this.props.item.productId, newQuantity);
    }
  }
}
```

## Тестирование

### Unit-тесты для CartService

Создай `src/backend/services/__tests__/cart.service.test.ts`:

```typescript
import { CartService } from '../cart.service';
import { readJsonFile, writeJsonFile } from '../../utils/file.utils';
import { Cart } from '../../models/cart.model';
import { Product } from '../../models/product.model';

jest.mock('../../utils/file.utils');

const mockReadJsonFile = readJsonFile as jest.MockedFunction<typeof readJsonFile>;
const mockWriteJsonFile = writeJsonFile as jest.MockedFunction<typeof writeJsonFile>;

describe('CartService', () => {
  let cartService: CartService;

  const mockProducts: Product[] = [
    {
      id: 'product-1',
      name: 'iPhone 15',
      description: 'Смартфон',
      price: 1000,
      category: 'electronics',
      inStock: true,
      discountPercent: 10, // Вариант 21
    },
    {
      id: 'product-2',
      name: 'Samsung Galaxy',
      description: 'Смартфон',
      price: 800,
      category: 'electronics',
      inStock: true,
    },
  ];

  const mockCarts: Cart[] = [
    {
      userId: 'user-1',
      items: [
        { productId: 'product-1', quantity: 2 },
      ],
      updatedAt: '2026-02-19T10:00:00Z',
    },
  ];

  beforeEach(() => {
    cartService = new CartService();
    jest.clearAllMocks();
  });

  describe('getCart', () => {
    it('должен вернуть корзину с обогащёнными элементами', async () => {
      mockReadJsonFile
        .mockResolvedValueOnce(mockCarts)
        .mockResolvedValueOnce(mockProducts);

      const result = await cartService.getCart('user-1');

      expect(result.userId).toBe('user-1');
      expect(result.items).toHaveLength(1);
      expect(result.items[0].name).toBe('iPhone 15');
    });

    it('должен корректно рассчитывать скидку (вариант 21)', async () => {
      mockReadJsonFile
        .mockResolvedValueOnce(mockCarts)
        .mockResolvedValueOnce(mockProducts);

      const result = await cartService.getCart('user-1');

      // 2 товара * 1000 цена * 0.9 (10% скидка) = 1800
      expect(result.items[0].total).toBe(1800);
      expect(result.items[0].discountPercent).toBe(10);
    });

    it('должен вернуть пустую корзину для нового пользователя', async () => {
      mockReadJsonFile
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce(mockProducts);

      const result = await cartService.getCart('new-user');

      expect(result.items).toHaveLength(0);
      expect(result.totalSum).toBe(0);
    });
  });

  describe('addItem', () => {
    it('должен добавить новый товар в корзину', async () => {
      mockReadJsonFile
        .mockResolvedValueOnce(mockCarts)
        .mockResolvedValueOnce(mockProducts);
      mockWriteJsonFile.mockResolvedValue();

      await cartService.addItem('user-1', 'product-2', 1);

      expect(mockWriteJsonFile).toHaveBeenCalled();
    });

    it('должен увеличить количество, если товар уже есть', async () => {
      mockReadJsonFile
        .mockResolvedValueOnce(mockCarts)
        .mockResolvedValueOnce(mockProducts);
      mockWriteJsonFile.mockResolvedValue();

      await cartService.addItem('user-1', 'product-1', 1);

      // Должен увеличить с 2 до 3
      const savedCart = mockWriteJsonFile.mock.calls[0][1] as Cart[];
      const item = savedCart[0].items.find(i => i.productId === 'product-1');
      expect(item?.quantity).toBe(3);
    });

    it('должен выбросить ошибку для несуществующего продукта', async () => {
      mockReadJsonFile
        .mockResolvedValueOnce(mockCarts)
        .mockResolvedValueOnce(mockProducts);

      await expect(cartService.addItem('user-1', 'non-existent', 1))
        .rejects.toThrow('Product not found');
    });

    it('должен выбросить ошибку для продукта не в наличии', async () => {
      const productsNotInStock = [{ ...mockProducts[0], inStock: false }];
      mockReadJsonFile
        .mockResolvedValueOnce(mockCarts)
        .mockResolvedValueOnce(productsNotInStock);

      await expect(cartService.addItem('user-1', 'product-1', 1))
        .rejects.toThrow('Product is out of stock');
    });
  });

  describe('updateItem', () => {
    it('должен обновить количество товара', async () => {
      mockReadJsonFile.mockResolvedValueOnce(mockCarts);
      mockWriteJsonFile.mockResolvedValue();

      await cartService.updateItem('user-1', 'product-1', 5);

      const savedCart = mockWriteJsonFile.mock.calls[0][1] as Cart[];
      const item = savedCart[0].items.find(i => i.productId === 'product-1');
      expect(item?.quantity).toBe(5);
    });

    it('должен удалить товар при количестве 0', async () => {
      mockReadJsonFile.mockResolvedValueOnce(mockCarts);
      mockWriteJsonFile.mockResolvedValue();

      await cartService.updateItem('user-1', 'product-1', 0);

      const savedCart = mockWriteJsonFile.mock.calls[0][1] as Cart[];
      expect(savedCart[0].items).toHaveLength(0);
    });
  });

  describe('removeItem', () => {
    it('должен удалить товар из корзины', async () => {
      mockReadJsonFile.mockResolvedValueOnce(mockCarts);
      mockWriteJsonFile.mockResolvedValue();

      await cartService.removeItem('user-1', 'product-1');

      const savedCart = mockWriteJsonFile.mock.calls[0][1] as Cart[];
      expect(savedCart[0].items).toHaveLength(0);
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

## Git

1. Создай ветку: `git checkout -b feature/cart-timofey`
2. Делай коммиты на английском
3. Создай PR в `main`

## Комментарии

### Хорошие комментарии (использовать):

- **Юридические** — лицензии, заявления о правах
- **Информативные** — пояснения к сложному коду и регулярным выражениям
- **Пояснения намерений** — объяснение бизнес-логики
- **TODO** — пометки на будущее (`// TODO: реализовать...`)
- **JSDoc** — документация публичных API
- **Усиление** — подчёркивание важного
- **Предупреждения** — о последствиях

```typescript
// Юридический комментарий
// License: MIT (см. файл LICENSE)

// Информативный — пояснение регулярного выражения
const emailRegex = /^[\w.-]+@[\w.-]+\.\w+$/; // Домен обязателен

// Пояснение намерений — бизнес-логика
// Скидка применяется только для зарегистрированных пользователей
const discount = user ? product.price * (1 - product.discountPercent / 100) : product.price;

// JSDoc для публичного API
/**
 * Рассчитывает итоговую сумму с учётом скидки.
 * @param price - Базовая цена товара
 * @param discountPercent - Процент скидки (0-100)
 * @returns Итоговая сумма
 */
function calculateTotal(price: number, discountPercent: number): number {
  return price * (1 - discountPercent / 100);
}

// TODO — пометка на будущее
// TODO: Добавить поддержку купонов

// Предупреждение о последствиях
// ВНИМАНИЕ: этот метод удаляет все данные пользователя
function deleteUserData(userId: string) { /* ... */ }
```

### Плохие комментарии (избегать):

- Бормотание, шутки, шум
- Избыточные (дублируют код)
- Журнальные (авторы, задачи — есть Git)
- Закомментированный код (удалять)
- Позиционные маркеры (выносить в методы)
- За закрывающей скобкой
- Недостоверные (устаревшие)
- Обязательные (не заставлять)

```typescript
// ПЛОХО: Бормотание
// хз почему это работает, но пусть будет

// ПЛОХО: Дублирование кода
const x = 1; // Присваиваем 1 переменной x

// ПЛОХО: Журнальный
// Ivan, 19 февраля 2026 года: added this feature

// ПЛОХО: Закомментированный код — УДАЛИТЬ
// const oldPrice = price * 2;

// ПЛОХО: Позиционный маркер
// ==================== CART ====================

// ПЛОХО: За закрывающей скобкой
function foo() {
} // function foo
```

## Финальный чек-лист

- [ ] Backend: model, controller, service, routes
- [ ] API: GET /api/cart
- [ ] API: POST /api/cart/items
- [ ] API: PUT /api/cart/items/:productId
- [ ] API: DELETE /api/cart/items/:productId
- [ ] Frontend: Типы корзины (cart.ts)
- [ ] Frontend: Страница корзины (CartPage)
- [ ] Frontend: Компоненты CartItem, CartList, CartSummary
- [ ] Data-атрибуты: data-title="basket", data-price="basket"
- [ ] Вариант 21: скидки, discountPercent, отображение скидки
- [ ] Тесты: unit-тесты для CartService
- [ ] Git: ветка, коммиты, PR