# Правила вклада в проект L_Shop

## Git Workflow

### Ветки

- `main` - защищённая ветка, изменения только через Pull Request
- `review` - пустая ветка для ревью (PR из main в review не закрывается)
- `feature/<модуль>-<имя>` - ветки разработчиков

### Именование веток

```
feature/products-nikita    # Никита П. - продукты
feature/cart-timofey       # Тимофей - корзина
feature/orders-nikita-t    # Никита Т. - заказы
```

### Формат коммитов

Используем Conventional Commits на английском языке:

```
feat: add product filtering
fix: correct cart item removal
docs: update API documentation
refactor: simplify auth middleware
test: add unit tests for validators
chore: update dependencies
```

### Процесс работы

1. Создай ветку от `main`
2. Выполняй работу, делай коммиты
3. Перед созданием PR обнови ветку от `main`
4. Создай Pull Request в `main`
5. Получи минимум 2 аппрува от коллег
6. Тимлид (Глеб) делает финальный merge

## Код-стайл

### TypeScript

- **Строгая типизация**: `strict: true`, `noImplicitAny: true`
- **Запрет `any`**: используй `unknown` с проверками
- **Импорты**: сортировка по eslint-plugin-import

### ESLint + Prettier

Конфигурация:
- `airbnb-typescript/base`
- Single quotes
- Trailing commas
- Max line width: 100

### Комментарии

- Комментарии в коде - на русском языке
- JSDoc для сложной логики

## Структура файлов

### Backend

```
src/backend/
  controllers/  # HTTP-обработчики
  services/     # Бизнес-логика
  routes/       # Маршруты
  models/       # TypeScript interfaces
  middleware/   # Middleware функции
  utils/        # Вспомогательные функции
```

### Frontend

```
src/frontend/
  pages/        # Страницы SPA
  components/   # UI-компоненты
  services/     # API запросы
  router/       # Маршрутизация
  store/        # Состояние
  types/        # TypeScript types
```

## Code Review

### Критерии

1. Отсутствие типа `any`
2. Правильная типизация
3. Соответствие код-стайлу
4. Работоспособность кода
5. Наличие необходимых data-attribute

### Checklist для PR

- [ ] Код компилируется без ошибок
- [ ] ESLint не показывает ошибок
- [ ] Функциональность работает
- [ ] Data-attribute на месте
- [ ] Комментарии добавлены где нужно
