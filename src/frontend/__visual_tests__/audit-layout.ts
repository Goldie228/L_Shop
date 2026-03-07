/**
 * Скрипт аудита вёрстки для L_Shop
 * 
 * Создаёт скриншоты текущего состояния и проверяет консольные ошибки
 * Запуск: npx ts-node src/frontend/__visual_tests__/audit-layout.ts
 */

import { chromium, Browser, Page } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';

// Конфигурация
const BASE_URL = 'http://localhost:3004';
const OUTPUT_DIR = path.join(__dirname, 'output', 'audit');
const REFERENCES_DIR = path.join(__dirname, '..', '..', '..', '..', 'docs', 'design', 'references', 'pages', 'main-page');

// Настройки viewport
const VIEWPORTS = {
  desktop: { width: 1280, height: 800 },
  tablet: { width: 768, height: 1024 },
  mobile: { width: 375, height: 667 }
};

// Результаты аудита
interface AuditResult {
  name: string;
  viewport: string;
  passed: boolean;
  errors: string[];
  warnings: string[];
  screenshotPath?: string;
}

const results: AuditResult[] = [];

/**
 * Создать директорию если не существует
 */
function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

/**
 * Сохранить скриншот
 */
async function saveScreenshot(page: Page, name: string) {
  const screenshotPath = path.join(OUTPUT_DIR, name);
  await page.screenshot({ path: screenshotPath, fullPage: true });
  return screenshotPath;
}

/**
 * Получить сообщения консоли
 */
function setupConsoleListener(page: Page): { errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  page.on('console', msg => {
    const text = msg.text();
    if (msg.type() === 'error') {
      // Фильтруем несущественные ошибки
      if (!text.includes('favicon') && !text.includes('manifest') && !text.includes('404')) {
        errors.push(text);
      }
    } else if (msg.type() === 'warning') {
      if (!text.includes('favicon') && !text.includes('manifest')) {
        warnings.push(text);
      }
    }
  });
  
  page.on('pageerror', error => {
    errors.push(`Page Error: ${error.message}`);
  });
  
  return { errors, warnings };
}

/**
 * Аудит главной страницы
 */
async function auditMainPage(browser: Browser) {
  console.log('\n=== Аудит MainPage ===\n');
  
  for (const [viewportName, viewport] of Object.entries(VIEWPORTS)) {
    console.log(`\n--- Viewport: ${viewportName} (${viewport.width}x${viewport.height}) ---`);
    
    const context = await browser.newContext({ viewport });
    const page = await context.newPage();
    const consoleMessages = setupConsoleListener(page);
    
    const result: AuditResult = {
      name: 'MainPage',
      viewport: viewportName,
      passed: true,
      errors: [],
      warnings: []
    };
    
    try {
      // Переход на страницу
      console.log(`Navigating to ${BASE_URL}/...`);
      await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 30000 });
      
      // Ждать загрузки контента
      await page.waitForTimeout(2000);
      
      // Проверить наличие критических элементов
      const headerExists = await page.locator('.header').count() > 0;
      const productListExists = await page.locator('.product-list').count() > 0 || await page.locator('.main-page__products').count() > 0;
      const filtersExists = await page.locator('.product-filters').count() > 0 || await page.locator('.main-page__filters').count() > 0;
      
      console.log(`Header: ${headerExists ? '✓' : '✗'}`);
      console.log(`Product List: ${productListExists ? '✓' : '✗'}`);
      console.log(`Filters: ${filtersExists ? '✓' : '✗'}`);
      
      if (!headerExists) result.errors.push('Header component not found');
      if (!productListExists) result.warnings.push('Product list not found (might be loading state)');
      
      // Проверить структуру страницы
      const mainPageExists = await page.locator('.main-page').count() > 0;
      const containerExists = await page.locator('.container').count() > 0;
      
      console.log(`Main Page container: ${mainPageExists ? '✓' : '✗'}`);
      console.log(`Container class: ${containerExists ? '✓' : '✗'}`);
      
      // Проверить сетку продуктов
      const productGridExists = await page.locator('.product-list__grid').count() > 0;
      const productCards = await page.locator('.product-card').count();
      
      console.log(`Product Grid: ${productGridExists ? '✓' : '✗'}`);
      console.log(`Product Cards: ${productCards}`);
      
      // Проверить фильтры
      const filterGroups = await page.locator('.product-filters__group').count();
      const filterSelects = await page.locator('.product-filters__select').count();
      
      console.log(`Filter Groups: ${filterGroups}`);
      console.log(`Filter Selects: ${filterSelects}`);
      
      // Скриншот текущего состояния
      const currentScreenshotName = `main-page-${viewportName}-current.png`;
      result.screenshotPath = await saveScreenshot(page, currentScreenshotName);
      console.log(`Screenshot saved: ${result.screenshotPath}`);
      
      // Проверить эталон
      const referenceName = `main-page-${viewportName}-chromium-desktop-linux.png`;
      const referencePath = path.join(REFERENCES_DIR, referenceName);
      
      if (fs.existsSync(referencePath)) {
        console.log(`Reference found: ${referencePath}`);
      } else {
        console.log(`Reference NOT found: ${referencePath}`);
        result.warnings.push(`Reference screenshot not found: ${referenceName}`);
      }
      
    } catch (error) {
      result.passed = false;
      result.errors.push(`Error: ${(error as Error).message}`);
      console.error('Error:', error);
    }
    
    // Добавить консольные ошибки
    result.errors.push(...consoleMessages.errors);
    result.warnings.push(...consoleMessages.warnings);
    
    if (result.errors.length > 0) {
      result.passed = false;
    }
    
    results.push(result);
    
    await context.close();
  }
}

