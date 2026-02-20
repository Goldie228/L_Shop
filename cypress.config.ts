import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'cypress/support/e2e.ts',
    // Настройка для разработки
    watchForFileChanges: true,
    // Таймауты
    defaultCommandTimeout: 10000,
    pageLoadTimeout: 30000,
    requestTimeout: 10000,
    // Снимки скриншотов при падении тестов
    screenshotOnRunFailure: true,
    // Видео при падении
    video: true,
    // Уменьшаем шум в выводе
    quiet: false,
  },
  component: {
    devServer: {
      framework: 'react',
      bundler: 'vite',
    },
  },
});
