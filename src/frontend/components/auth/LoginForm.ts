/**
 * Форма входа - L_Shop Frontend
 * Форма аутентификации пользователя с анимациями и переключателем видимости пароля
 * 
 * @see src/frontend/styles/components/forms.css - стили форм
 * @see docs/DESIGN_SYSTEM.md - документация дизайн-системы
 */

import { Component, ComponentProps } from '../base/Component.js';
import { Input } from '../ui/Input.js';
import { Button } from '../ui/Button.js';
import { AuthService } from '../../services/auth.service.js';
import { store } from '../../store/store.js';
import { LoginUserData, validateLogin, validatePassword } from '../../types/user.js';
import { ApiError, NetworkError } from '../../types/api.js';

/**
 * Свойства формы входа
 */
export interface LoginFormProps extends ComponentProps {
  /** Callback при успешном входе */
  onSuccess?: () => void;
  /** Callback для переключения на форму регистрации */
  onSwitchToRegister?: () => void;
}

/**
 * Состояние формы входа
 */
interface LoginFormState {
  /** Значения формы */
  values: {
    loginOrEmail: string;
    password: string;
  };
  /** Ошибки валидации */
  errors: {
    loginOrEmail?: string;
    password?: string;
  };
  /** Ошибка отправки формы */
  submitError: string | null;
  /** Состояние загрузки */
  isLoading: boolean;
  /** Видимость пароля */
  showPassword: boolean;
}

/**
 * Компонент формы входа
 * Обеспечивает аутентификацию пользователя с валидацией и анимациями
 * 
 * @example
 * ```typescript
 * const loginForm = new LoginForm({
 *   onSuccess: () => console.log('Вход выполнен!'),
 *   onSwitchToRegister: () => showRegisterForm()
 * });
 * 
 * document.body.appendChild(loginForm.render());
 * ```
 */
export class LoginForm extends Component<LoginFormProps> {
  /** Form state */
  private state: LoginFormState = {
    values: {
      loginOrEmail: '',
      password: '',
    },
    errors: {},
    submitError: null,
    isLoading: false,
    showPassword: false,
  };
  
  /** Input components */
  private inputs: Map<string, Input> = new Map();
  
  /** Submit button */
  private submitButton: Button | null = null;
  
  /** Form element reference */
  private formElement: HTMLFormElement | null = null;
  
  /** Password toggle button */
  private passwordToggleButton: HTMLButtonElement | null = null;

   /**
    * Получить свойства по умолчанию
    */
   protected getDefaultProps(): LoginFormProps {
    return {
      ...super.getDefaultProps(),
    };
  }

   /**
    * Отрендерить форму входа
    * @returns Элемент формы
    */
   public render(): HTMLFormElement {
    const form = this.createElement('form', {
      className: 'auth-form',
      novalidate: true,
      'data-testid': 'login-form',
    });
    
    // Add error banner if exists
    if (this.state.submitError) {
      const errorBanner = this.createErrorBanner();
      form.appendChild(errorBanner);
    }
    
    // Create form fields
    const fields = this.createFormFields();
    form.appendChild(fields);
    
    // Create submit button
    const actions = this.createFormActions();
    form.appendChild(actions);
    
    // Add form submit handler
    this.addEventListener(form, 'submit', this.handleSubmit);
    
    this.formElement = form;
    this.element = form;
    return form;
  }

   /**
    * Создать баннер ошибки с анимацией
    * @returns Элемент баннера ошибки
    */
   private createErrorBanner(): HTMLDivElement {
    const banner = this.createElement(
      'div',
      {
        className: 'auth-form__error-banner',
        role: 'alert',
        'aria-live': 'polite',
        'data-testid': 'login-error-banner',
      },
      [
        `<svg class="auth-form__error-banner-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
        </svg>`,
        this.state.submitError!,
      ]
    );
    
    // Add shake animation
    banner.classList.add('auth-form__error-banner--shake');
    
    return banner;
  }

   /**
    * Создать поля формы
    * @returns Контейнер полей
    */
   private createFormFields(): HTMLDivElement {
    const container = this.createElement('div', {
      className: 'auth-form__fields',
    });
    
    // Login or Email input
    const loginInput = new Input({
      name: 'loginOrEmail',
      type: 'text',
      label: 'Логин или Email',
      placeholder: 'Введите логин или email',
      required: true,
      autocomplete: 'username',
      value: this.state.values.loginOrEmail,
      error: this.state.errors.loginOrEmail,
      inputState: this.state.errors.loginOrEmail ? 'error' : 'default',
      onChange: (value) => this.handleInputChange('loginOrEmail', value),
      onBlur: (value) => this.handleInputBlur('loginOrEmail', value),
    });
    this.inputs.set('loginOrEmail', loginInput);
    container.appendChild(loginInput.render());
    
    // Password input with toggle
    const passwordContainer = this.createPasswordField();
    container.appendChild(passwordContainer);
    
    return container;
  }