/**
 * Аудит тёмной темы
 */
async function auditDarkTheme(browser: Browser) {
  console.log('\n=== Аудит Dark Theme ===\n');
  
  const viewport = VIEWPORTS.desktop;
  
  const context = await browser.newContext({ 
    viewport,
    colorScheme: 'dark'
  });
  const page = await context.newPage();
  const consoleMessages = setupConsoleListener(page);
  
  const result: AuditResult = {
    name: 'MainPage (Dark)',
    viewport: 'desktop-dark',
    passed: true,
    errors: [],
    warnings: []
  };
  
  try {
    // Включить тёмную тему
    await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 30000 });
    
    // Добавить класс dark-theme к root
    await page.evaluate(() => {
      document.documentElement.classList.add('dark-theme');
    });
    
    await page.waitForTimeout(1000);
    
    // Проверить, что класс применён
    const hasDarkTheme = await page.evaluate(() => {
      return document.documentElement.classList.contains('dark-theme');
    });
    
    console.log(`Dark theme class applied: ${hasDarkTheme ? '✓' : '✗'}`);
    
    // Скриншот
    result.screenshotPath = await saveScreenshot(page, 'main-page-desktop-dark-current.png');
    console.log(`Screenshot saved: ${result.screenshotPath}`);
    
    // Проверить эталон
    const referencePath = path.join(REFERENCES_DIR, 'main-page-desktop-dark-chromium-desktop-linux.png');
    
    if (fs.existsSync(referencePath)) {
      console.log(`Reference found: ${referencePath}`);
    } else {
      result.warnings.push('Reference screenshot for dark theme not found');
    }
    
  } catch (error) {
    result.passed = false;
    result.errors.push(`Error: ${(error as Error).message}`);
  }
  
  result.errors.push(...consoleMessages.errors);
  result.warnings.push(...consoleMessages.warnings);
  
  if (result.errors.length > 0) {
    result.passed = false;
  }
  
  results.push(result);
  
  await context.close();
}

/**
 * Проверить состояние мобильного меню
 */
async function auditMobileMenu(browser: Browser) {
  console.log('\n=== Аудит Mobile Menu ===\n');
  
  const viewport = VIEWPORTS.mobile;
  
  const context = await browser.newContext({ viewport });
  const page = await context.newPage();
  
  const result: AuditResult = {
    name: 'Mobile Menu',
    viewport: 'mobile',
    passed: true,
    errors: [],
    warnings: []
  };
  
  try {
    await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(1000);
    
    // Проверить видимость мобильного меню
    const menuToggle = await page.locator('.header__menu-toggle').count();
    const mobileMenu = await page.locator('.header__mobile-menu').count();
    
    console.log(`Menu toggle: ${menuToggle > 0 ? '✓' : '✗'}`);
    console.log(`Mobile menu container: ${mobileMenu > 0 ? '✓' : '✗'}`);
    
    if (menuToggle === 0) {
      result.errors.push('Mobile menu toggle not found');
      result.passed = false;
    }
    
    if (mobileMenu === 0) {
      result.errors.push('Mobile menu container not found');
      result.passed = false;
    }
    
    if (menuToggle > 0) {
      // Открыть меню
      await page.click('.header__menu-toggle');
      await page.waitForTimeout(500);
      
      result.screenshotPath = await saveScreenshot(page, 'main-page-mobile-menu-open.png');
      console.log('Mobile menu opened and screenshot saved');
      
      // Проверить, что меню открыто
      const menuIsOpen = await page.locator('.header__mobile-menu--open').count() > 0;
      console.log(`Menu is open: ${menuIsOpen ? '✓' : '✗'}`);
      
      if (!menuIsOpen) {
        result.warnings.push('Mobile menu does not have --open class after click');
      }
    }
    
  } catch (error) {
    result.passed = false;
    result.errors.push(`Error: ${(error as Error).message}`);
  }
  
  results.push(result);
  
  await context.close();
}

