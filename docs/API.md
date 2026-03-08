# API Документация L_Shop

Базовый URL: `http://localhost:3001/api`

> **Важно:** Все цены указаны в белорусских рублях (BYN).

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
    "firstName": "Иван",
    "email": "ivan@example.com",
    "login": "ivan123",
    "phone": "+375291234567",
    "role": "user",
    "createdAt": "2026-03-01T00:00:00.000Z",
    "updatedAt": "2026-03-01T00:00:00.000Z"
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
    "firstName": "Иван",
    "email": "ivan@example.com",
    "login": "ivan123",
    "phone": "+375291234567",
    "role": "user",
    "createdAt": "2026-03-01T00:00:00.000Z",
    "updatedAt": "2026-03-01T00:00:00.000Z"
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
  "firstName": "Иван",
  "email": "ivan@example.com",
  "login": "ivan123",
  "phone": "+375291234567",
  "role": "user",
  "createdAt": "2026-03-01T00:00:00.000Z",
  "updatedAt": "2026-03-07T00:00:00.000Z"
}
```

**Ошибки:**
| Код | Код ошибки | Описание |
|-----|------------|----------|
| 401 | UNAUTHORIZED | Не авторизован |
| 401 | SESSION_EXPIRED | Сессия истекла |
| 404 | USER_NOT_FOUND | Пользователь не найден |

---

### GET /auth/session-config

Получение конфигурации сессии (публичная информация).

**Требует авторизацию:** Нет

**Ответ 200:**
```json
{
  "sessionDurationMinutes": 10,
  "maxSessionsPerUser": 5
}
```

**Ошибки:** Нет

---

### PUT /auth/profile

Обновление профиля пользователя (имя и email).

**Требуется:** Authorization (sessionToken cookie)

**Тело запроса:**
```json
{
  "name": "Иван Петров",      // опционально
  "email": "ivan.petrov@example.com" // опционально
}
```

**Ответ 200:**
```json
{
  "id": "uuid",
  "name": "Иван Петров",
  "email": "ivan.petrov@example.com",
  "login": "ivan123",
  "phone": "+375291234567",
  "role": "user",
  "createdAt": "2026-03-01T00:00:00.000Z",
  "updatedAt": "2026-03-07T00:00:00.000Z"
}
```

**Ошибки:**
| Код | Код ошибки | Описание |
|-----|------------|----------|
| 400 | INVALID_EMAIL | Неверный формат email |
| 400 | MISSING_FIELDS | Отсутствуют поля для обновления |
| 409 | EMAIL_EXISTS | Пользователь с таким email уже существует |
| 401 | UNAUTHORIZED | Не авторизован |
| 401 | SESSION_EXPIRED | Сессия истекла |
| 404 | USER_NOT_FOUND | Пользователь не найден |

---

### PUT /auth/password

Изменение пароля пользователя.

**Требуется:** Authorization (sessionToken cookie)

**Тело запроса:**
```json
{
  "currentPassword": "secret123",
  "newPassword": "newSecret456"
}
```

**Ответ 200:**
```json
{
  "message": "Пароль успешно изменён"
}
```

**Ошибки:**
| Код | Код ошибки | Описание |
|-----|------------|----------|
| 400 | MISSING_PASSWORD | Отсутствует текущий или новый пароль |
| 400 | WEAK_PASSWORD | Новый пароль менее 6 символов |
| 401 | INVALID_CREDENTIALS | Неверный текущий пароль |
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
    "currency": "BYN",
    "category": "electronics",
    "inStock": true,
    "imageUrl": "/images/product.jpg",
    "discountPercent": 10,
    "rating": 4.5,
    "reviewsCount": 42,
    "brand": "BrandName",
    "warranty": "12 месяцев",
    "specifications": {
      "color": "black",
      "size": "XL"
    },
    "createdAt": "2026-03-01T00:00:00.000Z",
    "updatedAt": "2026-03-07T00:00:00.000Z"
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
  "currency": "BYN",
  "category": "electronics",
  "inStock": true,
  "imageUrl": "/images/product.jpg",
  "discountPercent": 10,
  "rating": 4.5,
  "reviewsCount": 42,
  "brand": "BrandName",
  "warranty": "12 месяцев",
  "specifications": {
    "color": "black",
    "size": "XL"
  },
  "createdAt": "2026-03-01T00:00:00.000Z",
  "updatedAt": "2026-03-07T00:00:00.000Z"
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

**Метод:** GET
**Путь:** `/cart`
**Требует авторизацию:** Да (sessionToken cookie)
**Требует роль admin:** Нет

**Query параметры:** Нет

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
      "currency": "BYN",
      "discountPercent": 10,
      "total": 180.00,
      "imageUrl": "/images/product.jpg"
    }
  ],
  "totalSum": 180.00,
  "currency": "BYN",
  "updatedAt": "2026-03-06T12:00:00.000Z"
}
```

