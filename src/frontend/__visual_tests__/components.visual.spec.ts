/**
 * Визуальные регрессионные тесты для компонентов L_Shop
 * 
 * Запуск:
 *   npx playwright test --config=playwright.visual.config.ts components.visual.spec.ts
 * 
 * Обновление baseline:
 *   npx playwright test --config=playwright.visual.config.ts components.visual.spec.ts --update-snapshots
 */

import { test, expect, Locator } from '@playwright/test';

// Функция для получения массива локаторов для маскирования
function getMaskLocators(page: { locator: (selector: string) => Locator }): Locator[] {
  return [
    page.locator('.dynamic-price'),
    page.locator('.dynamic-date'),
    page.locator('.user-name'),
    page.locator('[data-dynamic]'),
  ];
}

// ============================================================================
// BUTTON TESTS
// ============================================================================

test.describe('Button Component', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('/playground');
    // Click on Button tab to show button examples
    await page.click('[data-component="button"]');
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

  test('Button - all sizes', async ({ page }) => {
    const section = page.locator('.playground-section');
    await expect(section).toHaveScreenshot('button-sizes.png');
  });
});

// ============================================================================
// INPUT TESTS
// ============================================================================

test.describe('Input Component', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('/playground');
    // Click on Input tab
    await page.click('[data-component="input"]');
  });

  test('Input - default state', async ({ page }) => {
    const input = page.locator('.input').first();
    await expect(input).toHaveScreenshot('input-default.png');
  });

  test('Input - focus state', async ({ page }) => {
    const input = page.locator('.input').first();
    await input.focus();
    await expect(input).toHaveScreenshot('input-focus.png');
  });

  test('Input - filled state', async ({ page }) => {
    const input = page.locator('.input').first();
    await input.fill('test@example.com');
    await expect(input).toHaveScreenshot('input-filled.png');
  });

  test('Input - error state', async ({ page }) => {
    const input = page.locator('.input--error').first();
    await expect(input).toHaveScreenshot('input-error.png');
  });
});

// ============================================================================
// PRODUCT CARD TESTS
// ============================================================================

test.describe('ProductCard Component', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('/playground');
    // Click on ProductCard tab
    await page.click('[data-component="product-card"]');
  });

  test('ProductCard - default state', async ({ page }) => {
    const card = page.locator('.product-card').first();
    await expect(card).toHaveScreenshot('product-card-default.png');
  });

  test('ProductCard - hover state', async ({ page }) => {
    const card = page.locator('.product-card').first();
    await card.hover();
    await expect(card).toHaveScreenshot('product-card-hover.png');
  });
});

// ============================================================================
// MAIN PAGE TESTS
// ============================================================================

test.describe('Main Page', () => {
  
  test('Main page - product list', async ({ page }) => {
    // Use PlaygroundPage which has stable mock data
    await page.goto('/playground');
    // Click on ProductCard tab to show product examples
    await page.click('[data-component="product-card"]');
    // Wait for product cards to be visible
    await page.waitForSelector('.product-card', { timeout: 10000 });
    // Additional wait for animations to complete
    await page.waitForTimeout(500);
    const productSection = page.locator('.playground-section');
    await expect(productSection).toHaveScreenshot('main-page-product-list.png');
  });
});
