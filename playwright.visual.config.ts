/**
 * Конфигурация визуального регрессионного тестирования для L_Shop
 * 
 * Использование:
 *   npx playwright test --config=playwright.visual.config.ts
 *   npx playwright test --config=playwright.visual.config.ts --update-snapshots  # обновить baseline
 */

import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  // Общая директория для всех тестов
  testDir: './src/frontend/__visual_tests__',
  
  // Директория для эталонных скриншотов (baseline)
  snapshotDir: './src/frontend/__visual_tests__/screenshots',
  
  // Выходная директория для результатов
  outputDir: './src/frontend/__visual_tests__/output',
  
  // Полностью параллельное выполнение
  fullyParallel: true,
  
  // Подавлять вывод stdout/stderr во время выполнения
  quiet: false,
  
  // Таймауты
  timeout: 30 * 1000,
  expect: {
    timeout: 5 * 1000,
    // Настройки для визуального сравнения
    toHaveScreenshot: {
      // Максимальное различие в пикселях (порог чувствительности)
      maxDiffPixelRatio: 0.02,  // 2% - допустимый порог для кросс-браузерных различий
      // Или можно использовать maxDiffPixels для абсолютного числа
      // maxDiffPixels: 100,
    },
  },
  
  // Проекты (разные конфигурации браузеров)
  projects: [
    // Desktop - Chrome (основной)
    {
      name: 'chromium-desktop',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 800 },
        deviceScaleFactor: 1,
      },
    },
    
    // Desktop - Firefox
    {
      name: 'firefox-desktop',
      use: {
        ...devices['Desktop Firefox'],
        viewport: { width: 1280, height: 800 },
      },
    },
    
    // Desktop - Safari/WebKit
    {
      name: 'webkit-desktop',
      use: {
        ...devices['Desktop Safari'],
        viewport: { width: 1280, height: 800 },
      },
    },
    
    // Tablet - iPad
    {
      name: 'ipad-mini',
      use: {
        ...devices['iPad Mini'],
      },
    },
    
    // Mobile - iPhone
    {
      name: 'iphone-14',
      use: {
        ...devices['iPhone 14'],
      },
    },
    
    // Mobile - Pixel
    {
      name: 'pixel-7',
      use: {
        ...devices['Pixel 7'],
      },
    },
  ],
  
  // Использовать репортер с скриншотами
  reporter: [
    ['html', { outputFolder: './src/frontend/__visual_tests__/report' }],
    ['list'],
  ],
  
  // Веб-сервер для тестов (опционально)
  // webServer: {
  //   command: 'npm run dev:frontend',
  //   port: 5173,
  //   timeout: 120 * 1000,
  //   reuseExistingServer: !process.env.CI,
  // },
  
  // Настройки для CI
  use: {
    // Базовая ссылка
    baseURL: 'http://localhost:3002',
    
    // Делать скриншоты только при падении
    screenshot: 'only-on-failure',
    
    // Записывать видео только при падении
    video: 'retain-on-failure',
    
    // Трассировка только при падении
    trace: 'retain-on-failure',
  },
});

/**
 * Настройки маскирования динамического контента
 * 
 * Для маскирования нестабильных элементов (даты, цены, имена пользователей)
 * можно использовать CSS или JavaScript.
 * 
 * Пример CSS-селекторов для игнорирования:
 * - .dynamic-date
 * .dynamic-price
 * .user-name
 * 
 * Playwright поддерживает:
 * - toHaveScreenshot({ mask: [...] }) - маскирование элементов
 * - toHaveScreenshot({ maskColor: 'transparent' }) - цвет маски
 */