**Ошибки:**
| Код | Код ошибки | Описание |
|-----|------------|----------|
| 401 | UNAUTHORIZED | Не авторизован |
| 401 | SESSION_EXPIRED | Сессия истекла |

---

### POST /cart/items

Добавить товар в корзину.

**Метод:** POST
**Путь:** `/cart/items`
**Требует авторизацию:** Да (sessionToken cookie)
**Требует роль admin:** Нет

**Тело запроса:**
```json
{
  "productId": "uuid",
  "quantity": 1
}
```

**Ответ 201:**
```json
{
  "userId": "uuid",
  "items": [
    {
      "productId": "uuid",
      "quantity": 1,
      "name": "Название товара",
      "price": 100.00,
      "currency": "BYN",
      "discountPercent": 0,
      "total": 100.00,
      "imageUrl": "/images/product.jpg"
    }
  ],
  "totalSum": 100.00,
  "currency": "BYN",
  "updatedAt": "2026-03-06T12:00:00.000Z"
}
```

**Ошибки:**
| Код | Код ошибки | Описание |
|-----|------------|----------|
| 400 | MISSING_PRODUCT_ID | ID продукта не указан |
| 400 | INVALID_QUANTITY | Количество должно быть больше 0 |
| 400 | PRODUCT_NOT_FOUND | Продукт не найден |
| 400 | PRODUCT_OUT_OF_STOCK | Продукт отсутствует на складе |
| 401 | UNAUTHORIZED | Не авторизован |
| 401 | SESSION_EXPIRED | Сессия истекла |

---

### PUT /cart/items/:productId

Обновить количество товара в корзине.

**Метод:** PUT
**Путь:** `/cart/items/:productId`
**Требует авторизацию:** Да (sessionToken cookie)
**Требует роль admin:** Нет

**Path параметры:**
- `productId` (UUID) - ID продукта

**Тело запроса:**
```json
{
  "quantity": 3
}
```

**Ответ 200:**
```json
{
  "userId": "uuid",
  "items": [
    {
      "productId": "uuid",
      "quantity": 3,
      "name": "Название товара",
      "price": 100.00,
      "currency": "BYN",
      "discountPercent": 0,
      "total": 300.00,
      "imageUrl": "/images/product.jpg"
    }
  ],
  "totalSum": 300.00,
  "currency": "BYN",
  "updatedAt": "2026-03-06T12:00:00.000Z"
}
```

**Ошибки:**
| Код | Код ошибки | Описание |
|-----|------------|----------|
| 400 | MISSING_PRODUCT_ID | ID продукта не указан |
| 400 | INVALID_QUANTITY | Количество должно быть больше 0 |
| 404 | CART_ITEM_NOT_FOUND | Элемент корзины не найден |
| 404 | PRODUCT_NOT_FOUND | Продукт не найден |
| 401 | UNAUTHORIZED | Не авторизован |
| 401 | SESSION_EXPIRED | Сессия истекла |

---

### DELETE /cart/items/:productId

Удалить товар из корзины.

**Метод:** DELETE
**Путь:** `/cart/items/:productId`
**Требует авторизацию:** Да (sessionToken cookie)
**Требует роль admin:** Нет

**Path параметры:**
- `productId` (UUID) - ID продукта

**Ответ 200:**
```json
{
  "userId": "uuid",
  "items": [],
  "totalSum": 0,
  "currency": "BYN",
  "updatedAt": "2026-03-06T12:00:00.000Z"
}
```

**Ошибки:**
| Код | Код ошибки | Описание |
|-----|------------|----------|
| 404 | CART_ITEM_NOT_FOUND | Элемент корзины не найден |
| 401 | UNAUTHORIZED | Не авторизован |
| 401 | SESSION_EXPIRED | Сессия истекла |

---

## Заказы

> **Все эндпоинты требуют авторизации**

### POST /orders

Создать новый заказ на основе корзины.

**Метод:** POST
**Путь:** `/orders`
**Требует авторизацию:** Да (sessionToken cookie)
**Требует роль admin:** Нет

**Тело запроса:**
```json
{
  "deliveryAddress": "г. Минск, ул. Примерная, д. 1",
  "phone": "+375291234567",
  "email": "customer@example.com",
  "paymentMethod": "cash",
  "deliveryType": "courier",
  "comment": "Позвонить перед доставкой"
}
```

