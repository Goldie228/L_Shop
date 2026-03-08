/**
 * Компонент итогов корзины - L_Shop Frontend
 * Отображает общую сумму и кнопку оформления заказа
 *
 * @see src/frontend/styles/components/cart.css - стили корзины
 */

import { Component, ComponentProps } from '../base/Component';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

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
  /** Обработчик применения промокода */
  onApplyPromoCode?: (code: string) => void;
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

  /** Поле ввода промокода */
  private promoCodeInput: Input | null = null;

  /** Кнопка применения промокода */
  private applyPromoBtn: Button | null = null;

  /** Текущий промокод */
  private promoCode = '';

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
   * Обработчик изменения промокода
   */
  private handlePromoCodeChange = (value: string): void => {
    this.promoCode = value;
  };

  /**
   * Обработчик применения промокода
   */
  private handleApplyPromo = (): void => {
    if (this.promoCode.trim() && this.props.onApplyPromoCode) {
      this.props.onApplyPromoCode(this.promoCode.trim());
    }
  };

  /**
   * Отрендерить итоги корзины
   */
  public render(): HTMLElement {
    const { totalSum, itemsCount } = this.props;

    this.element = this.createElement('div', {
      className: 'cart-summary',
    });

    // Заголовок
    const title = this.createElement(
      'h2',
      {
        className: 'cart-summary__title',
      },
      ['Итого'],
    );

    // Количество товаров
    const countText = this.createElement(
      'p',
      {
        className: 'cart-summary__count',
      },
      [`Товаров: ${itemsCount}`],
    );

    // Общая сумма
    const totalElement = this.createElement(
      'p',
      {
        className: 'cart-summary__total',
      },
      [`Сумма: ${totalSum.toFixed(2)} ₽`],
    );

    // Секция промокода
    const promoSection = this.createElement('div', {
      className: 'cart-summary__promo',
    });

    const promoLabel = this.createElement(
      'p',
      {
        className: 'cart-summary__promo-label',
      },
      ['Промокод'],
    );

    this.promoCodeInput = new Input({
      placeholder: 'Введите промокод',
      value: this.promoCode,
      onChange: this.handlePromoCodeChange,
    });

    this.applyPromoBtn = new Button({
      text: 'Применить',
      variant: 'secondary',
      size: 'sm',
      onClick: this.handleApplyPromo,
    });

    promoSection.append(promoLabel);
    this.promoCodeInput.mount(promoSection);
    this.applyPromoBtn.mount(promoSection);

    // Кнопка оформления
    this.checkoutBtn = new Button({
      text: 'Оформить заказ',
      variant: 'primary',
      block: true,
      disabled: itemsCount === 0,
      onClick: () => this.props.onCheckout?.(),
    });

    this.element.append(title, countText, totalElement, promoSection);
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
