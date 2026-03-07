/**
 * Страница корзины - L_Shop Frontend
 * Отображает корзину пользователя с возможностью оформления доставки
 *
 * @see src/frontend/styles/pages/cart.css - стили страницы корзины
 */

import { Component, ComponentProps } from '../base/Component';
import { CartList } from '../cart/CartList';
import { CartSummary } from '../cart/CartSummary';
import { api } from '../../services/api';
import { store } from '../../store/store';
import { router } from '../../router/router';
import { CartWithProducts, CartItemWithProduct } from '../../types/cart';

/**
 * Интерфейс пропсов страницы корзины
 */
export interface CartPageProps extends ComponentProps {}

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
    const title = this.createElement('h1', {
      className: 'cart-page__title',
    }, ['Корзина']);
    this.element.appendChild(title);

    // Проверка авторизации
    if (!store.isAuthenticated()) {
      const authMessage = this.createElement('div', {
        className: 'cart-page__auth-required',
      });

      const message = this.createElement('p', {}, [
        'Для оформления заказа необходимо авторизоваться. ',
      ]);

      const loginLink = this.createElement('a', {
        href: '#',
        className: 'cart-page__login-link',
      }, ['Войти в аккаунт']);
      
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
      }, ['🛒']);
      
      const emptyText = this.createElement('p', {
        className: 'cart-empty__text',
      }, ['Войдите в аккаунт, чтобы увидеть вашу корзину']);
      
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
      console.error('[CartPage] Ошибка загрузки корзины:', error);
      const errorMessage = this.createElement('p', {
        className: 'cart-page__error',
      }, ['Ошибка загрузки корзины']);
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
    this.cartSummary?.updateSummary(
      this.cartData.totalSum,
      this.cartData.items.length,
    );
  }

  /**
   * Обработать изменение количества
   */
  private async handleQuantityChange(productId: string, quantity: number): Promise<void> {
    try {
      this.cartData = await api.put<CartWithProducts>(
        `/api/cart/items/${productId}`,
        { quantity },
      );
      this.updateUI();
    } catch (error) {
      console.error('[CartPage] Ошибка изменения количества:', error);
    }
  }

  /**
   * Обработать удаление товара
   */
  private async handleRemoveItem(productId: string): Promise<void> {
    try {
      this.cartData = await api.delete<CartWithProducts>(
        `/api/cart/items/${productId}`,
      );
      this.updateUI();
    } catch (error) {
      console.error('[CartPage] Ошибка удаления товара:', error);
    }
  }

  /**
   * Обработать оформление доставки
   */
  private handleCheckout(): void {
    router.navigate('/delivery');
  }
}