**Ответ 201:**
```json
{
  "id": "uuid",
  "userId": "uuid",
  "firstName": "Иван",
  "items": [
    {
      "productId": "uuid",
      "name": "Название товара",
      "price": 100.00,
      "currency": "BYN",
      "quantity": 2,
      "discountPercent": 10,
      "total": 180.00
    }
  ],
  "deliveryAddress": "г. Минск, ул. Примерная, д. 1",
  "phone": "+375291234567",
  "email": "customer@example.com",
  "paymentMethod": "cash",
  "deliveryType": "courier",
  "comment": "Позвонить перед доставкой",
  "status": "pending",
  "currency": "BYN",
  "totalSum": 180.00,
  "createdAt": "2026-03-07T14:30:00.000Z",
  "updatedAt": "2026-03-07T14:30:00.000Z"
}
```

**Ошибки:**
| Код | Код ошибки | Описание |
|-----|------------|----------|
| 400 | CART_EMPTY | Корзина пуста |
| 400 | INVALID_DELIVERY_ADDRESS | Не указан адрес доставки |
| 400 | INVALID_PHONE | Неверный формат телефона |
| 400 | INVALID_EMAIL | Неверный формат email |
| 400 | INVALID_PAYMENT_METHOD | Некорректный способ оплаты |
| 400 | INVALID_DELIVERY_TYPE | Некорректный тип доставки |
| 400 | DELIVERY_ADDRESS_TOO_LONG | Адрес доставки слишком длинный |
| 400 | COMMENT_TOO_LONG | Комментарий слишком длинный |
| 401 | UNAUTHORIZED | Не авторизован |
| 401 | SESSION_EXPIRED | Сессия истекла |
| 404 | USER_NOT_FOUND | Пользователь не найден |
| 500 | INTERNAL_SERVER_ERROR | Внутренняя ошибка сервера |

---

### GET /orders

Получить список заказов текущего пользователя.

**Метод:** GET
**Путь:** `/orders`
**Требует авторизацию:** Да (sessionToken cookie)
**Требует роль admin:** Нет

**Query параметры:**
| Параметр | Тип | Описание |
|----------|-----|----------|
| `status` | string | Фильтр по статусу: `pending`, `confirmed`, `shipped`, `delivered`, `cancelled` |
| `limit` | number | Количество заказов на странице (по умолчанию 20) |
| `offset` | number | Смещение для пагинации (по умолчанию 0) |

**Ответ 200:**
```json
[
  {
    "id": "uuid",
    "userId": "uuid",
    "firstName": "Иван",
    "items": [
      {
        "productId": "uuid",
        "name": "Название товара",
        "price": 100.00,
        "currency": "BYN",
        "quantity": 2,
        "discountPercent": 10,
        "total": 180.00
      }
    ],
    "deliveryAddress": "г. Минск, ул. Примерная, д. 1",
    "phone": "+375291234567",
    "email": "customer@example.com",
    "paymentMethod": "cash",
    "deliveryType": "courier",
    "comment": "Позвонить перед доставкой",
    "status": "pending",
    "currency": "BYN",
    "totalSum": 180.00,
    "createdAt": "2026-03-07T14:30:00.000Z",
    "updatedAt": "2026-03-07T14:30:00.000Z"
  }
]
```

**Ошибки:**
| Код | Код ошибки | Описание |
|-----|------------|----------|
| 400 | INVALID_STATUS | Некорректный статус заказа |
| 400 | INVALID_LIMIT | limit должен быть от 1 до 100 |
| 400 | INVALID_OFFSET | offset должен быть неотрицательным |
| 401 | UNAUTHORIZED | Не авторизован |
| 401 | SESSION_EXPIRED | Сессия истекла |

---

### GET /orders/:id

Получить заказ по ID.

**Метод:** GET
**Путь:** `/orders/:id`
**Требует авторизацию:** Да (sessionToken cookie)
**Требует роль admin:** Нет

**Path параметры:**
- `id` (UUID) - ID заказа

**Ответ 200:**
```json
{
  "id": "uuid",
  "userId": "uuid",
  "firstName": "Иван",
  "items": [
    {
      "productId": "uuid",
      "name": "Название товара",
      "price": 100.00,
      "currency": "BYN",
      "quantity": 2,
      "discountPercent": 10,
      "total": 180.00
    }
  ],
  "deliveryAddress": "г. Минск, ул. Примерная, д. 1",
  "phone": "+375291234567",
  "email": "customer@example.com",
  "paymentMethod": "cash",
  "deliveryType": "courier",
  "comment": "Позвонить перед доставкой",
  "status": "pending",
  "currency": "BYN",
  "totalSum": 180.00,
  "createdAt": "2026-03-07T14:30:00.000Z",
  "updatedAt": "2026-03-07T14:30:00.000Z"
}
```

**Ошибки:**
| Код | Код ошибки | Описание |
|-----|------------|----------|
| 400 | MISSING_ORDER_ID | ID заказа не указан |
| 404 | ORDER_NOT_FOUND | Заказ не найден |
| 401 | UNAUTHORIZED | Не авторизован |
| 401 | SESSION_EXPIRED | Сессия истекла |
| 403 | FORBIDDEN | Нет доступа к этому заказу |

