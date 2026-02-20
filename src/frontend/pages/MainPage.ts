/**
 * Main Page Component - L_Shop Frontend
 * Главная страница магазина с приветственным контентом
 * 
 * @see src/frontend/styles/pages/main-page.css - стили страницы
 * @see src/frontend/styles/utilities.css - утилитарные классы
 */

import { Component, ComponentProps } from '../components/base/Component.js';
import { Button } from '../components/ui/Button.js';
import { store } from '../store/store.js';

/**
 * Main page props
 */
export interface MainPageProps extends ComponentProps {
  /** Callback when login/register clicked */
  onAuthClick?: () => void;
}

/**
 * Main page component
 * Landing page for the shop
 */
export class MainPage extends Component<MainPageProps> {
  /** Store unsubscribe function */
  private unsubscribe: (() => void) | null = null;

  /**
   * Get default props
   */
  protected getDefaultProps(): MainPageProps {
    return {
      ...super.getDefaultProps()
    };
  }

  /**
   * Render main page
   * @returns Page element
   */
  public render(): HTMLElement {
    const state = store.getState();

    // Создаём контейнер страницы (без layout обёртки)
    // Layout будет управлять общей структурой
    const page = this.createElement('div', {
      className: 'page main-page animate-fade-in',
    });
    page.setAttribute('data-testid', 'main-page');

    // Hero section с анимацией
    const hero = this.createHeroSection(state.user.isAuthenticated);
    page.appendChild(hero);

    // Features section с анимированными карточками
    const features = this.createFeaturesSection();
    page.appendChild(features);

    this.element = page;
    return page;
  }

  /**
   * Create hero section
   * @param isAuthenticated - Whether user is authenticated
   * @returns Hero element
   */
  private createHeroSection(isAuthenticated: boolean): HTMLElement {
    const hero = this.createElement('section', {
      className: 'hero animate-slide-up',
    });
    hero.setAttribute('data-testid', 'hero-section');

    // Используем контейнер из layout
    const container = this.createElement('div', {
      className: 'layout__content',
    });

    // Hero content
    const content = this.createElement('div', {
      className: 'hero__content',
    });

    // Title с утилитарным классом типографики
    const title = this.createElement(
      'h1',
      { className: 'hero__title text-hero' },
      ['Добро пожаловать в L_Shop'],
    );
    content.appendChild(title);

    // Subtitle с утилитарным классом типографики
    const subtitle = this.createElement(
      'p',
      { className: 'hero__subtitle text-body-lg' },
      ['Интернет-магазин с широким ассортиментом товаров и удобным сервисом'],
    );
    content.appendChild(subtitle);
    
    // CTA buttons
    const actions = this.createElement('div', {
      className: 'hero__actions'
    });
    
    if (isAuthenticated) {
      // Show shop button for authenticated users
      const shopButton = new Button({
        text: 'Перейти в каталог',
        variant: 'primary',
        size: 'lg',
        onClick: () => {
          // Will navigate to catalog when implemented
          console.log('Navigate to catalog');
        }
      });
      actions.appendChild(shopButton.render());
    } else {
      // Show auth buttons for guests
      const loginButton = new Button({
        text: 'Войти',
        variant: 'primary',
        size: 'lg',
        onClick: () => {
          if (this.props.onAuthClick) {
            this.props.onAuthClick();
          }
        }
      });
      actions.appendChild(loginButton.render());
      
      const registerButton = new Button({
        text: 'Регистрация',
        variant: 'secondary',
        size: 'lg',
        onClick: () => {
          if (this.props.onAuthClick) {
            this.props.onAuthClick();
          }
        }
      });
      actions.appendChild(registerButton.render());
    }
    
    content.appendChild(actions);
    container.appendChild(content);
    hero.appendChild(container);
    
    return hero;
  }

  /**
   * Create features section
   * @returns Features element
   */
  private createFeaturesSection(): HTMLElement {
    const section = this.createElement('section', {
      className: 'features',
    });
    section.setAttribute('data-testid', 'features-section');

    // Используем контейнер из layout
    const container = this.createElement('div', {
      className: 'layout__content',
    });

    // Section title с утилитарным классом типографики
    const title = this.createElement(
      'h2',
      { className: 'features__title text-h2' },
      ['Почему выбирают нас'],
    );
    container.appendChild(title);

    // Features grid
    const grid = this.createElement('div', {
      className: 'features__grid',
    });

    // Feature cards с hover эффектами и анимацией появления
    // CSS уже содержит staggered animation через nth-child
    const features: Array<{ icon: string; title: string; description: string }> = [
      {
        icon: '🚚',
        title: 'Быстрая доставка',
        description: 'Доставляем заказы по всей стране в кратчайшие сроки',
      },
      {
        icon: '💳',
        title: 'Удобная оплата',
        description: 'Принимаем все виды карт и электронных платежей',
      },
      {
        icon: '🔒',
        title: 'Безопасность',
        description: 'Гарантируем безопасность ваших данных и платежей',
      },
      {
        icon: '📞',
        title: 'Поддержка 24/7',
        description: 'Наши специалисты всегда готовы помочь вам',
      },
    ];

    features.forEach((feature, index) => {
      const card = this.createFeatureCard(
        feature.icon,
        feature.title,
        feature.description,
        index,
      );
      grid.appendChild(card);
    });

    container.appendChild(grid);
    section.appendChild(container);

    return section;
  }

  /**
   * Create feature card
   * @param icon - Icon emoji
   * @param title - Feature title
   * @param description - Feature description
   * @param index - Card index for test id
   * @returns Card element
   */
  private createFeatureCard(
    icon: string,
    title: string,
    description: string,
    index: number,
  ): HTMLElement {
    // Добавляем классы для hover эффекта и анимации
    const card = this.createElement('div', {
      className: 'feature-card card card--hover animate-slide-up',
    });
    card.setAttribute('data-testid', `feature-card-${index}`);

    // Icon
    const iconEl = this.createElement(
      'div',
      { className: 'feature-card__icon' },
      [icon],
    );
    card.appendChild(iconEl);

    // Title с утилитарным классом типографики
    const titleEl = this.createElement(
      'h3',
      { className: 'feature-card__title text-h4' },
      [title],
    );
    card.appendChild(titleEl);

    // Description с утилитарным классом типографики
    const descEl = this.createElement(
      'p',
      { className: 'feature-card__description text-body' },
      [description],
    );
    card.appendChild(descEl);

    return card;
  }

  /**
   * Called after component is mounted
   */
  protected onMounted(): void {
    // Subscribe to auth changes
    this.unsubscribe = store.subscribe('user', () => {
      this.update();
    });
  }

  /**
   * Called after component is unmounted
   */
  protected onUnmounted(): void {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }
  }
}
