/**
 * Register Form Component - L_Shop Frontend
 * Form for user registration with data-registration attribute
 */

import { Component, ComponentProps } from '../base/Component';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { AuthService } from '../../services/auth.service';
import { store } from '../../store/store';
import {
  RegisterUserData,
  validateName,
  validateEmail,
  validateLogin,
  validatePhone,
  validatePassword,
  validatePasswordConfirmation
} from '../../types/user';
import { ApiError, NetworkError } from '../../types/api';

/**
 * Register form props
 */
export interface RegisterFormProps extends ComponentProps {
  /** Callback on successful registration */
  onSuccess?: () => void;
  /** Callback to switch to login form */
  onSwitchToLogin?: () => void;
}

/**
 * Register form state
 */
interface RegisterFormState {
  /** Form values */
  values: {
    name: string;
    login: string;
    email: string;
    phone: string;
    password: string;
    confirmPassword: string;
  };
  /** Validation errors */
  errors: {
    name?: string;
    login?: string;
    email?: string;
    phone?: string;
    password?: string;
    confirmPassword?: string;
  };
  /** Form submission error */
  submitError: string | null;
  /** Loading state */
  isLoading: boolean;
}

/**
 * Register form component
 * Includes data-registration attribute as required
 */
export class RegisterForm extends Component<RegisterFormProps> {
  /** Form state */
  private state: RegisterFormState = {
    values: {
      name: '',
      login: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: ''
    },
    errors: {},
    submitError: null,
    isLoading: false
  };
  
  /** Input components */
  private inputs: Map<string, Input> = new Map();
  
  /** Submit button */
  private submitButton: Button | null = null;

  /**
   * Get default props
   */
  protected getDefaultProps(): RegisterFormProps {
    return {
      ...super.getDefaultProps()
    };
  }

