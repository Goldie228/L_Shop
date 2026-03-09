/**
 * Главная страница - L_Shop Frontend
 * Приветственная страница с популярными товарами и акциями
 */

import { Component, ComponentProps } from '../base/Component.js';
import { ProductCard } from '../product/ProductCard.js';
import { Button } from '../ui/Button.js';
import { Toast } from '../ui/Toast.js';
import { Icon } from '../ui/Icon.js';
import { Product } from '../../types/product.js';
import { api } from '../../services/api.js';
import { store } from '../../store/store.js';
import { router } from '../../router/router.js';

/**
 * Интерфейс пропсов для MainPage
 */
export interface MainPageProps extends ComponentProps {
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
 * Главная страница с приветствием и популярными товарами
 */
export class MainPage extends Component<MainPageProps> {
  /** Карточки популярных товаров */
  private productCards: ProductCard[] = [];

  /** Загруженные продукты */
  private products: Product[] = [];

  /** Состояние загрузки */
  private isLoading = false;

  /** Контейнер для популярных товаров */
  private productsContainer: HTMLElement | null = null;

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
    const classes = ['page', 'main-page', 'home-page'];
    if (className) {
      classes.push(className);
    }

    // Создать корневой элемент
    this.element = this.createElement('div', {
      className: classes.join(' '),
    });

    // Hero секция (баннер)
    const hero = this.renderHero();
    this.element.appendChild(hero);

    // Секция преимуществ
    const features = this.renderFeatures();
    this.element.appendChild(features);

    // Секция популярных товаров
    const popularSection = this.renderPopularSection();
    this.element.appendChild(popularSection);

    // Загрузить популярные товары
    this.loadPopularProducts();

    return this.element;
  }

  /**
   * Отрендерить Hero секцию (баннер приветствия)
   */
  private renderHero(): HTMLElement {
    const hero = this.createElement('section', {
      className: 'hero',
    });

    const container = this.createElement('div', {
      className: 'container',
    });

    const content = this.createElement('div', {
      className: 'hero__content',
    });

    // Заголовок
    const title = this.createElement('h1', {
      className: 'hero__title',
    });
    title.textContent = 'Добро пожаловать в L_Shop';
    content.appendChild(title);

    // Подзаголовок
    const subtitle = this.createElement('p', {
      className: 'hero__subtitle',
    });
    subtitle.textContent = 'Лучшие товары по выгодным ценам. Качество, проверенное временем.';
    content.appendChild(subtitle);

    // Кнопки действий
    const actions = this.createElement('div', {
      className: 'hero__actions',
    });

    const catalogBtn = new Button({
      text: 'Перейти в каталог',
      variant: 'primary',
      size: 'lg',
      testId: 'hero-catalog-btn',
      onClick: () => router.navigate('/catalog'),
    });
    actions.appendChild(catalogBtn.render());

    content.appendChild(actions);
    container.appendChild(content);
    hero.appendChild(container);

    return hero;
  }

  /**
   * Отрендерить секцию преимуществ
   */
  private renderFeatures(): HTMLElement {
    const features = this.createElement('section', {
      className: 'features',
    });

    const container = this.createElement('div', {
      className: 'container',
    });

    const title = this.createElement('h2', {
      className: 'features__title',
    });
    title.textContent = 'Почему выбирают нас';
    container.appendChild(title);

    const grid = this.createElement('div', {
      className: 'features__grid',
    });

    // Преимущество 1
    const feature1 = this.createFeatureItem(
      'truck',
      'Быстрая доставка',
      'Доставляем по всей стране за 1-3 дня',
    );
    grid.appendChild(feature1);

    // Преимущество 2
    const feature2 = this.createFeatureItem(
      'check',
      'Гарантия качества',
      'Весь товар сертифицирован и проверен',
    );
    grid.appendChild(feature2);

    // Преимущество 3
    const feature3 = this.createFeatureItem(
      'money',
      'Лучшие цены',
      'Регулярные акции и скидки для клиентов',
    );
    grid.appendChild(feature3);

    // Преимущество 4
    const feature4 = this.createFeatureItem(
      'headphones',
      'Поддержка 24/7',
      'Всегда на связи и готовы помочь',
    );
    grid.appendChild(feature4);

    container.appendChild(grid);
    features.appendChild(container);

    return features;
  }

  /**
   * Создать элемент преимущества
   */
  private createFeatureItem(iconName: string, title: string, description: string): HTMLElement {
    const item = this.createElement('div', {
      className: 'feature-item',
    });

    const iconWrapper = this.createElement('div', {
      className: 'feature-item__icon',
    });
    const icon = new Icon({ name: iconName as any, size: 32 });
    iconWrapper.appendChild(icon.render());
    item.appendChild(iconWrapper);

    const titleEl = this.createElement('h3', {
      className: 'feature-item__title',
    });
    titleEl.textContent = title;
    item.appendChild(titleEl);

    const descEl = this.createElement('p', {
      className: 'feature-item__description',
    });
    descEl.textContent = description;
    item.appendChild(descEl);

    return item;
  }

