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

    // Изображение товара
    const imageContainer = this.createElement('div', {
      className: 'cart-item__image-container',
    });

    const image = this.createElement('img', {
      className: 'cart-item__image',
      src: item.imageUrl || '/images/placeholder.svg',
      alt: item.name,
      loading: 'lazy',
    });
    imageContainer.appendChild(image);

    // Название с data-title="basket"
    const title = this.createElement(
      'h3',
      {
        className: 'cart-item__title',
        'data-title': 'basket',
      },
      [item.name],
    );

    // Контейнер цены
    const priceContainer = this.createElement('div', {
      className: 'cart-item__price-container',
    });

    // Вариант 21: отображение скидки
    if (item.discountPercent && item.discountPercent > 0) {
      // Старая цена (зачёркнутая)
      const oldPrice = this.createElement(
        'span',
        {
          className: 'cart-item__price--old',
        },
        [`${item.price.toFixed(2)} ₽`],
      );

      // Новая цена со скидкой
      const newPriceValue = item.price * (1 - item.discountPercent / 100);
      const newPrice = this.createElement(
        'span',
        {
          className: 'cart-item__price--new',
          'data-price': 'basket',
        },
        [`${newPriceValue.toFixed(2)} ₽`],
      );

      // Бейдж скидки
      const discount = this.createElement(
        'span',
        {
          className: 'cart-item__discount',
        },
        [`-${item.discountPercent}%`],
      );

      priceContainer.append(oldPrice, newPrice, discount);
    } else {
      // Цена без скидки
      const price = this.createElement(
        'span',
        {
          className: 'cart-item__price',
          'data-price': 'basket',
        },
        [`${item.price.toFixed(2)} ₽`],
      );
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

    const quantityValue = this.createElement(
      'span',
      {
        className: 'cart-item__quantity-value',
      },
      [String(item.quantity)],
    );

    this.increaseBtn = new Button({
      text: '+',
      variant: 'secondary',
      onClick: () => this.handleQuantityChange(1),
    });

    this.decreaseBtn.mount(quantityControl);
    quantityControl.appendChild(quantityValue);
    this.increaseBtn.mount(quantityControl);

    // Итого для позиции
    const total = this.createElement(
      'span',
      {
        className: 'cart-item__total',
      },
      [`Итого: ${item.total.toFixed(2)} ₽`],
    );

    // Собираем элемент
    this.element.append(imageContainer, title, priceContainer, quantityControl);

    // Кнопка удаления с SVG иконкой
    const removeButton = document.createElement('button');
    removeButton.className = 'cart-item__remove';
    removeButton.setAttribute('aria-label', 'Удалить товар');

    const removeIcon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    removeIcon.setAttribute('viewBox', '0 0 24 24');
    removeIcon.setAttribute('fill', 'none');
    removeIcon.setAttribute('stroke', 'currentColor');
    removeIcon.setAttribute('stroke-width', '2');
    removeIcon.setAttribute('stroke-linecap', 'round');
    removeIcon.setAttribute('stroke-linejoin', 'round');

    const path1 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path1.setAttribute('d', 'M3 6h18');

    const path2 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path2.setAttribute('d', 'M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6');

    const path3 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path3.setAttribute('d', 'M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2');

    removeIcon.appendChild(path1);
    removeIcon.appendChild(path2);
    removeIcon.appendChild(path3);
    removeButton.appendChild(removeIcon);

    removeButton.addEventListener('click', () => this.props.onRemove?.(item.productId));

    this.element.appendChild(removeButton);
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
