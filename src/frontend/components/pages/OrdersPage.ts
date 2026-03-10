/**
 * Страница моих заказов - L_Shop Frontend
 * Отображает список заказов пользователя
 */

import { Component, ComponentProps } from '../base/Component.js';
import { orderService } from '../../services/order.service';
import { store } from '../../store/store.js';
import { router } from '../../router/router.js';
import { Order, OrderStatus } from '../../types/order';

/**
 * Пропсы для страницы заказов
 */
export interface OrdersPageProps extends ComponentProps {
  /** Дополнительный класс */
  className?: string;
}

/**
 * Состояние страницы заказов
 */
export interface OrdersPageState {
  /** Загрузка */
  loading: boolean;
  /** Ошибка */
  error: string | null;
  /** Список заказов */
  orders: Order[];
}

/**
 * Форматировать цену в BYN
 */
const formatPrice = (price: number): string => `${price.toLocaleString('ru-BY')} BYN`;

/**
 * Отображение статуса заказа на русском
 */
const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'Ожидает подтверждения',
  processing: 'В обработке',
  shipped: 'В доставке',
  delivered: 'Доставлен',
  cancelled: 'Отменён',
};

/**
 * Цвет статуса заказа
 */
const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  pending: 'var(--color-warning)',
  processing: 'var(--color-warning)',
  shipped: 'var(--color-primary)',
  delivered: 'var(--color-success)',
  cancelled: 'var(--color-error)',
};

/**
 * Страница "Мои заказы"
 * Показывает историю заказов пользователя
 */
export class OrdersPage extends Component<OrdersPageProps> {
  private state: OrdersPageState = {
    loading: true,
    error: null,
    orders: [],
  };

  /** Флаг, что загрузка уже выполняется (для предотвращения повторных запросов) */
  private isLoadingInProgress = false;

  /** Флаг, что загрузка уже была выполнена */
  private hasLoaded = false;

  /**
   * Получить пропсы по умолчанию
   */
  protected getDefaultProps(): OrdersPageProps {
    return {
      ...super.getDefaultProps(),
      className: 'orders-page',
    };
  }

  /**
   * Отрендерить страницу заказов
   * @returns Элемент страницы
   */
  public render(): HTMLElement {
    const container = this.createElement('div', {
      className: this.props.className || 'orders-page',
    });

    // Добавляем общий контейнер для центрирования
    const innerContainer = this.createElement('div', {
      className: 'container',
    });

    // Проверка авторизации
    if (!store.isAuthenticated()) {
      const authRequired = this.renderAuthRequired();
      innerContainer.appendChild(authRequired);
      container.appendChild(innerContainer);
      this.element = container;
      return container;
    }

    const content = this.createElement('div', {
      className: 'orders-page__content',
    });

    // Заголовок
    const header = this.renderHeader();
    content.appendChild(header);

    // Состояние загрузки
    if (this.state.loading) {
      const loading = this.renderLoading();
      content.appendChild(loading);
    }

    // Ошибка
    if (this.state.error) {
      const error = this.renderError();
      content.appendChild(error);
    }

    // Список заказов
    if (!this.state.loading && !this.state.error && this.state.orders.length > 0) {
      const ordersList = this.renderOrdersList();
      content.appendChild(ordersList);
    }

    // Пустой список
    if (!this.state.loading && !this.state.error && this.state.orders.length === 0) {
      const empty = this.renderEmpty();
      content.appendChild(empty);
    }

    innerContainer.appendChild(content);
    container.appendChild(innerContainer);
    this.element = container;

    // Загрузить заказы после рендера (только если ещё не загружали)
    if (store.isAuthenticated() && !this.hasLoaded && !this.isLoadingInProgress) {
      this.loadOrders();
    }

    return container;
  }

