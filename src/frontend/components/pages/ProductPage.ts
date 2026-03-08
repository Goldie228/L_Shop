/**
 * Страница товара - L_Shop Frontend
 * Детальная информация о товаре с похожими товарами
 */

import { Component, ComponentProps } from '../base/Component';
import { Button } from '../ui/Button';
import { Product } from '../../types/product';
import { api } from '../../services/api';
import { store } from '../../store/store';
import { router } from '../../router/router';

/**
 * Пропсы страницы товара
 */
export interface ProductPageProps extends ComponentProps {
  /** ID товара для загрузки */
  productId?: string;
  /** Данные товара (если переданы напрямую) */
  product?: Product | null;
}

/**
 * Состояние страницы товара
 */
export interface ProductPageState {
  /** Загрузка */
  loading: boolean;
  /** Загрузка похожих товаров */
  loadingSimilar: boolean;
  /** Ошибка */
  error: string | null;
  /** Данные товара */
  product: Product | null;
  /** Похожие товары */
  similarProducts: Product[];
  /** ID кнопки добавления в корзину для управления состоянием */
  addToCartButton: Button | null;
}

/**
 * Страница товара
 * Отображает детальную информацию о товаре с возможностью добавления в корзину
 * и похожими товарами из той же категории
 */
export class ProductPage extends Component<ProductPageProps> {
  private state: ProductPageState = {
    loading: false,
    loadingSimilar: false,
    error: null,
    product: this.props.product || null,
    similarProducts: [],
    addToCartButton: null,
  };

  private productId: string | null = null;

  constructor(props: ProductPageProps = {}) {
    super(props);

    // Извлечь ID товара из props или из URL
    if (props.productId) {
      this.productId = props.productId;
    } else if (props.product?.id) {
      this.productId = props.product.id;
    } else {
      // Попробовать получить из URL (если передан через роутер)
      const pathMatch = window.location.pathname.match(/^\/product\/([^/]+)$/);
      if (pathMatch) {
        this.productId = pathMatch[1];
      }
    }
  }

  // SVG иконки для безопасного рендеринга (без innerHTML)
  private static readonly PLACEHOLDER_IMAGE_SVG = '<svg class="product-page__placeholder-image" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>';

  private static readonly FILLED_STAR_SVG = '<svg class="product-page__rating-star-icon product-page__rating-star-icon--filled" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>';

  private static readonly HALF_STAR_SVG = '<svg class="product-page__rating-star-icon product-page__rating-star-icon--half" viewBox="0 0 24 24" fill="currentColor"><defs><linearGradient id="halfStarGradient"><stop offset="50%" stop-color="currentColor"/><stop offset="50%" stop-color="transparent"/></linearGradient></defs><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="url(#halfStarGradient)"/></svg>';

  private static readonly EMPTY_STAR_SVG = '<svg class="product-page__rating-star-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>';

  private static readonly PLACEHOLDER_SIMILAR_SVG = '<svg class="product-page__placeholder-image-similar" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>';

  protected getDefaultProps(): ProductPageProps {
    return {
      ...super.getDefaultProps(),
      className: 'product-page',
    };
  }

  public async init(): Promise<void> {
    // Если товар уже передан в props, не загружать
    if (this.props.product) {
      this.state.product = this.props.product;
      this.update();
      // Загрузить похожие товары
      if (this.props.product.category) {
        await this.loadSimilarProducts(this.props.product.category, this.props.product.id);
      }
      return;
    }

    // Загрузить товар по ID
    if (this.productId) {
      await this.loadProduct();
    } else {
      this.state.error = 'ID товара не указан';
      this.update();
    }
  }