---

### PUT /orders/:id/cancel

Отменить заказ.

**Метод:** PUT
**Путь:** `/orders/:id/cancel`
**Требует авторизацию:** Да (sessionToken cookie)
**Требует роль admin:** Нет

**Path параметры:**
- `id` (UUID) - ID заказа

**Ответ 200:**
```json
{
  "id": "uuid",
  "userId": "uuid",
  "firstName": "Иван",
  "items": [
    {
      "productId": "uuid",
      "name": "Название товара",
      "price": 100.00,
      "currency": "BYN",
      "quantity": 2,
      "discountPercent": 10,
      "total": 180.00
    }
  ],
  "deliveryAddress": "г. Минск, ул. Примерная, д. 1",
  "phone": "+375291234567",
  "email": "customer@example.com",
  "paymentMethod": "cash",
  "deliveryType": "courier",
  "comment": "Позвонить перед доставкой",
  "status": "cancelled",
  "currency": "BYN",
  "totalSum": 180.00,
  "createdAt": "2026-03-07T14:30:00.000Z",
  "updatedAt": "2026-03-07T15:00:00.000Z"
}
```

**Ошибки:**
| Код | Код ошибки | Описание |
|-----|------------|----------|
| 400 | MISSING_ORDER_ID | ID заказа не указан |
| 404 | ORDER_NOT_FOUND | Заказ не найден |
| 400 | ORDER_CANCELLATION_NOT_ALLOWED | Отмена заказа невозможна (уже обработан) |
| 401 | UNAUTHORIZED | Не авторизован |
| 401 | SESSION_EXPIRED | Сессия истекла |
| 403 | FORBIDDEN | Нет доступа к этому заказу |

---

## Админские эндпоинты

> **Все эндпоинты требуют роль admin**

### GET /admin/products

Получить список всех продуктов (для администраторов).

**Метод:** GET
**Путь:** `/admin/products`
**Требует авторизацию:** Да (sessionToken cookie)
**Требует роль admin:** Да

**Query параметры:**
| Параметр | Тип | Описание |
|----------|-----|----------|
| `search` | string | Поиск по названию и описанию |
| `sort` | string | Сортировка: `price_asc`, `price_desc`, `name_asc`, `name_desc`, `created_at_desc` |
| `category` | string | Фильтр по категории |
| `inStock` | string | Фильтр по наличию: `true`, `false` |
| `minRating` | number | Минимальный рейтинг (1-5) |
| `limit` | number | Количество на странице (по умолчанию 20) |
| `offset` | number | Смещение для пагинации |

**Ответ 200:**
```json
[
  {
    "id": "uuid",
    "name": "Название товара",
    "description": "Описание товара",
    "price": 100.00,
    "currency": "BYN",
    "category": "electronics",
    "inStock": true,
    "imageUrl": "/images/product.jpg",
    "discountPercent": 10,
    "rating": 4.5,
    "reviewsCount": 42,
    "brand": "BrandName",
    "warranty": "12 месяцев",
    "specifications": {
      "color": "black",
      "size": "XL"
    },
    "createdAt": "2026-03-01T00:00:00.000Z",
    "updatedAt": "2026-03-07T00:00:00.000Z"
  }
]
```

**Ошибки:**
| Код | Код ошибки | Описание |
|-----|------------|----------|
| 403 | FORBIDDEN | Доступ запрещён (требуется роль admin) |
| 401 | UNAUTHORIZED | Не авторизован |
| 401 | SESSION_EXPIRED | Сессия истекла |
| 400 | INVALID_SORT_PARAMETER | Некорректный параметр sort |
| 400 | INVALID_LIMIT | limit должен быть от 1 до 100 |
| 400 | INVALID_OFFSET | offset должен быть неотрицательным |

---

### GET /admin/products/:id

Получить продукт по ID (для администраторов).

**Метод:** GET
**Путь:** `/admin/products/:id`
**Требует авторизацию:** Да (sessionToken cookie)
**Требует роль admin:** Да

**Path параметры:**
- `id` (UUID) - ID продукта

**Ответ 200:**
```json
{
  "id": "uuid",
  "name": "Название товара",
  "description": "Описание товара",
  "price": 100.00,
  "currency": "BYN",
  "category": "electronics",
  "inStock": true,
  "imageUrl": "/images/product.jpg",
  "discountPercent": 10,
  "rating": 4.5,
  "reviewsCount": 42,
  "brand": "BrandName",
  "warranty": "12 месяцев",
  "specifications": {
    "color": "black",
    "size": "XL"
  },
  "createdAt": "2026-03-01T00:00:00.000Z",
  "updatedAt": "2026-03-07T00:00:00.000Z"
}
```

