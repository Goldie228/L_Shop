/**
 * Footer Component - L_Shop Frontend
 * Многосекционный футер с колонками, newsletter и социальными сетями
 *
 * @see src/frontend/styles/components/footer.css - стили футера
 * @see docs/DESIGN_SYSTEM.md - документация дизайн-системы
 */

import { Component, ComponentProps } from '../base/Component.js';

/**
 * Props для Footer компонента
 */
export interface FooterProps extends ComponentProps {
  /** URL логотипа для клика */
  logoUrl?: string;
  /** Текст копирайта */
  copyrightText?: string;
  /** Callback при подписке на newsletter */
  onNewsletterSubmit?: (email: string) => void;
}

/**
 * SVG иконки социальных сетей
 * Используются встроенные SVG для независимости от внешних библиотек
 */
const FACEBOOK_ICON = `
  <svg class="footer__social-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
`;

const TWITTER_ICON = `
  <svg class="footer__social-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
  </svg>
`;

const INSTAGRAM_ICON = `
  <svg class="footer__social-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
  </svg>
`;

const YOUTUBE_ICON = `
  <svg class="footer__social-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
`;

const TELEGRAM_ICON = `
  <svg class="footer__social-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
  </svg>
`;

/**
 * Логотип L_Shop
 */
const LOGO_SVG = `
  <svg class="footer__logo-svg" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
    <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 20px; font-weight: 700;" fill="currentColor">L</text>
  </svg>
`;

/**
 * Footer component class
 * Многосекционный футер с адаптивным layout
 *
 * @example
 * ```typescript
 * const footer = new Footer({
 *   logoUrl: '/',
 *   copyrightText: '© 2024 L_Shop. Все права защищены.',
 *   onNewsletterSubmit: (email) => console.log('Newsletter:', email)
 * });
 * document.body.appendChild(footer.render());
 * ```
 */
export class Footer extends Component<FooterProps> {
  /**
   * Newsletter форма и её состояние
   */
  private newsletterForm: HTMLFormElement | null = null;
  private emailInput: HTMLInputElement | null = null;

  /**
   * Get default props
   */
  protected getDefaultProps(): FooterProps {
    return {
      ...super.getDefaultProps(),
      logoUrl: '/',
      copyrightText: '© 2024 L_Shop. Все права защищены.',
    };
  }

  /**
   * Render footer
   * @returns Footer element
   */
  public render(): HTMLElement {
    const footer = this.createElement('footer', {
      className: 'footer',
      role: 'contentinfo',
      'data-testid': 'footer',
    });

    // Основной контейнер с колонками
    const container = this.createElement('div', {
      className: 'footer__container',
    });

    // Колонка 1: Логотип, описание, социальные сети
    const column1 = this.createBrandColumn();
    container.appendChild(column1);

    // Колонка 2: Категории товаров
    const column2 = this.createCategoriesColumn();
    container.appendChild(column2);

    // Колонка 3: Информация о компании
    const column3 = this.createCompanyColumn();
    container.appendChild(column3);

    // Колонка 4: Newsletter форма
    const column4 = this.createNewsletterColumn();
    container.appendChild(column4);

    footer.appendChild(container);

    // Legal links в отдельной строке
    const legalBar = this.createLegalBar();
    footer.appendChild(legalBar);

    this.element = footer;
    return footer;
  }

  /**
   * Создание колонки с брендом (логотип, описание, соцсети)
   * @returns Колонка элемента
   */
  private createBrandColumn(): HTMLElement {
    const column = this.createElement('div', {
      className: 'footer__column footer__column--brand',
    });

    // Логотип
    const logoLink = this.createElement('a', {
      href: this.props.logoUrl ?? '/',
      className: 'footer__logo-link',
      'aria-label': 'L_Shop - на главную',
    });

    const logo = this.createElement('span', {
      className: 'footer__logo',
    });
    logo.innerHTML = LOGO_SVG;
    logoLink.appendChild(logo);

    const brandName = this.createElement('span', {
      className: 'footer__brand-name',
    }, ['L_Shop']);
    logoLink.appendChild(brandName);

    column.appendChild(logoLink);

    // Описание
    const description = this.createElement('p', {
      className: 'footer__description',
    }, [
      'L_Shop — ваш премиальный интернет-магазин. Мы предлагаем только лучшее качество товаров с быстрой доставкой и отличным сервисом.'
    ]);
    column.appendChild(description);

    // Социальные сети
    const socialSection = this.createElement('div', {
      className: 'footer__social',
    });

    const socialLabel = this.createElement('span', {
      className: 'footer__social-label',
    }, ['Подпишитесь на нас:']);
    socialSection.appendChild(socialLabel);

    const socialLinks = this.createElement('div', {
      className: 'footer__social-links',
    });

    const socialNetworks = [
      { name: 'Facebook', icon: FACEBOOK_ICON, href: 'https://facebook.com' },
      { name: 'Twitter', icon: TWITTER_ICON, href: 'https://twitter.com' },
      { name: 'Instagram', icon: INSTAGRAM_ICON, href: 'https://instagram.com' },
      { name: 'YouTube', icon: YOUTUBE_ICON, href: 'https://youtube.com' },
      { name: 'Telegram', icon: TELEGRAM_ICON, href: 'https://telegram.org' },
    ];

    socialNetworks.forEach(network => {
      const link = this.createElement('a', {
        href: network.href,
        className: 'footer__social-link',
        target: '_blank',
        rel: 'noopener noreferrer',
        'aria-label': `L_Shop в ${network.name}`,
        'data-testid': `social-link-${network.name.toLowerCase()}`,
      });
      link.innerHTML = network.icon;
      socialLinks.appendChild(link);
    });

    socialSection.appendChild(socialLinks);
    column.appendChild(socialSection);

    return column;
  }

