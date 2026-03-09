/**
 * Страница каталога - L_Shop Frontend
 * Каталог продуктов с фильтрацией
 */

import { Component, ComponentProps } from '../base/Component.js';
import { ProductList } from '../product/ProductList.js';
import { ProductFilters } from '../product/ProductFilters.js';
import { Breadcrumbs, BreadcrumbItem } from '../ui/Breadcrumbs.js';
import { Toast } from '../ui/Toast.js';
import { Product, ProductFilters as ProductFiltersType } from '../../types/product.js';
import { api } from '../../services/api.js';
import { store } from '../../store/store.js';

/**
 * Интерфейс пропсов для CatalogPage
 */
export interface CatalogPageProps extends ComponentProps {
  /** Callback для добавления в корзину */
  onAddToCart?: (productId: string) => void;
}

/**
 * Интерфейс ответа API продуктов
 */
interface ProductsApiResponse {
  products: Product[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

/**
 * Страница каталога с фильтрацией продуктов
 */
export class CatalogPage extends Component<CatalogPageProps> {
  /** Компонент фильтров */
  private filtersComponent: ProductFilters | null = null;

  /** Компонент списка продуктов */
  private productListComponent: ProductList | null = null;

  /** Компонент хлебных крошек */
  private breadcrumbsComponent: Breadcrumbs | null = null;

  /** Текущие фильтры */
  private currentFilters: ProductFiltersType = {};

  /** Загруженные продукты */
  private products: Product[] = [];

  /** Состояние загрузки */
  private isLoading = false;

  /**
   * Получить пропсы по умолчанию
   */
  protected getDefaultProps(): CatalogPageProps {
    return {
      ...super.getDefaultProps(),
    };
  }

  /**
   * Отрендерить страницу каталога
   */
  public render(): HTMLElement {
    const { className } = this.props;

    // Построить классы
    const classes = ['page', 'catalog-page'];
    if (className) {
      classes.push(className);
    }

    // Создать корневой элемент
    this.element = this.createElement('div', {
      className: classes.join(' '),
    });

    // Хлебные крошки
    this.renderBreadcrumbs();

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
   * Отрендерить хлебные крошки
   */
  private renderBreadcrumbs(): void {
    const breadcrumbItems: BreadcrumbItem[] = [];

    // Добавляем текущую страницу
    breadcrumbItems.push({ label: 'Каталог товаров' });

    this.breadcrumbsComponent = new Breadcrumbs({
      items: breadcrumbItems,
      showHome: true,
    });

    const container = this.createElement('div', { className: 'container' });
    this.breadcrumbsComponent.mount(container);
    this.addChild(this.breadcrumbsComponent);
    this.element?.prepend(container);
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
    if (!this.productListComponent) {
      return;
    }

    this.isLoading = true;
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

      // API возвращает { products: [...], pagination: {...} }
      const response = await api.get<ProductsApiResponse>('/api/products', params);
      
      // Извлекаем массив продуктов из ответа
      this.products = response.products || [];
      
      this.productListComponent.setProps({ products: this.products, loading: false });
      this.productListComponent.update();
    } catch (error) {
      // Определяем тип ошибки для более информативного сообщения
      let errorMessage = 'Не удалось загрузить товары. Попробуйте позже.';
      if (error instanceof Error) {
        if (
          error.message.includes('network')
          || error.message.includes('Network')
          || error.name === 'TypeError'
        ) {
          errorMessage = 'Сервер недоступен. Проверьте подключение или перезагрузите страницу.';
        }
      }

      this.productListComponent.setProps({ error: errorMessage, loading: false });
      this.productListComponent.update();
    } finally {
      this.isLoading = false;
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
  private async handleAddToCart(productId: string): Promise<void> {
    try {
      // Добавить товар в корзину через API
      await api.post('/api/cart/items', { productId, quantity: 1 });

      // Показать уведомление об успехе
      this.showNotification('Товар добавлен в корзину', 'success');

      // Вызвать внешний callback если есть
      this.props.onAddToCart?.(productId);
    } catch (error) {
      console.error('[CatalogPage] Ошибка добавления в корзину:', error);

      // Показать уведомление об ошибке
      const message = error instanceof Error ? error.message : 'Не удалось добавить товар';
      this.showNotification(message, 'error');
    }
  }

  /**
   * Показать уведомление с использованием Toast компонента
   */
  private showNotification(message: string, type: 'success' | 'error' | 'info' | 'warning'): void {
    switch (type) {
      case 'success':
        Toast.showSuccess(message);
        break;
      case 'error':
        Toast.showError(message);
        break;
      case 'warning':
        Toast.showWarning(message);
        break;
      default:
        Toast.showInfo(message);
    }
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