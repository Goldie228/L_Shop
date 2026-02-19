# Промпт для Тимофея (Вариант 21) - Модуль корзины

## Введение

Ты разрабатываешь модуль корзины для интернет-магазина L_Shop. Проект уже содержит базовую инфраструктуру и аутентификацию. Твоя задача — реализовать backend и frontend для работы с корзиной.

## Вариант 21 - Особенности

Для твоего варианта добавь поддержку скидок:
- Добавь поле `discountPercent?: number` (0-100) в модель Product
- Учитывай скидку при расчёте стоимости в корзине
- Отображай старую цену зачёркнутой и новую цену со скидкой

## Backend

### Файлы для создания:

1. `src/backend/controllers/cart.controller.ts`
2. `src/backend/services/cart.service.ts`
3. `src/backend/routes/cart.routes.ts`

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
  "updatedAt": "2024-01-15T10:00:00Z"
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

### Реализация сервиса:

```typescript
// cart.service.ts
import { readJsonFile, writeJsonFile } from '../utils/file.utils';
import { Cart, CartItem } from '../models/cart.model';
import { Product } from '../models/product.model';

const CARTS_FILE = 'carts.json';
const PRODUCTS_FILE = 'products.json';

export class CartService {
  async getCart(userId: string) {
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
      const total = item.quantity * price * (1 - discount / 100);
      
      return {
        ...item,
        name: product?.name || 'Unknown',
        price,
        discountPercent: discount,
        total
      };
    });
    
    const totalSum = items.reduce((sum, item) => sum + item.total, 0);
    
    return { ...cart, items, totalSum };
  }
  
  async addItem(userId: string, productId: string, quantity: number) {
    // Реализуй логику добавления
  }
  
  async updateItem(userId: string, productId: string, quantity: number) {
    // Реализуй логику обновления
  }
  
  async removeItem(userId: string, productId: string) {
    // Реализуй логику удаления
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

### Структура файлов:

```
src/frontend/
  pages/
    CartPage.ts
  components/
    Cart.ts
    CartItem.ts
  services/
    cartApi.ts
```

### Компоненты:

#### Cart

Список продуктов в корзине с:
- Названием (с атрибутом `data-title="basket"`)
- Ценой за единицу (с атрибутом `data-price="basket"`)
- Количеством с кнопками +/-
- Общей стоимостью за позицию
- Общей суммой корзины
- Кнопкой "Оформить заказ"

#### CartItem

Карточка продукта в корзине с отображением скидки (вариант 21).

### Data-атрибуты:

В корзине:
- `data-title="basket"` - на элементе с названием продукта
- `data-price="basket"` - на элементе с ценой продукта

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
      description: 'Smartphone',
      price: 1000,
      category: 'electronics',
      inStock: true,
      discountPercent: 10, // Вариант 21
    },
    {
      id: 'product-2',
      name: 'Samsung Galaxy',
      description: 'Smartphone',
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
      updatedAt: '2024-01-15T10:00:00Z',
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
npm test                    # Запустить все тесты
npm run test:watch          # Режим наблюдения
npm run test:coverage       # С отчётом покрытия
```

## Git

1. Создай ветку: `git checkout -b feature/cart-timofey`
2. Делай коммиты на английском
3. Создай PR в `main`

## Финальный чек-лист

- [ ] Backend: controller, service, routes
- [ ] API: GET /api/cart
- [ ] API: POST /api/cart/items
- [ ] API: PUT /api/cart/items/:productId
- [ ] API: DELETE /api/cart/items/:productId
- [ ] Frontend: Страница корзины
- [ ] Frontend: Компоненты Cart, CartItem
- [ ] Data-атрибуты: data-title="basket", data-price="basket"
- [ ] Вариант 21: скидки, discountPercent
- [ ] Тесты: unit-тесты для CartService
- [ ] Git: ветка, коммиты, PR
