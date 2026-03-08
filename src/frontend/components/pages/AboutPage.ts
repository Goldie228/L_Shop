/**
 * Страница "О нас" - L_Shop Frontend
 * Информационная страница о компании
 */

import { Component, ComponentProps } from '../base/Component';

/**
 * Пропсы страницы "О нас"
 */
export type AboutPageProps = ComponentProps;

/**
 * SVG иконки для преимуществ
 */
const BENEFIT_ICONS = {
  delivery: [
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"',
    '  stroke-linecap="round" stroke-linejoin="round">',
    '  <rect x="1" y="3" width="15" height="13"></rect>',
    '  <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>',
    '  <circle cx="5.5" cy="18.5" r="2.5"></circle>',
    '  <circle cx="18.5" cy="18.5" r="2.5"></circle>',
    '</svg>',
  ].join('\n'),
  quality: [
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"',
    '  stroke-linecap="round" stroke-linejoin="round">',
    '  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>',
    '</svg>',
  ].join('\n'),
  support: [
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"',
    '  stroke-linecap="round" stroke-linejoin="round">',
    '  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>',
    '</svg>',
  ].join('\n'),
  price: [
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"',
    '  stroke-linecap="round" stroke-linejoin="round">',
    '  <line x1="12" y1="1" x2="12" y2="23"></line>',
    '  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>',
    '</svg>',
  ].join('\n'),
};

/**
 * Данные для секции преимуществ
 */
const BENEFITS = [
  {
    icon: BENEFIT_ICONS.delivery,
    title: 'Быстрая доставка',
    description:
      'Доставляем заказы по всей Беларуси в кратчайшие сроки. Самовывоз из магазина в день заказа.',
  },
  {
    icon: BENEFIT_ICONS.quality,
    title: 'Гарантия качества',
    description:
      'Все товары проходят строгий контроль качества. Официальная гарантия на весь ассортимент.',
  },
  {
    icon: BENEFIT_ICONS.support,
    title: 'Поддержка 24/7',
    description:
      'Наша команда поддержки всегда готова помочь. Ответим на все ваши вопросы в любое время.',
  },
  {
    icon: BENEFIT_ICONS.price,
    title: 'Честные цены',
    description:
      'Прозрачное ценообразование без скрытых наценок. Регулярные акции и скидки для клиентов.',
  },
];

/**
 * Интерфейс для элемента команды
 */
interface TeamMember {
  name: string;
  role: string;
  variant: string;
  description: string;
}

/**
 * Данные для секции команды (из документации проекта)
 */
const TEAM: TeamMember[] = [
  {
    name: 'Глеб',
    role: 'Тимлид',
    variant: '8',
    description: 'Отвечает за инфраструктуру, аутентификацию и интеграцию модулей',
  },
  {
    name: 'Никита П.',
    role: 'Backend/Frontend разработчик',
    variant: '17',
    description: 'Разрабатывает модуль продуктов и каталог',
  },
  {
    name: 'Тимофей',
    role: 'Backend/Frontend разработчик',
    variant: '21',
    description: 'Отвечает за модуль корзины и оформление заказов',
  },
  {
    name: 'Никита Т.',
    role: 'Backend/Frontend разработчик',
    variant: '24',
    description: 'Разрабатывает модуль заказов и доставки',
  },
];

/**
 * Статистика компании
 */
const STATS = [
  { value: '5000+', label: 'Товаров' },
  { value: '25000+', label: 'Клиентов' },
  { value: '45000+', label: 'Заказов' },
  { value: '98%', label: 'Довольных клиентов' },
];

/**
 * Страница "О нас"
 */
export class AboutPage extends Component<AboutPageProps> {
  constructor(props: AboutPageProps = {}) {
    super(props);
  }

  protected getDefaultProps(): AboutPageProps {
    return {
      ...super.getDefaultProps(),
      className: 'about-page',
    };
  }

