/**
 * Страница профиля пользователя - L_Shop Frontend
 * Расширенная версия с историей заказов и формой редактирования
 */

import { Component, ComponentProps } from '../base/Component.js';
import { Button } from '../ui/Button.js';
import { Input } from '../ui/Input.js';
import { AuthService, AuthEventEmitter, UpdateProfileData, UpdatePasswordData } from '../../services/auth.service.js';
import { orderService } from '../../services/order.service.js';
import { store } from '../../store/store.js';
import { User, validateEmail, validateName, validatePassword } from '../../types/user.js';
import { Order, OrderStatus } from '../../types/order.js';
import { router } from '../../router/router.js';

/**
 * Интерфейс пропсов страницы профиля
 */
export interface ProfilePageProps extends ComponentProps {
  user: User;
}

/**
 * Интерфейс состояния формы
 */
interface FormState {
  name: string;
  email: string;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  errors: Record<string, string>;
}

/**
 * Страница профиля пользователя
 */
export class ProfilePage extends Component<ProfilePageProps> {
  private logoutButton: Button | null = null;
  private saveButton: Button | null = null;
  private orders: Order[] = [];
  private isLoadingOrders = false;
  private isSaving = false;
  private formState: FormState = {
    name: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    errors: {}
  };

  // References to input components
  private nameInput: Input | null = null;
  private emailInput: Input | null = null;
  private currentPasswordInput: Input | null = null;
  private newPasswordInput: Input | null = null;
  private confirmPasswordInput: Input | null = null;

  // Container references for re-rendering
  private ordersContainer: HTMLElement | null = null;
  private toastContainer: HTMLElement | null = null;

  protected getDefaultProps(): ProfilePageProps {
    return {
      ...super.getDefaultProps(),
      user: {} as User,
    } as ProfilePageProps;
  }