   /**
    * Создать поле пароля с кнопкой переключения
    * @returns Контейнер поля пароля
    */
   private createPasswordField(): HTMLDivElement {
    const container = this.createElement('div', {
      className: 'auth-form__password-field',
    });
    
    // Password input
    const passwordInput = new Input({
      name: 'password',
      type: this.state.showPassword ? 'text' : 'password',
      label: 'Пароль',
      placeholder: 'Введите пароль',
      required: true,
      autocomplete: 'current-password',
      value: this.state.values.password,
      error: this.state.errors.password,
      inputState: this.state.errors.password ? 'error' : 'default',
      onChange: (value) => this.handleInputChange('password', value),
      onBlur: (value) => this.handleInputBlur('password', value),
    });
    this.inputs.set('password', passwordInput);
    container.appendChild(passwordInput.render());
    
    // Password toggle button
    this.passwordToggleButton = this.createPasswordToggleButton();
    container.appendChild(this.passwordToggleButton);
    
    return container;
  }

   /**
    * Создать кнопку переключения видимости пароля
    * @returns Элемент кнопки переключения
    */
   private createPasswordToggleButton(): HTMLButtonElement {
    const button = this.createElement(
      'button',
      {
        type: 'button',
        className: 'auth-form__password-toggle',
        'aria-label': this.state.showPassword ? 'Скрыть пароль' : 'Показать пароль',
        'data-testid': 'password-toggle',
      },
      [this.getPasswordToggleIcon()]
    );
    
    this.addEventListener(button, 'click', this.togglePasswordVisibility);
    
    return button;
  }

   /**
    * Получить SVG иконки переключения пароля
    * @returns Строка SVG
    */
   private getPasswordToggleIcon(): string {
    if (this.state.showPassword) {
      // Eye off icon
      return `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
          <line x1="1" y1="1" x2="23" y2="23"/>
        </svg>
      `;
    }
    // Eye icon
    return `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
        <circle cx="12" cy="12" r="3"/>
      </svg>
    `;
  }

   /**
    * Переключить видимость пароля
    */
   private togglePasswordVisibility = (): void => {
    this.state.showPassword = !this.state.showPassword;
    
    // Update input type
    const passwordInput = this.inputs.get('password');
    if (passwordInput) {
      passwordInput.setType(this.state.showPassword ? 'text' : 'password');
    }
    
    // Update toggle button
    if (this.passwordToggleButton) {
      this.passwordToggleButton.setAttribute(
        'aria-label',
        this.state.showPassword ? 'Скрыть пароль' : 'Показать пароль'
      );
      this.passwordToggleButton.innerHTML = this.getPasswordToggleIcon();
    }
  };

   /**
    * Создать действия формы (кнопки)
    * @returns Контейнер действий
    */
   private createFormActions(): HTMLDivElement {
    const container = this.createElement('div', {
      className: 'auth-form__actions',
    });
    
    // Submit button
    this.submitButton = new Button({
      text: 'Войти',
      type: 'submit',
      variant: 'primary',
      size: 'lg',
      block: true,
      loading: this.state.isLoading,
      testId: 'login-submit',
       onClick: () => {}, // Обработка выполняется через отправку формы
    });
    container.appendChild(this.submitButton.render());
    
    // Switch to register link
    if (this.props.onSwitchToRegister) {
      const switchLink = this.createElement(
        'div',
        { className: 'auth-form__link' },
        ['Нет аккаунта? ', this.createSwitchLink()]
      );
      container.appendChild(switchLink);
    }
    
    return container;
  }

   /**
    * Создать ссылку переключения на форму регистрации
    * @returns Элемент ссылки
    */
   private createSwitchLink(): HTMLAnchorElement {
    const link = this.createElement(
      'a',
      {
        href: '#register',
        role: 'button',
        'data-testid': 'switch-to-register',
      },
      ['Зарегистрироваться']
    );
    
    this.addEventListener(link, 'click', (e) => {
      e.preventDefault();
      if (this.props.onSwitchToRegister) {
        this.props.onSwitchToRegister();
      }
    });
    
    return link;
  }

   /**
    * Обработать изменение значения поля ввода
    * @param field - Имя поля
    * @param value - Новое значение
    */
   private handleInputChange = (field: keyof LoginUserData, value: string): void => {
    this.state.values[field] = value;
    
    // Clear error on change
    if (this.state.errors[field]) {
      this.state.errors[field] = undefined;
      this.updateInputState(field);
    }
    
    // Clear submit error
    if (this.state.submitError) {
      this.state.submitError = null;
      this.removeErrorBanner();
    }
  };

