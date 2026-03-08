/**
 * Страница корзины - L_Shop Frontend
 * Отображает корзину пользователя с возможностью оформления доставки
 *
 * @see src/frontend/styles/pages/cart.css - стили страницы корзины
 */

import { Component, ComponentProps } from '../base/Component';
import { CartList } from '../cart/CartList';
import { CartSummary } from '../cart/CartSummary';
import { Toast } from '../ui/Toast';
import { api } from '../../services/api';
import { store } from '../../store/store';
import { router } from '../../router/router';
import { CartWithProducts } from '../../types/cart';

/**
 * Интерфейс пропсов страницы корзины
 */
export type CartPageProps = ComponentProps;

/**
 * Страница корзины
 * Только для авторизованных пользователей
 *
 * @example
 * ```typescript
 * const cartPage = new CartPage({});
 * container.appendChild(cartPage.render());
 * ```
 */
export class CartPage extends Component<CartPageProps> {
  /** Компонент списка товаров */
  private cartList: CartList | null = null;

  /** Компонент итогов */
  private cartSummary: CartSummary | null = null;

  /** Данные корзины */
  private cartData: CartWithProducts | null = null;

  /** Состояние загрузки */
  private isLoading = false;

  /**
   * Отрендерить страницу корзины
   */
  public render(): HTMLElement {
    this.element = this.createElement('div', {
      className: 'cart-page',
    });

    // Заголовок
    const title = this.createElement(
      'h1',
      {
        className: 'cart-page__title',
      },
      ['Корзина'],
    );
    this.element.appendChild(title);

    // Проверка авторизации
    if (!store.isAuthenticated()) {
      const authMessage = this.createElement('div', {
        className: 'cart-page__auth-required',
      });

      const message = this.createElement('p', {}, [
        'Для оформления заказа необходимо авторизоваться. ',
      ]);

      const loginLink = this.createElement(
        'a',
        {
          href: '#',
          className: 'cart-page__login-link',
        },
        ['Войти в аккаунт'],
      );

      this.addEventListener(loginLink, 'click', (e) => {
        e.preventDefault();
        // Триггерим открытие модалки авторизации через событие
        document.dispatchEvent(new CustomEvent('openAuthModal'));
      });

      message.appendChild(loginLink);
      authMessage.appendChild(message);

      // Показываем пустую корзину с приглашением к авторизации
      const emptyCart = this.createElement('div', {
        className: 'cart-empty',
      });

      const emptyIcon = this.createElement('div', {
        className: 'cart-empty__icon',
      });

      // SVG иконка корзины
      const cartIconSvg = `
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="cart-empty__icon-svg">
          <path d="M2 2H3.74001C4.82027 2 5.67 2.93 5.58 4L4.75 13.96C4.61189 15.59 5.79983 16.99 7.33999 17.19L8.75999 17.38C9.03785 17.43 9.3 17.66 9.3 17.96L9.3 19.4C9.3 19.76 9.54 20.08 9.9 20.08H15.1C15.46 20.08 15.7 19.76 15.7 19.4L15.7 17.96C15.7 17.66 15.96 17.43 16.24 17.38L17.66 17.19C19.2 16.99 20.39 15.59 20.25 13.96L19.42 4C19.33 2.93 20.18 2 21.26 2H22C22.5304 2 23.0391 2.21071 23.4142 2.58579C23.7893 2.96086 24 3.46957 24 4V5C24 5.53043 23.7893 6.03914 23.4142 6.41421C23.0391 6.78929 22.5304 7 22 7H20.9C20.37 7 19.86 6.79 19.54 6.46L18.62 4.64C18.34 4.22 17.81 4.03 17.38 4.18L15.97 4.68C15.38 4.89 14.89 5.38 14.68 6.04L14.32 7.26C14.18 7.68 13.82 7.96 13.4 7.96H10.6C10.18 7.96 9.82 7.68 9.68 7.26L9.32 6.04C9.11 5.38 8.62 4.89 8.03 4.68L6.62 4.18C6.19 4.03 5.66 4.22 5.38 4.64L4.46 6.46C4.14 6.79 3.63 7 3.1 7H1.7C1.16957 7 0.660858 6.78929 0.285785 6.41421C-0.0892882 6.03914 -0.3 5.53043 -0.3 5V4C-0.3 3.46957 -0.0892882 2.96086 0.285785 2.58579C0.660858 2.21071 1.16957 2 1.7 2H2Z" fill="currentColor"/>
        </svg>
      `;
      emptyIcon.innerHTML = cartIconSvg;

      const emptyText = this.createElement(
        'p',
        {
          className: 'cart-empty__text',
        },
        ['Войдите в аккаунт, чтобы увидеть вашу корзину'],
      );

      emptyCart.appendChild(emptyIcon);
      emptyCart.appendChild(emptyText);
      authMessage.appendChild(emptyCart);

      this.element.appendChild(authMessage);
      return this.element;
    }

    // Контейнер содержимого
    const content = this.createElement('div', {
      className: 'cart-page__content',
    });

    // Список товаров
    this.cartList = new CartList({
      items: [],
      onQuantityChange: (productId, quantity) => this.handleQuantityChange(productId, quantity),
      onRemove: (productId) => this.handleRemoveItem(productId),
      onGoToCatalog: () => this.handleGoToCatalog(),
    });
    this.cartList.mount(content);

    // Итоги
    this.cartSummary = new CartSummary({
      totalSum: 0,
      itemsCount: 0,
      onCheckout: () => this.handleCheckout(),
    });
    this.cartSummary.mount(content);

    this.element.appendChild(content);

    // Загрузка данных
    this.loadCart();

    return this.element;
  }

  /**
   * Загрузить данные корзины
   */
  private async loadCart(): Promise<void> {
    if (this.isLoading) return;
    this.isLoading = true;

    try {
      this.cartData = await api.get<CartWithProducts>('/api/cart');
      this.updateUI();
    } catch (error) {
      // Ошибка загрузки корзины (обрабатывается в catch)
      const errorMessage = this.createElement(
        'p',
        {
          className: 'cart-page__error',
        },
        ['Ошибка загрузки корзины'],
      );
      this.element?.appendChild(errorMessage);
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Обновить UI
   */
  private updateUI(): void {
    if (!this.cartData) return;

    this.cartList?.updateItems(this.cartData.items);
    this.cartSummary?.updateSummary(this.cartData.totalSum, this.cartData.items.length);
  }

  /**
   * Обработать изменение количества
   */
  private async handleQuantityChange(productId: string, quantity: number): Promise<void> {
    try {
      this.cartData = await api.put<CartWithProducts>(`/api/cart/items/${productId}`, { quantity });
      this.updateUI();
    } catch (error) {
      // Ошибка изменения количества (обрабатывается в catch)
    }
  }

  /**
   * Обработать удаление товара
   */
  private async handleRemoveItem(productId: string): Promise<void> {
    try {
      this.cartData = await api.delete<CartWithProducts>(`/api/cart/items/${productId}`);
      this.updateUI();
    } catch (error) {
      Toast.showError('Ошибка удаления товара');
    }
  }

  /**
   * Обработать оформление доставки
   */
  private handleCheckout(): void {
    router.navigate('/delivery');
  }

  /**
   * Обработать переход в каталог
   */
  private handleGoToCatalog(): void {
    router.navigate('/catalog');
  }
}