  public async beforeRender(): Promise<void> {
    // Load orders when component is about to render
    this.isLoadingOrders = true;
    try {
      this.orders = await orderService.getOrders();
      // Sort by date descending and take only 5
      this.orders = this.orders
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5);
    } catch (error) {
      console.error('[ProfilePage] Ошибка загрузки заказов:', error);
      this.orders = [];
    } finally {
      this.isLoadingOrders = false;
    }
  }

  public render(): HTMLElement {
    const { user } = this.props;

    // Initialize form state with user data
    this.formState.name = user.name || '';
    this.formState.email = user.email || '';

    const container = this.createElement('div', {
      className: 'profile-page',
    });

    // Toast notification container
    this.toastContainer = this.createElement('div', {
      className: 'profile-page__toast-container',
    });
    container.appendChild(this.toastContainer);

    // Заголовок
    const title = this.createElement('h1', {
      className: 'profile-page__title',
    }, ['Профиль пользователя']);
    container.appendChild(title);

    // Основной контент - двухколоночный макет
    const content = this.createElement('div', {
      className: 'profile-page__content',
    });

    // Левая колонка - информация о профиле
    const leftColumn = this.createElement('div', {
      className: 'profile-page__left',
    });

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

    // Роль с визуальным индикатором
    const roleEl = this.createElement('div', {
      className: 'profile-page__field',
    }, [
      this.createElement('span', { className: 'profile-page__label' }, ['Роль:']),
      this.createElement('span', {
        className: `profile-page__role profile-page__role--${user.role}`
      }, [user.role === 'admin' ? 'Администратор' : 'Пользователь']),
    ]);
    info.appendChild(roleEl);

    // Дата регистрации в формате дд.мм.гггг
    const createdAt = user.createdAt ? this.formatDate(user.createdAt) : 'Не указано';
    const createdAtEl = this.createElement('div', {
      className: 'profile-page__field',
    }, [
      this.createElement('span', { className: 'profile-page__label' }, ['Дата регистрации:']),
      this.createElement('span', { className: 'profile-page__value' }, [createdAt]),
    ]);
    info.appendChild(createdAtEl);

    card.appendChild(info);
    leftColumn.appendChild(card);

    // Панель админа
    if (user.role === 'admin') {
      const adminPanel = this.createElement('div', {
        className: 'profile-page__admin-panel',
      });
      const adminIcon = this.createElement('span', {
        className: 'profile-page__admin-icon',
      }, ['⚙️']);
      adminPanel.appendChild(adminIcon);
      
      const adminTitle = this.createElement('h3', {
        className: 'profile-page__admin-title',
      }, ['Панель управления']);
      adminPanel.appendChild(adminTitle);

      const adminLink = this.createElement('button', {
        className: 'profile-page__admin-button',
      }, ['Перейти в админ-панель']);
      adminLink.addEventListener('click', () => {
        router.navigate('/admin');
      });
      adminPanel.appendChild(adminLink);

      leftColumn.appendChild(adminPanel);
    }

    content.appendChild(leftColumn);

    // Правая колонка - история заказов и редактирование
    const rightColumn = this.createElement('div', {
      className: 'profile-page__right',
    });

    // Секция истории заказов
    const ordersSection = this.createElement('div', {
      className: 'profile-page__section',
    });

    const ordersTitle = this.createElement('h2', {
      className: 'profile-page__section-title',
    }, ['История заказов']);
    ordersSection.appendChild(ordersTitle);

    this.ordersContainer = this.createElement('div', {
      className: 'profile-page__orders',
    });

    if (this.isLoadingOrders) {
      const loadingEl = this.createElement('div', {
        className: 'profile-page__loading',
      }, ['Загрузка заказов...']);
      this.ordersContainer.appendChild(loadingEl);
    } else if (this.orders.length === 0) {
      const emptyEl = this.createElement('div', {
        className: 'profile-page__empty',
      }, ['У вас пока нет заказов']);
      this.ordersContainer.appendChild(emptyEl);
    } else {
      this.orders.forEach(order => {
        const orderCard = this.renderOrderCard(order);
        this.ordersContainer?.appendChild(orderCard);
      });
    }

    ordersSection.appendChild(this.ordersContainer);

    // Ссылка на все заказы
    const allOrdersLink = this.createElement('a', {
      className: 'profile-page__orders-link',
      href: '/orders',
    }, ['Посмотреть все заказы']);
    allOrdersLink.addEventListener('click', (e) => {
      e.preventDefault();
      router.navigate('/orders');
    });
    ordersSection.appendChild(allOrdersLink);

    rightColumn.appendChild(ordersSection);

    // Секция редактирования профиля
    const editSection = this.createElement('div', {
      className: 'profile-page__section',
    });

    const editTitle = this.createElement('h2', {
      className: 'profile-page__section-title',
    }, ['Редактирование профиля']);
    editSection.appendChild(editTitle);

    const editForm = this.createElement('form', {
      className: 'profile-page__form',
    });

    // Поле Имя
    const nameLabel = this.createElement('label', {
      className: 'profile-page__form-label',
    }, ['Имя']);
    editForm.appendChild(nameLabel);

    this.nameInput = new Input({
      type: 'text',
      placeholder: 'Введите имя',
      value: this.formState.name,
      error: this.formState.errors.name,
    });
    const nameInputEl = this.nameInput.render();
    if (nameInputEl) {
      const nameInputElement = this.nameInput.getElement();
      if (nameInputElement) {
        nameInputElement.addEventListener('input', (e) => {
          const target = e.target as HTMLInputElement;
          this.formState.name = target.value;
          this.validateField('name');
        });
      }
      editForm.appendChild(nameInputEl);
    }

    // Поле Email
    const emailLabel = this.createElement('label', {
      className: 'profile-page__form-label',
    }, ['Email']);
    editForm.appendChild(emailLabel);

    this.emailInput = new Input({
      type: 'email',
      placeholder: 'Введите email',
      value: this.formState.email,
      error: this.formState.errors.email,
    });
    const emailInputEl = this.emailInput.render();
    if (emailInputEl) {
      const emailInputElement = this.emailInput.getElement();
      if (emailInputElement) {
        emailInputElement.addEventListener('input', (e) => {
          const target = e.target as HTMLInputElement;
          this.formState.email = target.value;
          this.validateField('email');
        });
      }
      editForm.appendChild(emailInputEl);
    }

    // Разделитель для пароля
    const passwordDivider = this.createElement('div', {
      className: 'profile-page__form-divider',
    }, ['Смена пароля (необязательно)']);
    editForm.appendChild(passwordDivider);

    // Поле Текущий пароль
    const currentPasswordLabel = this.createElement('label', {
      className: 'profile-page__form-label',
    }, ['Текущий пароль']);
    editForm.appendChild(currentPasswordLabel);

    this.currentPasswordInput = new Input({
      type: 'password',
      placeholder: 'Введите текущий пароль',
      value: this.formState.currentPassword,
      error: this.formState.errors.currentPassword,
    });
    const currentPasswordEl = this.currentPasswordInput.render();
    if (currentPasswordEl) {
      const currentPasswordElement = this.currentPasswordInput.getElement();
      if (currentPasswordElement) {
        currentPasswordElement.addEventListener('input', (e) => {
          const target = e.target as HTMLInputElement;
          this.formState.currentPassword = target.value;
        });
      }
      editForm.appendChild(currentPasswordEl);
    }

    // Поле Новый пароль
    const newPasswordLabel = this.createElement('label', {
      className: 'profile-page__form-label',
    }, ['Новый пароль']);
    editForm.appendChild(newPasswordLabel);

    this.newPasswordInput = new Input({
      type: 'password',
      placeholder: 'Минимум 6 символов',
      value: this.formState.newPassword,
      error: this.formState.errors.newPassword,
    });
    const newPasswordEl = this.newPasswordInput.render();
    if (newPasswordEl) {
      const newPasswordElement = this.newPasswordInput.getElement();
      if (newPasswordElement) {
        newPasswordElement.addEventListener('input', (e) => {
          const target = e.target as HTMLInputElement;
          this.formState.newPassword = target.value;
          this.validateField('newPassword');
        });
      }
      editForm.appendChild(newPasswordEl);
    }

    // Поле Подтверждение пароля
    const confirmPasswordLabel = this.createElement('label', {
      className: 'profile-page__form-label',
    }, ['Подтверждение пароля']);
    editForm.appendChild(confirmPasswordLabel);

    this.confirmPasswordInput = new Input({
      type: 'password',
      placeholder: 'Повторите новый пароль',
      value: this.formState.confirmPassword,
      error: this.formState.errors.confirmPassword,
    });
    const confirmPasswordEl = this.confirmPasswordInput.render();
    if (confirmPasswordEl) {
      const confirmPasswordElement = this.confirmPasswordInput.getElement();
      if (confirmPasswordElement) {
        confirmPasswordElement.addEventListener('input', (e) => {
          const target = e.target as HTMLInputElement;
          this.formState.confirmPassword = target.value;
        });
      }
      editForm.appendChild(confirmPasswordEl);
    }

    // Общая ошибка формы
    if (this.formState.errors.form) {
      const formError = this.createElement('div', {
        className: 'profile-page__form-error',
      }, [this.formState.errors.form]);
      editForm.appendChild(formError);
    }

    // Кнопка сохранения
    this.saveButton = new Button({
      text: 'Сохранить изменения',
      variant: 'primary',
      size: 'lg',
      onClick: () => this.handleSave(),
    });
    editForm.appendChild(this.saveButton.render());

    editSection.appendChild(editForm);
    rightColumn.appendChild(editSection);

    content.appendChild(rightColumn);

    container.appendChild(content);

    // Кнопки действий
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
   * Отрендерить карточку заказа
   */
  private renderOrderCard(order: Order): HTMLElement {
    const card = this.createElement('div', {
      className: 'profile-page__order-card',
    });

    // Номер заказа и дата
    const header = this.createElement('div', {
      className: 'profile-page__order-header',
    });

    const orderId = this.createElement('span', {
      className: 'profile-page__order-id',
    }, [`Заказ #${order.id.slice(-6)}`]);
    header.appendChild(orderId);

    const orderDate = this.createElement('span', {
      className: 'profile-page__order-date',
    }, [this.formatDate(order.createdAt)]);
    header.appendChild(orderDate);

    card.appendChild(header);

    // Статус
    const statusEl = this.createElement('span', {
      className: `profile-page__order-status profile-page__order-status--${order.status}`,
    }, [this.getStatusLabel(order.status)]);
    card.appendChild(statusEl);

    // Сумма
    const totalEl = this.createElement('div', {
      className: 'profile-page__order-total',
    }, [`${order.totalSum.toLocaleString('ru-RU')} ₽`]);
    card.appendChild(totalEl);

    return card;
  }

  /**
   * Форматировать дату в формат дд.мм.гггг
   */
  private formatDate(dateString: string): string {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
  }

  /**
   * Получить текстовую метку статуса заказа
   */
  private getStatusLabel(status: OrderStatus): string {
    const labels: Record<OrderStatus, string> = {
      pending: 'Ожидает',
      confirmed: 'Подтверждён',
      shipped: 'Отправлен',
      delivered: 'Доставлен',
      cancelled: 'Отменён',
    };
    return labels[status] || status;
  }

  /**
   * Валидировать конкретное поле
   */
  private validateField(field: string): void {
    let error = '';

    switch (field) {
      case 'name':
        if (this.formState.name) {
          const validation = validateName(this.formState.name);
          if (!validation.isValid) {
            error = validation.error || '';
          }
        }
        break;
      case 'email':
        if (this.formState.email) {
          const validation = validateEmail(this.formState.email);
          if (!validation.isValid) {
            error = validation.error || '';
          }
        }
        break;
      case 'newPassword':
        if (this.formState.newPassword) {
          const validation = validatePassword(this.formState.newPassword);
          if (!validation.isValid) {
            error = validation.error || '';
          }
        }
        break;
    }

    this.formState.errors[field] = error;
  }

  /**
   * Валидировать форму
   */
  private validateForm(): boolean {
    const errors: Record<string, string> = {};

    // Валидация имени
    if (this.formState.name) {
      const nameValidation = validateName(this.formState.name);
      if (!nameValidation.isValid) {
        errors.name = nameValidation.error || 'Ошибка валидации имени';
      }
    }

    // Валидация email
    if (this.formState.email) {
      const emailValidation = validateEmail(this.formState.email);
      if (!emailValidation.isValid) {
        errors.email = emailValidation.error || 'Ошибка валидации email';
      }
    }

    // Если меняем пароль
    const isChangingPassword = this.formState.newPassword || this.formState.confirmPassword;

    if (isChangingPassword) {
      // Текущий пароль обязателен при смене
      if (!this.formState.currentPassword) {
        errors.currentPassword = 'Введите текущий пароль';
      }

      // Валидация нового пароля
      if (this.formState.newPassword) {
        const passwordValidation = validatePassword(this.formState.newPassword);
        if (!passwordValidation.isValid) {
          errors.newPassword = passwordValidation.error || 'Ошибка валидации пароля';
        }
      }

      // Проверка совпадения паролей
      if (this.formState.newPassword !== this.formState.confirmPassword) {
        errors.confirmPassword = 'Пароли не совпадают';
      }
    }

    this.formState.errors = errors;
    return Object.keys(errors).length === 0;
  }

  /**
   * Перерисовать компонент (обёртка над update из базового класса)
   */
  private refreshDisplay(): void {
    this.update();
  }

  /**
   * Сохранить изменения профиля
   */
  private async handleSave(): Promise<void> {
    // Валидация формы
    if (!this.validateForm()) {
      this.update();
      return;
    }

    this.isSaving = true;
    this.saveButton?.setLoading(true);

    try {
      // Обновление профиля (имя и email)
      if (this.formState.name || this.formState.email) {
        const profileData: UpdateProfileData = {};
        if (this.formState.name) {
          profileData.name = this.formState.name;
        }
        if (this.formState.email) {
          profileData.email = this.formState.email;
        }

        const updatedUser = await AuthService.updateProfile(profileData);
        store.setUser(updatedUser);
      }

      // Смена пароля
      if (this.formState.newPassword && this.formState.currentPassword) {
        const passwordData: UpdatePasswordData = {
          currentPassword: this.formState.currentPassword,
          newPassword: this.formState.newPassword,
        };
        await AuthService.updatePassword(passwordData);
      }

      // Показать успешное уведомление
      this.showToast('Профиль успешно обновлён', 'success');

      // Очистить поля пароля
      this.formState.currentPassword = '';
      this.formState.newPassword = '';
      this.formState.confirmPassword = '';

      // Перерисовать форму
      this.refreshDisplay();

    } catch (error) {
      console.error('[ProfilePage] Ошибка сохранения:', error);
      
      // Обработка ошибок
      if (error instanceof Error) {
        let errorMessage = 'Ошибка сохранения профиля';
        
        // Проверяем, есть ли更多信息 в ошибке
        if ('statusCode' in error) {
          const statusCode = (error as { statusCode: number }).statusCode;
          if (statusCode === 409) {
            errorMessage = 'Email уже используется другим пользователем';
            this.formState.errors.email = errorMessage;
          } else if (statusCode === 400) {
            errorMessage = 'Неверный текущий пароль';
            this.formState.errors.currentPassword = errorMessage;
          }
        }
        
        this.showToast(errorMessage, 'error');
      } else {
        this.showToast('Произошла ошибка при сохранении', 'error');
      }

      this.update();
    } finally {
      this.isSaving = false;
      this.saveButton?.setLoading(false);
    }
  }

  /**
   * Показать toast уведомление
   */
  private showToast(message: string, type: 'success' | 'error'): void {
    if (!this.toastContainer) return;

    const toast = this.createElement('div', {
      className: `profile-page__toast profile-page__toast--${type}`,
    }, [message]);

    this.toastContainer.appendChild(toast);

    // Автоматически скрыть через 3 секунды
    setTimeout(() => {
      toast.remove();
    }, 3000);
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
