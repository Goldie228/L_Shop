/**
 * Компонент карточки продукта - L_Shop Frontend
 * Отображает информацию о продукте с рейтингом (Вариант 17)
 */

import { Component, ComponentProps } from '../base/Component.js';
import { Button } from '../ui/Button.js';
import { Product } from '../../types/product.js';

/**
 * Интерфейс пропсов для ProductCard
 */
export interface ProductCardProps extends ComponentProps {
  /** Данные продукта */
  product: Product;
  /** Авторизован ли пользователь */
  isAuthenticated: boolean;
  /** Callback для добавления в корзину */
  onAddToCart?: (productId: string) => void;
}

/**
 * Карточка продукта для отображения в каталоге
 *
 * @example
 * ```typescript
 * const card = new ProductCard({
 *   product: productData,
 *   isAuthenticated: true,
 *   onAddToCart: (id) => console.log('Added:', id)
 * });
 * card.mount(container);
 * ```
 */
export class ProductCard extends Component<ProductCardProps> {
  /** Кнопка добавления в корзину */
  private addButton: Button | null = null;

  /**
   * Получить пропсы по умолчанию
   */
  protected getDefaultProps(): ProductCardProps {
    return {
      ...super.getDefaultProps(),
      product: {} as Product,
      isAuthenticated: false,
    };
  }

  /**
   * Отрендерить карточку продукта
   */
  public render(): HTMLElement {
    const { product, isAuthenticated, className } = this.props;

    // Построить классы
    const classes = ['product-card'];
    if (!product.inStock) {
      classes.push('product-card--out-of-stock');
    }
    if (className) {
      classes.push(className);
    }

    // Создать корневой элемент
    this.element = this.createElement('div', {
      className: classes.join(' '),
    });

    // Изображение продукта
    const imageContainer = this.renderImage();
    this.element.appendChild(imageContainer);

    // Контент карточки
    const content = this.renderContent();
    this.element.appendChild(content);

    // Рейтинг (Вариант 17)
    if (product.rating !== undefined) {
      const ratingElement = this.renderRating();
      this.element.appendChild(ratingElement);
    }

    // Кнопка "В корзину" только для авторизованных
    if (isAuthenticated && product.inStock) {
      this.renderAddButton();
    }

    return this.element;
  }

  /**
   * Отрендерить изображение продукта
   */
  private renderImage(): HTMLElement {
    const { product } = this.props;

    const imageContainer = this.createElement('div', {
      className: 'product-card__image',
    });

    if (product.imageUrl) {
      const img = this.createElement('img', {
        src: product.imageUrl,
        alt: product.name,
        className: 'product-card__img',
      });
      // Fallback при ошибке загрузки изображения
      img.onerror = () => {
        img.src = '/images/placeholder.svg';
        img.alt = 'Изображение недоступно';
      };
      imageContainer.appendChild(img);
    } else {
      // Заглушка если нет изображения
      const placeholder = this.createElement('div', {
        className: 'product-card__placeholder',
      });
      placeholder.textContent = '📷';
      imageContainer.appendChild(placeholder);
    }

    // Бейдж скидки
    if (product.discountPercent && product.discountPercent > 0) {
      const discountBadge = this.createElement('span', {
        className: 'product-card__discount-badge',
      });
      discountBadge.textContent = `-${product.discountPercent}%`;
      imageContainer.appendChild(discountBadge);
    }

    return imageContainer;
  }

  /**
   * Отрендерить контент карточки (название и цена)
   */
  private renderContent(): HTMLElement {
    const { product } = this.props;

    const content = this.createElement('div', {
      className: 'product-card__content',
    });

    // Название с data-title атрибутом
    const title = this.createElement('h3', {
      className: 'product-card__title',
      'data-title': '', // Обязательный атрибут для тестирования
    });
    title.textContent = product.name;
    content.appendChild(title);

    // Категория
    const category = this.createElement('span', {
      className: 'product-card__category',
    });
    category.textContent = this.getCategoryLabel(product.category);
    content.appendChild(category);

    // Цена с data-price атрибутом
    const priceContainer = this.createElement('div', {
      className: 'product-card__price-container',
    });

    const price = this.createElement('span', {
      className: 'product-card__price',
      'data-price': '', // Обязательный атрибут для тестирования
    });
    price.textContent = this.formatPrice(product.price);

    if (product.discountPercent && product.discountPercent > 0) {
      const originalPrice = this.createElement('span', {
        className: 'product-card__original-price',
      });
      originalPrice.textContent = this.formatPrice(
        product.price * (1 + product.discountPercent / 100)
      );
      priceContainer.appendChild(originalPrice);
    }

    priceContainer.appendChild(price);
    content.appendChild(priceContainer);

    // Статус наличия
    if (!product.inStock) {
      const stockStatus = this.createElement('span', {
        className: 'product-card__stock-status product-card__stock-status--out',
      });
      stockStatus.textContent = 'Нет в наличии';
      content.appendChild(stockStatus);
    }

    return content;
  }

  /**
   * Отрендерить рейтинг (Вариант 17)
   */
  private renderRating(): HTMLElement {
    const { product } = this.props;

    const ratingElement = this.createElement('div', {
      className: 'product-card__rating',
    });

    // Звезда рейтинга
    const star = this.createElement('span', {
      className: 'product-card__rating-star',
    });
    star.textContent = '★';
    ratingElement.appendChild(star);

    // Значение рейтинга
    const ratingValue = this.createElement('span', {
      className: 'product-card__rating-value',
    });
    ratingValue.textContent = product.rating!.toFixed(1);
    ratingElement.appendChild(ratingValue);

    // Количество отзывов
    if (product.reviewsCount) {
      const reviewsCount = this.createElement('span', {
        className: 'product-card__reviews-count',
      });
      reviewsCount.textContent = `(${product.reviewsCount} отзывов)`;
      ratingElement.appendChild(reviewsCount);
    }

    return ratingElement;
  }

  /**
   * Отрендерить кнопку добавления в корзину
   */
  private renderAddButton(): void {
    const { product, onAddToCart } = this.props;

    this.addButton = new Button({
      text: 'В корзину',
      variant: 'primary',
      size: 'md',
      className: 'product-card__add-button',
      onClick: () => onAddToCart?.(product.id),
    });

    this.addButton.mount(this.element!);
    this.addChild(this.addButton);
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

  /**
   * Форматировать цену
   */
  private formatPrice(price: number): string {
    return `${price.toLocaleString('ru-RU')} ₽`;
  }
}