/**
 * Компонент Breadcrumbs - L_Shop Frontend
 * Хлебные крошки для навигации
 *
 * @see docs/DESIGN_SYSTEM.md - документация дизайн-системы
 */

import { Component, ComponentProps } from '../base/Component.js';
import { router } from '../../router/router.js';

/**
 * Элемент хлебных крошек
 */
export interface BreadcrumbItem {
  /** Текст ссылки */
  label: string;
  /** URL ссылки (опционально - если нет, то текущий элемент) */
  href?: string;
  /** Иконка (опционально) */
  icon?: string;
}

/**
 * Пропсы компонента Breadcrumbs
 */
export interface BreadcrumbsProps extends ComponentProps {
  /** Элементы хлебных крошек */
  items: BreadcrumbItem[];
  /** Показывать иконку дома в начале */
  showHome?: boolean;
  /** Разделитель */
  separator?: '/' | '>' | '→' | '•';
}

/**
 * SVG иконка дома
 */
const HOME_ICON = `
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
       stroke-linecap="round" stroke-linejoin="round" class="breadcrumbs__home-icon">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
    <polyline points="9 22 9 12 15 12 15 22"></polyline>
  </svg>
`;

/**
 * SVG иконка разделителя
 */
const SEPARATOR_ICON = `
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
       stroke-linecap="round" stroke-linejoin="round" class="breadcrumbs__separator-icon">
    <polyline points="9 18 15 12 9 6"></polyline>
  </svg>
`;

/**
 * Компонент хлебных крошек
 *
 * @example
 * ```typescript
 * const breadcrumbs = new Breadcrumbs({
 *   items: [
 *     { label: 'Каталог', href: '/catalog' },
 *     { label: 'Электроника', href: '/catalog?category=electronics' },
 *     { label: 'Смартфоны' } // Последний элемент без href
 *   ],
 *   showHome: true
 * });
 * container.appendChild(breadcrumbs.render());
 * ```
 */
export class Breadcrumbs extends Component<BreadcrumbsProps> {
  /**
   * Получить пропсы по умолчанию
   */
  protected getDefaultProps(): BreadcrumbsProps {
    return {
      ...super.getDefaultProps(),
      items: [],
      showHome: true,
      separator: '>',
    };
  }

  /**
   * Отрендерить хлебные крошки
   */
  public render(): HTMLElement {
    const { items, showHome, separator } = this.props;

    const nav = this.createElement('nav', {
      className: 'breadcrumbs',
      'aria-label': 'Навигационная цепочка',
      'data-testid': 'breadcrumbs',
    });

    const list = this.createElement('ol', {
      className: 'breadcrumbs__list',
    });

    // Добавить иконку дома
    if (showHome) {
      const homeItem = this.createBreadcrumbItem({ label: 'Главная', href: '/' }, true);
      list.appendChild(homeItem);

      if (items.length > 0) {
        const separatorEl = this.createSeparator(separator!);
        list.appendChild(separatorEl);
      }
    }

    // Добавить элементы
    items.forEach((item, index) => {
      const isLast = index === items.length - 1;
      const breadcrumbItem = this.createBreadcrumbItem(item, false, isLast);
      list.appendChild(breadcrumbItem);

      if (!isLast) {
        const separatorEl = this.createSeparator(separator!);
        list.appendChild(separatorEl);
      }
    });

    nav.appendChild(list);
    this.element = nav;
    return nav;
  }

  /**
   * Создать элемент хлебных крошек
   */
  private createBreadcrumbItem(
    item: BreadcrumbItem,
    isHome = false,
    isLast = false,
  ): HTMLLIElement {
    const li = this.createElement('li', {
      className: 'breadcrumbs__item',
    });

    if (isLast || !item.href) {
      // Последний элемент или элемент без ссылки - просто текст
      const span = this.createElement('span', {
        className: 'breadcrumbs__current',
        'aria-current': 'page',
      });
      span.textContent = item.label;
      li.appendChild(span);
    } else {
      // Ссылка
      const link = this.createElement('a', {
        className: 'breadcrumbs__link',
        href: item.href,
      });

      if (isHome) {
        // Иконка дома
        const iconSpan = this.createElement('span', {
          className: 'breadcrumbs__home',
          'aria-label': 'Главная',
        });
        const svg = this.createSVGFromString(HOME_ICON);
        if (svg) {
          iconSpan.appendChild(svg);
        }
        link.appendChild(iconSpan);
        link.setAttribute('title', 'Главная');
      } else {
        link.textContent = item.label;
      }

      this.addEventListener(link, 'click', (e: Event) => {
        e.preventDefault();
        router.navigate(item.href!);
      });

      li.appendChild(link);
    }

    return li;
  }

  /**
   * Создать разделитель
   */
  private createSeparator(separator: string): HTMLLIElement {
    const li = this.createElement('li', {
      className: 'breadcrumbs__separator',
      'aria-hidden': 'true',
    });

    if (separator === '>' || separator === '→') {
      const svg = this.createSVGFromString(SEPARATOR_ICON);
      if (svg) {
        li.appendChild(svg);
      }
    } else {
      li.textContent = separator;
    }

    return li;
  }

  /**
   * Обновить элементы хлебных крошек
   */
  public setItems(items: BreadcrumbItem[]): void {
    this.setProps({ items });
    this.update();
  }
}