  public render(): HTMLElement {
    const container = this.createElement('div', {
      className: 'about-page',
    });

    const innerContainer = this.createElement('div', {
      className: 'container',
    });

    // Заголовок
    const title = this.createElement(
      'h1',
      {
        className: 'page-title',
      },
      ['О нас'],
    );
    innerContainer.appendChild(title);

    // Миссия
    const missionSection = this.createSection(
      'Наша миссия',
      'L_Shop — это прототип интернет-магазина, разработанный с целью создания функционального и удобного веб-приложения с полной системой аутентификации, каталогом товаров с фильтрацией, корзиной покупок и оформлением заказов. Мы стремимся показать, как можно эффективно разрабатывать TypeScript-приложения, соблюдая лучшие практики чистой архитектуры, SOLID-принципов и стандартов кодирования.',
    );
    innerContainer.appendChild(missionSection);

    // История
    const historySection = this.createSection(
      'О проекте',
      'L_Shop — это учебный проект, созданный для демонстрации современных подходов к full-stack разработке. Проект использует стек технологий: Node.js + Express для бэкенда и чистый TypeScript с Vite для фронтенда. Данные хранятся в JSON-файлах, что позволяет быстро запускать и тестировать приложение без необходимости настройки внешних баз данных. Проект активно развивается командой из 4 разработчиков с чётким разделением ответственности.',
    );
    innerContainer.appendChild(historySection);

    // Преимущества
    const benefitsSection = this.createBenefitsSection();
    innerContainer.appendChild(benefitsSection);

    // Статистика
    const statsSection = this.createStatsSection();
    innerContainer.appendChild(statsSection);

    // Команда
    const teamSection = this.createTeamSection();
    innerContainer.appendChild(teamSection);

    // Ценности
    const valuesSection = this.createValuesSection();
    innerContainer.appendChild(valuesSection);

    // Карточка контактов
    const contactCard = this.createContactCard();
    innerContainer.appendChild(contactCard);

    container.appendChild(innerContainer);

    return container;
  }

  /**
   * Создать секцию с заголовком и текстом
   */
  private createSection(title: string, text: string): HTMLElement {
    const section = this.createElement('section', {
      className: 'about-page__section',
    });

    const titleEl = this.createElement(
      'h2',
      {
        className: 'about-page__section-title',
      },
      [title],
    );
    section.appendChild(titleEl);

    const textEl = this.createElement(
      'p',
      {
        className: 'about-page__text',
      },
      [text],
    );
    section.appendChild(textEl);

    return section;
  }

  /**
   * Создать секцию преимуществ
   */
  private createBenefitsSection(): HTMLElement {
    const section = this.createElement('section', {
      className: 'about-page__section about-page__benefits',
    });

    const titleEl = this.createElement(
      'h2',
      {
        className: 'about-page__section-title',
      },
      ['Почему выбирают нас'],
    );
    section.appendChild(titleEl);

    const grid = this.createElement('div', {
      className: 'about-page__benefits-grid',
    });

    BENEFITS.forEach((benefit) => {
      const card = this.createElement('div', {
        className: 'about-page__benefit-card',
      });

      const iconDiv = this.createElement('div', {
        className: 'about-page__benefit-icon',
      });
      iconDiv.innerHTML = benefit.icon;
      card.appendChild(iconDiv);

      const cardTitle = this.createElement(
        'h3',
        {
          className: 'about-page__benefit-title',
        },
        [benefit.title],
      );
      card.appendChild(cardTitle);

      const cardDesc = this.createElement(
        'p',
        {
          className: 'about-page__benefit-description',
        },
        [benefit.description],
      );
      card.appendChild(cardDesc);

      grid.appendChild(card);
    });

    section.appendChild(grid);
    return section;
  }

  /**
   * Создать секцию статистики
   */
  private createStatsSection(): HTMLElement {
    const section = this.createElement('section', {
      className: 'about-page__section about-page__stats',
    });

    const titleEl = this.createElement(
      'h2',
      {
        className: 'about-page__section-title',
      },
      ['Наши достижения'],
    );
    section.appendChild(titleEl);

    const statsGrid = this.createElement('div', {
      className: 'about-page__stats-grid',
    });

    STATS.forEach((stat) => {
      const statItem = this.createElement('div', {
        className: 'about-page__stat-item',
      });

      const value = this.createElement(
        'div',
        {
          className: 'about-page__stat-value',
        },
        [stat.value],
      );
      statItem.appendChild(value);

      const label = this.createElement(
        'div',
        {
          className: 'about-page__stat-label',
        },
        [stat.label],
      );
      statItem.appendChild(label);

      statsGrid.appendChild(statItem);
    });

    section.appendChild(statsGrid);
    return section;
  }

