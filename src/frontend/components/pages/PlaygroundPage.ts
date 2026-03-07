/**
 * PlaygroundPage - Страница для изолированного просмотра и тестирования компонентов
 * 
 * Используется для:
 * - Визуального регрессионного тестирования
 * - Ручной проверки компонентов
 * - Демонстрации состояний компонентов
 */

import { Component } from '../base/Component.js';
import { Button, ButtonVariant, ButtonSize } from '../ui/Button.js';
import { Input } from '../ui/Input.js';
import { Modal } from '../ui/Modal.js';
import { ProductCard } from '../product/ProductCard.js';
import type { Product } from '../../types/product.js';

interface PlaygroundPageProps {
  component?: string;
}

/**
 * Примеры данных для ProductCard
 */
const SAMPLE_PRODUCT: Product = {
  id: '1',
  name: 'Смартфон Galaxy S24 Ultra',
  description: 'Мощный смартфон с камерой 200 МП',
  price: 99990,
  category: 'electronics',
  imageUrl: 'https://via.placeholder.com/300x300',
  inStock: true,
  rating: 4.8,
  reviewsCount: 124,
  discountPercent: 15,
};

const SAMPLE_PRODUCT_OUT_OF_STOCK: Product = {
  id: '2',
  name: 'Ноутбук ThinkPad X1',
  description: 'Бизнес-ноутбук премиум-класса',
  price: 149990,
  category: 'electronics',
  imageUrl: 'https://via.placeholder.com/300x300',
  inStock: false,
  rating: 4.5,
  reviewsCount: 89,
  discountPercent: 0,
};

/**
 * PlaygroundPage - страница для тестирования компонентов
 * Не наследуется от Component, так как это самостоятельная страница
 */
export class PlaygroundPage {
  private currentComponent: string = 'button';
  private container: HTMLElement | null = null;

  constructor(component?: string) {
    this.currentComponent = component || 'button';
  }

