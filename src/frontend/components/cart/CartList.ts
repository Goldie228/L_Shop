/**
 * Компонент списка корзины - L_Shop Frontend
 * Отображает список товаров в корзине
 *
 * @see src/frontend/styles/components/cart.css - стили корзины
 */

import { Component, ComponentProps } from '../base/Component';
import { Button } from '../ui/Button';
import { CartItem } from './CartItem';
import { CartItemWithProduct } from '../../types/cart';

/**
 * Интерфейс пропсов компонента CartList
 */
export interface CartListProps extends ComponentProps {
  /** Элементы корзины */
  items: CartItemWithProduct[];
  /** Обработчик изменения количества */
  onQuantityChange?: (productId: string, quantity: number) => void;
  /** Обработчик удаления */
  onRemove?: (productId: string) => void;
  /** Обработчик перехода в каталог */
  onGoToCatalog?: () => void;
}

/**
 * Компонент списка товаров в корзине
 *
 * @example
 * ```typescript
 * const cartList = new CartList({
 *   items: cartItems,
 *   onQuantityChange: (id, qty) => updateQuantity(id, qty),
 *   onRemove: (id) => removeItem(id),
 *   onGoToCatalog: () => router.navigate('/catalog')
 * });
 * container.appendChild(cartList.render());
 * ```
 */
export class CartList extends Component<CartListProps> {
  /** Массив компонентов элементов корзины */
  private cartItems: CartItem[] = [];

  /**
   * Получить пропсы по умолчанию
   */
  protected getDefaultProps(): CartListProps {
    return {
      ...super.getDefaultProps(),
      items: [],
    } as CartListProps;
  }

  /**
   * Отрендерить список корзины
   */
  public render(): HTMLElement {
    const { items, onGoToCatalog } = this.props;

    this.element = this.createElement('div', {
      className: 'cart-list',
    });

    // Очищаем предыдущие элементы
    this.cartItems.forEach((item) => item.destroy());
    this.cartItems = [];

    if (items.length === 0) {
      const emptyContainer = this.createElement('div', {
        className: 'cart-list__empty-container',
      });

      const emptyMessage = this.createElement(
        'p',
        {
          className: 'cart-list__empty',
        },
        ['Корзина пуста'],
      );
      emptyContainer.appendChild(emptyMessage);

      if (onGoToCatalog) {
        const catalogButton = new Button({
          text: 'Перейти в каталог',
          variant: 'primary',
          size: 'md',
          onClick: () => onGoToCatalog(),
        });
        catalogButton.mount(emptyContainer);
      }

      this.element.appendChild(emptyContainer);
      return this.element;
    }

    // Создаём элементы корзины
    items.forEach((item) => {
      const cartItem = new CartItem({
        item,
        onQuantityChange: this.props.onQuantityChange,
        onRemove: this.props.onRemove,
      });
      if (this.element) {
        cartItem.mount(this.element);
      }
      this.cartItems.push(cartItem);
    });

    return this.element;
  }

  /**
   * Обновить список товаров
   */
  public updateItems(items: CartItemWithProduct[]): void {
    this.setProps({ items });
    this.update();
  }
}
