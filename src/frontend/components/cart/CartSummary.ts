/**
 * Компонент итогов корзины - L_Shop Frontend
 * Отображает общую сумму и кнопку оформления заказа
 *
 * @see src/frontend/styles/components/cart.css - стили корзины
 */

import { Component, ComponentProps } from '../base/Component';
import { Button } from '../ui/Button';

/**
 * Интерфейс пропсов компонента CartSummary
 */
export interface CartSummaryProps extends ComponentProps {
  /** Общая сумма */
  totalSum: number;
  /** Количество товаров */
  itemsCount: number;
  /** Обработчик оформления заказа */
  onCheckout?: () => void;
}

/**
 * Компонент итогов корзины
 *
 * @example
 * ```typescript
 * const cartSummary = new CartSummary({
 *   totalSum: 5000,
 *   itemsCount: 3,
 *   onCheckout: () => navigate('/delivery')
 * });
 * container.appendChild(cartSummary.render());
 * ```
 */
export class CartSummary extends Component<CartSummaryProps> {
  /** Кнопка оформления заказа */
  private checkoutBtn: Button | null = null;

  /**
   * Получить пропсы по умолчанию
   */
  protected getDefaultProps(): CartSummaryProps {
    return {
      ...super.getDefaultProps(),
      totalSum: 0,
      itemsCount: 0,
    } as CartSummaryProps;
  }

  /**
   * Отрендерить итоги корзины
   */
  public render(): HTMLElement {
    const { totalSum, itemsCount } = this.props;

    this.element = this.createElement('div', {
      className: 'cart-summary',
    });

    // Заголовок
    const title = this.createElement('h2', {
      className: 'cart-summary__title',
    }, ['Итого']);

    // Количество товаров
    const countText = this.createElement('p', {
      className: 'cart-summary__count',
    }, [`Товаров: ${itemsCount}`]);

    // Общая сумма
    const totalElement = this.createElement('p', {
      className: 'cart-summary__total',
    }, [`Сумма: ${totalSum.toFixed(2)} ₽`]);

    // Кнопка оформления
    this.checkoutBtn = new Button({
      text: 'Оформить доставку',
      variant: 'primary',
      block: true,
      disabled: itemsCount === 0,
      onClick: () => this.props.onCheckout?.(),
    });

    this.element.append(title, countText, totalElement);
    this.checkoutBtn.mount(this.element);

    return this.element;
  }

  /**
   * Обновить итоги
   */
  public updateSummary(totalSum: number, itemsCount: number): void {
    this.setProps({ totalSum, itemsCount });
    this.update();
  }
}