  /**
   * Отрендерить заголовок страницы
   */
  private renderHeader(): HTMLElement {
    const header = this.createElement('div', {
      className: 'orders-page__header',
    });

    const title = this.createElement(
      'h1',
      {
        className: 'page-title',
      },
      ['Мои заказы'],
    );
    header.appendChild(title);

    const subtitle = this.createElement(
      'p',
      {
        className: 'orders-page__subtitle',
      },
      ['Просмотр истории ваших заказов'],
    );
    header.appendChild(subtitle);

    return header;
  }

  /**
   * Отрендерить состояние загрузки
   */
  private renderLoading(): HTMLElement {
    const loading = this.createElement('div', {
      className: 'orders-page__loading',
    });

    const text = this.createElement('p', {}, ['Загрузка заказов...']);
    loading.appendChild(text);

    return loading;
  }

  /**
   * Отрендерить ошибку
   */
  private renderError(): HTMLElement {
    const error = this.createElement('div', {
      className: 'orders-page__error',
    });

    const title = this.createElement(
      'h3',
      {
        className: 'orders-page__error-title',
      },
      ['Ошибка загрузки'],
    );
    error.appendChild(title);

    const message = this.createElement(
      'p',
      {
        className: 'orders-page__error-message',
      },
      [this.state.error || 'Неизвестная ошибка'],
    );
    error.appendChild(message);

    const retryButton = this.createElement(
      'button',
      {
        className: 'btn btn--primary',
        type: 'button',
      },
      ['Попробовать снова'],
    );
    this.addEventListener(retryButton, 'click', () => {
      this.hasLoaded = false;
      this.loadOrders();
    });
    error.appendChild(retryButton);

    return error;
  }

  /**
   * Отрендерить список заказов
   */
  private renderOrdersList(): HTMLElement {
    const list = this.createElement('div', {
      className: 'orders-page__list',
    });

    this.state.orders.forEach((order) => {
      const orderCard = this.renderOrderCard(order);
      list.appendChild(orderCard);
    });

    return list;
  }

  /**
   * Отрендерить карточку заказа
   */
  private renderOrderCard(order: Order): HTMLElement {
    const card = this.createElement('div', {
      className: 'order-card',
    });

    // Шапка карточки с номером и статусом
    const header = this.createElement('div', {
      className: 'order-card__header',
    });

    const orderInfo = this.createElement('div', {
      className: 'order-card__info',
    });

    const orderNumber = this.createElement(
      'h3',
      {
        className: 'order-card__number',
      },
      [`Заказ №${order.id}`],
    );
    orderInfo.appendChild(orderNumber);

    const orderDate = this.createElement(
      'p',
      {
        className: 'order-card__date',
      },
      [new Date(order.createdAt).toLocaleDateString('ru-RU')],
    );
    orderInfo.appendChild(orderDate);

    header.appendChild(orderInfo);

    const status = this.createElement(
      'span',
      {
        className: 'order-card__status',
        style: `color: ${ORDER_STATUS_COLORS[order.status]}`,
      },
      [ORDER_STATUS_LABELS[order.status]],
    );
    header.appendChild(status);

    card.appendChild(header);

    // Тело карточки - товары
    const body = this.createElement('div', {
      className: 'order-card__body',
    });

    const itemsList = this.createElement('ul', {
      className: 'order-card__items',
    });

    order.items.forEach((item) => {
      const itemEl = this.createElement('li', {
        className: 'order-card__item',
      });

      const itemInfo = this.createElement('div', {
        className: 'order-card__item-info',
      });

      const name = this.createElement(
        'span',
        {
          className: 'order-card__item-name',
        },
        [item.name],
      );
      itemInfo.appendChild(name);

      const quantity = this.createElement(
        'span',
        {
          className: 'order-card__item-quantity',
        },
        [`× ${item.quantity}`],
      );
      itemInfo.appendChild(quantity);

      itemEl.appendChild(itemInfo);

      const price = this.createElement(
        'span',
        {
          className: 'order-card__item-price',
        },
        [formatPrice(item.price * item.quantity)],
      );
      itemEl.appendChild(price);

      itemsList.appendChild(itemEl);
    });

    body.appendChild(itemsList);
    card.appendChild(body);

    // Подвал карточки - итоговая сумма
    const footer = this.createElement('div', {
      className: 'order-card__footer',
    });

    const totalLabel = this.createElement(
      'span',
      {
        className: 'order-card__total-label',
      },
      ['Итого:'],
    );
    footer.appendChild(totalLabel);

    const total = this.createElement(
      'span',
      {
        className: 'order-card__total',
      },
      [formatPrice(order.totalSum)],
    );
    footer.appendChild(total);

    card.appendChild(footer);

    return card;
  }