**Ошибки:**
| Код | Код ошибки | Описание |
|-----|------------|----------|
| 403 | FORBIDDEN | Доступ запрещён (требуется роль admin) |
| 401 | UNAUTHORIZED | Не авторизован |
| 401 | SESSION_EXPIRED | Сессия истекла |
| 400 | MISSING_PRODUCT_ID | ID продукта не указан |
| 404 | PRODUCT_NOT_FOUND | Продукт не найден |

---

### POST /admin/products

Создать новый продукт (для администраторов).

**Метод:** POST
**Путь:** `/admin/products`
**Требует авторизацию:** Да (sessionToken cookie)
**Требует роль admin:** Да

**Тело запроса:**
```json
{
  "name": "Новый товар",
  "description": "Описание нового товара",
  "price": 199.99,
  "category": "electronics",
  "inStock": true,
  "imageUrl": "/images/new-product.jpg",
  "discountPercent": 0,
  "brand": "BrandName",
  "warranty": "12 месяцев",
  "specifications": {
    "color": "black",
    "size": "XL"
  }
}
```

**Ответ 201:**
```json
{
  "id": "uuid",
  "name": "Новый товар",
  "description": "Описание нового товара",
  "price": 199.99,
  "currency": "BYN",
  "category": "electronics",
  "inStock": true,
  "imageUrl": "/images/new-product.jpg",
  "discountPercent": 0,
  "rating": 0,
  "reviewsCount": 0,
  "brand": "BrandName",
  "warranty": "12 месяцев",
  "specifications": {
    "color": "black",
    "size": "XL"
  },
  "createdAt": "2026-03-07T14:30:00.000Z",
  "updatedAt": "2026-03-07T14:30:00.000Z"
}
```

**Ошибки:**
| Код | Код ошибки | Описание |
|-----|------------|----------|
| 403 | FORBIDDEN | Доступ запрещён (требуется роль admin) |
| 401 | UNAUTHORIZED | Не авторизован |
| 401 | SESSION_EXPIRED | Сессия истекла |
| 400 | MISSING_NAME | Отсутствует название товара |
| 400 | MISSING_DESCRIPTION | Отсутствует описание товара |
| 400 | MISSING_PRICE | Отсутствует цена товара |
| 400 | MISSING_CATEGORY | Отсутствует категория товара |
| 400 | INVALID_PRICE | Цена должна быть положительным числом |
| 400 | INVALID_DISCOUNT_PERCENT | Скидка должна быть от 0 до 100 |

---

### PUT /admin/products/:id

Обновить продукт (для администраторов).

**Метод:** PUT
**Путь:** `/admin/products/:id`
**Требует авторизацию:** Да (sessionToken cookie)
**Требует роль admin:** Да

**Path параметры:**
- `id` (UUID) - ID продукта

**Тело запроса** (все поля опциональны):
```json
{
  "name": "Обновлённый товар",
  "description": "Новое описание",
  "price": 149.99,
  "category": "electronics",
  "inStock": false,
  "imageUrl": "/images/updated-product.jpg",
  "discountPercent": 15,
  "brand": "UpdatedBrand",
  "warranty": "24 месяца",
  "specifications": {
    "color": "white",
    "size": "M"
  }
}
```

**Ответ 200:**
```json
{
  "id": "uuid",
  "name": "Обновлённый товар",
  "description": "Новое описание",
  "price": 149.99,
  "currency": "BYN",
  "category": "electronics",
  "inStock": false,
  "imageUrl": "/images/updated-product.jpg",
  "discountPercent": 15,
  "rating": 4.5,
  "reviewsCount": 42,
  "brand": "UpdatedBrand",
  "warranty": "24 месяца",
  "specifications": {
    "color": "white",
    "size": "M"
  },
  "createdAt": "2026-03-01T00:00:00.000Z",
  "updatedAt": "2026-03-07T14:30:00.000Z"
}
```

**Ошибки:**
| Код | Код ошибки | Описание |
|-----|------------|----------|
| 403 | FORBIDDEN | Доступ запрещён (требуется роль admin) |
| 401 | UNAUTHORIZED | Не авторизован |
| 401 | SESSION_EXPIRED | Сессия истекла |
| 400 | MISSING_PRODUCT_ID | ID продукта не указан |
| 404 | PRODUCT_NOT_FOUND | Продукт не найден |
| 400 | INVALID_PRICE | Цена должна быть положительным числом |
| 400 | INVALID_DISCOUNT_PERCENT | Скидка должна быть от 0 до 100 |

---

### DELETE /admin/products/:id

Удалить продукт (для администраторов).

**Метод:** DELETE
**Путь:** `/admin/products/:id`
**Требует авторизацию:** Да (sessionToken cookie)
**Требует роль admin:** Да

**Path параметры:**
- `id` (UUID) - ID продукта