  /**
   * Создание колонки с категориями товаров
   * @returns Колонка элемента
   */
  private createCategoriesColumn(): HTMLElement {
    const column = this.createElement('div', {
      className: 'footer__column footer__column--categories',
    });

    const title = this.createElement('h3', {
      className: 'footer__column-title',
    }, ['Категории']);
    column.appendChild(title);

    const list = this.createElement('ul', {
      className: 'footer__list',
    });

    const categories = [
      { name: 'Электроника', href: '/category/electronics' },
      { name: 'Одежда', href: '/category/clothing' },
      { name: 'Дом и сад', href: '/category/home-garden' },
      { name: 'Красота', href: '/category/beauty' },
      { name: 'Спорт', href: '/category/sports' },
      { name: 'Книги', href: '/category/books' },
    ];

    categories.forEach(category => {
      const item = this.createElement('li', {
        className: 'footer__list-item',
      });

      const link = this.createElement('a', {
        href: category.href,
        className: 'footer__link',
        'data-testid': `category-link-${category.name.toLowerCase().replace(/\s+/g, '-')}`,
      }, [category.name]);

      item.appendChild(link);
      list.appendChild(item);
    });

    column.appendChild(list);
    return column;
  }

  /**
   * Создание колонки с информацией о компании
   * @returns Колонка элемента
   */
  private createCompanyColumn(): HTMLElement {
    const column = this.createElement('div', {
      className: 'footer__column footer__column--company',
    });

    const title = this.createElement('h3', {
      className: 'footer__column-title',
    }, ['Компания']);
    column.appendChild(title);

    const list = this.createElement('ul', {
      className: 'footer__list',
    });

    const links = [
      { name: 'О нас', href: '/about' },
      { name: 'Контакты', href: '/contact' },
      { name: 'Карьера', href: '/careers' },
      { name: 'Блог', href: '/blog' },
      { name: 'Партнёрам', href: '/partners' },
    ];

    links.forEach(link => {
      const item = this.createElement('li', {
        className: 'footer__list-item',
      });

      const a = this.createElement('a', {
        href: link.href,
        className: 'footer__link',
        'data-testid': `company-link-${link.name.toLowerCase().replace(/\s+/g, '-')}`,
      }, [link.name]);

      item.appendChild(a);
      list.appendChild(item);
    });

    column.appendChild(list);
    return column;
  }

  /**
   * Создание колонки с newsletter формой
   * @returns Колонка элемента
   */
  private createNewsletterColumn(): HTMLElement {
    const column = this.createElement('div', {
      className: 'footer__column footer__column--newsletter',
    });

    const title = this.createElement('h3', {
      className: 'footer__column-title',
    }, ['Рассылка']);
    column.appendChild(title);

    const description = this.createElement('p', {
      className: 'footer__newsletter-description',
    }, [
      'Подпишитесь на нашу рассылку, чтобы получать новости о новых поступлениях и акциях.'
    ]);
    column.appendChild(description);

    // Форма newsletter
    this.newsletterForm = this.createElement('form', {
      className: 'footer__newsletter-form',
      'data-testid': 'newsletter-form',
    });

    // Email input
    this.emailInput = this.createElement('input', {
      type: 'email',
      className: 'footer__newsletter-input',
      placeholder: 'Ваш email',
      required: true,
      'aria-label': 'Email для рассылки',
      'data-testid': 'newsletter-email-input',
    });

    this.addEventListener(this.emailInput, 'input', () => this.validateEmail());
    this.addEventListener(this.emailInput, 'blur', () => this.validateEmail());

    this.newsletterForm.appendChild(this.emailInput);

    // Кнопка подписки
    const submitButton = this.createElement('button', {
      type: 'submit',
      className: 'footer__newsletter-button',
      'data-testid': 'newsletter-submit-btn',
    }, ['Подписаться']);

    this.addEventListener(this.newsletterForm, 'submit', (e) => {
      e.preventDefault();
      this.handleNewsletterSubmit();
    });

    this.newsletterForm.appendChild(submitButton);
    column.appendChild(this.newsletterForm);

    // Сообщение об успехе/ошибке
    const message = this.createElement('p', {
      className: 'footer__newsletter-message',
      'aria-live': 'polite',
      'data-testid': 'newsletter-message',
    });
    column.appendChild(message);

    return column;
  }