  /**
   * Render registration form
   * @returns Form element
   */
  public render(): HTMLFormElement {
    const form = this.createElement('form', {
      className: 'auth-form',
      novalidate: true,
      'data-registration': '' // Required data attribute
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
    
    this.element = form;
    return form;
  }

  /**
   * Create error banner
   * @returns Error banner element
   */
  private createErrorBanner(): HTMLDivElement {
    return this.createElement(
      'div',
      { className: 'auth-form__error-banner' },
      [
        `<svg class="auth-form__error-banner-icon" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
        </svg>`,
        this.state.submitError!
      ]
    );
  }

  /**
   * Create form fields
   * @returns Fields container
   */
  private createFormFields(): HTMLDivElement {
    const container = this.createElement('div', {
      className: 'auth-form__fields'
    });
    
    // Name input
    const nameInput = new Input({
      name: 'name',
      type: 'text',
      label: 'Имя',
      placeholder: 'Введите ваше имя',
      required: true,
      autocomplete: 'name',
      value: this.state.values.name,
      error: this.state.errors.name,
      inputState: this.state.errors.name ? 'error' : 'default',
      onChange: (value) => this.handleInputChange('name', value),
      onBlur: (value) => this.handleInputBlur('name', value)
    });
    this.inputs.set('name', nameInput);
    container.appendChild(nameInput.render());
    
    // Email input
    const emailInput = new Input({
      name: 'email',
      type: 'email',
      label: 'Email',
      placeholder: 'example@mail.com',
      required: true,
      autocomplete: 'email',
      value: this.state.values.email,
      error: this.state.errors.email,
      inputState: this.state.errors.email ? 'error' : 'default',
      onChange: (value) => this.handleInputChange('email', value),
      onBlur: (value) => this.handleInputBlur('email', value)
    });
    this.inputs.set('email', emailInput);
    container.appendChild(emailInput.render());
    
    // Login input
    const loginInput = new Input({
      name: 'login',
      type: 'text',
      label: 'Логин',
      placeholder: 'Придумайте логин',
      required: true,
      autocomplete: 'username',
      value: this.state.values.login,
      error: this.state.errors.login,
      inputState: this.state.errors.login ? 'error' : 'default',
      onChange: (value) => this.handleInputChange('login', value),
      onBlur: (value) => this.handleInputBlur('login', value)
    });
    this.inputs.set('login', loginInput);
    container.appendChild(loginInput.render());
    
    // Phone input
    const phoneInput = new Input({
      name: 'phone',
      type: 'tel',
      label: 'Телефон',
      placeholder: '+375291234567',
      required: true,
      autocomplete: 'tel',
      pattern: '^\\+\\d{10,15}$',
      value: this.state.values.phone,
      error: this.state.errors.phone,
      inputState: this.state.errors.phone ? 'error' : 'default',
      helperText: 'Формат: +375291234567',
      onChange: (value) => this.handleInputChange('phone', value),
      onBlur: (value) => this.handleInputBlur('phone', value)
    });
    this.inputs.set('phone', phoneInput);
    container.appendChild(phoneInput.render());
    
    // Password input
    const passwordInput = new Input({
      name: 'password',
      type: 'password',
      label: 'Пароль',
      placeholder: 'Минимум 6 символов',
      required: true,
      autocomplete: 'new-password',
      minLength: 6,
      value: this.state.values.password,
      error: this.state.errors.password,
      inputState: this.state.errors.password ? 'error' : 'default',
      onChange: (value) => this.handleInputChange('password', value),
      onBlur: (value) => this.handleInputBlur('password', value)
    });
    this.inputs.set('password', passwordInput);
    container.appendChild(passwordInput.render());
    
    // Confirm password input
    const confirmPasswordInput = new Input({
      name: 'confirmPassword',
      type: 'password',
      label: 'Подтверждение пароля',
      placeholder: 'Повторите пароль',
      required: true,
      autocomplete: 'new-password',
      value: this.state.values.confirmPassword,
      error: this.state.errors.confirmPassword,
      inputState: this.state.errors.confirmPassword ? 'error' : 'default',
      onChange: (value) => this.handleInputChange('confirmPassword', value),
      onBlur: (value) => this.handleInputBlur('confirmPassword', value)
    });
    this.inputs.set('confirmPassword', confirmPasswordInput);
    container.appendChild(confirmPasswordInput.render());
    
    return container;
  }

  /**
   * Create form actions
   * @returns Actions container
   */
  private createFormActions(): HTMLDivElement {
    const container = this.createElement('div', {
      className: 'auth-form__actions'
    });
    
    // Submit button
    this.submitButton = new Button({
      text: 'Зарегистрироваться',
      type: 'submit',
      variant: 'primary',
      size: 'lg',
      block: true,
      loading: this.state.isLoading,
      onClick: () => {} // Handled by form submit
    });
    container.appendChild(this.submitButton.render());
    
    // Switch to login link
    if (this.props.onSwitchToLogin) {
      const switchLink = this.createElement(
        'div',
        { className: 'auth-form__link' },
        ['Уже есть аккаунт? ', this.createSwitchLink()]
      );
      container.appendChild(switchLink);
    }
    
    return container;
  }

  /**
   * Create switch to login link
   * @returns Link element
   */
  private createSwitchLink(): HTMLAnchorElement {
    const link = this.createElement(
      'a',
      {
        href: '#login',
        role: 'button'
      },
      ['Войти']
    );
    
    this.addEventListener(link, 'click', (e) => {
      e.preventDefault();
      if (this.props.onSwitchToLogin) {
        this.props.onSwitchToLogin();
      }
    });
    
    return link;
  }

  /**
   * Handle input value change
   * @param field - Field name
   * @param value - New value
   */
  private handleInputChange = (field: keyof RegisterUserData, value: string): void => {
    this.state.values[field] = value;
    
    // Clear error on change
    if (this.state.errors[field]) {
      this.state.errors[field] = undefined;
      this.updateInputState(field);
    }
    
    // Clear submit error
    if (this.state.submitError) {
      this.state.submitError = null;
    }
  };

  /**
   * Handle input blur (validation)
   * @param field - Field name
   * @param value - Current value
   */
  private handleInputBlur = (field: keyof RegisterUserData, value: string): void => {
    this.validateField(field, value);
  };

  /**
   * Validate single field
   * @param field - Field name
   * @param value - Field value
   * @returns Whether field is valid
   */
  private validateField(field: keyof RegisterUserData, value: string): boolean {
    let result;
    
    switch (field) {
      case 'name':
        result = validateName(value);
        break;
      case 'email':
        result = validateEmail(value);
        break;
      case 'login':
        result = validateLogin(value);
        break;
      case 'phone':
        result = validatePhone(value);
        break;
      case 'password':
        result = validatePassword(value);
        break;
      case 'confirmPassword':
        result = validatePasswordConfirmation(this.state.values.password, value);
        break;
      default:
        return true;
    }
    
    if (!result.isValid) {
      this.state.errors[field] = result.error || undefined;
      this.updateInputState(field);
      return false;
    }
    
    this.state.errors[field] = undefined;
    this.updateInputState(field);
    return true;
  }

  /**
   * Update input component state
   * @param field - Field name
   */
  private updateInputState(field: keyof RegisterUserData): void {
    const input = this.inputs.get(field);
    if (input) {
      if (this.state.errors[field]) {
        input.setError(this.state.errors[field]!);
      } else {
        input.clearError();
      }
    }
  }

  /**
   * Validate all fields
   * @returns Whether form is valid
   */
  private validateForm(): boolean {
    let isValid = true;
    
    for (const field of Object.keys(this.state.values) as Array<keyof RegisterUserData>) {
      if (!this.validateField(field, this.state.values[field])) {
        isValid = false;
      }
    }
    
    return isValid;
  }

  /**
   * Handle form submission
   * @param event - Submit event
   */
  private handleSubmit = async (event: Event): Promise<void> => {
    event.preventDefault();
    
    // Validate form
    if (!this.validateForm()) {
      return;
    }
    
    // Set loading state
    this.state.isLoading = true;
    this.state.submitError = null;
    this.updateLoadingState();
    
    try {
      // Call auth service
      const user = await AuthService.register(this.state.values);
      
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
   * Handle submission error
   * @param error - Error object
   */
  private handleError(error: unknown): void {
    if (error instanceof NetworkError) {
      this.state.submitError = 'Ошибка сети. Проверьте подключение.';
    } else if (error instanceof ApiError) {
      switch (error.type) {
        case 'conflict':
          this.state.submitError = 'Пользователь с такими данными уже существует.';
          break;
        case 'validation':
          // Show first validation error
          if (error.errors && error.errors.length > 0) {
            this.state.submitError = error.errors[0].message;
          } else {
            this.state.submitError = error.message || 'Проверьте введенные данные.';
          }
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
  }

  /**
   * Update loading state
   */
  private updateLoadingState(): void {
    if (this.submitButton) {
      this.submitButton.setLoading(this.state.isLoading);
    }
  }

  /**
   * Reset form
   */
  public reset(): void {
    this.state = {
      values: {
        name: '',
        login: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: ''
      },
      errors: {},
      submitError: null,
      isLoading: false
    };
    
    this.inputs.forEach(input => {
      input.setValue('');
      input.clearError();
    });
    
    this.update();
  }
}