**Ответ 204:** Нет содержимого

**Ошибки:**
| Код | Код ошибки | Описание |
|-----|------------|----------|
| 403 | FORBIDDEN | Доступ запрещён (требуется роль admin) |
| 401 | UNAUTHORIZED | Не авторизован |
| 401 | SESSION_EXPIRED | Сессия истекла |
| 400 | MISSING_PRODUCT_ID | ID продукта не указан |
| 404 | PRODUCT_NOT_FOUND | Продукт не найден |
| 409 | PRODUCT_IN_ORDERS | Продукт нельзя удалить, есть связанные заказы |

---

### GET /admin/orders

Получить список всех заказов (для администраторов).

**Метод:** GET
**Путь:** `/admin/orders`
**Требует авторизацию:** Да (sessionToken cookie)
**Требует роль admin:** Да

**Query параметры:**
| Параметр | Тип | Описание |
|----------|-----|----------|
| `status` | string | Фильтр по статусу: `pending`, `confirmed`, `shipped`, `delivered`, `cancelled` |
| `userId` | string | Фильтр по ID пользователя |
| `dateFrom` | string | Дата начала (ISO 8601) |
| `dateTo` | string | Дата окончания (ISO 8601) |
| `limit` | number | Количество заказов на странице (по умолчанию 20) |
| `offset` | number | Смещение для пагинации (по умолчанию 0) |
| `sort` | string | Сортировка: `created_at_desc`, `created_at_asc`, `total_desc`, `total_asc` |

**Ответ 200:**
```json
[
  {
    "id": "uuid",
    "userId": "uuid",
    "firstName": "Иван",
    "items": [
      {
        "productId": "uuid",
        "name": "Название товара",
        "price": 100.00,
        "currency": "BYN",
        "quantity": 2,
        "discountPercent": 10,
        "total": 180.00
      }
    ],
    "deliveryAddress": "г. Минск, ул. Примерная, д. 1",
    "phone": "+375291234567",
    "email": "customer@example.com",
    "paymentMethod": "cash",
    "deliveryType": "courier",
    "comment": "Позвонить перед доставкой",
    "status": "pending",
    "currency": "BYN",
    "totalSum": 180.00,
    "createdAt": "2026-03-07T14:30:00.000Z",
    "updatedAt": "2026-03-07T14:30:00.000Z"
  }
]
```

**Ошибки:**
| Код | Код ошибки | Описание |
|-----|------------|----------|
| 403 | FORBIDDEN | Доступ запрещён (требуется роль admin) |
| 401 | UNAUTHORIZED | Не авторизован |
| 401 | SESSION_EXPIRED | Сессия истекла |
| 400 | INVALID_STATUS | Некорректный статус заказа |
| 400 | INVALID_USER_ID | Некорректный ID пользователя |
| 400 | INVALID_DATE_FORMAT | Неверный формат даты |
| 400 | INVALID_LIMIT | limit должен быть от 1 до 100 |
| 400 | INVALID_OFFSET | offset должен быть неотрицательным |
| 400 | INVALID_SORT_PARAMETER | Некорректный параметр sort |

---

### GET /admin/orders/:id

Получить заказ по ID (для администраторов).

**Метод:** GET
**Путь:** `/admin/orders/:id`
**Требует авторизацию:** Да (sessionToken cookie)
**Требует роль admin:** Да

**Path параметры:**
- `id` (UUID) - ID заказа

**Ответ 200:**
```json
{
  "id": "uuid",
  "userId": "uuid",
  "firstName": "Иван",
  "items": [
    {
      "productId": "uuid",
      "name": "Название товара",
      "price": 100.00,
      "currency": "BYN",
      "quantity": 2,
      "discountPercent": 10,
      "total": 180.00
    }
  ],
  "deliveryAddress": "г. Минск, ул. Примерная, д. 1",
  "phone": "+375291234567",
  "email": "customer@example.com",
  "paymentMethod": "cash",
  "deliveryType": "courier",
  "comment": "Позвонить перед доставкой",
  "status": "pending",
  "currency": "BYN",
  "totalSum": 180.00,
  "createdAt": "2026-03-07T14:30:00.000Z",
  "updatedAt": "2026-03-07T14:30:00.000Z"
}
```

**Ошибки:**
| Код | Код ошибки | Описание |
|-----|------------|----------|
| 403 | FORBIDDEN | Доступ запрещён (требуется роль admin) |
| 401 | UNAUTHORIZED | Не авторизован |
| 401 | SESSION_EXPIRED | Сессия истекла |
| 400 | MISSING_ORDER_ID | ID заказа не указан |
| 404 | ORDER_NOT_FOUND | Заказ не найден |

---

### PUT /admin/orders/:id/status

Обновить статус заказа (для администраторов).

