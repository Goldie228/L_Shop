/**
 * Main Page Component - L_Shop Frontend
 * Home page with welcome content
 */

import { Component, ComponentProps } from '../components/base/Component';
import { Button } from '../components/ui/Button';
import { store } from '../store/store';

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
    
    const page = this.createElement('div', {
      className: 'page main-page'
    });
    
    // Hero section
    const hero = this.createHeroSection(state.user.isAuthenticated);
    page.appendChild(hero);
    
    // Features section
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
      className: 'hero'
    });
    
    const container = this.createElement('div', {
      className: 'container'
    });
    
    // Hero content
    const content = this.createElement('div', {
      className: 'hero__content'
    });
    
    // Title
    const title = this.createElement(
      'h1',
      { className: 'hero__title' },
      ['Добро пожаловать в L_Shop']
    );
    content.appendChild(title);
    
    // Subtitle
    const subtitle = this.createElement(
      'p',
      { className: 'hero__subtitle' },
      ['Интернет-магазин с широким ассортиментом товаров и удобным сервисом']
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
      className: 'features'
    });
    
    const container = this.createElement('div', {
      className: 'container'
    });
    
    // Section title
    const title = this.createElement(
      'h2',
      { className: 'features__title' },
      ['Почему выбирают нас']
    );
    container.appendChild(title);
    
    // Features grid
    const grid = this.createElement('div', {
      className: 'features__grid'
    });
    
    // Feature 1
    const feature1 = this.createFeatureCard(
      '🚚',
      'Быстрая доставка',
      'Доставляем заказы по всей стране в кратчайшие сроки'
    );
    grid.appendChild(feature1);
    
    // Feature 2
    const feature2 = this.createFeatureCard(
      '💳',
      'Удобная оплата',
      'Принимаем все виды карт и электронных платежей'
    );
    grid.appendChild(feature2);
    
    // Feature 3
    const feature3 = this.createFeatureCard(
      '🔒',
      'Безопасность',
      'Гарантируем безопасность ваших данных и платежей'
    );
    grid.appendChild(feature3);
    
    // Feature 4
    const feature4 = this.createFeatureCard(
      '📞',
      'Поддержка 24/7',
      'Наши специалисты всегда готовы помочь вам'
    );
    grid.appendChild(feature4);
    
    container.appendChild(grid);
    section.appendChild(container);
    
    return section;
  }

  /**
   * Create feature card
   * @param icon - Icon emoji
   * @param title - Feature title
   * @param description - Feature description
   * @returns Card element
   */
  private createFeatureCard(
    icon: string,
    title: string,
    description: string
  ): HTMLElement {
    const card = this.createElement('div', {
      className: 'feature-card card'
    });
    
    // Icon
    const iconEl = this.createElement(
      'div',
      { className: 'feature-card__icon' },
      [icon]
    );
    card.appendChild(iconEl);
    
    // Title
    const titleEl = this.createElement(
      'h3',
      { className: 'feature-card__title' },
      [title]
    );
    card.appendChild(titleEl);
    
    // Description
    const descEl = this.createElement(
      'p',
      { className: 'feature-card__description' },
      [description]
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