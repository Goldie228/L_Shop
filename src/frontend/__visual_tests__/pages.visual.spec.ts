/**
 * Визуальные регрессионные тесты для страниц L_Shop
 * 
 * Запуск:
 *   npx playwright test --config=playwright.visual.config.ts pages.visual.spec.ts
 * 
 * Обновление baseline:
 *   npx playwright test --config=playwright.visual.config.ts pages.visual.spec.ts --update-snapshots
 */

import { test, expect } from '@playwright/test';

// ============================================================================
// MAIN PAGE TESTS
// ============================================================================

test.describe('MainPage', () => {
  
  test('MainPage - desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/');
    await expect(page).toHaveScreenshot('main-page-desktop.png');
  });

  test('MainPage - tablet', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');
    await expect(page).toHaveScreenshot('main-page-tablet.png');
  });

  test('MainPage - mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await expect(page).toHaveScreenshot('main-page-mobile.png');
  });

  test('MainPage - with filters open (mobile)', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    // Открыть фильтры на мобильном
    const filterToggle = page.locator('[data-testid="filters-toggle"]');
    if (await filterToggle.isVisible()) {
      await filterToggle.click();
    }
    
    await expect(page).toHaveScreenshot('main-page-filters-open.png');
  });

  test('MainPage - empty state', async ({ page }) => {
    await page.goto('/?empty=true');
    await expect(page).toHaveScreenshot('main-page-empty.png');
  });

  test('MainPage - loading state', async ({ page }) => {
    await page.goto('/?loading=true');
    await expect(page).toHaveScreenshot('main-page-loading.png');
  });
});

// ============================================================================
// CART PAGE TESTS
// ============================================================================

test.describe('CartPage', () => {
  
  test('CartPage - desktop with items', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/cart');
    await expect(page).toHaveScreenshot('cart-page-desktop.png');
  });

  test('CartPage - mobile with items', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/cart');
    await expect(page).toHaveScreenshot('cart-page-mobile.png');
  });

  test('CartPage - empty cart', async ({ page }) => {
    await page.goto('/cart?empty=true');
    await expect(page).toHaveScreenshot('cart-page-empty.png');
  });

  test('CartPage - with discount applied', async ({ page }) => {
    await page.goto('/cart?discount=true');
    await expect(page).toHaveScreenshot('cart-page-discount.png');
  });
});

// ============================================================================
// PROFILE PAGE TESTS
// ============================================================================

test.describe('ProfilePage', () => {
  
  test('ProfilePage - logged in', async ({ page }) => {
    await page.goto('/profile');
    await expect(page).toHaveScreenshot('profile-page-desktop.png');
  });

  test('ProfilePage - edit mode', async ({ page }) => {
    await page.goto('/profile?edit=true');
    await expect(page).toHaveScreenshot('profile-page-edit.png');
  });
});

// ============================================================================
// DELIVERY PAGE TESTS
// ============================================================================

test.describe('DeliveryPage', () => {
  
  test('DeliveryPage - desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/delivery');
    await expect(page).toHaveScreenshot('delivery-page-desktop.png');
  });

  test('DeliveryPage - mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/delivery');
    await expect(page).toHaveScreenshot('delivery-page-mobile.png');
  });

  test('DeliveryPage - form filled', async ({ page }) => {
    await page.goto('/delivery?filled=true');
    await expect(page).toHaveScreenshot('delivery-page-filled.png');
  });
});

// ============================================================================
// DARK MODE TESTS
// ============================================================================

test.describe('Dark Mode', () => {
  
  test('MainPage - dark mode desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/?dark=true');
    await expect(page).toHaveScreenshot('main-page-desktop-dark.png');
  });

  test('CartPage - dark mode desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/cart?dark=true');
    await expect(page).toHaveScreenshot('cart-page-desktop-dark.png');
  });

  test('Button - dark mode', async ({ page }) => {
    await page.goto('/playground/button?dark=true');
    const button = page.locator('.btn--primary').first();
    await expect(button).toHaveScreenshot('button-dark.png');
  });

  test('Input - dark mode', async ({ page }) => {
    await page.goto('/playground');
    // Click on Input tab to show input examples
    await page.click('[data-component="input"]');
    // Enable dark mode
    await page.evaluate(() => {
      document.documentElement.classList.add('dark-theme');
    });
    await page.waitForTimeout(300);
    const input = page.locator('.input').first();
    await expect(input).toHaveScreenshot('input-dark.png');
  });
});