**Метод:** PUT
**Путь:** `/admin/orders/:id/status`
**Требует авторизацию:** Да (sessionToken cookie)
**Требует роль admin:** Да

**Path параметры:**
- `id` (UUID) - ID заказа

**Тело запроса:**
```json
{
  "status": "confirmed"
}
```

**Ответ 200:**
```json
{
  "id": "uuid",
  "userId": "uuid",
  "firstName": "Иван",
  "items": [
    {
      "productId": "uuid",
      "name": "Название товара",
      "price": 100.00,
      "currency": "BYN",
      "quantity": 2,
      "discountPercent": 10,
      "total": 180.00
    }
  ],
  "deliveryAddress": "г. Минск, ул. Примерная, д. 1",
  "phone": "+375291234567",
  "email": "customer@example.com",
  "paymentMethod": "cash",
  "deliveryType": "courier",
  "comment": "Позвонить перед доставкой",
  "status": "confirmed",
  "currency": "BYN",
  "totalSum": 180.00,
  "createdAt": "2026-03-07T14:30:00.000Z",
  "updatedAt": "2026-03-07T15:00:00.000Z"
}
```

**Ошибки:**
| Код | Код ошибки | Описание |
|-----|------------|----------|
| 403 | FORBIDDEN | Доступ запрещён (требуется роль admin) |
| 401 | UNAUTHORIZED | Не авторизован |
| 401 | SESSION_EXPIRED | Сессия истекла |
| 400 | MISSING_ORDER_ID | ID заказа не указан |
| 400 | MISSING_STATUS | Статус не указан |
| 400 | INVALID_STATUS | Некорректный статус заказа |
| 404 | ORDER_NOT_FOUND | Заказ не найден |
| 400 | ORDER_STATUS_UPDATE_NOT_ALLOWED | Обновление статуса невозможно |

---

### GET /admin/users

Получить список всех пользователей (для администраторов).

**Метод:** GET
**Путь:** `/admin/users`
**Требует авторизацию:** Да (sessionToken cookie)
**Требует роль admin:** Да

**Query параметры:**
| Параметр | Тип | Описание |
|----------|-----|----------|
| `search` | string | Поиск по имени, email, логину |
| `role` | string | Фильтр по роли: `user`, `admin` |
| `limit` | number | Количество пользователей на странице (по умолчанию 20) |
| `offset` | number | Смещение для пагинации (по умолчанию 0) |

**Ответ 200:**
```json
[
  {
    "id": "uuid",
    "name": "Иван Иванов",
    "email": "ivan@example.com",
    "login": "ivan123",
    "phone": "+375291234567",
    "role": "user",
    "createdAt": "2026-03-01T00:00:00.000Z",
    "updatedAt": "2026-03-07T00:00:00.000Z"
  }
]
```

**Ошибки:**
| Код | Код ошибки | Описание |
|-----|------------|----------|
| 403 | FORBIDDEN | Доступ запрещён (требуется роль admin) |
| 401 | UNAUTHORIZED | Не авторизован |
| 401 | SESSION_EXPIRED | Сессия истекла |
| 400 | INVALID_LIMIT | limit должен быть от 1 до 100 |
| 400 | INVALID_OFFSET | offset должен быть неотрицательным |
| 400 | INVALID_ROLE | Некорректная роль пользователя |

---

### GET /admin/users/:id

Получить пользователя по ID (для администраторов).

**Метод:** GET
**Путь:** `/admin/users/:id`
**Требует авторизацию:** Да (sessionToken cookie)
**Требует роль admin:** Да

**Path параметры:**
- `id` (UUID) - ID пользователя

**Ответ 200:**
```json
{
  "id": "uuid",
  "name": "Иван Иванов",
  "firstName": "Иван",
  "email": "ivan@example.com",
  "login": "ivan123",
  "phone": "+375291234567",
  "role": "user",
  "createdAt": "2026-03-01T00:00:00.000Z",
  "updatedAt": "2026-03-07T00:00:00.000Z"
}
```

**Ошибки:**
| Код | Код ошибки | Описание |
|-----|------------|----------|
| 403 | FORBIDDEN | Доступ запрещён (требуется роль admin) |
| 401 | UNAUTHORIZED | Не авторизован |
| 401 | SESSION_EXPIRED | Сессия истекла |
| 400 | MISSING_USER_ID | ID пользователя не указан |
| 404 | USER_NOT_FOUND | Пользователь не найден |

---

### PUT /admin/users/:id/role

Изменить роль пользователя (для администраторов).

**Метод:** PUT
**Путь:** `/admin/users/:id/role`
**Требует авторизацию:** Да (sessionToken cookie)
**Требует роль admin:** Да

**Path параметры:**
- `id` (UUID) - ID пользователя

**Тело запроса:**
```json
{
  "role": "admin"
}
```

