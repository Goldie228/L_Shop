/**
 * Компонент Skeleton - L_Shop Frontend
 * Скелетон для индикации загрузки контента
 *
 * @see docs/DESIGN_SYSTEM.md - документация дизайн-системы
 */

import { Component, ComponentProps } from '../base/Component.js';

/**
 * Типы скелетонов
 */
export type SkeletonVariant = 'text' | 'circle' | 'rect' | 'card' | 'avatar' | 'image';

/**
 * Пропсы компонента Skeleton
 */
export interface SkeletonProps extends ComponentProps {
  /** Вариант скелетона */
  variant?: SkeletonVariant;
  /** Ширина (CSS значение) */
  width?: string;
  /** Высота (CSS значение) */
  height?: string;
  /** Количество строк (для variant='text') */
  lines?: number;
  /** Анимировать ли скелетон */
  animated?: boolean;
}

/**
 * Компонент Skeleton для отображения загрузки
 *
 * @example
 * ```typescript
 * // Простой текстовый скелетон
 * const skeleton = new Skeleton({ variant: 'text', lines: 3 });
 *
 * // Скелетон карточки товара
 * const cardSkeleton = new Skeleton({ variant: 'card' });
 *
 * // Кастомные размеры
 * const customSkeleton = new Skeleton({
 *   variant: 'rect',
 *   width: '200px',
 *   height: '150px'
 * });
 * ```
 */
export class Skeleton extends Component<SkeletonProps> {
  /**
   * Получить пропсы по умолчанию
   */
  protected getDefaultProps(): SkeletonProps {
    return {
      ...super.getDefaultProps(),
      variant: 'text',
      animated: true,
      lines: 1,
    };
  }

  /**
   * Отрендерить скелетон
   */
  public render(): HTMLElement {
    const {
      variant, width, height, lines, animated,
    } = this.props;

    if (variant === 'card') {
      return this.renderCardSkeleton();
    }

    const container = this.createElement('div', {
      className: `skeleton skeleton--${variant}${animated ? ' skeleton--animated' : ''}`,
      'data-testid': 'skeleton',
    });

    // Установка размеров
    if (width) {
      container.style.width = width;
    }
    if (height) {
      container.style.height = height;
    }

    // Для текста с несколькими строками
    if (variant === 'text' && lines && lines > 1) {
      for (let i = 0; i < lines; i++) {
        const line = this.createElement('div', {
          className: 'skeleton__line',
        });
        // Последняя строка короче
        if (i === lines - 1) {
          line.style.width = '70%';
        }
        container.appendChild(line);
      }
    }

    this.element = container;
    return container;
  }

  /**
   * Отрендерить скелетон карточки товара
   */
  private renderCardSkeleton(): HTMLElement {
    const card = this.createElement('div', {
      className: 'skeleton-card',
      'data-testid': 'skeleton-card',
    });

    // Изображение
    const image = this.createElement('div', {
      className: 'skeleton-card__image skeleton skeleton--animated',
    });
    card.appendChild(image);

    // Контент
    const content = this.createElement('div', {
      className: 'skeleton-card__content',
    });

    // Заголовок
    const title = this.createElement('div', {
      className: 'skeleton skeleton--text skeleton--animated',
    });
    title.style.width = '80%';
    title.style.height = '20px';
    content.appendChild(title);

    // Описание
    const description = this.createElement('div', {
      className: 'skeleton skeleton--text skeleton--animated',
    });
    description.style.width = '100%';
    description.style.height = '14px';
    description.style.marginTop = '8px';
    content.appendChild(description);

    // Цена
    const price = this.createElement('div', {
      className: 'skeleton skeleton--text skeleton--animated',
    });
    price.style.width = '40%';
    price.style.height = '24px';
    price.style.marginTop = '12px';
    content.appendChild(price);

    card.appendChild(content);

    this.element = card;
    return card;
  }
}

/**
 * Создать сетку скелетонов карточек
 * @param count - количество скелетонов
 * @returns HTMLElement с сеткой скелетонов
 */
export function createProductSkeletons(count: number): HTMLElement {
  const grid = document.createElement('div');
  grid.className = 'skeleton-grid';

  for (let i = 0; i < count; i++) {
    const skeleton = new Skeleton({ variant: 'card' });
    grid.appendChild(skeleton.render());
  }

  return grid;
}

/**
 * Создать скелетон страницы товара
 * @returns HTMLElement со скелетоном страницы
 */
export function createProductPageSkeleton(): HTMLElement {
  const container = document.createElement('div');
  container.className = 'product-skeleton';

  // Основной контент
  const main = document.createElement('div');
  main.className = 'product-skeleton__main';

  // Изображение
  const image = document.createElement('div');
  image.className = 'product-skeleton__image skeleton skeleton--rect skeleton--animated';
  main.appendChild(image);

  // Детали
  const details = document.createElement('div');
  details.className = 'product-skeleton__details';

  // Категория
  const category = document.createElement('div');
  category.className = 'skeleton skeleton--text skeleton--animated';
  category.style.width = '100px';
  category.style.height = '14px';
  details.appendChild(category);

  // Название
  const title = document.createElement('div');
  title.className = 'skeleton skeleton--text skeleton--animated';
  title.style.width = '80%';
  title.style.height = '28px';
  title.style.marginTop = '12px';
  details.appendChild(title);

  // Рейтинг
  const rating = document.createElement('div');
  rating.className = 'skeleton skeleton--text skeleton--animated';
  rating.style.width = '150px';
  rating.style.height = '16px';
  rating.style.marginTop = '8px';
  details.appendChild(rating);

  // Цена
  const price = document.createElement('div');
  price.className = 'skeleton skeleton--text skeleton--animated';
  price.style.width = '120px';
  price.style.height = '32px';
  price.style.marginTop = '16px';
  details.appendChild(price);

  // Описание
  for (let i = 0; i < 3; i++) {
    const line = document.createElement('div');
    line.className = 'skeleton skeleton--text skeleton--animated';
    line.style.width = i === 2 ? '70%' : '100%';
    line.style.height = '14px';
    line.style.marginTop = '8px';
    details.appendChild(line);
  }

  // Кнопка
  const button = document.createElement('div');
  button.className = 'skeleton skeleton--rect skeleton--animated';
  button.style.width = '180px';
  button.style.height = '48px';
  button.style.marginTop = '24px';
  button.style.borderRadius = '8px';
  details.appendChild(button);

  main.appendChild(details);
  container.appendChild(main);

  return container;
}