  /**
   * Отрендерить секцию популярных товаров
   */
  private renderPopularSection(): HTMLElement {
    const section = this.createElement('section', {
      className: 'popular-products',
    });

    const container = this.createElement('div', {
      className: 'container',
    });

    const header = this.createElement('div', {
      className: 'popular-products__header',
    });

    const title = this.createElement('h2', {
      className: 'popular-products__title',
    });
    title.textContent = 'Популярные товары';
    header.appendChild(title);

    const viewAllBtn = new Button({
      text: 'Смотреть все',
      variant: 'ghost',
      size: 'sm',
      testId: 'view-all-btn',
      onClick: () => router.navigate('/catalog'),
    });
    header.appendChild(viewAllBtn.render());

    container.appendChild(header);

    // Контейнер для товаров (скелетон или товары)
    this.productsContainer = this.createElement('div', {
      className: 'popular-products__grid',
    });
    container.appendChild(this.productsContainer);

    // Показываем скелетон загрузки
    this.renderLoading();

    section.appendChild(container);

    return section;
  }

  /**
   * Отрендерить состояние загрузки
   */
  private renderLoading(): void {
    if (!this.productsContainer) return;

    this.productsContainer.innerHTML = '';

    for (let i = 0; i < 4; i++) {
      const skeleton = this.createElement('div', {
        className: 'product-skeleton',
      });

      const imageSkeleton = this.createElement('div', {
        className: 'product-skeleton__image',
      });
      skeleton.appendChild(imageSkeleton);

      const titleSkeleton = this.createElement('div', {
        className: 'product-skeleton__title',
      });
      skeleton.appendChild(titleSkeleton);

      const priceSkeleton = this.createElement('div', {
        className: 'product-skeleton__price',
      });
      skeleton.appendChild(priceSkeleton);

      this.productsContainer.appendChild(skeleton);
    }
  }

  /**
   * Загрузить популярные товары
   */
  private async loadPopularProducts(): Promise<void> {
    if (this.isLoading) return;
    this.isLoading = true;

    try {
      const response = await api.get<ProductsApiResponse>('/api/products', {
        limit: '4',
        offset: '0',
      });

      this.products = response.products || [];
      this.renderProducts();
    } catch (error) {
      console.error('Ошибка загрузки товаров:', error);
      this.renderError();
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Отрендерить загруженные товары
   */
  private renderProducts(): void {
    if (!this.productsContainer) return;

    this.productsContainer.innerHTML = '';

    // Очищаем предыдущие карточки
    this.productCards.forEach((card) => card.destroy());
    this.productCards = [];

    if (this.products.length === 0) {
      const emptyMessage = this.createElement('p', {
        className: 'popular-products__empty',
      });
      emptyMessage.textContent = 'Товары не найдены';
      this.productsContainer.appendChild(emptyMessage);
      return;
    }

    // Рендерим карточки товаров
    this.products.forEach((product) => {
      const card = new ProductCard({
        product,
        isAuthenticated: store.isAuthenticated(),
        onAddToCart: () => this.handleAddToCart(product),
      });

      // Добавляем обработчик клика для перехода на страницу товара
      const cardElement = card.render();
      cardElement.style.cursor = 'pointer';
      cardElement.addEventListener('click', (e) => {
        // Не переходим если клик был по кнопке "В корзину"
        if ((e.target as HTMLElement).closest('.product-card__add-button')) {
          return;
        }
        router.navigate(`/product/${product.id}`);
      });

      this.productsContainer!.appendChild(cardElement);
      this.productCards.push(card);
    });
  }

  /**
   * Отрендерить ошибку загрузки
   */
  private renderError(): void {
    if (!this.productsContainer) return;

    this.productsContainer.innerHTML = '';

    const errorMessage = this.createElement('div', {
      className: 'popular-products__error',
    });

    const text = this.createElement('p', {}, ['Не удалось загрузить товары']);
    errorMessage.appendChild(text);

    const retryBtn = new Button({
      text: 'Попробовать снова',
      variant: 'secondary',
      size: 'sm',
      onClick: () => this.loadPopularProducts(),
    });

    errorMessage.appendChild(retryBtn.render());
    this.productsContainer.appendChild(errorMessage);
  }

  /**
   * Обработать добавление в корзину
   */
  private async handleAddToCart(product: Product): Promise<void> {
    if (!store.isAuthenticated()) {
      // Открыть модальное окно авторизации
      document.dispatchEvent(new CustomEvent('openAuthModal'));
      Toast.showWarning('Войдите, чтобы добавить товар в корзину');
      return;
    }

    try {
      await api.post('/api/cart/items', {
        productId: product.id,
        quantity: 1,
      });

      Toast.showSuccess(`${product.name} добавлен в корзину`);

      // Обновляем счётчик корзины
      const cart = await api.get<{ items: unknown[]; totalSum: number }>('/api/cart');
      if (cart && cart.items) {
        store.setCartState(cart.items.length, cart.totalSum || 0);
      }
    } catch (error) {
      console.error('Ошибка добавления в корзину:', error);
      Toast.showError('Не удалось добавить товар в корзину');
    }
  }

  /**
   * Очистка при уничтожении компонента
   */
  protected onDestroy(): void {
    this.productCards.forEach((card) => card.destroy());
    this.productCards = [];
  }
}
