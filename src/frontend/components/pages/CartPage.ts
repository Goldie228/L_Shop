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

      // Иконка корзины
      const iconContainer = this.createElement('div', {
        className: 'cart-empty__icon',
      });

      const cartIconSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      cartIconSvg.setAttribute('viewBox', '0 0 24 24');
      cartIconSvg.setAttribute('fill', 'none');
      cartIconSvg.setAttribute('class', 'cart-empty__icon-svg');

      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', 'M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z');
      path.setAttribute('fill', 'currentColor');

      cartIconSvg.appendChild(path);
      iconContainer.appendChild(cartIconSvg);
      authMessage.appendChild(iconContainer);

      // Заголовок
      const title = this.createElement(
        'h2',
        {
          className: 'cart-page__auth-title',
          style: 'font-size: var(--font-size-2xl); margin: 0 0 var(--spacing-4); color: var(--color-text-primary);',
        },
        ['Корзина'],
      );
      authMessage.appendChild(title);

      // Текст
      const message = this.createElement(
        'p',
        {
          style: 'font-size: var(--font-size-lg); color: var(--color-text-secondary); margin: 0 0 var(--spacing-6);',
        },
        ['Войдите в аккаунт, чтобы увидеть вашу корзину и оформить заказ'],
      );
      authMessage.appendChild(message);

      // Кнопка входа
      const loginButton = this.createElement(
        'button',
        {
          className: 'btn btn--primary btn--md',
          style: 'padding: var(--spacing-3) var(--spacing-6);',
        },
        ['Войти в аккаунт'],
      );

      this.addEventListener(loginButton, 'click', () => {
        document.dispatchEvent(new CustomEvent('openAuthModal'));
      });

      authMessage.appendChild(loginButton);

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