**Ответ 200:**
```json
{
  "id": "uuid",
  "name": "Иван Иванов",
  "firstName": "Иван",
  "email": "ivan@example.com",
  "login": "ivan123",
  "phone": "+375291234567",
  "role": "admin",
  "createdAt": "2026-03-01T00:00:00.000Z",
  "updatedAt": "2026-03-07T15:00:00.000Z"
}
```

**Ошибки:**
| Код | Код ошибки | Описание |
|-----|------------|----------|
| 403 | FORBIDDEN | Доступ запрещён (требуется роль admin) |
| 401 | UNAUTHORIZED | Не авторизован |
| 401 | SESSION_EXPIRED | Сессия истекла |
| 400 | MISSING_USER_ID | ID пользователя не указан |
| 400 | MISSING_ROLE | Роль не указана |
| 400 | INVALID_ROLE | Некорректная роль пользователя |
| 404 | USER_NOT_FOUND | Пользователь не найден |
| 409 | CANNOT_CHANGE_OWN_ROLE | Нельзя изменить собственную роль |



### PUT /admin/users/:id/block

Заблокировать или разблокировать пользователя (для администраторов).

**Метод:** PUT
**Путь:** `/admin/users/:id/block`
**Требует авторизацию:** Да (sessionToken cookie)
**Требует роль admin:** Да

**Path параметры:**
- `id` (UUID) - ID пользователя

**Тело запроса:** Не требуется (пустой объект)

**Ответ 200:**
```json
{
  "message": "Пользователь успешно заблокирован",
  "user": {
    "id": "uuid",
    "name": "Иван Иванов",
    "firstName": "Иван",
    "email": "ivan@example.com",
    "login": "ivan123",
    "phone": "+375291234567",
    "role": "user",
    "createdAt": "2026-03-01T00:00:00.000Z",
    "updatedAt": "2026-03-07T15:00:00.000Z"
  }
}
```

**Ошибки:**
| Код | Код ошибки | Описание |
|-----|------------|----------|
| 403 | FORBIDDEN | Доступ запрещён (требуется роль admin) |
| 401 | UNAUTHORIZED | Не авторизован |
| 401 | SESSION_EXPIRED | Сессия истекла |
| 403 | CANNOT_BLOCK_SELF | Нельзя заблокировать свою учетную запись |
| 404 | USER_NOT_FOUND | Пользователь не найден |

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
  firstName: string;    // Имя (отдельное поле)
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
  price: number;           // Цена в BYN
  currency: 'BYN';         // Валюта (всегда BYN)
  category: string;        // Категория
  inStock: boolean;        // Наличие
  discountPercent?: number; // Скидка 0-100
  imageUrl?: string;       // URL изображения
  rating?: number;         // Рейтинг (1-5)
  reviewsCount?: number;   // Количество отзывов
  brand: string;           // Бренд
  warranty: string;        // Гарантия
  specifications: Record<string, unknown>; // Технические характеристики
  createdAt: string;       // ISO 8601
  updatedAt?: string;      // ISO 8601
}
```

### Cart

```typescript
interface Cart {
  userId: string;          // UUID пользователя
  items: CartItem[];       // Элементы корзины
  totalSum: number;        // Общая сумма (BYN)
  currency: 'BYN';         // Валюта (всегда BYN)
  updatedAt: string;       // ISO 8601
}

interface CartItem {
  productId: string;       // UUID продукта
  quantity: number;        // Количество
  name: string;            // Название продукта
  price: number;           // Цена за единицу (BYN)
  discountPercent?: number; // Скидка в процентах
  total: number;           // Итоговая сумма (BYN)
  currency: 'BYN';         // Валюта (всегда BYN)
  imageUrl?: string;       // URL изображения продукта
}
```

### Order

```typescript
interface Order {
  id: string;              // UUID заказа
  userId: string;          // UUID пользователя
  firstName: string;       // Имя получателя
  items: OrderItem[];      // Элементы заказа
  deliveryAddress: string; // Адрес доставки
  phone: string;           // Телефон (+1234567890)
  email: string;           // Email
  paymentMethod: 'cash' | 'card' | 'online'; // Способ оплаты
  deliveryType?: 'courier' | 'pickup';       // Тип доставки
  comment?: string;        // Комментарий
  status: OrderStatus;     // Статус заказа
  currency: 'BYN';         // Валюта (всегда BYN)
  totalSum: number;        // Общая сумма (BYN)
  createdAt: string;       // ISO 8601
  updatedAt?: string;      // ISO 8601
}

type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

interface OrderItem {
  productId: string;       // UUID продукта
  name: string;            // Название продукта на момент заказа
  price: number;           // Цена на момент заказа (BYN)
  currency: 'BYN';         // Валюта (всегда BYN)
  quantity: number;        // Количество
  discountPercent?: number; // Скидка в процентах
}
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