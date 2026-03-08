/**
 * Компонент списка продуктов - L_Shop Frontend
 * Отображает сетку карточек продуктов
 */

import { Component, ComponentProps } from '../base/Component.js';
import { ProductCard } from './ProductCard.js';
import { Product } from '../../types/product.js';

export interface ProductListProps extends ComponentProps {
  products: Product[];
  isAuthenticated: boolean;
  onAddToCart?: (productId: string) => void;
  loading?: boolean;
  error?: string | null;
}

export class ProductList extends Component<ProductListProps> {
  private productCards: ProductCard[] = [];

  protected getDefaultProps(): ProductListProps {
    return {
      ...super.getDefaultProps(),
      products: [],
      isAuthenticated: false,
      loading: false,
      error: null,
    };
  }

  public render(): HTMLElement {
    const {
      products, loading, error, className,
    } = this.props;

    const classes = ['product-list'];
    if (className) {
      classes.push(className);
    }

    this.element = this.createElement('div', {
      className: classes.join(' '),
    });

    if (loading) {
      this.element.appendChild(this.renderLoading());
      return this.element;
    }

    if (error) {
      this.element.appendChild(this.renderError());
      return this.element;
    }

    if (products.length === 0) {
      this.element.appendChild(this.renderEmpty());
      return this.element;
    }

    this.element.appendChild(this.renderGrid());
    return this.element;
  }

  private renderLoading(): HTMLElement {
    const container = this.createElement('div', { className: 'product-list__loading' });
    const spinner = this.createElement('div', { className: 'product-list__spinner' });
    container.appendChild(spinner);
    const text = this.createElement('span', { className: 'product-list__loading-text' });
    text.textContent = 'Загрузка товаров...';
    container.appendChild(text);
    return container;
  }

  private renderError(): HTMLElement {
    const container = this.createElement('div', { className: 'product-list__error' });
    const icon = this.createElement('span', { className: 'product-list__error-icon' });
    icon.innerHTML = `
      <svg class="product-list__error-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
        <line x1="12" y1="9" x2="12" y2="13"></line>
        <line x1="12" y1="17" x2="12.01" y2="17"></line>
      </svg>
    `;
    container.appendChild(icon);
    const message = this.createElement('p', { className: 'product-list__error-message' });
    message.textContent = this.props.error || 'Произошла ошибка при загрузке товаров';
    container.appendChild(message);
    return container;
  }

  private renderEmpty(): HTMLElement {
    const container = this.createElement('div', { className: 'product-list__empty' });
    const icon = this.createElement('span', { className: 'product-list__empty-icon' });
    icon.innerHTML = `
      <svg class="product-list__empty-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
        <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
        <line x1="12" y1="22.08" x2="12" y2="12"></line>
      </svg>
    `;
    container.appendChild(icon);
    const message = this.createElement('p', { className: 'product-list__empty-message' });
    message.textContent = 'Товары не найдены';
    container.appendChild(message);
    const hint = this.createElement('p', { className: 'product-list__empty-hint' });
    hint.textContent = 'Попробуйте изменить параметры фильтрации';
    container.appendChild(hint);
    return container;
  }

  private renderGrid(): HTMLElement {
    const { products, isAuthenticated, onAddToCart } = this.props;
    const grid = this.createElement('div', { className: 'product-list__grid' });

    this.productCards.forEach((card) => card.destroy());
    this.productCards = [];

    products.forEach((product) => {
      const card = new ProductCard({ product, isAuthenticated, onAddToCart });
      card.mount(grid);
      this.productCards.push(card);
    });

    return grid;
  }

  public updateProducts(products: Product[]): void {
    this.setProps({ products });
    this.update();
  }

  public setLoading(loading: boolean): void {
    this.setProps({ loading });
    this.rerender();
  }

  public setError(error: string | null): void {
    this.setProps({ error });
    this.rerender();
  }

  /**
   * Перерисовать компонент с текущими props
   */
  private rerender(): void {
    if (!this.element) return;

    const oldElement = this.element;
    const newElement = this.render();
    oldElement.replaceWith(newElement);
    this.element = newElement;
  }
}
