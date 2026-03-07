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
    if (!this.productListComponent) {
      console.log('[MainPage] productListComponent is null, skipping loadProducts');
      return;
    }

    console.log('[MainPage] Starting loadProducts...');
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

      console.log('[MainPage] Fetching products from /api/products...');
      this.products = await api.get<Product[]>('/api/products', params);
      console.log('[MainPage] Products loaded:', this.products.length, 'items');
      // Устанавливаем продукты И сбрасываем загрузку одновременно
      this.productListComponent.setProps({ products: this.products, loading: false });
      this.productListComponent.update();
    } catch (error) {
      console.error('[MainPage] Ошибка загрузки продуктов:', error);
      
      // Определяем тип ошибки для более информативного сообщения
      let errorMessage = 'Не удалось загрузить товары. Попробуйте позже.';
      if (error instanceof Error) {
        if (error.message.includes('network') || error.message.includes('Network') || error.name === 'TypeError') {
          errorMessage = 'Сервер недоступен. Проверьте подключение или перезагрузите страницу.';
        }
      }
      
      this.productListComponent.setProps({ error: errorMessage, loading: false });
      this.productListComponent.update();
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
      console.error('[MainPage] Ошибка добавления в корзину:', error);
      
      // Показать уведомление об ошибке
      const message = error instanceof Error ? error.message : 'Не удалось добавить товар';
      this.showNotification(message, 'error');
    }
  }

  /**
   * Показать уведомление
   */
  private showNotification(message: string, type: 'success' | 'error' | 'info'): void {
    // Создать элемент уведомления
    const notification = this.createElement('div', {
      className: `notification notification--${type}`,
      role: 'alert',
    });
    notification.textContent = message;
    
    // Добавить на страницу
    document.body.appendChild(notification);
    
    // Анимация появления
    requestAnimationFrame(() => {
      notification.classList.add('notification--visible');
    });
    
    // Удалить через 3 секунды
    setTimeout(() => {
      notification.classList.remove('notification--visible');
      setTimeout(() => notification.remove(), 300);
    }, 3000);
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