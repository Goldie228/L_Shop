# Промпт для Никиты П. (Вариант 17) - Модуль продуктов

## Введение

Ты разрабатываешь модуль продуктов для интернет-магазина L_Shop. Проект уже содержит базовую инфраструктуру, созданную тимлидом (Глебом):

- ✅ Базовый компонент `Component` с жизненным циклом и state management
- ✅ Router для навигации
- ✅ Store для управления состоянием
- ✅ API клиент с типизацией
- ✅ AuthService для аутентификации
- ✅ UI компоненты: Button, Input, Modal
- ✅ Layout компоненты: Header, Footer, Layout
- ✅ Jest конфигурация для frontend и backend тестов

Твоя задача — реализовать backend и frontend для работы с продуктами.

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
//अलग से 19 февраля 2026 года
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

1. `src/backend/models/product.model.ts` - модель продукта
2. `src/backend/controllers/product.controller.ts` - контроллер
3. `src/backend/services/product.service.ts` - сервис
4. `src/backend/routes/product.routes.ts` - маршруты

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

### Реализация модели:

```typescript
// src/backend/models/product.model.ts

/**
 * Модель продукта для интернет-магазина
 */
export interface Product {
  /** Уникальный идентификатор */
  id: string;
  /** Название продукта */
  name: string;
  /** Описание продукта */
  description: string;
  /** Цена в рублях */
  price: number;
  /** Категория продукта */
  category: string;
  /** Есть ли в наличии */
  inStock: boolean;
  /** URL изображения */
  imageUrl?: string;
  /** Средний рейтинг (1-5) - Вариант 17 */
  rating?: number;
  /** Количество отзывов - Вариант 17 */
  reviewsCount?: number;
  /** Дата создания */
  createdAt?: string;
}
```

### Реализация сервиса:

```typescript
// src/backend/services/product.service.ts
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

### Использование существующей инфраструктуры

#### Базовый компонент

Все твои компоненты должны наследоваться от базового класса:

```typescript
import { Component, ComponentProps } from '../components/base/Component';

interface ProductCardProps extends ComponentProps {
  product: Product;
  onAddToCart?: (productId: string) => void;
}

export class ProductCard extends Component<ProductCardProps> {
  // Реализация
}
```

#### Store для состояния

Используй существующий Store для управления состоянием продуктов:

```typescript
import { Store } from '../store/store';

// Подписка на изменения
Store.subscribe('products', (products) => {
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
const products = await api.get<Product[]>('/api/products', { search: 'phone' });

// Обработка ошибок
try {
  const products = await api.get<Product[]>('/api/products');
} catch (error) {
  // error уже обработан api клиентом
}
```

#### Router

Используй существующий Router:

```typescript
import { Router } from '../router/router';

// Навигация
Router.navigate('/cart');

// Получить текущий маршрут
const currentPath = Router.getCurrentPath();
```

### Структура файлов для создания:

```
src/frontend/
├── components/
│   └── product/
│       ├── ProductCard.ts      # Карточка товара
│       ├── ProductList.ts      # Список товаров
│       └── ProductFilters.ts   # Фильтры товаров
├── pages/
│   └── MainPage.ts             # Обновить главную страницу
├── types/
│   └── product.ts              # Типы продукта
├── styles/
│   └── components/
│       └── product-card.css    # Стили карточки товара
```

### Компоненты:

#### ProductCard
- Изображение (или заглушка)
- Название с атрибутом `data-title`
- Цена с атрибутом `data-price`
- Рейтинг и отзывы (вариант 17)
- Кнопка "В корзину" (только для авторизованных)

#### ProductFilters
- Поле поиска
- Select сортировки (price_asc, price_desc)
- Select категории
- Чекбокс "В наличии"
- Поле минимального рейтинга (вариант 17)

### Пример реализации ProductCard:

```typescript
// src/frontend/components/product/ProductCard.ts
import { Component, ComponentProps } from '../base/Component';
import { Button } from '../ui/Button';
import { Product } from '../../types/product';

export interface ProductCardProps extends ComponentProps {
  product: Product;
  isAuthenticated: boolean;
  onAddToCart?: (productId: string) => void;
}

export class ProductCard extends Component<ProductCardProps> {
  private addButton: Button | null = null;

  protected getDefaultProps(): ProductCardProps {
    return {
      ...super.getDefaultProps(),
      product: {} as Product,
      isAuthenticated: false,
    };
  }

  public render(): HTMLElement {
    const { product, isAuthenticated } = this.props;
    
    this.element = this.createElement('div', {
      className: 'product-card',
    });

    // Изображение
    const imageContainer = this.createElement('div', {
      className: 'product-card__image',
    });
    if (product.imageUrl) {
      const img = this.createElement('img', {
        src: product.imageUrl,
        alt: product.name,
      });
      imageContainer.appendChild(img);
    }

    // Название с data-title
    const title = this.createElement('h3', {
      className: 'product-card__title',
      'data-title': '', // Обязательный атрибут для тестирования
    }, [product.name]);

    // Цена с data-price
    const price = this.createElement('span', {
      className: 'product-card__price',
      'data-price': '', // Обязательный атрибут для тестирования
    }, [`${product.price} ₽`]);

    // Рейтинг и отзывы (вариант 17)
    if (product.rating !== undefined) {
      const ratingInfo = this.createElement('div', {
        className: 'product-card__rating',
      }, [
        `★ ${product.rating.toFixed(1)}`,
        product.reviewsCount ? ` (${product.reviewsCount} отзывов)` : '',
      ]);
      this.element.appendChild(ratingInfo);
    }

    // Кнопка "В корзину" только для авторизованных
    if (isAuthenticated) {
      this.addButton = new Button({
        text: 'В корзину',
        variant: 'primary',
        onClick: () => this.props.onAddToCart?.(product.id),
      });
      this.addButton.mount(this.element);
    }

    // Собираем карточку
    this.element.append(imageContainer, title, price);

    return this.element;
  }
}
```

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
npm test                    # Запустить все backend тесты
npm run test:frontend       # Запустить frontend тесты
npm run test:watch          # Режим наблюдения
npm run test:coverage       # С отчётом покрытия
```

## Финальный чек-лист

- [ ] Backend: model, controller, service, routes
- [ ] API: GET /api/products с фильтрами
- [ ] API: GET /api/products/:id
- [ ] Frontend: Типы продукта (product.ts)
- [ ] Frontend: Компоненты ProductCard, ProductList, ProductFilters
- [ ] Frontend: Обновить MainPage
- [ ] Data-атрибуты: data-title, data-price
- [ ] Вариант 17: rating, reviewsCount, фильтр minRating
- [ ] Тесты: unit-тесты для ProductService
- [ ] Git: ветка, коммиты, PR