  /**
   * Валидация email
   * @returns true если email валиден
   */
  private validateEmail(): boolean {
    if (!this.emailInput) return false;

    const email = this.emailInput.value.trim();
    const isValid = this.isValidEmail(email);
    const messageEl = this.element?.querySelector('.footer__newsletter-message');

    if (email && !isValid) {
      this.emailInput.classList.add('footer__newsletter-input--error');
      if (messageEl) {
        messageEl.textContent = 'Введите корректный email';
        messageEl.classList.add('footer__newsletter-message--error');
        messageEl.classList.remove('footer__newsletter-message--success');
      }
      return false;
    } else {
      this.emailInput.classList.remove('footer__newsletter-input--error');
      if (messageEl) {
        messageEl.classList.remove('footer__newsletter-message--error');
      }
      return true;
    }
  }

  /**
   * Проверка валидности email через регулярное выражение
   * @param email - Email для проверки
   * @returns true если email валиден
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Обработка отправки newsletter формы
   */
  private handleNewsletterSubmit(): void {
    if (!this.emailInput || !this.validateEmail()) return;

    const email = this.emailInput.value.trim();
    const messageEl = this.element?.querySelector('.footer__newsletter-message');

    try {
      // Вызов callback если передан
      if (this.props.onNewsletterSubmit) {
        this.props.onNewsletterSubmit(email);
      } else {
        // Заглушка: логируем в консоль
        console.log('[Footer] Newsletter subscription:', email);
      }

      // Показать сообщение об успехе
      if (messageEl) {
        messageEl.textContent = 'Спасибо за подписку!';
        messageEl.classList.add('footer__newsletter-message--success');
        messageEl.classList.remove('footer__newsletter-message--error');
      }

      // Очистить форму
      this.emailInput.value = '';

      // Скрыть сообщение через 5 секунд
      setTimeout(() => {
        if (messageEl) {
          messageEl.textContent = '';
          messageEl.classList.remove('footer__newsletter-message--success');
        }
      }, 5000);

    } catch (error) {
      // Обработка ошибок
      console.error('[Footer] Newsletter subscription error:', error);

      if (messageEl) {
        messageEl.textContent = 'Произошла ошибка. Попробуйте позже.';
        messageEl.classList.add('footer__newsletter-message--error');
        messageEl.classList.remove('footer__newsletter-message--success');
      }
    }
  }

  /**
   * Создание нижней панели с legal links
   * @returns Элемент legal bar
   */
  private createLegalBar(): HTMLElement {
    const bar = this.createElement('div', {
      className: 'footer__legal-bar',
    });

    const container = this.createElement('div', {
      className: 'footer__legal-container',
    });

    // Копирайт
    const copyright = this.createElement('p', {
      className: 'footer__copyright',
    }, [this.props.copyrightText ?? '© 2024 L_Shop. Все права защищены.']);
    container.appendChild(copyright);

    // Legal links
    const legalLinks = this.createElement('nav', {
      className: 'footer__legal-links',
      'aria-label': 'Правовая информация',
    });

    const legalItems = [
      { name: 'Privacy Policy', href: '/privacy' },
      { name: 'Terms of Service', href: '/terms' },
      { name: 'Cookie Policy', href: '/cookies' },
    ];

    legalItems.forEach((item, index) => {
      const link = this.createElement('a', {
        href: item.href,
        className: 'footer__legal-link',
        'data-testid': `legal-link-${item.name.toLowerCase().replace(/\s+/g, '-')}`,
      }, [item.name]);

      // Добавляем разделитель кроме последнего элемента
      if (index < legalItems.length - 1) {
        const separator = this.createElement('span', {
          className: 'footer__legal-separator',
        }, ['|']);
        legalLinks.appendChild(separator);
      }

      legalLinks.appendChild(link);
    });

    container.appendChild(legalLinks);
    bar.appendChild(container);

    return bar;
  }
}
