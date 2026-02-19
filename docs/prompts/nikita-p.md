# Промпт для Никиты П. (Вариант 17) - Модуль продуктов

## Введение

Ты разрабатываешь модуль продуктов для интернет-магазина L_Shop. Проект уже содержит базовую инфраструктуру, созданную тимлидом (Глебом). Твоя задача — реализовать backend и frontend для работы с продуктами.

## Комментарии

### Хорошие комментарии (использовать)

- **Юридические** — лицензии, заявления о правах
- **Информативные** — пояснения к сложному коду и регулярным выражениям
- **Пояснения намерений** — объяснение бизнес-логики
- **TODO** — пометки на будущее
- **JSDoc** — документация публичных API и методов
- **Усиление** — подчёркивание важного
- **Предупреждения** — о возможных последствиях

```typescript
// Юридический комментарий
// License: MIT

// Информативный комментарий
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // валидация email

// Пояснение намерений
// Используем бинарный поиск для производительности O(log n)
function findProduct(products: Product[], id: string) { ... }

// TODO комментарий
// TODO: добавить кэширование после релиза

// JSDoc для публичного API
/**
 * Получает продукт по ID
 * @param id - уникальный идентификатор продукта
 * @returns продукт или null
 */
function getProductById(id: string): Product | null { ... }
```

### Плохие комментарии (избегать)

- **Бормотание, шутки, шум** — бессмысленный текст
- **Избыточные** — дублирование того, что и так видно из кода
- **Журнальные** — авторы, задачи (есть Git)
- **Закомментированный код** — удалять, не хранить
- **Позиционные маркеры** — выносить в отдельные методы
- **За закрывающей скобкой** — нечитаемо
- **Недостоверные** — устаревшие, вводят в заблуждение
- **Обязательные** — не заставлять писать

```typescript
// ❌ Плохо:
// iterate through products
for (const product of products) { }

// ❌ Журнальный:
// Created by John on 19 февраля 2026 года
// Fixed bug #123

// ❌ Закомментированный код:
// const oldFilter = products.filter(...);

// ❌ Позиционный маркер:
// } // end for

// ✅ Хорошо:
// Фильтруем только активные продукты
const activeProducts = products.filter(p => p.isActive);
```

## Вариант 17 - Особенности

Для твоего варианта добавь дополнительные поля в модель Product:
```typescript
interface Product {
  // ... базовые поля
  rating?: number;        // средний рейтинг (1-5)
  reviewsCount?: number;  // количество отзывов
}
```

## Backend

### Файлы для создания:

1. `src/backend/controllers/product.controller.ts`
2. `src/backend/services/product.service.ts`
3. `src/backend/routes/product.routes.ts`

### API Endpoints:

#### GET /api/products

Список продуктов с поддержкой query-параметров:
- `search` (string) - поиск по полям `name` и `description` (без учёта регистра)
- `sort` (string) - значения: `price_asc`, `price_desc`
- `category` (string) - фильтр по категории
- `inStock` (boolean) - `true` или `false`
- `minRating` (number) - минимальный рейтинг (для варианта 17)

**Пример запроса:**
```
GET /api/products?search=phone&sort=price_asc&category=electronics&inStock=true&minRating=4
```

**Ответ:**
```json
[
  {
    "id": "uuid",
    "name": "iPhone 15",
    "description": "Смартфон от Apple",
    "price": 999,
    "category": "electronics",
    "inStock": true,
    "imageUrl": "/images/iphone.jpg",
    "rating": 4.5,
    "reviewsCount": 128
  }
]
```

#### GET /api/products/:id

Получить один продукт по ID.

**Ответ 200:** Объект продукта
**Ответ 404:** `{ "message": "Product not found" }`

### Реализация сервиса:

```typescript
// product.service.ts
import { readJsonFile } from '../utils/file.utils';
import { Product } from '../models/product.model';

const PRODUCTS_FILE = 'products.json';

export class ProductService {
  async getProducts(filters: {
    search?: string;
    sort?: string;
    category?: string;
    inStock?: string;
    minRating?: string;
  }): Promise<Product[]> {
    let products = await readJsonFile<Product>(PRODUCTS_FILE);
    
    // Поиск
    if (filters.search) {
      const term = filters.search.toLowerCase();
      products = products.filter(p => 
        p.name.toLowerCase().includes(term) || 
        p.description.toLowerCase().includes(term)
      );
    }
    
    // Фильтр по категории
    if (filters.category) {
      products = products.filter(p => p.category === filters.category);
    }
    
    // Фильтр по наличию
    if (filters.inStock !== undefined) {
      products = products.filter(p => p.inStock === (filters.inStock === 'true'));
    }
    
    // Фильтр по рейтингу (вариант 17)
    if (filters.minRating) {
      const min = Number(filters.minRating);
      products = products.filter(p => (p.rating || 0) >= min);
    }
    
    // Сортировка
    if (filters.sort === 'price_asc') {
      products.sort((a, b) => a.price - b.price);
    } else if (filters.sort === 'price_desc') {
      products.sort((a, b) => b.price - a.price);
    }
    
    return products;
  }
  
  async getProductById(id: string): Promise<Product | null> {
    const products = await readJsonFile<Product>(PRODUCTS_FILE);
    return products.find(p => p.id === id) || null;
  }
}
```

