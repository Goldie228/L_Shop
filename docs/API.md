# API Документация L_Shop

Базовый URL: `http://localhost:3001/api`

## Содержание

1. [Авторизация](#авторизация)
2. [Продукты](#продукты)
3. [Корзина](#корзина)
4. [Заказы](#заказы)
5. [Коды ошибок](#коды-ошибок)
6. [Типы данных](#типы-данных)

---

## Авторизация

### POST /auth/register

Регистрация нового пользователя.

**Тело запроса:**
```json
{
  "name": "Иван Иванов",
  "email": "ivan@example.com",
  "login": "ivan123",
  "phone": "+375291234567",
  "password": "secret123"
}
```

**Ответ 201:**
```json
{
  "message": "Регистрация успешна",
  "user": {
    "id": "uuid",
    "name": "Иван Иванов",
    "email": "ivan@example.com",
    "login": "ivan123",
    "phone": "+375291234567"
  }
}
```

**Ошибки:**
| Код | Код ошибки | Описание |
|-----|------------|----------|
| 400 | MISSING_FIELDS | Отсутствуют обязательные поля |
| 400 | INVALID_EMAIL | Неверный формат email |
| 400 | INVALID_PHONE | Неверный формат телефона (ожидается +1234567890, 10-15 цифр) |
| 400 | WEAK_PASSWORD | Пароль менее 6 символов |
| 409 | EMAIL_EXISTS | Пользователь с таким email уже существует |
| 409 | LOGIN_EXISTS | Пользователь с таким логином уже существует |

---

### POST /auth/login

Вход в систему.

**Тело запроса:**
```json
{
  "login": "ivan123",  // login или email
  "password": "secret123"
}
```

**Ответ 200:**
```json
{
  "message": "Вход выполнен",
  "user": {
    "id": "uuid",
    "name": "Иван Иванов",
    "email": "ivan@example.com",
    "login": "ivan123",
    "phone": "+375291234567"
  }
}
```

**Ошибки:**
| Код | Код ошибки | Описание |
|-----|------------|----------|
| 400 | MISSING_CREDENTIALS | Отсутствуют учётные данные |
| 401 | INVALID_CREDENTIALS | Неверный логин или пароль |

---

### POST /auth/logout

Выход из системы.

**Требуется:** Authorization (sessionToken cookie)

**Ответ 200:**
```json
{
  "message": "Выход выполнен"
}
```

---

### GET /auth/me

Получение информации о текущем пользователе.

**Требуется:** Authorization (sessionToken cookie)

**Ответ 200:**
```json
{
  "id": "uuid",
  "name": "Иван Иванов",
  "email": "ivan@example.com",
  "login": "ivan123",
  "phone": "+375291234567"
}
```

**Ошибки:**
| Код | Код ошибки | Описание |
|-----|------------|----------|
| 401 | UNAUTHORIZED | Не авторизован |
| 401 | SESSION_EXPIRED | Сессия истекла |
| 404 | USER_NOT_FOUND | Пользователь не найден |

---

## Продукты

### GET /products

Получение списка продуктов с фильтрацией и сортировкой.

**Query параметры:**
| Параметр | Тип | Описание |
|----------|-----|----------|
| `search` | string | Поиск по названию и описанию |
| `sort` | string | Сортировка: `price_asc`, `price_desc` |
| `category` | string | Фильтр по категории |
| `inStock` | string | Фильтр по наличию: `true`, `false` |
| `minRating` | number | Минимальный рейтинг (1-5) |

**Ответ 200:**
```json
[
  {
    "id": "uuid",
    "name": "Название товара",
    "description": "Описание товара",
    "price": 100.00,
    "category": "electronics",
    "rating": 4.5,
    "reviewsCount": 42,
    "inStock": true,
    "discountPercent": 10,
    "imageUrl": "/images/product.jpg",
    "createdAt": "2026-03-01T00:00:00.000Z"
  }
]
```

**Ошибки:**
| Код | Код ошибки | Описание |
|-----|------------|----------|
| 400 | INVALID_SORT_PARAMETER | Некорректный параметр sort |
| 400 | INVALID_INSTOCK_PARAMETER | Некорректный параметр inStock |
| 400 | INVALID_MINRATING_PARAMETER | minRating должен быть от 1 до 5 |

---

### GET /products/:id

Получить продукт по ID.

**Параметры URL:**
- `id` - ID продукта

**Ответ 200:**
```json
{
  "id": "uuid",
  "name": "Название товара",
  "description": "Описание товара",
  "price": 100.00,
  "category": "electronics",
  "rating": 4.5,
  "reviewsCount": 42,
  "inStock": true,
  "discountPercent": 10,
  "imageUrl": "/images/product.jpg",
  "createdAt": "2026-03-01T00:00:00.000Z"
}
```

**Ошибки:**
| Код | Код ошибки | Описание |
|-----|------------|----------|
| 400 | MISSING_PRODUCT_ID | ID продукта не указан |
| 404 | PRODUCT_NOT_FOUND | Продукт не найден |

---

## Корзина

> **Все эндпоинты требуют авторизации**

### GET /cart

Получить корзину текущего пользователя.

**Требуется:** Authorization

**Ответ 200:**
```json
{
  "userId": "uuid",
  "items": [
    {
      "productId": "uuid",
      "quantity": 2,
      "name": "Название товара",
      "price": 100.00,
      "discountPercent": 10,
      "total": 180.00
    }
  ],
  "totalSum": 180.00,
  "updatedAt": "2026-03-06T12:00:00.000Z"
}
```

**Ошибки:**
| Код | Код ошибки | Описание |
|-----|------------|----------|
| 401 | UNAUTHORIZED | Не авторизован |

---

### POST /cart/items

Добавить товар в корзину.

**Требуется:** Authorization

**Тело запроса:**
```json
{
  "productId": "uuid",
  "quantity": 1
}
```

**Ответ 200:** Возвращает обновлённую корзину.

**Ошибки:**
| Код | Код ошибки | Описание |
|-----|------------|----------|
| 400 | INVALID_REQUEST | productId и quantity обязательны |
| 401 | UNAUTHORIZED | Не авторизован |
| 404 | PRODUCT_NOT_FOUND | Продукт не найден |
| 400 | OUT_OF_STOCK | Продукт отсутствует на складе |

---

### PUT /cart/items/:productId

Изменить количество товара в корзине.

**Требуется:** Authorization

**Параметры URL:**
- `productId` - ID продукта

**Тело запроса:**
```json
{
  "quantity": 3
}
```

**Ответ 200:** Возвращает обновлённую корзину.

**Ошибки:**
| Код | Код ошибки | Описание |
|-----|------------|----------|
| 400 | INVALID_REQUEST | quantity должно быть неотрицательным |
| 401 | UNAUTHORIZED | Не авторизован |
| 404 | CART_NOT_FOUND | Корзина не найдена |
| 404 | ITEM_NOT_FOUND | Товар не найден в корзине |

**Примечание:** Если `quantity = 0`, товар удаляется из корзины.

---

### DELETE /cart/items/:productId

Удалить товар из корзины.

**Требуется:** Authorization

**Параметры URL:**
- `productId` - ID продукта

**Ответ 200:** Возвращает обновлённую корзину.

**Ошибки:**
| Код | Код ошибки | Описание |
|-----|------------|----------|
| 400 | INVALID_REQUEST | productId обязателен |
| 401 | UNAUTHORIZED | Не авторизован |
| 404 | CART_NOT_FOUND | Корзина не найдена |

---

## Заказы

> **Все эндпоинты требуют авторизации**

### POST /orders

Создать новый заказ.

**Требуется:** Authorization

**Тело запроса:**
```json
{
  "deliveryAddress": "г. Минск, ул. Примерная, д. 1, кв. 1",
  "phone": "+375291234567",
  "email": "ivan@example.com",
  "paymentMethod": "cash",
  "deliveryType": "courier",
  "comment": "Позвонить перед доставкой"
}
```

**Поля:**
| Поле | Обязательно | Описание |
|------|-------------|----------|
| deliveryAddress | Да | Адрес доставки |
| phone | Да | Телефон в формате +1234567890 |
| email | Да | Email для связи |
| paymentMethod | Да | Способ оплаты: `cash`, `card`, `online` |
| deliveryType | Нет | Тип доставки: `courier`, `pickup` |
| comment | Нет | Комментарий к заказу |

**Ответ 201:**
```json
{
  "id": "uuid",
  "userId": "uuid",
  "items": [
    {
      "productId": "uuid",
      "name": "Название товара",
      "price": 100.00,
      "quantity": 2,
      "discountPercent": 10
    }
  ],
  "deliveryAddress": "г. Минск, ул. Примерная, д. 1, кв. 1",
  "phone": "+375291234567",
  "email": "ivan@example.com",
  "paymentMethod": "cash",
  "deliveryType": "courier",
  "comment": "Позвонить перед доставкой",
  "status": "pending",
  "totalSum": 180.00,
  "createdAt": "2026-03-06T12:00:00.000Z"
}
```

**Ошибки:**
| Код | Код ошибки | Описание |
|-----|------------|----------|
| 400 | MISSING_FIELDS | Отсутствуют обязательные поля |
| 400 | INVALID_EMAIL | Некорректный формат email |
| 400 | INVALID_PHONE | Некорректный формат телефона |
| 400 | INVALID_PAYMENT_METHOD | Некорректный способ оплаты |
| 400 | INVALID_DELIVERY_TYPE | Некорректный тип доставки |
| 400 | CART_EMPTY | Корзина пуста |
| 401 | UNAUTHORIZED | Не авторизован |

---

### GET /orders

Получить список заказов текущего пользователя.

**Требуется:** Authorization

**Ответ 200:**
```json
[
  {
    "id": "uuid",
    "userId": "uuid",
    "items": [...],
    "deliveryAddress": "г. Минск, ул. Примерная, д. 1",
    "phone": "+375291234567",
    "email": "ivan@example.com",
    "paymentMethod": "cash",
    "deliveryType": "courier",
    "status": "delivered",
    "totalSum": 180.00,
    "createdAt": "2026-03-06T12:00:00.000Z"
  }
]
```

**Ошибки:**
| Код | Код ошибки | Описание |
|-----|------------|----------|
| 401 | UNAUTHORIZED | Не авторизован |

---

### GET /orders/:orderId

Получить конкретный заказ по ID.

**Требуется:** Authorization

**Параметры URL:**
- `orderId` - ID заказа

**Ответ 200:** Возвращает объект заказа.

**Ошибки:**
| Код | Код ошибки | Описание |
|-----|------------|----------|
| 400 | MISSING_ORDER_ID | ID заказа не указан |
| 401 | UNAUTHORIZED | Не авторизован |
| 404 | ORDER_NOT_FOUND | Заказ не найден |

---

## Коды ошибок

### Общие коды ошибок

| Код HTTP | Код ошибки | Описание |
|----------|------------|----------|
| 400 | INVALID_REQUEST | Некорректный запрос |
| 401 | UNAUTHORIZED | Требуется авторизация |
| 403 | FORBIDDEN | Доступ запрещён |
| 404 | NOT_FOUND | Ресурс не найден |
| 500 | INTERNAL_ERROR | Внутренняя ошибка сервера |

### Формат ошибки

```json
{
  "message": "Человекочитаемое сообщение",
  "error": "ERROR_CODE"
}
```

---

## Типы данных

### User

```typescript
interface User {
  id: string;           // UUID
  name: string;         // Отображаемое имя
  email: string;        // Email
  login: string;        // Логин
  phone: string;        // Телефон (+1234567890)
  role: 'user' | 'admin';
  createdAt: string;    // ISO 8601
  updatedAt: string;    // ISO 8601
}
```

### Product

```typescript
interface Product {
  id: string;              // UUID
  name: string;            // Название
  description: string;     // Описание
  price: number;           // Цена
  category: string;        // Категория
  inStock: boolean;        // Наличие
  discountPercent?: number; // Скидка 0-100
  imageUrl?: string;       // URL изображения
  createdAt: string;       // ISO 8601
  updatedAt?: string;      // ISO 8601
}
```

### Cart

```typescript
interface Cart {
  userId: string;
  items: CartItem[];
  totalSum: number;
  updatedAt: string;
}

interface CartItem {
  productId: string;
  quantity: number;
  name: string;
  price: number;
  discountPercent?: number;
  total: number;
}
```

### Order

```typescript
interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  deliveryAddress: string;
  phone: string;
  email: string;
  paymentMethod: 'cash' | 'card' | 'online';
  deliveryType?: 'courier' | 'pickup';
  comment?: string;
  status: OrderStatus;
  totalSum: number;
  createdAt: string;
  updatedAt?: string;
}

type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
```

---

## Аутентификация

### Механизм сессий

1. При регистрации/входе сервер создаёт сессию с уникальным токеном
2. Токен сохраняется в httpOnly cookie (`sessionToken`)
3. Cookie автоматически отправляется с каждым запросом
4. Duration сессии: **10 минут** (настраивается в `SESSION_DURATION_MINUTES`)
5. При каждом запросе сессия продлевается

### CORS

- Development: разрешены запросы с `localhost:*`
- Production: разрешены запросы только с `FRONTEND_URL`
- Credentials: включены (для cookies)

### Health Check

```
GET /health
```

**Ответ 200:**
```json
{
  "status": "ok",
  "timestamp": "2026-03-06T12:00:00.000Z",
  "environment": "development"
}
```

---

*Документ обновлён: март 2026*