  /**
   * Создать секцию команды
   */
  private createTeamSection(): HTMLElement {
    const section = this.createElement('section', {
      className: 'about-page__section about-page__team',
    });

    const titleEl = this.createElement(
      'h2',
      {
        className: 'about-page__section-title',
      },
      ['Наша команда'],
    );
    section.appendChild(titleEl);

    const introText = this.createElement(
      'p',
      {
        className: 'about-page__text about-page__team-intro',
      },
      [
        'Мы — команда профессионалов, объединённых общей целью: сделать покупки в интернете максимально удобными и приятными. Каждый из нас вносит свой вклад в развитие L_Shop.',
      ],
    );
    section.appendChild(introText);

    const teamGrid = this.createElement('div', {
      className: 'about-page__team-grid',
    });

    TEAM.forEach((member) => {
      const card = this.createElement('div', {
        className: 'about-page__team-card',
      });

      const avatar = this.createElement('div', {
        className: 'about-page__team-avatar',
      });
      // Используем первые буквы имени для аватарки
      const initials = member.name
        .split(' ')
        .map((n) => n[0])
        .join('');
      avatar.textContent = initials;
      card.appendChild(avatar);

      const name = this.createElement(
        'h3',
        {
          className: 'about-page__team-name',
        },
        [member.name],
      );
      card.appendChild(name);

      const role = this.createElement(
        'div',
        {
          className: 'about-page__team-role',
        },
        [member.role],
      );
      card.appendChild(role);

      // Отображаем вариант разработчика
      const variant = this.createElement(
        'div',
        {
          className: 'about-page__team-variant',
        },
        [`Вариант ${member.variant}`],
      );
      card.appendChild(variant);

      const desc = this.createElement(
        'p',
        {
          className: 'about-page__team-desc',
        },
        [member.description],
      );
      card.appendChild(desc);

      teamGrid.appendChild(card);
    });

    section.appendChild(teamGrid);
    return section;
  }

  /**
   * Создать секцию ценностей
   */
  private createValuesSection(): HTMLElement {
    const section = this.createElement('section', {
      className: 'about-page__section',
    });

    const titleEl = this.createElement(
      'h2',
      {
        className: 'about-page__section-title',
      },
      ['Наши ценности'],
    );
    section.appendChild(titleEl);

    const valuesList = this.createElement('ul', {
      className: 'about-page__values-list',
    });

    const values = [
      'Качество — мы отбираем только проверенные товары',
      'Доступность — честные цены и регулярные акции',
      'Надёжность — быстрая доставка и безопасная оплата',
      'Уважение — мы ценим каждого клиента',
    ];

    values.forEach((value) => {
      const li = this.createElement(
        'li',
        {
          className: 'about-page__value-item',
        },
        [value],
      );
      valuesList.appendChild(li);
    });

    section.appendChild(valuesList);
    return section;
  }

  /**
   * Создать карточку контактов
   */
  private createContactCard(): HTMLElement {
    const contactCard = this.createElement('div', {
      className: 'about-page__contact-card',
    });

    const contactCardTitle = this.createElement(
      'h3',
      {
        className: 'about-page__contact-card-title',
      },
      ['📞 Свяжитесь с нами'],
    );
    contactCard.appendChild(contactCardTitle);

    const contactContent = this.createElement('div', {
      className: 'about-page__contact-card-content',
    });

    // Адрес
    const addressItem = this.createContactItem('Адрес', 'г. Минск, ул. Примерная, д. 123');
    contactContent.appendChild(addressItem);

    // Телефон
    const phoneItem = this.createContactItem('Телефон', '+375 (29) 123-45-67');
    contactContent.appendChild(phoneItem);

    // Email
    const emailItem = this.createContactItem('Email', 'info@lshop.by');
    contactContent.appendChild(emailItem);

    // Время работы
    const hoursItem = this.createContactItem(
      'Время работы',
      'Пн–Пт: 9:00–21:00, Сб–Вс: 10:00–20:00',
    );
    contactContent.appendChild(hoursItem);

    contactCard.appendChild(contactContent);
    return contactCard;
  }

  /**
   * Создать элемент контакта
   */
  private createContactItem(label: string, value: string): HTMLElement {
    const item = this.createElement('div', {
      className: 'about-page__contact-item',
    });

    const labelEl = this.createElement(
      'span',
      {
        className: 'about-page__contact-label',
      },
      [label],
    );
    item.appendChild(labelEl);

    const valueEl = this.createElement(
      'span',
      {
        className: 'about-page__contact-value',
      },
      [value],
    );
    item.appendChild(valueEl);

    return item;
  }
}
