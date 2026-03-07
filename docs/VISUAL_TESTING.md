# Визуальное тестирование в L_Shop

> Руководство по настройке и использованию визуального регрессионного тестирования

## Содержание

1. [Введение](#введение)
2. [Установка](#установка)
3. [Настройка](#настройка)
4. [Запуск тестов](#запуск-тестов)
5. [Структура тестов](#структура-тестов)
6. [Обновление эталонов](#обновление-эталонов)
7. [Интерпретация результатов](#интерпретация-результатов)
8. [CI/CD интеграция](#cicd-интеграция)
9. [Часто задаваемые вопросы](#часто-задаваемые-вопросы)

---

## Введение

### Зачем нужно визуальное тестирование?

Визуальное регрессионное тестирование помогает обнаружить нежелательные изменения в UI, которые могут возникнуть при:
- Изменении стилей компонентов
- Обновлении дизайн-токенов
- Рефакторинге CSS
- Добавлении новых функций

### Инструменты

Проект использует **Playwright** для визуального тестирования:
- Уже установлен в проекте (`@playwright/test`)
- Интеграция с существующим E2E стеком (Cypress также доступен)
- Сравнение скриншотов на уровне пикселей
- Кросс-браузерное тестирование

---

## Установка

### Требования

- Node.js 18+
- npm 9+

### Установка браузеров Playwright

```bash
# Установка Chromium, Firefox, WebKit
npx playwright install

# Или только Chromium (для быстрой настройки)
npx playwright install chromium
```

### Проверка установки

```bash
# Должен показать установленные браузеры
npx playwright install --dry-run
```

---

## Настройка

### Конфигурационный файл

Основной конфигурационный файл: `playwright.visual.config.ts`

```typescript
// Ключевые настройки
export default defineConfig({
  testDir: './src/frontend/__visual_tests__',
  snapshotDir: './src/frontend/__visual_tests__/screenshots',
  
  // Порог чувствительности (1% - рекомендуется)
  expect: {
    toHaveScreenshot: {
      maxDiffPixelRatio: 0.01,
    },
  },
  
  // Проекты для разных устройств
  projects: [
    { name: 'chromium-desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox-desktop', use: { ...devices['Desktop Firefox'] } },
    { name: 'ipad-mini', use: { ...devices['iPad Mini'] } },
    { name: 'iphone-14', use: { ...devices['iPhone 14'] } },
  ],
});
```

### NPM-скрипты

```bash
# Запустить все визуальные тесты
npm run test:visual

# Запустить только тесты компонентов
npm run test:visual:components

# Запустить только тесты страниц
npm run test:visual:pages

# Обновить эталонные скриншоты
npm run test:visual:update

# Показать HTML-отчёт
npm run test:visual:report
```

---

## Запуск тестов

### Локальный запуск

#### Все тесты

```bash
npm run test:visual
```

#### Тесты компонентов

```bash
npm run test:visual:components
```

#### Тесты страниц

```bash
npm run test:visual:pages
```

#### Определённый браузер

```bash
npx playwright test --config=playwright.visual.config.ts --project=chromium-desktop
```

#### С обновлением скриншотов

```bash
npm run test:visual:update
```

### Запуск с dev-сервером

```bash
# В одном терминале запустить dev-сервер
npm run dev:frontend

# В другом терминале запустить тесты
npm run test:visual
```

---

## Структура тестов

```
src/frontend/__visual_tests__/
├── components.visual.spec.ts   # Тесты компонентов
├── pages.visual.spec.ts        # Тесты страниц
├── screenshots/               # Эталонные скриншоты (baseline)
│   ├── components/
│   │   ├── button-default.png
│   │   ├── button-hover.png
│   │   └── ...
│   └── pages/
│       ├── main-page-desktop.png
│       └── ...
└── report/                    # HTML-отчёты
```

### Пример теста компонента

```typescript
import { test, expect } from '@playwright/test';

test.describe('Button Component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/playground/button');
  });

  test('Button - default state', async ({ page }) => {
    const button = page.locator('.btn--primary').first();
    await expect(button).toHaveScreenshot('button-default.png');
  });

  test('Button - hover state', async ({ page }) => {
    const button = page.locator('.btn--primary').first();
    await button.hover();
    await expect(button).toHaveScreenshot('button-hover.png');
  });
});
```

### Пример теста страницы

```typescript
import { test, expect } from '@playwright/test';

test.describe('MainPage', () => {
  test('MainPage - desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/');
    await expect(page).toHaveScreenshot('main-page-desktop.png');
  });

  test('MainPage - mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await expect(page).toHaveScreenshot('main-page-mobile.png');
  });
});
```

---

## Обновление эталонов

### Когда нужно обновлять?

- Изменение дизайна компонента
- Добавление нового состояния компонента
- Рефакторинг стилей
- Обновление дизайн-токенов

### Как обновить?

1. **Локально:**

```bash
# Запустить тесты и обновить изменившиеся скриншоты
npm run test:visual:update

# Или с конкретным браузером
npx playwright test --config=playwright.visual.config.ts --update-snapshots
```

2. **Проверить изменения:**

```bash
# Посмотреть diff в HTML-отчёте
npm run test:visual:report

# Или проверить глазами
ls -la src/frontend/__visual_tests__/screenshots/
```

3. **Зафиксировать:**

```bash
git add src/frontend/__visual_tests__/screenshots/
git commit -m "visual: update baseline screenshots for Button component"
```

### Важно!

> ⚠️ **Не обновляйте скриншоты автоматически в CI!**
> 
> Всегда проверяйте изменения локально перед коммитом. Если изменения ожидаемы и согласованы с дизайнером — обновляйте baseline.

---

## Интерпретация результатов

### Успешный тест

```
✓ Button - default state (chromium-desktop) (150ms)
✓ Button - hover state (chromium-desktop) (120ms)
```

### Проваленный тест

```
✗ Button - default state (chromium-desktop)
  Error: Image is 34248 bytes, but expected 33892 bytes.
  Max difference between pixel is 1.23%, which exceeds threshold of 1%.
```

### Что делать при падении?

1. **Проверьте diff:**

```bash
# Откройте HTML-отчёт
npm run test:visual:report
```

2. **Определите причину:**
   - Преднамеренное изменение дизайна?
   - Баг в коде?
   - Нестабильный контент (динамические данные)?

3. **Действия:**
   - **Баг** → Исправьте код, запустите тесты снова
   - **Ожидаемое изменение** → Обновите baseline: `npm run test:visual:update`
   - **Нестабильный контент** → Добавьте маскирование

### Маскирование динамического контента

Для элементов с меняющимися данными (даты, цены, имена):

```typescript
test('ProductCard - with dynamic data', async ({ page }) => {
  const card = page.locator('.product-card').first();
  
  await expect(card).toHaveScreenshot('product-card.png', {
    // Маскировать элементы с динамическим контентом
    mask: [
      page.locator('.product-price'),
      page.locator('.product-date'),
    ],
    maskColor: 'transparent', // или '#FF0000' для видимой маски
  });
});
```

---

## CI/CD интеграция

### GitHub Actions

Создайте файл `.github/workflows/visual-tests.yml`:

```yaml
name: Visual Tests

on:
  pull_request:
    paths:
      - 'src/frontend/**/*.ts'
      - 'src/frontend/**/*.css'
      - 'src/frontend/styles/**'
      - 'playwright.visual.config.ts'

jobs:
  visual-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Install Playwright browsers
        run: npx playwright install --with-deps chromium
      
      - name: Build frontend
        run: npm run build:frontend
      
      - name: Start dev server
        run: npm run dev:frontend &
      
      - name: Wait for server
        run: sleep 10
      
      - name: Run visual tests
        run: npm run test:visual
        
      - name: Upload artifacts
        uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: visual-test-report
          path: src/frontend/__visual_tests__/report/
          retention-days: 7
```

### GitLab CI

```yaml
visual_tests:
  image: node:20
  script:
    - npm ci
    - npx playwright install chromium
    - npm run build:frontend
    - npm run dev:frontend &
    - sleep 10
    - npm run test:visual
  artifacts:
    when: on_failure
    reports:
      junit: src/frontend/__visual_tests__/report/junit.xml
```

---

## Часто задаваемые вопросы

### Почему тесты падают из-за 0.1% разницы?

Это нормально для рендеринга в разных окружениях. Настройте порог:

```typescript
// playwright.visual.config.ts
expect: {
  toHaveScreenshot: {
    maxDiffPixelRatio: 0.01, // 1% - по умолчанию
    // maxDiffPixels: 100,    // или абсолютное число пикселей
  },
}
```

### Как игнорировать определённые области?

```typescript
await expect(page).toHaveScreenshot('page.png', {
  mask: [page.locator('.ignore-this')],
});
```

### Как тестировать только на одном браузере?

```bash
npx playwright test --config=playwright.visual.config.ts --project=chromium-desktop
```

### Как добавить новый тест?

1. Добавьте тест в `components.visual.spec.ts` или `pages.visual.spec.ts`
2. Запустите с обновлением: `npm run test:visual:update`
3. Проверьте результат
4. Зафиксируйте изменения

### Тесты медленные, как ускорить?

1. Запускайте только нужные тесты:
```bash
npx playwright test --config=playwright.visual.config.ts components.visual.spec.ts
```

2. Ограничьте количество браузеров в проектах
3. Используйте параллельный запуск (включён по умолчанию)

### Где хранятся эталонные скриншоты?

В `src/frontend/__visual_tests__/screenshots/`. Эти файлы должны быть в репозитории.

---

## Ресурсы

- [Playwright Screenshot Testing](https://playwright.dev/docs/test-snapshots)
- [Visual Regression Testing Best Practices](https://playwright.dev/docs/visual-regression-testing)
- [Design Tokens Documentation](./DESIGN_SYSTEM.md)