  public render(): HTMLElement {
    const container = this.createElement('div', {
      className: 'product-page',
    });

    // Внутренний контейнер для центрирования
    const innerContainer = this.createElement('div', {
      className: 'container',
    });

    // Состояние загрузки
    if (this.state.loading) {
      const loading = this.createElement(
        'div',
        {
          className: 'product-page__loading',
        },
        ['Загрузка...'],
      );
      innerContainer.appendChild(loading);
      container.appendChild(innerContainer);
      return container;
    }

    // Состояние ошибки
    if (this.state.error) {
      const errorSection = this.renderError(this.state.error);
      innerContainer.appendChild(errorSection);
      container.appendChild(innerContainer);
      return container;
    }

    // Товар не найден
    if (!this.state.product) {
      const notFoundSection = this.renderNotFound();
      innerContainer.appendChild(notFoundSection);
      container.appendChild(innerContainer);
      return container;
    }

    const { product } = this.state;

    // Основной контент
    const mainContent = this.createElement('div', {
      className: 'product-page__main',
    });

    // Изображение товара с зумом
    const imageWrapper = this.renderProductImage(product);
    mainContent.appendChild(imageWrapper);

    // Информация о товаре
    const details = this.createElement('div', {
      className: 'product-page__details',
    });

    // Категория
    if (product.category) {
      const category = this.createElement(
        'p',
        {
          className: 'product-page__category',
        },
        [this.getCategoryLabel(product.category)],
      );
      details.appendChild(category);
    }

    // Название товара
    const name = this.createElement(
      'h1',
      {
        className: 'product-page__name',
      },
      [product.name],
    );
    details.appendChild(name);

    // Рейтинг со звёздами
    if (product.rating !== undefined) {
      const rating = this.renderRating(product.rating, product.reviewsCount);
      details.appendChild(rating);
    }

    // Цена
    const priceContainer = this.renderPrice(product);
    details.appendChild(priceContainer);

    // Наличие на складе
    const stock = this.createElement(
      'p',
      {
        className: `product-page__stock ${
          product.inStock ? 'product-page__stock--available' : 'product-page__stock--unavailable'
        }`,
      },
      [product.inStock ? 'В наличии' : 'Нет в наличии'],
    );
    details.appendChild(stock);

    // Характеристики
    const characteristics = this.renderCharacteristics(product);
    if (characteristics) {
      details.appendChild(characteristics);
    }

    // Описание
    if (product.description) {
      const descriptionSection = this.renderDescription(product.description);
      details.appendChild(descriptionSection);
    }

    // Кнопки действий
    const actions = this.renderActions(product);
    details.appendChild(actions);

    mainContent.appendChild(details);
    innerContainer.appendChild(mainContent);

    // Секция похожих товаров
    const similarSection = this.renderSimilarProducts();
    innerContainer.appendChild(similarSection);

    container.appendChild(innerContainer);

    return container;
  }

  /**
   * Отрендерить изображение товара с эффектом зума
   */
  private renderProductImage(product: Product): HTMLElement {
    const imageWrapper = this.createElement('div', {
      className: 'product-page__image-wrapper',
    });

    if (product.imageUrl) {
      const image = this.createElement('img', {
        className: 'product-page__image',
        src: product.imageUrl,
        alt: product.name,
      }) as HTMLImageElement;

      // Обработчик ошибки загрузки изображения
      image.onerror = () => {
        image.src = '/images/placeholder.svg';
        image.alt = 'Изображение недоступно';
      };

      // Эффект зума при наведении
      image.onmouseenter = () => {
        image.style.transform = 'scale(1.1)';
      };

      image.onmouseleave = () => {
        image.style.transform = 'scale(1)';
      };

      imageWrapper.appendChild(image);
    } else {
      const placeholder = this.createElement('div', {
        className: 'product-page__image-placeholder',
      });
      const placeholderSvg = this.createSVGFromString(ProductPage.PLACEHOLDER_IMAGE_SVG);
      if (placeholderSvg) {
        placeholder.appendChild(placeholderSvg);
      }
      imageWrapper.appendChild(placeholder);
    }

    return imageWrapper;
  }

  /**
   * Отрендеровать рейтинг со звёздами
   */
  private renderRating(rating: number, reviewsCount?: number): HTMLElement {
    const ratingContainer = this.createElement('div', {
      className: 'product-page__rating',
    });

    // Отрисовка звёзд (максимум 5)
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 1; i <= 5; i++) {
      const star = this.createElement('span', {
        className: 'product-page__rating-star',
      });

      if (i <= fullStars) {
        const filledStar = this.createSVGFromString(ProductPage.FILLED_STAR_SVG);
        if (filledStar) {
          star.appendChild(filledStar);
        }
        star.classList.add('product-page__rating-star--filled');
      } else if (i === fullStars + 1 && hasHalfStar) {
        const halfStar = this.createSVGFromString(ProductPage.HALF_STAR_SVG);
        if (halfStar) {
          star.appendChild(halfStar);
        }
        star.classList.add('product-page__rating-star--half');
      } else {
        const emptyStar = this.createSVGFromString(ProductPage.EMPTY_STAR_SVG);
        if (emptyStar) {
          star.appendChild(emptyStar);
        }
      }

      ratingContainer.appendChild(star);
    }