### Подключение маршрутов:

Добавь в `src/backend/app.ts`:
```typescript
import productRoutes from './routes/product.routes';
// ...
app.use('/api/products', productRoutes);
```

## Frontend

### Структура файлов:

```
src/frontend/
  pages/
    MainPage.ts
  components/
    ProductCard.ts
    Filters.ts
    SearchBar.ts
  services/
    productApi.ts
  types/
    product.ts
```

### Компоненты:

#### ProductCard

Карточка продукта с:
- Изображением (или заглушкой)
- Названием (с атрибутом `data-title`)
- Ценой (с атрибутом `data-price`)
- Рейтингом и количеством отзывов (вариант 17)
- Кнопкой "Добавить в корзину" (для авторизованных пользователей)

#### Filters

Блок фильтров с:
- Полем поиска (input)
- Select для сортировки
- Select для категории
- Чекбоксом "Только в наличии"
- Полем ввода минимального рейтинга (вариант 17)

### Data-атрибуты:

На главной странице:
- `data-title` - на элементе с названием продукта
- `data-price` - на элементе с ценой продукта

## Git

1. Создай ветку: `git checkout -b feature/products-nikita`
2. Делай коммиты на английском: `feat: add product filtering`
3. Создай PR в `main`
4. Запроси review у коллег

## Тестирование

### Unit-тесты для ProductService

Создай `src/backend/services/__tests__/product.service.test.ts`:

```typescript
import { ProductService } from '../product.service';
import { readJsonFile } from '../../utils/file.utils';
import { Product } from '../../models/product.model';

jest.mock('../../utils/file.utils');

const mockReadJsonFile = readJsonFile as jest.MockedFunction<typeof readJsonFile>;

describe('ProductService', () => {
  let productService: ProductService;

  const mockProducts: Product[] = [
    {
      id: '1',
      name: 'iPhone 15',
      description: 'Смартфон от Apple',
      price: 999,
      category: 'electronics',
      inStock: true,
      rating: 4.5,
      reviewsCount: 128,
    },
    {
      id: '2',
      name: 'Samsung Galaxy',
      description: 'Смартфон от Samsung',
      price: 799,
      category: 'electronics',
      inStock: false,
      rating: 4.0,
      reviewsCount: 64,
    },
  ];

  beforeEach(() => {
    productService = new ProductService();
    jest.clearAllMocks();
  });

  describe('getProducts', () => {
    it('должен вернуть все продукты без фильтров', async () => {
      mockReadJsonFile.mockResolvedValue(mockProducts);

      const result = await productService.getProducts({});

      expect(result).toHaveLength(2);
    });

    it('должен фильтровать по поисковому запросу', async () => {
      mockReadJsonFile.mockResolvedValue(mockProducts);

      const result = await productService.getProducts({ search: 'iphone' });

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('iPhone 15');
    });

    it('должен фильтровать по категории', async () => {
      mockReadJsonFile.mockResolvedValue(mockProducts);

      const result = await productService.getProducts({ category: 'electronics' });

      expect(result).toHaveLength(2);
    });

    it('должен фильтровать по наличию', async () => {
      mockReadJsonFile.mockResolvedValue(mockProducts);

      const result = await productService.getProducts({ inStock: 'true' });

      expect(result).toHaveLength(1);
      expect(result[0].inStock).toBe(true);
    });

    it('должен фильтровать по минимальному рейтингу (вариант 17)', async () => {
      mockReadJsonFile.mockResolvedValue(mockProducts);

      const result = await productService.getProducts({ minRating: '4.2' });

      expect(result).toHaveLength(1);
      expect(result[0].rating).toBe(4.5);
    });

    it('должен сортировать по возрастанию цены', async () => {
      mockReadJsonFile.mockResolvedValue(mockProducts);

      const result = await productService.getProducts({ sort: 'price_asc' });

      expect(result[0].price).toBe(799);
      expect(result[1].price).toBe(999);
    });

    it('должен сортировать по убыванию цены', async () => {
      mockReadJsonFile.mockResolvedValue(mockProducts);

      const result = await productService.getProducts({ sort: 'price_desc' });

      expect(result[0].price).toBe(999);
      expect(result[1].price).toBe(799);
    });
  });

  describe('getProductById', () => {
    it('должен вернуть продукт по id', async () => {
      mockReadJsonFile.mockResolvedValue(mockProducts);

      const result = await productService.getProductById('1');

      expect(result).not.toBeNull();
      expect(result?.name).toBe('iPhone 15');
    });

    it('должен вернуть null для несуществующего id', async () => {
      mockReadJsonFile.mockResolvedValue(mockProducts);

      const result = await productService.getProductById('999');

      expect(result).toBeNull();
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

## Финальный чек-лист

- [ ] Backend: controller, service, routes
- [ ] API: GET /api/products с фильтрами
- [ ] API: GET /api/products/:id
- [ ] Frontend: Главная страница
- [ ] Frontend: Компоненты ProductCard, Filters
- [ ] Data-атрибуты: data-title, data-price
- [ ] Вариант 17: rating, reviewsCount, фильтр minRating
- [ ] Тесты: unit-тесты для ProductService
- [ ] Git: ветка, коммиты, PR