  /**
   * Рендер страницы playground
   */
  public render(): HTMLElement {
    this.container = document.createElement('div');
    const container = document.createElement('div');
    container.className = 'playground-page';
    container.innerHTML = `
      <div class="container" style="padding: var(--spacing-lg);">
        <h1 class="page__title" style="margin-bottom: var(--spacing-lg);">
          Component Playground
        </h1>
        
        <div style="display: flex; gap: var(--spacing-md); margin-bottom: var(--spacing-xl); flex-wrap: wrap;">
          <button class="btn btn--primary" data-component="button">Button</button>
          <button class="btn btn--secondary" data-component="input">Input</button>
          <button class="btn btn--secondary" data-component="modal">Modal</button>
          <button class="btn btn--secondary" data-component="product-card">ProductCard</button>
        </div>
        
        <div class="playground-content" id="playground-content">
          ${this.renderComponent(this.currentComponent)}
        </div>
      </div>
    `;

    // Добавить обработчики для кнопок переключения
    container.querySelectorAll('[data-component]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const target = e.target as HTMLElement;
        const componentName = target.dataset.component;
        if (componentName) {
          this.currentComponent = componentName;
          const content = container.querySelector('#playground-content');
          if (content) {
            content.innerHTML = this.renderComponent(componentName);
          }
        }
      });
    });

    return container;
  }

  /**
   * Рендер выбранного компонента
   */
  private renderComponent(component: string): string {
    switch (component) {
      case 'button':
        return this.renderButtonExamples();
      case 'input':
        return this.renderInputExamples();
      case 'modal':
        return this.renderModalExamples();
      case 'product-card':
        return this.renderProductCardExamples();
      default:
        return '<p>Компонент не найден</p>';
    }
  }

  /**
   * Рендер примеров Button
   */
  private renderButtonExamples(): string {
    return `
      <div class="playground-section">
        <h2 style="margin-bottom: var(--spacing-lg);">Button Component</h2>
        
        <h3 style="margin-bottom: var(--spacing-md);">Sizes</h3>
        <div style="display: flex; gap: var(--spacing-md); align-items: center; margin-bottom: var(--spacing-xl);">
          <button class="btn btn--primary btn--sm">Small</button>
          <button class="btn btn--primary btn--md">Medium</button>
          <button class="btn btn--primary btn--lg">Large</button>
        </div>
        
        <h3 style="margin-bottom: var(--spacing-md);">Variants</h3>
        <div style="display: flex; gap: var(--spacing-md); flex-wrap: wrap; margin-bottom: var(--spacing-xl);">
          <button class="btn btn--primary">Primary</button>
          <button class="btn btn--secondary">Secondary</button>
          <button class="btn btn--outline">Outline</button>
          <button class="btn btn--ghost">Ghost</button>
        </div>
        
        <h3 style="margin-bottom: var(--spacing-md);">States</h3>
        <div style="display: flex; gap: var(--spacing-md); flex-wrap: wrap; margin-bottom: var(--spacing-xl);">
          <button class="btn btn--primary">Default</button>
          <button class="btn btn--primary" hover>Hover</button>
          <button class="btn btn--primary" focus>Focus</button>
          <button class="btn btn--primary" disabled>Disabled</button>
          <button class="btn btn--primary is-loading">Loading</button>
        </div>
        
        <h3 style="margin-bottom: var(--spacing-md);">Colors</h3>
        <div style="display: flex; gap: var(--spacing-md); flex-wrap: wrap;">
          <button class="btn btn--primary">Primary</button>
          <button class="btn btn--secondary">Secondary</button>
          <button class="btn btn--success">Success</button>
          <button class="btn btn--error">Error</button>
          <button class="btn btn--warning">Warning</button>
        </div>
      </div>
    `;
  }

  /**
   * Рендер примеров Input
   */
  private renderInputExamples(): string {
    return `
      <div class="playground-section">
        <h2 style="margin-bottom: var(--spacing-lg);">Input Component</h2>
        
        <h3 style="margin-bottom: var(--spacing-md);">States</h3>
        <div style="display: flex; flex-direction: column; gap: var(--spacing-md); max-width: 400px; margin-bottom: var(--spacing-xl);">
          <div>
            <label style="display: block; margin-bottom: var(--spacing-1); font-size: var(--font-size-sm);">Default</label>
            <input type="text" class="input" placeholder="Enter text..." />
          </div>
          <div>
            <label style="display: block; margin-bottom: var(--spacing-1); font-size: var(--font-size-sm);">With Value</label>
            <input type="text" class="input" value="Filled value" />
          </div>
          <div>
            <label style="display: block; margin-bottom: var(--spacing-1); font-size: var(--font-size-sm);">Focus (click to see)</label>
            <input type="text" class="input" placeholder="Click me..." />
          </div>
          <div>
            <label style="display: block; margin-bottom: var(--spacing-1); font-size: var(--font-size-sm);">Error</label>
            <input type="text" class="input input--error" value="Invalid input" />
            <span style="color: var(--color-error); font-size: var(--font-size-xs);">Error message here</span>
          </div>
          <div>
            <label style="display: block; margin-bottom: var(--spacing-1); font-size: var(--font-size-sm);">Success</label>
            <input type="text" class="input input--success" value="Valid input" />
          </div>
          <div>
            <label style="display: block; margin-bottom: var(--spacing-1); font-size: var(--font-size-sm);">Disabled</label>
            <input type="text" class="input" value="Disabled" disabled />
          </div>
        </div>
        
        <h3 style="margin-bottom: var(--spacing-md);">Types</h3>
        <div style="display: flex; flex-direction: column; gap: var(--spacing-md); max-width: 400px;">
          <div>
            <label style="display: block; margin-bottom: var(--spacing-1); font-size: var(--font-size-sm);">Email</label>
            <input type="email" class="input" placeholder="email@example.com" />
          </div>
          <div>
            <label style="display: block; margin-bottom: var(--spacing-1); font-size: var(--font-size-sm);">Password</label>
            <input type="password" class="input" placeholder="••••••••" />
          </div>
          <div>
            <label style="display: block; margin-bottom: var(--spacing-1); font-size: var(--font-size-sm);">Search</label>
            <input type="search" class="input" placeholder="Search..." />
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Рендер примеров Modal
   */
  private renderModalExamples(): string {
    return `
      <div class="playground-section">
        <h2 style="margin-bottom: var(--spacing-lg);">Modal Component</h2>
        
        <div style="margin-bottom: var(--spacing-xl);">
          <button class="btn btn--primary" id="open-modal-btn">Open Modal</button>
        </div>
        
        <div class="modal-backdrop" id="modal-backdrop" style="display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 1000;"></div>
        <div class="modal" id="sample-modal" style="display: none; position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 90%; max-width: 480px; background: var(--color-bg-primary); border-radius: var(--radius-5); padding: var(--spacing-8); box-shadow: var(--shadow-5); z-index: 1001;">
          <h3 style="margin-bottom: var(--spacing-md);">Modal Title</h3>
          <p style="margin-bottom: var(--spacing-lg); color: var(--color-text-secondary);">
            This is a sample modal dialog. It can contain any content you need.
          </p>
          <div style="display: flex; gap: var(--spacing-md); justify-content: flex-end;">
            <button class="btn btn--outline" id="close-modal-btn">Cancel</button>
            <button class="btn btn--primary">Confirm</button>
          </div>
        </div>
        
        <p style="color: var(--color-text-secondary);">
          Нажмите "Open Modal" чтобы увидеть модальное окно.
        </p>
      </div>
      
      <script>
        const modal = document.getElementById('sample-modal');
        const backdrop = document.getElementById('modal-backdrop');
        const openBtn = document.getElementById('open-modal-btn');
        const closeBtn = document.getElementById('close-modal-btn');
        
        function openModal() {
          modal.style.display = 'block';
          backdrop.style.display = 'block';
          setTimeout(() => {
            modal.style.opacity = '1';
            modal.style.transform = 'translate(-50%, -50%) scale(1)';
          }, 10);
        }
        
        function closeModal() {
          modal.style.opacity = '0';
          modal.style.transform = 'translate(-50%, -50%) scale(0.95)';
          setTimeout(() => {
            modal.style.display = 'none';
            backdrop.style.display = 'none';
          }, 250);
        }
        
        openBtn.addEventListener('click', openModal);
        closeBtn.addEventListener('click', closeModal);
        backdrop.addEventListener('click', closeModal);
      </script>
    `;
  }

  /**
   * Рендер примеров ProductCard
   */
  private renderProductCardExamples(): string {
    return `
      <div class="playground-section">
        <h2 style="margin-bottom: var(--spacing-lg);">ProductCard Component</h2>
        
        <h3 style="margin-bottom: var(--spacing-md);">Default State</h3>
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: var(--spacing-lg); margin-bottom: var(--spacing-xl); max-width: 900px;">
          ${this.renderProductCard(SAMPLE_PRODUCT)}
        </div>
        
        <h3 style="margin-bottom: var(--spacing-md);">Out of Stock</h3>
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: var(--spacing-lg); margin-bottom: var(--spacing-xl); max-width: 900px;">
          ${this.renderProductCard(SAMPLE_PRODUCT_OUT_OF_STOCK)}
        </div>
        
        <h3 style="margin-bottom: var(--spacing-md);">With Discount</h3>
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: var(--spacing-lg); max-width: 900px;">
          ${this.renderProductCard({ ...SAMPLE_PRODUCT, discountPercent: 20 })}
        </div>
      </div>
    `;
  }

  /**
   * Рендер карточки товара
   */
  private renderProductCard(product: Product): string {
    const card = new ProductCard({ product });
    return card.render().outerHTML;
  }
}
