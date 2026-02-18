# Архитектура проекта L_Shop

## Общая схема

```
[Browser SPA] <---> [Express Server] <---> [JSON Files]
     |                    |                    |
  TypeScript          TypeScript          Data Storage
  Components          Controllers         users.json
  Router              Services            products.json
  Store               Middleware          carts.json
                     Models              orders.json
                                         sessions.json
```

## Backend

### Слои:

1. **Routes** - определение маршрутов и привязка к контроллерам
2. **Controllers** - обработка HTTP-запросов, валидация, формирование ответа
3. **Services** - бизнес-логика, работа с данными
4. **Models** - описание типов данных (TypeScript interfaces)
5. **Middleware** - промежуточная обработка (auth, errors)
6. **Utils** - вспомогательные функции

### Аутентификация

1. Пользователь регистрируется/входит
2. Сервер создаёт сессию (token + userId + expiresAt)
3. Токен сохраняется в httpOnly cookie
4. Middleware проверяет токен при каждом запросе к защищённым ресурсам

## Frontend (планируется)

### Слои:

1. **Router** - управление URL и отображение страниц
2. **Pages** - компоненты страниц
3. **Components** - переиспользуемые UI-компоненты
4. **Services** - запросы к API
5. **Store** - глобальное состояние

## Data-attributes для тестирования

| Attribute | Element |
|-----------|---------|
| data-title | Название товара на главной |
| data-price | Цена товара на главной |
| data-title="basket" | Название товара в корзине |
| data-price="basket" | Цена товара в корзине |
| data-registration | Форма регистрации |
| data-delivery | Форма доставки |
