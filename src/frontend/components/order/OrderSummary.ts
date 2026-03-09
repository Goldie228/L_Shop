/**
 * Сводка заказа - L_Shop Frontend
 * Отображает элементы корзины и итоговую сумму
 */

import { Component, ComponentProps } from '../base/Component';
import { OrderItem } from '../../types/order';

/**
 * Пропсы сводки заказа
 */
export interface OrderSummaryProps extends ComponentProps {
  /** Элементы заказа */
  items: OrderItem[];
  /** Заголовок */
  title?: string;
  /** Показать кнопку оформления */
  showCheckoutButton?: boolean;
}

/**
 * Сводка заказа для отображения на странице доставки
 */
export class OrderSummary extends Component<OrderSummaryProps> {
  protected getDefaultProps(): OrderSummaryProps {
    return {
      ...super.getDefaultProps(),
      className: 'order-summary',
      items: [],
      title: 'Ваш заказ',
      showCheckoutButton: false,
    };
  }

  public render(): HTMLElement {
    const container = this.createElement('div', {
      className: 'order-summary',
    });

    // Заголовок
    const title = this.createElement(
      'h2',
      {
        className: 'order-summary__title',
      },
      [this.props.title ?? ''],
    );
    container.appendChild(title);

    // Список товаров
    const itemsList = this.createElement('div', {
      className: 'order-summary__items',
    });

    this.props.items.forEach((item) => {
      const itemEl = this.renderItem(item);
      itemsList.appendChild(itemEl);
    });

    container.appendChild(itemsList);

    // Разделитель
    const divider = this.createElement('hr', {
      className: 'order-summary__divider',
    });
    container.appendChild(divider);

    // Итого
    const total = this.calculateTotal();
    const totalSection = this.createElement('div', {
      className: 'order-summary__total',
    });

    const totalLabel = this.createElement(
      'span',
      {
        className: 'order-summary__total-label',
      },
      ['Итого:'],
    );
    totalSection.appendChild(totalLabel);

    const totalValue = this.createElement(
      'span',
      {
        className: 'order-summary__total-value',
      },
      [this.formatPrice(total)],
    );
    totalSection.appendChild(totalValue);

    container.appendChild(totalSection);

    return container;
  }

  /**
   * Отрендерить один элемент заказа
   */
  private renderItem(item: OrderItem): HTMLElement {
    const itemEl = this.createElement('div', {
      className: 'order-summary__item',
    });

    // Информация о товаре
    const infoEl = this.createElement('div', {
      className: 'order-summary__item-info',
    });

    const nameEl = this.createElement(
      'span',
      {
        className: 'order-summary__item-name',
      },
      [item.name],
    );
    infoEl.appendChild(nameEl);

    const quantityEl = this.createElement(
      'span',
      {
        className: 'order-summary__item-quantity',
      },
      [`× ${item.quantity}`],
    );
    infoEl.appendChild(quantityEl);

    itemEl.appendChild(infoEl);

    // Цена
    const priceEl = this.createElement('div', {
      className: 'order-summary__item-price',
    });

    // Применить скидку если есть
    const discountedPrice = item.discountPercent
      ? item.price * (1 - item.discountPercent / 100)
      : item.price;

    if (item.discountPercent) {
      // Показать старую цену зачёркнутой
      const oldPrice = this.createElement(
        'span',
        {
          className: 'order-summary__item-old-price',
        },
        [this.formatPrice(item.price * item.quantity)],
      );
      priceEl.appendChild(oldPrice);

      // Показать новую цену со скидкой
      const newPrice = this.createElement(
        'span',
        {
          className: 'order-summary__item-new-price',
        },
        [this.formatPrice(discountedPrice * item.quantity)],
      );
      priceEl.appendChild(newPrice);

      // Показать процент скидки
      const discountBadge = this.createElement(
        'span',
        {
          className: 'order-summary__item-discount',
        },
        [`-${item.discountPercent}%`],
      );
      priceEl.appendChild(discountBadge);
    } else {
      priceEl.textContent = this.formatPrice(item.price * item.quantity);
    }

    itemEl.appendChild(priceEl);

    return itemEl;
  }

  /**
   * Рассчитать итоговую сумму
   */
  private calculateTotal(): number {
    return this.props.items.reduce((sum, item) => {
      const discount = item.discountPercent || 0;
      const itemPrice = item.price * item.quantity * (1 - discount / 100);
      return sum + itemPrice;
    }, 0);
  }

  /**
   * Форматировать цену
   */
  private formatPrice(price: number): string {
    return `${price.toFixed(2)} BYN`;
  }

  /**
   * Обновить элементы заказа
   */
  public updateItems(items: OrderItem[]): void {
    this.props.items = items;
    this.update();
  }
}