/**
 * Анализ DOM-структуры
 */
async function analyzeDomStructure(browser: Browser) {
  console.log('\n=== Анализ DOM-структуры ===\n');
  
  const viewport = VIEWPORTS.desktop;
  
  const context = await browser.newContext({ viewport });
  const page = await context.newPage();
  
  try {
    await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2000);
    
    // Получить информацию о структуре
    const structureInfo = await page.evaluate(() => {
      const getInfo = (selector: string) => {
        const el = document.querySelector(selector) as HTMLElement | null;
        if (!el) return null;
        
        const styles = window.getComputedStyle(el);
        return {
          exists: true,
          display: styles.display,
          flexDirection: styles.flexDirection,
          gridTemplateColumns: styles.gridTemplateColumns,
          gap: styles.gap,
          padding: styles.padding,
          width: el.offsetWidth,
          height: el.offsetHeight,
          childrenCount: el.children.length
        };
      };
      
      return {
        mainPage: getInfo('.main-page'),
        mainPageContent: getInfo('.main-page__content'),
        mainPageFilters: getInfo('.main-page__filters'),
        mainPageProducts: getInfo('.main-page__products'),
        productFilters: getInfo('.product-filters'),
        productList: getInfo('.product-list'),
        productListGrid: getInfo('.product-list__grid'),
        header: getInfo('.header'),
        headerContainer: getInfo('.header__container')
      };
    });
    
    console.log('DOM Structure Analysis:');
    for (const [key, value] of Object.entries(structureInfo)) {
      if (value) {
        console.log(`\n${key}:`);
        console.log(`  Display: ${value.display}`);
        if (value.flexDirection) console.log(`  Flex Direction: ${value.flexDirection}`);
        if (value.gridTemplateColumns) console.log(`  Grid Columns: ${value.gridTemplateColumns}`);
        console.log(`  Gap: ${value.gap}`);
        console.log(`  Size: ${value.width}x${value.height}px`);
        console.log(`  Children: ${value.childrenCount}`);
      } else {
        console.log(`\n${key}: NOT FOUND`);
      }
    }
    
    // Сохранить анализ в файл
    const analysisPath = path.join(OUTPUT_DIR, 'dom-analysis.json');
    fs.writeFileSync(analysisPath, JSON.stringify(structureInfo, null, 2));
    console.log(`\nAnalysis saved to: ${analysisPath}`);
    
  } catch (error) {
    console.error('Error:', error);
  }
  
  await context.close();
}

/**
 * Сгенерировать HTML отчёт
 */