  /**
   * Отрендерить пустое состояние
   */
  private renderEmpty(): HTMLElement {
    const empty = this.createElement('div', {
      className: 'orders-page__empty',
    });

    const icon = this.createElement(
      'div',
      {
        className: 'orders-page__empty-icon',
      },
      ['📦'],
    );
    empty.appendChild(icon);

    const title = this.createElement(
      'h3',
      {
        className: 'orders-page__empty-title',
      },
      ['У вас пока нет заказов'],
    );
    empty.appendChild(title);

    const message = this.createElement(
      'p',
      {
        className: 'orders-page__empty-message',
      },
      ['Начните делать покупки, и ваши заказы появятся здесь'],
    );
    empty.appendChild(message);

    const shopButton = this.createElement(
      'button',
      {
        className: 'btn btn--primary',
        type: 'button',
      },
      ['Перейти в каталог'],
    );
    this.addEventListener(shopButton, 'click', () => {
      router.navigate('/');
    });
    empty.appendChild(shopButton);

    return empty;
  }

  /**
   * Отрендерить сообщение о необходимости авторизации
   */
  private renderAuthRequired(): HTMLElement {
    const container = this.createElement('div', {
      className: 'orders-page__auth-required',
    });

    const title = this.createElement(
      'h2',
      {
        className: 'orders-page__auth-title',
      },
      ['Требуется авторизация'],
    );
    container.appendChild(title);

    const message = this.createElement(
      'p',
      {
        className: 'orders-page__auth-message',
      },
      ['Для просмотра заказов необходимо войти в систему'],
    );
    container.appendChild(message);

    const loginButton = this.createElement(
      'button',
      {
        className: 'btn btn--primary',
        type: 'button',
      },
      ['Войти'],
    );
    this.addEventListener(loginButton, 'click', () => {
      store.openModal('auth');
    });
    container.appendChild(loginButton);

    return container;
  }

  /**
   * Загрузить заказы пользователя
   */
  private async loadOrders(): Promise<void> {
    // Предотвращаем повторную загрузку если уже загружаем или уже загружено
    if (this.isLoadingInProgress || this.hasLoaded) {
      return;
    }

    if (!store.isAuthenticated()) {
      this.state = {
        loading: false,
        error: null,
        orders: [],
      };
      this.hasLoaded = true;
      return;
    }

    this.isLoadingInProgress = true;
    this.state = {
      ...this.state,
      loading: true,
      error: null,
    };
    this.update();

    try {
      const orders = await orderService.getOrders();
      this.state = {
        loading: false,
        error: null,
        orders,
      };
      this.hasLoaded = true;
      this.update();
    } catch (error) {
      console.error('[OrdersPage] Ошибка загрузки заказов:', error);
      this.state = {
        loading: false,
        error: 'Не удалось загрузить заказы. Попробуйте позже.',
        orders: [],
      };
      this.hasLoaded = true;
      this.update();
    } finally {
      this.isLoadingInProgress = false;
    }
  }

  /**
   * Сбросить состояние и перезагрузить заказы
   */
  public resetAndReload(): void {
    this.hasLoaded = false;
    this.isLoadingInProgress = false;
    this.state = {
      loading: true,
      error: null,
      orders: [],
    };
    this.update();
    this.loadOrders();
  }
}
