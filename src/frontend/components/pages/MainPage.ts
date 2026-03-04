/**
 * Главная страница - L_Shop Frontend
 * Каталог продуктов с фильтрацией
 */

import { Component, ComponentProps } from '../base/Component.js';
import { ProductList } from '../product/ProductList.js';
import { ProductFilters } from '../product/ProductFilters.js';
import { Product, ProductFilters as ProductFiltersType } from '../../types/product.js';
import { api } from '../../services/api.js';
import { store } from '../../store/store.js';

/**
 * Интерфейс пропсов для MainPage
 */
export interface MainPageProps extends ComponentProps {
  /** Callback для добавления в корзину */
  onAddToCart?: (productId: string) => void;
}

/**
 * Главная страница с каталогом продуктов
 */
export class MainPage extends Component<MainPageProps> {
  /** Компонент фильтров */
  private filtersComponent: ProductFilters | null = null;
  /** Компонент списка продуктов */
  private productListComponent: ProductList | null = null;
  /** Текущие фильтры */
  private currentFilters: ProductFiltersType = {};
  /** Загруженные продукты */
  private products: Product[] = [];

  /**
   * Получить пропсы по умолчанию
   */
  protected getDefaultProps(): MainPageProps {
    return {
      ...super.getDefaultProps(),
    };
  }

  /**
   * Отрендерить главную страницу
   */
  public render(): HTMLElement {
    const { className } = this.props;

    // Построить классы
    const classes = ['page', 'main-page'];
    if (className) {
      classes.push(className);
    }

    // Создать корневой элемент
    this.element = this.createElement('div', {
      className: classes.join(' '),
    });

    // Заголовок страницы
    const header = this.renderHeader();
    this.element.appendChild(header);

    // Контейнер с фильтрами и списком
    const content = this.createElement('div', {
      className: 'main-page__content',
    });

    // Панель фильтров
    const filtersContainer = this.renderFilters();
    content.appendChild(filtersContainer);

    // Список продуктов
    const listContainer = this.renderProductList();
    content.appendChild(listContainer);

    this.element.appendChild(content);

    // Загрузить продукты
    this.loadProducts();

    return this.element;
  }

  /**
   * Отрендерить заголовок страницы
   */
  private renderHeader(): HTMLElement {
    const header = this.createElement('div', {
      className: 'main-page__header',
    });

    const container = this.createElement('div', {
      className: 'container',
    });

    const title = this.createElement('h1', {
      className: 'page__title',
    });
    title.textContent = 'Каталог товаров';
    container.appendChild(title);

    header.appendChild(container);

    return header;
  }

  /**
   * Отрендерить панель фильтров
   */
  private renderFilters(): HTMLElement {
    const container = this.createElement('aside', {
      className: 'main-page__filters',
    });

    this.filtersComponent = new ProductFilters({
      filters: this.currentFilters,
      onFilterChange: (filters) => this.handleFilterChange(filters),
    });

    this.filtersComponent.mount(container);
    this.addChild(this.filtersComponent);

    return container;
  }

  /**
   * Отрендерить список продуктов
   */
  private renderProductList(): HTMLElement {
    const container = this.createElement('main', {
      className: 'main-page__products',
    });

    const isAuthenticated = store.isAuthenticated();

    this.productListComponent = new ProductList({
      products: [],
      isAuthenticated,
      onAddToCart: (productId) => this.handleAddToCart(productId),
      loading: true,
    });

    this.productListComponent.mount(container);
    this.addChild(this.productListComponent);

    return container;
  }

  /**
   * Загрузить продукты с сервера
   */
  private async loadProducts(): Promise<void> {
    if (!this.productListComponent) return;

    this.productListComponent.setLoading(true);
    this.productListComponent.setError(null);

    try {
      // Преобразовать фильтры в query-параметры
      const params: Record<string, string> = {};
      if (this.currentFilters.search) {
        params.search = this.currentFilters.search;
      }
      if (this.currentFilters.sort) {
        params.sort = this.currentFilters.sort;
      }
      if (this.currentFilters.category) {
        params.category = this.currentFilters.category;
      }
      if (this.currentFilters.inStock !== undefined) {
        params.inStock = String(this.currentFilters.inStock);
      }
      if (this.currentFilters.minRating !== undefined) {
        params.minRating = String(this.currentFilters.minRating);
      }

      this.products = await api.get<Product[]>('/api/products', params);
      this.productListComponent.updateProducts(this.products);
    } catch (error) {
      console.error('[MainPage] Ошибка загрузки продуктов:', error);
      this.productListComponent.setError('Не удалось загрузить товары. Попробуйте позже.');
    } finally {
      this.productListComponent.setLoading(false);
    }
  }

  /**
   * Обработать изменение фильтров
   */
  private handleFilterChange(filters: ProductFiltersType): void {
    this.currentFilters = filters;
    this.loadProducts();
  }

  /**
   * Обработать добавление в корзину
   */
  private handleAddToCart(productId: string): void {
    console.log('[MainPage] Добавление в корзину:', productId);
    // TODO: Реализовать добавление в корзину
    this.props.onAddToCart?.(productId);
  }

  /**
   * Обновить состояние авторизации
   */
  public updateAuthState(): void {
    if (this.productListComponent) {
      this.productListComponent.setProps({
        isAuthenticated: store.isAuthenticated(),
      });
      this.productListComponent.update();
    }
  }
}