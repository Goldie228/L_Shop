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
  * Пропсы главной страницы
  */
 export interface MainPageProps extends ComponentProps {
   /** Callback при клике на вход/регистрацию */
   onAuthClick?: () => void;
 }

/**
 * Коллекция для карточки коллекции
 */
interface Collection {
  /** Уникальный идентификатор */
  id: string;
  /** Название коллекции */
  name: string;
  /** Описание коллекции */
  description: string;
  /** URL изображения или иконки */
  imageUrl: string;
  /** Ссылка для перехода */
  link: string;
}

/**
 * Main page component
 * Landing page for the shop
 */
export class MainPage extends Component<MainPageProps> {
  /** Store unsubscribe function */
  private unsubscribe: (() => void) | null = null;

  /**
   * Коллекции для секции Featured Collections
   */
  private readonly collections: Collection[] = [
    {
      id: 'electronics',
      name: 'Электроника',
      description: 'Современные гаджеты и устройства',
      imageUrl: 'https://via.placeholder.com/400x300/16161d/3b82f6?text=Electronics',
      link: '#electronics',
    },
    {
      id: 'accessories',
      name: 'Аксессуары',
      description: 'Дополнения для ваших устройств',
      imageUrl: 'https://via.placeholder.com/400x300/16161d/9333ea?text=Accessories',
      link: '#accessories',
    },
    {
      id: 'home',
      name: 'Для дома',
      description: 'Уют и комфорт в каждом элементе',
      imageUrl: 'https://via.placeholder.com/400x300/16161d/22c55e?text=Home',
      link: '#home',
    },
    {
      id: 'clothing',
      name: 'Одежда',
      description: 'Стиль и качество от лучших брендов',
      imageUrl: 'https://via.placeholder.com/400x300/16161d/f59e0b?text=Clothing',
      link: '#clothing',
    },
  ];

  /**
   * Get default props
   */
  protected getDefaultProps(): MainPageProps {
    return {
      ...super.getDefaultProps(),
    };
  }

  /**
   * Render main page
   * @returns Page element
   */
  public render(): HTMLElement {
    // Создаём контейнер страницы
    const page = this.createElement('div', {
      className: 'page main-page animate-fade-in',
    });
    page.setAttribute('data-testid', 'main-page');

    // Hero section с анимацией
    const hero = this.createHeroSection();
    page.appendChild(hero);

    // Featured Collections section
    const collections = this.createCollectionsSection();
    page.appendChild(collections);

    // Features section
    const features = this.createFeaturesSection();
    page.appendChild(features);

    this.element = page;
    return page;
  }

  /**
   * Create hero section with dark theme gradient
   * @returns Hero element
   */
  private createHeroSection(): HTMLElement {
    const hero = this.createElement('section', {
      className: 'hero animate-fade-in',
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
    const title = this.createElement('h1', { className: 'hero__title text-hero' }, [
      'Откройте мир стиля и технологий',
    ]);
    content.appendChild(title);

    // Subtitle с утилитарным классом типографики
    const subtitle = this.createElement('p', { className: 'hero__subtitle text-body-lg' }, [
      'Лучшие товары для вашего дома и жизни. Качественные продукты с быстрой доставкой и гарантией удовлетворения.',
    ]);
    content.appendChild(subtitle);

    // CTA buttons
    const actions = this.createElement('div', {
      className: 'hero__actions',
    });

    const shopButton = new Button({
      text: 'Смотреть каталог',
      variant: 'primary',
      size: 'lg',
      onClick: () => {
        console.log('Navigate to catalog');
        // TODO: Навигация в каталог
      },
    });
    actions.appendChild(shopButton.render());

    const learnButton = new Button({
      text: 'Узнать больше',
      variant: 'outline',
      size: 'lg',
      onClick: () => {
        console.log('Scroll to collections');
        // Прокрутка к коллекциям
        const collectionsSection = document.querySelector('[data-testid="collections-section"]');
        if (collectionsSection) {
          collectionsSection.scrollIntoView({ behavior: 'smooth' });
        }
      },
    });
    actions.appendChild(learnButton.render());

    content.appendChild(actions);
    container.appendChild(content);
    hero.appendChild(container);

    return hero;
  }

  /**
   * Create featured collections section
   * @returns Collections element
   */
  private createCollectionsSection(): HTMLElement {
    const section = this.createElement('section', {
      className: 'collections-section',
    });
    section.setAttribute('data-testid', 'collections-section');

    const container = this.createElement('div', {
      className: 'layout__content',
    });

    // Section title
    const title = this.createElement('h2', { className: 'collections-section__title text-h2' }, [
      'Популярные коллекции',
    ]);
    container.appendChild(title);

    // Collections grid
    const grid = this.createElement('div', {
      className: 'collections-section__grid',
    });

    this.collections.forEach((collection, index) => {
      const card = this.createCollectionCard(collection, index);
      grid.appendChild(card);
    });

    container.appendChild(grid);
    section.appendChild(container);

    return section;
  }

  /**
   * Create collection card
   * @param collection - Collection data
   * @param index - Card index for animation delay
   * @returns Card element
   */
  private createCollectionCard(collection: Collection, index: number): HTMLElement {
    const card = this.createElement('a', {
      className: 'collection-card card card--hover animate-slide-up',
      href: collection.link,
    });
    card.setAttribute('data-testid', `collection-card-${index}`);

    // Image container with overlay
    const imageContainer = this.createElement('div', {
      className: 'collection-card__image-container',
    });

    const image = this.createElement('img', {
      className: 'collection-card__image',
      src: collection.imageUrl,
      alt: collection.name,
      loading: 'lazy',
    });
    imageContainer.appendChild(image);

    // Gradient overlay
    const overlay = this.createElement('div', {
      className: 'collection-card__overlay',
    });
    imageContainer.appendChild(overlay);

    card.appendChild(imageContainer);

    // Content
    const content = this.createElement('div', {
      className: 'collection-card__content',
    });

    const name = this.createElement('h3', { className: 'collection-card__name text-h4' }, [
      collection.name,
    ]);
    content.appendChild(name);

    const description = this.createElement(
      'p',
      { className: 'collection-card__description text-body' },
      [collection.description],
    );
    content.appendChild(description);

    const link = this.createElement('span', { className: 'collection-card__link text-body-sm' }, [
      'Смотреть все →',
    ]);
    content.appendChild(link);

    card.appendChild(content);

    return card;
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
    const title = this.createElement('h2', { className: 'features__title text-h2' }, [
      'Почему выбирают нас',
    ]);
    container.appendChild(title);

    // Features grid
    const grid = this.createElement('div', {
      className: 'features__grid',
    });

    // Feature cards с hover эффектами и анимацией появления
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
      const card = this.createFeatureCard(feature.icon, feature.title, feature.description, index);
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
    const card = this.createElement('div', {
      className: 'feature-card card card--hover animate-slide-up',
    });
    card.setAttribute('data-testid', `feature-card-${index}`);

    // Icon
    const iconEl = this.createElement('div', { className: 'feature-card__icon' }, [icon]);
    card.appendChild(iconEl);

    // Title с утилитарным классом типографики
    const titleEl = this.createElement('h3', { className: 'feature-card__title text-h4' }, [title]);
    card.appendChild(titleEl);

    // Description с утилитарным классом типографики
    const descEl = this.createElement('p', { className: 'feature-card__description text-body' }, [
      description,
    ]);
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