   /**
    * Обработать потерю фокуса полем ввода (валидация)
    * @param field - Имя поля
    * @param value - Текущее значение
    */
   private handleInputBlur = (field: keyof LoginUserData, value: string): void => {
    this.validateField(field, value);
  };

   /**
    * Валидировать отдельное поле
    * @param field - Имя поля
    * @param value - Значение поля
    * @returns Валидно ли поле
    */
   private validateField(field: keyof LoginUserData, value: string): boolean {
    let result;
    
    switch (field) {
      case 'loginOrEmail':
        result = validateLogin(value);
        break;
      case 'password':
        result = validatePassword(value);
        break;
      default:
        return true;
    }
    
    if (!result.isValid) {
      this.state.errors[field] = result.error || undefined;
      this.updateInputState(field);
      this.triggerShakeAnimation(field);
      return false;
    }
    
    this.state.errors[field] = undefined;
    this.updateInputState(field);
    return true;
  }

   /**
    * Запустить анимацию тряски для невалидного поля
    * @param field - Имя поля
    */
   private triggerShakeAnimation(field: keyof LoginUserData): void {
    const input = this.inputs.get(field);
    if (input) {
      const inputElement = input.getElement();
      if (inputElement) {
        inputElement.classList.add('form-field--shake');
        setTimeout(() => {
          inputElement.classList.remove('form-field--shake');
        }, 500);
      }
    }
  }

   /**
    * Обновить состояние компонента ввода
    * @param field - Имя поля
    */
   private updateInputState(field: keyof LoginUserData): void {
    const input = this.inputs.get(field);
    if (input) {
      if (this.state.errors[field]) {
        input.setError(this.state.errors[field]!);
      } else {
        input.resetState();
      }
    }
  }

   /**
    * Удалить баннер ошибки из формы
    */
   private removeErrorBanner(): void {
    const banner = this.formElement?.querySelector('.auth-form__error-banner');
    if (banner) {
      banner.remove();
    }
  }

   /**
    * Валидировать все поля
    * @returns Валидна ли форма
    */
   private validateForm(): boolean {
    let isValid = true;
    
    for (const field of Object.keys(this.state.values) as Array<keyof LoginUserData>) {
      if (!this.validateField(field, this.state.values[field])) {
        isValid = false;
      }
    }
    
    return isValid;
  }

   /**
    * Обработать отправку формы
    * @param event - Событие отправки
    */
   private handleSubmit = async (event: Event): Promise<void> => {
    event.preventDefault();
    
    // Validate form
    if (!this.validateForm()) {
      this.triggerFormShakeAnimation();
      return;
    }
    
    // Set loading state
    this.state.isLoading = true;
    this.state.submitError = null;
    this.updateLoadingState();
    
    try {
      // Call auth service
      const user = await AuthService.login(this.state.values);
      
      // Update store
      store.setUser(user);
      
      // Call success callback
      if (this.props.onSuccess) {
        this.props.onSuccess();
      }
    } catch (error) {
      this.handleError(error);
    } finally {
      this.state.isLoading = false;
      this.updateLoadingState();
    }
  };

   /**
    * Запустить анимацию тряски для всей формы
    */
   private triggerFormShakeAnimation(): void {
    if (this.formElement) {
      this.formElement.classList.add('auth-form--shake');
      setTimeout(() => {
        this.formElement?.classList.remove('auth-form--shake');
      }, 500);
    }
  }

   /**
    * Обработать ошибку отправки
    * @param error - Объект ошибки
    */
   private handleError(error: unknown): void {
    if (error instanceof NetworkError) {
      this.state.submitError = 'Ошибка сети. Проверьте подключение.';
    } else if (error instanceof ApiError) {
      switch (error.type) {
        case 'unauthorized':
          this.state.submitError = 'Неверный логин или пароль.';
          break;
        case 'validation':
          this.state.submitError = error.message || 'Проверьте введенные данные.';
          break;
        default:
          this.state.submitError = error.message || 'Произошла ошибка. Попробуйте позже.';
      }
    } else if (error instanceof Error) {
      this.state.submitError = error.message;
    } else {
      this.state.submitError = 'Произошла неизвестная ошибка.';
    }
    
    this.update();
    this.triggerFormShakeAnimation();
  }

   /**
    * Обновить состояние загрузки
    */
   private updateLoadingState(): void {
    if (this.submitButton) {
      this.submitButton.setLoading(this.state.isLoading);
    }
  }

   /**
    * Сбросить форму
    */
   public reset(): void {
    this.state = {
      values: {
        loginOrEmail: '',
        password: '',
      },
      errors: {},
      submitError: null,
      isLoading: false,
      showPassword: false,
    };
    
    this.inputs.forEach((input) => {
      input.setValue('');
      input.resetState();
    });
    
    this.update();
  }
}
