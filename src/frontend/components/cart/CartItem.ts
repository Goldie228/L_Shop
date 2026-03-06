/**
 * Компонент элемента корзины - L_Shop Frontend
 * Отображает отдельный товар в корзине с управлением количеством
 *
 * @see src/frontend/styles/components/cart.css - стили корзины
 */

import { Component, ComponentProps } from '../base/Component';
import { Button } from '../ui/Button';
import { CartItemWithProduct } from '../../types/cart';

/**
 * Интерфейс пропсов компонента CartItem
 */
export interface CartItemProps extends ComponentProps {
  /** Данные элемента корзины */
  item: CartItemWithProduct;
  /** Обработчик изменения количества */
  onQuantityChange?: (productId: string, quantity: number) => void;
  /** Обработчик удаления */
  onRemove?: (productId: string) => void;
}

/**
 * Компонент элемента корзины
 * Вариант 21: отображение скидки (зачёркнутая старая цена, новая цена)
 *
 * @example
 * ```typescript
 * const cartItem = new CartItem({
 *   item: {
 *     productId: '1',
 *     quantity: 2,
 *     name: 'iPhone 15',
 *     price: 999,
 *     discountPercent: 10,
 *     total: 1798.2
 *   },
 *   onQuantityChange: (id, qty) => console.log('Change:', id, qty),
 *   onRemove: (id) => console.log('Remove:', id)
 * });
 * container.appendChild(cartItem.render());
 * ```
 */
export class CartItem extends Component<CartItemProps> {
  /** Кнопка уменьшения количества */
  private decreaseBtn: Button | null = null;
  /** Кнопка увеличения количества */
  private increaseBtn: Button | null = null;
  /** Кнопка удаления */
  private removeBtn: Button | null = null;

  /**
   * Получить пропсы по умолчанию
   */
  protected getDefaultProps(): CartItemProps {
    return {
      ...super.getDefaultProps(),
      item: {} as CartItemWithProduct,
    } as CartItemProps;
  }

  /**
   * Отрендерить элемент корзины
   */
  public render(): HTMLElement {
    const { item } = this.props;

    this.element = this.createElement('div', {
      className: 'cart-item',
    });

    // Название с data-title="basket"
    const title = this.createElement('h3', {
      className: 'cart-item__title',
      'data-title': 'basket',
    }, [item.name]);

    // Контейнер цены
    const priceContainer = this.createElement('div', {
      className: 'cart-item__price-container',
    });

    // Вариант 21: отображение скидки
    if (item.discountPercent && item.discountPercent > 0) {
      // Старая цена (зачёркнутая)
      const oldPrice = this.createElement('span', {
        className: 'cart-item__price--old',
      }, [`${item.price.toFixed(2)} ₽`]);

      // Новая цена со скидкой
      const newPriceValue = item.price * (1 - item.discountPercent / 100);
      const newPrice = this.createElement('span', {
        className: 'cart-item__price--new',
        'data-price': 'basket',
      }, [`${newPriceValue.toFixed(2)} ₽`]);

      // Бейдж скидки
      const discount = this.createElement('span', {
        className: 'cart-item__discount',
      }, [`-${item.discountPercent}%`]);

      priceContainer.append(oldPrice, newPrice, discount);
    } else {
      // Цена без скидки
      const price = this.createElement('span', {
        className: 'cart-item__price',
        'data-price': 'basket',
      }, [`${item.price.toFixed(2)} ₽`]);
      priceContainer.appendChild(price);
    }

    // Управление количеством
    const quantityControl = this.createElement('div', {
      className: 'cart-item__quantity',
    });

    this.decreaseBtn = new Button({
      text: '-',
      variant: 'secondary',
      onClick: () => this.handleQuantityChange(-1),
    });

    const quantityValue = this.createElement('span', {
      className: 'cart-item__quantity-value',
    }, [String(item.quantity)]);

    this.increaseBtn = new Button({
      text: '+',
      variant: 'secondary',
      onClick: () => this.handleQuantityChange(1),
    });

    this.decreaseBtn.mount(quantityControl);
    quantityControl.appendChild(quantityValue);
    this.increaseBtn.mount(quantityControl);

    // Кнопка удаления
    this.removeBtn = new Button({
      text: 'Удалить',
      variant: 'ghost',
      className: 'cart-item__remove',
      onClick: () => this.props.onRemove?.(item.productId),
    });

    // Итого для позиции
    const total = this.createElement('span', {
      className: 'cart-item__total',
    }, [`Итого: ${item.total.toFixed(2)} ₽`]);

    // Собираем элемент
    this.element.append(title, priceContainer, quantityControl);
    this.removeBtn.mount(this.element);
    this.element.appendChild(total);

    return this.element;
  }

  /**
   * Обработать изменение количества
   */
  private handleQuantityChange(delta: number): void {
    const newQuantity = this.props.item.quantity + delta;
    if (newQuantity > 0) {
      this.props.onQuantityChange?.(this.props.item.productId, newQuantity);
    }
  }
}