/**
 * Компонент Footer - L_Shop Frontend
 * Подвал сайта с информацией и ссылками
 *
 * @see src/frontend/styles/components/layout.css - стили footer
 * @see docs/DESIGN_SYSTEM.md - документация дизайн-системы
 */

import { Component, ComponentProps } from '../base/Component.js';

/**
 * Пропсы для компонента Footer
 */
export interface FooterProps extends ComponentProps {
  /** Год для копирайта */
  year?: number;
}

/**
 * Footer компонент
 * Содержит логотип, ссылки и копирайт
 *
 * @example
 * ```typescript
 * const footer = new Footer();
 * document.body.appendChild(footer.render());
 * ```
 */
export class Footer extends Component<FooterProps> {
  /**
   * Получить пропсы по умолчанию
   */
  protected getDefaultProps(): FooterProps {
    return {
      ...super.getDefaultProps(),
      year: new Date().getFullYear(),
    };
  }

  /**
   * Отрендерить footer
   * @returns Элемент footer
   */
  public render(): HTMLElement {
    const footer = this.createElement('footer', {
      className: 'footer',
      role: 'contentinfo',
      'data-testid': 'footer',
    });

    const container = this.createElement('div', {
      className: 'footer__container',
    });

    // Основной контент footer
    const content = this.createContent();
    container.appendChild(content);

    // Нижняя часть с копирайтом
    const bottom = this.createBottom();
    container.appendChild(bottom);

    footer.appendChild(container);
    this.element = footer;
    return footer;
  }

  /**
   * Создать основной контент footer
   * @returns Элемент контента
   */
  private createContent(): HTMLElement {
    const content = this.createElement('div', {
      className: 'footer__content',
    });

    // Колонка с логотипом и описанием
    const brandCol = this.createElement('div', {
      className: 'footer__brand',
    });

    const logo = this.createElement('a', {
      href: '/',
      className: 'footer__logo',
    }, ['L_Shop']);

    const description = this.createElement('p', {
      className: 'footer__description',
    }, ['Интернет-магазин с широким ассортиментом товаров по выгодным ценам.']);

    brandCol.appendChild(logo);
    brandCol.appendChild(description);
    content.appendChild(brandCol);

    // Колонка с ссылками
    const linksCol = this.createElement('div', {
      className: 'footer__links',
    });

    const linksTitle = this.createElement('h4', {
      className: 'footer__links-title',
    }, ['Навигация']);

    const linksList = this.createElement('ul', {
      className: 'footer__links-list',
    });

    const links = [
      { text: 'Главная', href: '/' },
      { text: 'Каталог', href: '/catalog' },
      { text: 'О нас', href: '/about' },
      { text: 'Контакты', href: '/contacts' },
    ];

    links.forEach(link => {
      const item = this.createElement('li', {});
      const anchor = this.createElement('a', {
        href: link.href,
        className: 'footer__link',
      }, [link.text]);
      item.appendChild(anchor);
      linksList.appendChild(item);
    });

    linksCol.appendChild(linksTitle);
    linksCol.appendChild(linksList);
    content.appendChild(linksCol);

    // Колонка с контактами
    const contactsCol = this.createElement('div', {
      className: 'footer__contacts',
    });

    const contactsTitle = this.createElement('h4', {
      className: 'footer__links-title',
    }, ['Контакты']);

    const contactsList = this.createElement('ul', {
      className: 'footer__links-list',
    });

    const contacts = [
      { text: 'support@lshop.by', icon: 'email' },
      { text: '+375 (29) 123-45-67', icon: 'phone' },
    ];

    contacts.forEach(contact => {
      const item = this.createElement('li', {});
      const anchor = this.createElement('a', {
        href: contact.icon === 'email' ? `mailto:${contact.text}` : `tel:${contact.text.replace(/\D/g, '')}`,
        className: 'footer__link',
      }, [contact.text]);
      item.appendChild(anchor);
      contactsList.appendChild(item);
    });

    contactsCol.appendChild(contactsTitle);
    contactsCol.appendChild(contactsList);
    content.appendChild(contactsCol);

    return content;
  }

  /**
   * Создать нижнюю часть footer с копирайтом
   * @returns Элемент с копирайтом
   */
  private createBottom(): HTMLElement {
    const bottom = this.createElement('div', {
      className: 'footer__bottom',
    });

    const copyright = this.createElement('p', {
      className: 'footer__copyright',
    }, [`© ${this.props.year ?? new Date().getFullYear()} L_Shop. Все права защищены.`]);

    bottom.appendChild(copyright);
    return bottom;
  }
}