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
    const { products, loading, error, className } = this.props;

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
    icon.textContent = '⚠️';
    container.appendChild(icon);
    const message = this.createElement('p', { className: 'product-list__error-message' });
    message.textContent = this.props.error || 'Произошла ошибка при загрузке товаров';
    container.appendChild(message);
    return container;
  }

  private renderEmpty(): HTMLElement {
    const container = this.createElement('div', { className: 'product-list__empty' });
    const icon = this.createElement('span', { className: 'product-list__empty-icon' });
    icon.textContent = '📦';
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