    // Значение рейтинга
    const ratingValue = this.createElement('span', {
      className: 'product-page__rating-value',
    });
    ratingValue.textContent = ` ${rating.toFixed(1)}`;
    ratingContainer.appendChild(ratingValue);

    // Количество отзывов
    if (reviewsCount !== undefined) {
      const reviewsText = this.createElement('span', {
        className: 'product-page__rating-reviews',
      });
      reviewsText.textContent = ` (${reviewsCount} ${this.getReviewsCountLabel(reviewsCount)})`;
      ratingContainer.appendChild(reviewsText);
    }

    return ratingContainer;
  }

  /**
   * Отрендеровать цену
   */
  private renderPrice(product: Product): HTMLElement {
    const priceContainer = this.createElement('div', {
      className: 'product-page__price-container',
    });

    if (product.discountPercent && product.discountPercent > 0) {
      const oldPrice = this.createElement(
        'span',
        {
          className: 'product-page__price-old',
        },
        [`${product.price.toLocaleString('ru-RU')} ₽`],
      );
      priceContainer.appendChild(oldPrice);

      const newPrice = product.price * (1 - product.discountPercent / 100);
      const newPriceEl = this.createElement(
        'span',
        {
          className: 'product-page__price-new',
        },
        [`${Math.round(newPrice).toLocaleString('ru-RU')} ₽`],
      );
      priceContainer.appendChild(newPriceEl);

      const discount = this.createElement(
        'span',
        {
          className: 'product-page__discount',
        },
        [`-${product.discountPercent}%`],
      );
      priceContainer.appendChild(discount);
    } else {
      const price = this.createElement(
        'span',
        {
          className: 'product-page__price',
        },
        [`${product.price.toLocaleString('ru-RU')} ₽`],
      );
      priceContainer.appendChild(price);
    }

    return priceContainer;
  }

  /**
   * Отрендеровать характеристики товара
   */
  private renderCharacteristics(product: Product): HTMLElement | null {
    const characteristics = this.createElement('div', {
      className: 'product-page__characteristics',
    });

    const title = this.createElement(
      'h3',
      {
        className: 'product-page__characteristics-title',
      },
      ['Характеристики'],
    );
    characteristics.appendChild(title);

    const list = this.createElement('ul', {
      className: 'product-page__characteristics-list',
    });

    // Категория
    const categoryItem = this.createElement('li', {
      className: 'product-page__characteristics-item',
    });
    const categoryLabel = this.createElement(
      'span',
      {
        className: 'product-page__characteristics-label',
      },
      ['Категория:'],
    );
    const categoryValue = this.createElement(
      'span',
      {
        className: 'product-page__characteristics-value',
      },
      [this.getCategoryLabel(product.category)],
    );
    categoryItem.appendChild(categoryLabel);
    categoryItem.appendChild(document.createTextNode(' '));
    categoryItem.appendChild(categoryValue);
    list.appendChild(categoryItem);

    // Бренд (если есть в названии или можно добавить поле)
    // Пока используем категорию как бренд-аналог

    // Наличие на складе
    const stockItem = this.createElement('li', {
      className: 'product-page__characteristics-item',
    });
    const stockLabel = this.createElement(
      'span',
      {
        className: 'product-page__characteristics-label',
      },
      ['Доступность:'],
    );
    const stockValue = this.createElement(
      'span',
      {
        className: 'product-page__characteristics-value',
      },
      [product.inStock ? 'В наличии' : 'Нет в наличии'],
    );
    stockItem.appendChild(stockLabel);
    stockItem.appendChild(document.createTextNode(' '));
    stockItem.appendChild(stockValue);
    list.appendChild(stockItem);

    // Если есть рейтинг
    if (product.rating !== undefined) {
      const ratingItem = this.createElement('li', {
        className: 'product-page__characteristics-item',
      });
      const ratingLabel = this.createElement(
        'span',
        {
          className: 'product-page__characteristics-label',
        },
        ['Рейтинг:'],
      );
      const ratingValue = this.createElement(
        'span',
        {
          className: 'product-page__characteristics-value',
        },
        [`${product.rating.toFixed(1)} / 5.0`],
      );
      ratingItem.appendChild(ratingLabel);
      ratingItem.appendChild(document.createTextNode(' '));
      ratingItem.appendChild(ratingValue);
      list.appendChild(ratingItem);
    }

    characteristics.appendChild(list);
    return characteristics;
  }

  /**
   * Отрендеровать описание товара
   */
  private renderDescription(description: string): HTMLElement {
    const descriptionSection = this.createElement('div', {
      className: 'product-page__description-section',
    });

    const descriptionTitle = this.createElement(
      'h3',
      {
        className: 'product-page__description-title',
      },
      ['Описание'],
    );
    descriptionSection.appendChild(descriptionTitle);

    const desc = this.createElement(
      'p',
      {
        className: 'product-page__description',
      },
      [description],
    );
    descriptionSection.appendChild(desc);

    return descriptionSection;
  }

  /**
   * Отрендерить кнопки действий
   */
  private renderActions(product: Product): HTMLElement {
    const actions = this.createElement('div', {
      className: 'product-page__actions',
    });

    const addToCartButton = new Button({
      className: 'product-page__add-to-cart',
      text: 'В корзину',
      variant: 'primary',
      size: 'lg',
      disabled: !product.inStock,
      onClick: () => this.handleAddToCart(product.id),
    });

    // Сохраняем ссылку на кнопку для управления состоянием
    this.state.addToCartButton = addToCartButton;
    actions.appendChild(addToCartButton.render());

    return actions;
  }

  /**
   * Отрендерить секцию похожих товаров
   */
  private renderSimilarProducts(): HTMLElement {
    const similarSection = this.createElement('section', {
      className: 'product-page__similar-section',
    });

    const similarTitle = this.createElement(
      'h2',
      {
        className: 'product-page__similar-title',
      },
      ['Похожие товары'],
    );
    similarSection.appendChild(similarTitle);

    const similarGrid = this.createElement('div', {
      className: 'product-page__similar-grid',
    });

    // Если загрузка похожих товаров
    if (this.state.loadingSimilar) {
      const loadingSimilar = this.createElement(
        'p',
        {
          className: 'product-page__similar-loading',
        },
        ['Загрузка похожих товаров...'],
      );
      similarGrid.appendChild(loadingSimilar);
    } else if (this.state.similarProducts.length > 0) {
      // Отрисовка карточек похожих товаров
      this.state.similarProducts.forEach((product) => {
        const card = this.renderSimilarProductCard(product);
        similarGrid.appendChild(card);
      });
    } else {
      const placeholder = this.createElement(
        'p',
        {
          className: 'product-page__similar-placeholder',
        },
        ['Похожие товары не найдены'],
      );
      similarGrid.appendChild(placeholder);
    }

    similarSection.appendChild(similarGrid);
    return similarSection;
  }

  /**
   * Отрендерить карточку похожего товара
   */
  private renderSimilarProductCard(product: Product): HTMLElement {
    const card = this.createElement('a', {
      className: 'product-page__similar-card',
      href: `/product/${product.id}`,
    });

    // Изображение
    const imageWrapper = this.createElement('div', {
      className: 'product-page__similar-image',
    });

    if (product.imageUrl) {
      const image = this.createElement('img', {
        src: product.imageUrl,
        alt: product.name,
      }) as HTMLImageElement;
      image.onerror = () => {
        image.src = '/images/placeholder.svg';
      };
      imageWrapper.appendChild(image);
    } else {
      const placeholder = this.createElement('div', {
        className: 'product-page__similar-placeholder-image',
      });
      const placeholderSvg = this.createSVGFromString(ProductPage.PLACEHOLDER_SIMILAR_SVG);
      if (placeholderSvg) {
        placeholder.appendChild(placeholderSvg);
      }
      imageWrapper.appendChild(placeholder);
    }
    card.appendChild(imageWrapper);

    // Название
    const title = this.createElement(
      'h3',
      {
        className: 'product-page__similar-name',
      },
      [product.name],
    );
    card.appendChild(title);

    // Цена
    const price = this.createElement('p', {
      className: 'product-page__similar-price',
    });

    if (product.discountPercent && product.discountPercent > 0) {
      const oldPrice = this.createElement(
        'span',
        {
          className: 'product-page__similar-price-old',
        },
        [`${product.price.toLocaleString('ru-RU')} ₽`],
      );
      price.appendChild(oldPrice);

      const newPrice = product.price * (1 - product.discountPercent / 100);
      const newPriceEl = this.createElement(
        'span',
        {
          className: 'product-page__similar-price-new',
        },
        [`${Math.round(newPrice).toLocaleString('ru-RU')} ₽`],
      );
      price.appendChild(newPriceEl);
    } else {
      price.textContent = `${product.price.toLocaleString('ru-RU')} ₽`;
    }
    card.appendChild(price);

    // Обработка клика для навигации
    this.addEventListener(card, 'click', (e: Event) => {
      e.preventDefault();
      router.navigate(`/product/${product.id}`);
    });

    return card;
  }

  /**
   * Отрендерить секцию ошибки
   */
  private renderError(message: string): HTMLElement {
    const errorSection = this.createElement('div', {
      className: 'product-page__error',
    });

    const errorText = this.createElement(
      'p',
      {
        className: 'product-page__error-text',
      },
      [`Ошибка: ${message}`],
    );

    errorSection.appendChild(errorText);

    const backButton = new Button({
      text: 'Вернуться на главную',
      variant: 'secondary',
      onClick: () => router.navigate('/'),
    });
    errorSection.appendChild(backButton.render());

    return errorSection;
  }

  /**
   * Отрендерить секцию "товар не найден"
   */
  private renderNotFound(): HTMLElement {
    const notFoundSection = this.createElement('div', {
      className: 'product-page__not-found',
    });

    const notFoundIcon = this.createElement(
      'div',
      {
        className: 'product-page__not-found-icon',
      },
      ['🔍'],
    );
    notFoundSection.appendChild(notFoundIcon);

    const notFoundText = this.createElement(
      'h2',
      {
        className: 'product-page__not-found-title',
      },
      ['Товар не найден'],
    );
    notFoundSection.appendChild(notFoundText);

    const notFoundDesc = this.createElement(
      'p',
      {
        className: 'product-page__not-found-description',
      },
      ['Запрашиваемый товар не существует или был удалён'],
    );
    notFoundSection.appendChild(notFoundDesc);

    const backButton = new Button({
      text: 'Вернуться на главную',
      variant: 'primary',
      onClick: () => router.navigate('/'),
    });
    notFoundSection.appendChild(backButton.render());

    return notFoundSection;
  }

  /**
   * Загрузить товар с сервера
   */
  private async loadProduct(): Promise<void> {
    if (!this.productId) {
      this.state.error = 'ID товара не указан';
      this.update();
      return;
    }

    this.state.loading = true;
    this.state.error = null;
    this.update();

    try {
      const product = await api.get<Product>(`/api/products/${this.productId}`);
      this.state.product = product;
      this.state.loading = false;
      this.update();

      // Загрузить похожие товары после загрузки основного товара
      if (product.category) {
        await this.loadSimilarProducts(product.category, product.id);
      }
    } catch (error) {
      // Проверяем, является ли ошибка 404
      const errorMessage = error instanceof Error ? error.message : 'Ошибка загрузки товара';

      // Если товар не найден (404)
      if (errorMessage.includes('404') || errorMessage.includes('Not Found')) {
        this.state = {
          loading: false,
          loadingSimilar: false,
          error: null,
          product: null,
          similarProducts: [],
          addToCartButton: null,
        };
      } else {
        this.state = {
          loading: false,
          loadingSimilar: false,
          error: errorMessage,
          product: null,
          similarProducts: [],
          addToCartButton: null,
        };
      }
      this.update();
    }
  }

  /**
   * Загрузить похожие товары
   * @param category - Категория текущего товара
   * @param currentProductId - ID текущего товара (исключить из списка)
   */
  private async loadSimilarProducts(category: string, currentProductId: string): Promise<void> {
    this.state.loadingSimilar = true;
    this.update();

    try {
      // Получаем товары той же категории
      const products = await api.get<Product[]>(
        `/api/products?category=${encodeURIComponent(category)}`,
      );

      // Фильтруем: исключаем текущий товар и ограничиваем до 4 штук
      const similarProducts = products.filter((p) => p.id !== currentProductId).slice(0, 4);

      this.state.similarProducts = similarProducts;
      this.state.loadingSimilar = false;
      this.update();
    } catch (error) {
      console.error('[ProductPage] Ошибка загрузки похожих товаров:', error);
      this.state.loadingSimilar = false;
      this.update();
    }
  }

  /**
   * Обработать добавление в корзину
   * @param productId - ID товара
   */
  private async handleAddToCart(productId: string): Promise<void> {
    // Проверяем авторизацию
    if (!store.isAuthenticated()) {
      this.showNotification('Для добавления в корзину необходимо войти', 'error');
      store.openModal('auth');
      return;
    }

    // Показываем состояние загрузки
    if (this.state.addToCartButton) {
      this.state.addToCartButton.setLoading(true);
    }

    try {
      await api.post('/api/cart/items', { productId, quantity: 1 });

      // Показываем уведомление об успехе
      this.showNotification('Товар добавлен в корзину', 'success');

      // Заново загружаем данные корзины для обновления счётчика
      await this.updateCartCount();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Ошибка добавления в корзину';
      this.showNotification(message, 'error');
    } finally {
      // Сбрасываем состояние кнопки
      if (this.state.addToCartButton) {
        this.state.addToCartButton.setLoading(false);
      }
    }
  }

  /**
   * Обновить счётчик корзины в хедере
   */
  private async updateCartCount(): Promise<void> {
    try {
      const cartData = await api.get<{ items: unknown[] }>('/api/cart');
      const count = cartData?.items?.length ?? 0;

      // Ищем элемент счётчика корзины в хедере и обновляем
      const cartButton = document.querySelector('[data-testid="header-cart-btn"]');
      if (cartButton) {
        // Удаляем старый счётчик
        const existingBadge = cartButton.querySelector('.header__cart-badge');
        if (existingBadge) {
          existingBadge.remove();
        }

        // Добавляем новый счётчик
        if (count > 0) {
          const badge = document.createElement('span');
          badge.className = 'header__cart-badge';
          badge.textContent = count > 9 ? '9+' : String(count);
          cartButton.appendChild(badge);
        }
      }
    } catch (error) {
      console.error('[ProductPage] Не удалось обновить счётчик корзины:', error);
    }
  }

  /**
   * Показать уведомление
   * @param message - Текст уведомления
   * @param type - Тип уведомления (success, error, info)
   */
  private showNotification(message: string, type: 'success' | 'error' | 'info'): void {
    const notification = this.createElement('div', {
      className: `notification notification--${type}`,
      role: 'alert',
    });
    notification.textContent = message;

    document.body.appendChild(notification);

    requestAnimationFrame(() => {
      notification.classList.add('notification--visible');
    });

    setTimeout(() => {
      notification.classList.remove('notification--visible');
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }

  /**
   * Получить правильное склонение для "отзывов"
   * @param count - количество отзывов
   */
  private getReviewsCountLabel(count: number): string {
    const lastDigit = count % 10;
    const lastTwoDigits = count % 100;

    if (lastTwoDigits >= 11 && lastTwoDigits <= 14) {
      return 'отзывов';
    }

    switch (lastDigit) {
      case 1:
        return 'отзыв';
      case 2:
      case 3:
      case 4:
        return 'отзыва';
      default:
        return 'отзывов';
    }
  }

  /**
   * Получить отображаемое название категории
   */
  private getCategoryLabel(category: string): string {
    const categoryMap: Record<string, string> = {
      electronics: 'Электроника',
      clothing: 'Одежда',
      books: 'Книги',
      home: 'Дом и сад',
      sports: 'Спорт',
    };
    return categoryMap[category] || category;
  }
}
