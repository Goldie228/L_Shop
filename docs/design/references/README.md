# Визуальные референсы L_Shop

Эта директория содержит скриншоты компонентов и страниц для визуального контроля дизайна.

## Структура

```
references/
├── components/
│   ├── button/           # Скриншоты компонента Button
│   ├── input/            # Скриншоты компонента Input
│   ├── modal/            # Скриншоты компонента Modal (TODO)
│   └── product-card/     # Скриншоты компонента ProductCard
└── pages/
    ├── main-page/        # Скриншоты главной страницы
    ├── cart-page/        # Скриншоты страницы корзины
    ├── profile-page/     # Скриншоты страницы профиля
    └── delivery-page/    # Скриншоты страницы доставки
```

## Компоненты

### Button (`components/button/`)

| Файл | Описание |
|------|----------|
| `button-default-*.png` | Кнопка в состоянии по умолчанию |
| `button-hover-*.png` | Кнопка при наведении |
| `button-sizes-*.png` | Кнопки всех размеров (small, medium, large) |

**Варианты:**
- Primary (основная)
- Secondary (вторичная)
- Danger (опасная)

**Размеры:**
- Small (32px)
- Medium (40px)
- Large (48px)

---

### Input (`components/input/`)

| Файл | Описание |
|------|----------|
| `input-default-*.png` | Поле ввода в состоянии по умолчанию |
| `input-focus-*.png` | Поле ввода в фокусе |
| `input-filled-*.png` | Заполненное поле ввода |
| `input-error-*.png` | Поле ввода с ошибкой |

**Состояния:**
- Default
- Focus
- Filled
- Error
- Disabled

---

### ProductCard (`components/product-card/`)

| Файл | Описание |
|------|----------|
| `product-card-default-*.png` | Карточка продукта в состоянии по умолчанию |
| `product-card-hover-*.png` | Карточка продукта при наведении |

**Элементы:**
- Изображение продукта
- Название
- Цена (со скидкой и без)
- Кнопка "В корзину"

---

## Страницы

### MainPage (`pages/main-page/`)

| Файл | Описание |
|------|----------|
| `main-page-desktop-*.png` | Главная страница на десктопе |
| `main-page-tablet-*.png` | Главная страница на планшете |
| `main-page-mobile-*.png` | Главная страница на мобильном |
| `main-page-empty-*.png` | Пустой каталог |
| `main-page-loading-*.png` | Состояние загрузки |
| `main-page-filters-open-*.png` | С открытой панелью фильтров |

---

### CartPage (`pages/cart-page/`)

| Файл | Описание |
|------|----------|
| `cart-page-desktop-*.png` | Страница корзины на десктопе |
| `cart-page-mobile-*.png` | Страница корзины на мобильном |
| `cart-page-empty-*.png` | Пустая корзина |
| `cart-page-discount-*.png` | Корзина со скидкой |
| `cart-page-desktop-dark-*.png` | Тёмная тема |

---

### ProfilePage (`pages/profile-page/`)

| Файл | Описание |
|------|----------|
| `profile-page-desktop-*.png` | Страница профиля на десктопе |
| `profile-page-edit-*.png` | Режим редактирования профиля |

---

### DeliveryPage (`pages/delivery-page/`)

| Файл | Описание |
|------|----------|
| `delivery-page-desktop-*.png` | Страница доставки на десктопе |
| `delivery-page-mobile-*.png` | Страница доставки на мобильном |
| `delivery-page-filled-*.png` | Заполненная форма |

---

## Тёмная тема

Скриншоты тёмной темы доступны для:
- Button (`button-dark-*.png`)
- Input (`input-dark-*.png`)
- MainPage (`main-page-desktop-dark-*.png`)
- CartPage (`cart-page-desktop-dark-*.png`)

---

## Обновление скриншотов

Скриншоты генерируются автоматически при запуске визуальных тестов:

```bash
# Запуск визуальных тестов
npm run test:visual

# Обновление скриншотов (при изменении дизайна)
npm run test:visual:update
```

## Использование

1. **Для разработчиков** — используйте эти скриншоты как визуальный референс при вёрстке
2. **Для дизайнеров** — сравнивайте с макетами для контроля качества
3. **Для QA** — проверяйте регрессию визуального вида

---

*Документ обновлён: март 2026*