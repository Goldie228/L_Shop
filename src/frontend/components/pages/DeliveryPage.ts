/**
 * Страница оформления доставки - L_Shop Frontend
 * Вариант 24: Интеграция с заказами
 */

import { Component, ComponentProps } from '../base/Component';
import { DeliveryForm } from '../order/DeliveryForm';
import { OrderSummary } from '../order/OrderSummary';
import { orderService } from '../../services/order.service';
import { store } from '../../store/store';
import { router } from '../../router/router';
import { Order, OrderItem, CreateOrderData } from '../../types/order';

/**
 * Пропсы страницы доставки
 */
export interface DeliveryPageProps extends ComponentProps {
  /** Элементы корзины для оформления */
  items?: OrderItem[];
}

/**
 * Состояние страницы доставки
 */
export interface DeliveryPageState {
  /** Загрузка */
  loading: boolean;
  /** Ошибка */
  error: string | null;
  /** Успешное оформление */
  success: boolean;
  /** Созданный заказ */
  order: Order | null;
}

/**
 * Страница оформления доставки
 */
export class DeliveryPage extends Component<DeliveryPageProps> {
  private state: DeliveryPageState = {
    loading: false,
    error: null,
    success: false,
    order: null,
  };

  private deliveryForm!: DeliveryForm;
  private orderSummary!: OrderSummary;

  constructor(props: DeliveryPageProps = {}) {
    super(props);
  }

  protected getDefaultProps(): DeliveryPageProps {
    return {
      ...super.getDefaultProps(),
      className: 'delivery-page',
      items: [],
    };
  }

  public render(): HTMLElement {
    const container = this.createElement('div', {
      className: 'delivery-page',
    });

    // Проверка авторизации
    if (!store.isAuthenticated()) {
      const authRequired = this.renderAuthRequired();
      container.appendChild(authRequired);
      return container;
    }

    // Если заказ успешно создан
    if (this.state.success && this.state.order) {
      const successView = this.renderSuccess();
      container.appendChild(successView);
      return container;
    }

    // Основной контент
    const content = this.createElement('div', {
      className: 'delivery-page__content',
    });

    // Левая колонка - форма
    const formColumn = this.createElement('div', {
      className: 'delivery-page__form-column',
    });

    this.deliveryForm = new DeliveryForm({
      className: 'delivery-page__form',
      onSubmit: (data) => this.handleOrderSubmit(data),
      disabled: this.state.loading,
    });
    formColumn.appendChild(this.deliveryForm.render());
    content.appendChild(formColumn);

    // Правая колонка - сводка заказа
    const summaryColumn = this.createElement('div', {
      className: 'delivery-page__summary-column',
    });

    this.orderSummary = new OrderSummary({
      className: 'delivery-page__summary',
      items: this.props.items || [],
      title: 'Ваш заказ',
    });
    summaryColumn.appendChild(this.orderSummary.render());
    content.appendChild(summaryColumn);

    container.appendChild(content);

    // Отображение ошибки
    if (this.state.error) {
      const errorEl = this.createElement('div', {
        className: 'delivery-page__error',
      }, [this.state.error]);
      container.appendChild(errorEl);
    }

    return container;
  }

  /**
   * Отрендерить сообщение о необходимости авторизации
   */
  private renderAuthRequired(): HTMLElement {
    const container = this.createElement('div', {
      className: 'delivery-page__auth-required',
    });

    const title = this.createElement('h2', {
      className: 'delivery-page__auth-title',
    }, ['Требуется авторизация']);
    container.appendChild(title);

    const message = this.createElement('p', {
      className: 'delivery-page__auth-message',
    }, ['Для оформления заказа необходимо войти в систему.']);
    container.appendChild(message);

    const loginButton = this.createElement('button', {
      className: 'btn btn--primary',
    }, ['Войти']);
    this.addEventListener(loginButton, 'click', () => {
      store.openModal('auth');
    });
    container.appendChild(loginButton);

    return container;
  }

  /**
   * Отрендерить успешное оформление
   */
  private renderSuccess(): HTMLElement {
    const container = this.createElement('div', {
      className: 'delivery-page__success',
    });

    const icon = this.createElement('div', {
      className: 'delivery-page__success-icon',
    }, ['✓']);
    container.appendChild(icon);

    const title = this.createElement('h2', {
      className: 'delivery-page__success-title',
    }, ['Заказ оформлен!']);
    container.appendChild(title);

    const orderInfo = this.createElement('p', {
      className: 'delivery-page__success-order',
    }, [`Номер заказа: ${this.state.order!.id}`]);
    container.appendChild(orderInfo);

    const message = this.createElement('p', {
      className: 'delivery-page__success-message',
    }, ['Спасибо за заказ! Мы свяжемся с вами для подтверждения.']);
    container.appendChild(message);

    // Кнопки
    const actions = this.createElement('div', {
      className: 'delivery-page__success-actions',
    });

    const catalogButton = this.createElement('button', {
      className: 'btn btn--primary',
    }, ['Продолжить покупки']);
    this.addEventListener(catalogButton, 'click', () => {
      router.navigate('/');
    });
    actions.appendChild(catalogButton);

    const ordersButton = this.createElement('button', {
      className: 'btn btn--outline',
    }, ['Мои заказы']);
    this.addEventListener(ordersButton, 'click', () => {
      router.navigate('/orders');
    });
    actions.appendChild(ordersButton);

    container.appendChild(actions);

    return container;
  }

  /**
   * Обработать отправку заказа
   */
  private async handleOrderSubmit(data: CreateOrderData): Promise<void> {
    this.state.loading = true;
    this.state.error = null;

    try {
      const order = await orderService.createOrder(data);

      this.state = {
        loading: false,
        error: null,
        success: true,
        order,
      };

      // Обновить отображение
      this.update();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Ошибка при оформлении заказа';

      this.state = {
        ...this.state,
        loading: false,
        error: message,
      };

      // Обновить форму
      if (this.deliveryForm) {
        this.deliveryForm.setProps({ disabled: false });
      }
    }
  }

  /**
   * Установить элементы заказа
   */
  public setItems(items: OrderItem[]): void {
    this.props.items = items;
    if (this.orderSummary) {
      this.orderSummary.updateItems(items);
    }
  }
}