function generateHtmlReport(): string {
  let html = `
<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>L_Shop Layout Audit Report</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 20px; max-width: 1400px; margin: 0 auto; background: #f8fafc; }
    h1 { color: #1e293b; border-bottom: 2px solid #e2e8f0; padding-bottom: 16px; }
    .summary { display: flex; gap: 16px; margin: 24px 0; }
    .summary-card { background: white; padding: 20px 24px; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); min-width: 120px; }
    .summary-card h3 { margin: 0 0 8px; font-size: 14px; color: #64748b; }
    .summary-card .value { font-size: 32px; font-weight: 700; }
    .summary-card.passed .value { color: #22c55e; }
    .summary-card.failed .value { color: #ef4444; }
    .summary-card.total .value { color: #3b82f6; }
    .result { background: white; border-radius: 12px; padding: 20px; margin: 16px 0; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    .result.pass { border-left: 4px solid #22c55e; }
    .result.fail { border-left: 4px solid #ef4444; }
    .result h3 { margin: 0 0 12px; display: flex; align-items: center; gap: 8px; }
    .result h3 .status { font-size: 20px; }
    .errors { background: #fef2f2; border-radius: 8px; padding: 12px 16px; margin: 12px 0; }
    .warnings { background: #fffbeb; border-radius: 8px; padding: 12px 16px; margin: 12px 0; }
    .errors h4, .warnings h4 { margin: 0 0 8px; font-size: 14px; }
    .errors h4 { color: #ef4444; }
    .warnings h4 { color: #f59e0b; }
    .errors ul, .warnings ul { margin: 0; padding-left: 20px; }
    .errors li { color: #991b1b; }
    .warnings li { color: #92400e; }
    .screenshots { margin-top: 16px; }
    .screenshots h4 { margin: 0 0 12px; color: #475569; }
    .screenshot { display: inline-block; margin-right: 16px; margin-bottom: 16px; }
    .screenshot img { max-width: 400px; border: 1px solid #e2e8f0; border-radius: 8px; }
    .screenshot p { margin: 8px 0 0; font-size: 12px; color: #64748b; }
    a { color: #3b82f6; }
  </style>
</head>
<body>
  <h1>L_Shop Layout Audit Report</h1>
  <p>Generated: ${new Date().toLocaleString('ru-RU')}</p>
  
  <div class="summary">
    <div class="summary-card total">
      <h3>Total Tests</h3>
      <div class="value">${results.length}</div>
    </div>
    <div class="summary-card passed">
      <h3>Passed</h3>
      <div class="value">${results.filter(r => r.passed).length}</div>
    </div>
    <div class="summary-card failed">
      <h3>Failed</h3>
      <div class="value">${results.filter(r => !r.passed).length}</div>
    </div>
  </div>
`;

  for (const result of results) {
    html += `
  <div class="result ${result.passed ? 'pass' : 'fail'}">
    <h3>
      <span class="status">${result.passed ? '✓' : '✗'}</span>
      ${result.name} (${result.viewport})
    </h3>
    ${result.errors.length > 0 ? `
      <div class="errors">
        <h4>Errors (${result.errors.length})</h4>
        <ul>
          ${result.errors.map(e => `<li>${escapeHtml(e)}</li>`).join('')}
        </ul>
      </div>
    ` : ''}
    ${result.warnings.length > 0 ? `
      <div class="warnings">
        <h4>Warnings (${result.warnings.length})</h4>
        <ul>
          ${result.warnings.map(w => `<li>${escapeHtml(w)}</li>`).join('')}
        </ul>
      </div>
    ` : ''}
    ${result.screenshotPath ? `
      <div class="screenshots">
        <h4>Screenshot</h4>
        <div class="screenshot">
          <img src="${path.basename(result.screenshotPath)}" alt="${result.name}">
          <p>Current state</p>
        </div>
      </div>
    ` : ''}
  </div>
`;
  }

  html += `
</body>
</html>
`;
  
  return html;
}

function escapeHtml(text: string): string {
  return text.replace(/&/g, '&').replace(/</g, '<').replace(/>/g, '>').replace(/"/g, '"');
}

/**
 * Главная функция
 */
async function main() {
  console.log('L_Shop Layout Audit');
  console.log('====================');
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`Output: ${OUTPUT_DIR}`);
  
  // Создать директорию
  ensureDir(OUTPUT_DIR);
  
  const browser = await chromium.launch({ headless: true });
  
  try {
    await auditMainPage(browser);
    await auditDarkTheme(browser);
    await auditMobileMenu(browser);
    await analyzeDomStructure(browser);
    
    // Генерировать отчёт
    const reportHtml = generateHtmlReport();
    const reportPath = path.join(OUTPUT_DIR, 'audit-report.html');
    fs.writeFileSync(reportPath, reportHtml);
    
    console.log('\n=== Summary ===\n');
    console.log(`Total tests: ${results.length}`);
    console.log(`Passed: ${results.filter(r => r.passed).length}`);
    console.log(`Failed: ${results.filter(r => !r.passed).length}`);
    console.log(`\nReport: ${reportPath}`);
    
    // Вывести ошибки
    const allErrors = results.flatMap(r => r.errors);
    const allWarnings = results.flatMap(r => r.warnings);
    
    if (allErrors.length > 0) {
      console.log('\n=== Errors ===');
      allErrors.forEach(e => console.log(`- ${e}`));
    }
    
    if (allWarnings.length > 0) {
      console.log('\n=== Warnings ===');
      allWarnings.forEach(w => console.log(`- ${w}`));
    }
    
  } finally {
    await browser.close();
  }
}

main().catch(console.error);