/**
 * Страница профиля пользователя - L_Shop Frontend
 */

import { Component, ComponentProps } from '../base/Component.js';
import { Button } from '../ui/Button.js';
import { AuthService, AuthEventEmitter } from '../../services/auth.service.js';
import { store } from '../../store/store.js';
import { User } from '../../types/user.js';
import { router } from '../../router/router.js';

/**
 * Интерфейс пропсов страницы профиля
 */
export interface ProfilePageProps extends ComponentProps {
  user: User;
}

/**
 * Страница профиля пользователя
 */
export class ProfilePage extends Component<ProfilePageProps> {
  private logoutButton: Button | null = null;

  protected getDefaultProps(): ProfilePageProps {
    return {
      ...super.getDefaultProps(),
      user: {} as User,
    } as ProfilePageProps;
  }

  public render(): HTMLElement {
    const { user } = this.props;

    const container = this.createElement('div', {
      className: 'profile-page',
    });

    // Заголовок
    const title = this.createElement('h1', {
      className: 'profile-page__title',
    }, ['Профиль пользователя']);
    container.appendChild(title);

    // Карточка профиля
    const card = this.createElement('div', {
      className: 'profile-page__card',
    });

    // Аватар (первая буква имени)
    const avatar = this.createElement('div', {
      className: 'profile-page__avatar',
    }, [user.name?.charAt(0).toUpperCase() || '?']);
    card.appendChild(avatar);

    // Информация
    const info = this.createElement('div', {
      className: 'profile-page__info',
    });

    // Имя
    const nameEl = this.createElement('div', {
      className: 'profile-page__field',
    }, [
      this.createElement('span', { className: 'profile-page__label' }, ['Имя:']),
      this.createElement('span', { className: 'profile-page__value' }, [user.name || 'Не указано']),
    ]);
    info.appendChild(nameEl);

    // Логин
    const loginEl = this.createElement('div', {
      className: 'profile-page__field',
    }, [
      this.createElement('span', { className: 'profile-page__label' }, ['Логин:']),
      this.createElement('span', { className: 'profile-page__value' }, [user.login || 'Не указано']),
    ]);
    info.appendChild(loginEl);

    // Email
    const emailEl = this.createElement('div', {
      className: 'profile-page__field',
    }, [
      this.createElement('span', { className: 'profile-page__label' }, ['Email:']),
      this.createElement('span', { className: 'profile-page__value' }, [user.email || 'Не указано']),
    ]);
    info.appendChild(emailEl);

    // Телефон
    const phoneEl = this.createElement('div', {
      className: 'profile-page__field',
    }, [
      this.createElement('span', { className: 'profile-page__label' }, ['Телефон:']),
      this.createElement('span', { className: 'profile-page__value' }, [user.phone || 'Не указано']),
    ]);
    info.appendChild(phoneEl);

    card.appendChild(info);
    container.appendChild(card);

    // Кнопки
    const actions = this.createElement('div', {
      className: 'profile-page__actions',
    });

    // Кнопка выхода
    this.logoutButton = new Button({
      text: 'Выйти',
      variant: 'outline',
      size: 'md',
      onClick: () => this.handleLogout(),
    });
    actions.appendChild(this.logoutButton.render());

    container.appendChild(actions);

    this.element = container;
    return container;
  }

  /**
   * Обработать выход из системы
   */
  private async handleLogout(): Promise<void> {
    try {
      this.logoutButton?.setLoading(true);
      await AuthService.logout();
      AuthEventEmitter.emit('logout');
      store.setUser(null);
      router.navigate('/');
    } catch (error) {
      console.error('[ProfilePage] Ошибка выхода:', error);
      this.logoutButton?.setLoading(false);
    }
  }
}