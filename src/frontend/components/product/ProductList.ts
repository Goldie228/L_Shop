/**
 * Компонент списка продуктов - L_Shop Frontend
 * Отображает сетку карточек продуктов
 */

import { Component, ComponentProps } from '../base/Component.js';
import { ProductCard } from './ProductCard.js';
import { Product } from '../../types/product.js';

/**
 * Интерфейс пропсов для ProductList
 */
export interface ProductListProps extends ComponentProps {
  /** Массив продуктов */
  products: Product[];
  /** Авторизован ли пользователь */
  isAuthenticated: boolean;
  /** Callback для добавления в корзину */
  onAddToCart?: (productId: string) => void;
  /** Состояние загрузки */
  loading?: boolean;
  /** Сообщение об ошибке */
  error?: string | null;
}

/**
 * Список продуктов с сеткой карточек
 *
 * @example
 * ```typescript
 * const productList = new ProductList({
 *   products: productsData,
 *   isAuthenticated: true,
 *   onAddToCart: (id) => console.log('Added:', id)
 * });
 * productList.mount(container);
 * ```
 */
export class ProductList extends Component<ProductListProps> {
  /** Массив карточек продуктов */
  private productCards: ProductCard[] = [];

  /**
   * Получить пропсы по умолчанию
   */
  protected getDefaultProps(): ProductListProps {
    return {
      ...super.getDefaultProps(),
      products: [],
      isAuthenticated: false,
      loading: false,
      error: null,
    };
  }

  /**
   * Отрендерить список продуктов
   */
  public render(): HTMLElement {
    const { products, loading, error, className } = this.props;

    // Построить классы
    const classes = ['product-list'];
    if (className) {
      classes.push(className);
    }

    // Создать корневой элемент
    this.element = this.createElement('div', {
      className: classes.join(' '),
    });

    // Показать состояние загрузки
    if (loading) {
      const loadingElement = this.renderLoading();
      this.element.appendChild(loadingElement);
      return this.element;
    }

    // Показать ошибку
    if (error) {
      const errorElement = this.renderError();
      this.element.appendChild(errorElement);
      return this.element;
    }

    // Показать пустой список
    if (products.length === 0) {
      const emptyElement = this.renderEmpty();
      this.element.appendChild(emptyElement);
      return this.element;
    }

    // Отрендерить сетку продуктов
    const grid = this.renderGrid();
    this.element.appendChild(grid);

    return this.element;
  }

  /**
   * Отрендерить состояние загрузки
   */
  private renderLoading(): HTMLElement {
    const loadingContainer = this.createElement('div', {
      className: 'product-list__loading',
    });

    const spinner = this.createElement('div', {
      className: 'product-list__spinner',
    });
    loadingContainer.appendChild(spinner);

    const text = this.createElement('span', {
      className: 'product-list__loading-text',
    });
    text.textContent = 'Загрузка товаров...';
    loadingContainer.appendChild(text);

    return loadingContainer;
  }

  /**
   * Отрендерить ошибку
   */
  private renderError(): HTMLElement {
    const errorContainer = this.createElement('div', {
      className: 'product-list__error',
    });

    const icon = this.createElement('span', {
      className: 'product-list__error-icon',
    });
    icon.textContent = '⚠️';
    errorContainer.appendChild(icon);

    const message = this.createElement('p', {
      className: 'product-list__error-message',
    });
    message.textContent = this.props.error || 'Произошла ошибка при загрузке товаров';
    errorContainer.appendChild(message);

    return errorContainer;
  }

  /**
   * Отрендерить пустой список
   */
  private renderEmpty(): HTMLElement {
    const emptyContainer = this.createElement('div', {
      className: 'product-list__empty',
    });

    const icon = this.createElement('span', {
      className: 'product-list__empty-icon',
    });
    icon.textContent = '📦';
    emptyContainer.appendChild(icon);

    const message = this.createElement('p', {
      className: 'product-list__empty-message',
    });
    message.textContent = 'Товары не найдены';
    emptyContainer.appendChild(message);

    const hint = this.createElement('p', {
      className: 'product-list__empty-hint',
    });
    hint.textContent = 'Попробуйте изменить параметры фильтрации';
    emptyContainer.appendChild(hint);

    return emptyContainer;
  }

  /**
   * Отрендерить сетку карточек продуктов
   */
  private renderGrid(): HTMLElement {
    const { products, isAuthenticated, onAddToCart } = this.props;

    const grid = this.createElement('div', {
      className: 'product-list__grid',
    });

    // Очистить предыдущие карточки
    this.productCards.forEach((card) => card.destroy());
    this.productCards = [];

    // Создать карточки для каждого продукта
    products.forEach((product) => {
      const card = new ProductCard({
        product,
        isAuthenticated,
        onAddToCart,
      });

      card.mount(grid);
      this.productCards.push(card);
    });

    return grid;
  }

  /**
   * Обновить список продуктов
   */
  public updateProducts(products: Product[]): void {
    this.setProps({ products });
    this.update();
  }

  /**
   * Установить состояние загрузки
   */
  public setLoading(loading: boolean): void {
    this.setProps({ loading });
    this.update();
  }

  /**
   * Установить ошибку
   */
  public setError(error: string | null): void {
    this.setProps({ error });
    this.update();
  }
}