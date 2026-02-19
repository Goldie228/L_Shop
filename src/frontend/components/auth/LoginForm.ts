/**
 * Login Form Component - L_Shop Frontend
 * Form for user authentication
 */

import { Component, ComponentProps } from '../base/Component';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { AuthService } from '../../services/auth.service';
import { store } from '../../store/store';
import { LoginUserData, validateLogin, validatePassword } from '../../types/user';
import { ApiError, NetworkError } from '../../types/api';

/**
 * Login form props
 */
export interface LoginFormProps extends ComponentProps {
  /** Callback on successful login */
  onSuccess?: () => void;
  /** Callback to switch to register form */
  onSwitchToRegister?: () => void;
}

/**
 * Login form state
 */
interface LoginFormState {
  /** Form values */
  values: {
    loginOrEmail: string;
    password: string;
  };
  /** Validation errors */
  errors: {
    loginOrEmail?: string;
    password?: string;
  };
  /** Form submission error */
  submitError: string | null;
  /** Loading state */
  isLoading: boolean;
}

/**
 * Login form component
 */
export class LoginForm extends Component<LoginFormProps> {
  /** Form state */
  private state: LoginFormState = {
    values: {
      loginOrEmail: '',
      password: ''
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
  protected getDefaultProps(): LoginFormProps {
    return {
      ...super.getDefaultProps()
    };
  }

  /**
   * Render login form
   * @returns Form element
   */
  public render(): HTMLFormElement {
    const form = this.createElement('form', {
      className: 'auth-form',
      novalidate: true
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
      onBlur: (value) => this.handleInputBlur('loginOrEmail', value)
    });
    this.inputs.set('loginOrEmail', loginInput);
    container.appendChild(loginInput.render());
    
    // Password input
    const passwordInput = new Input({
      name: 'password',
      type: 'password',
      label: 'Пароль',
      placeholder: 'Введите пароль',
      required: true,
      autocomplete: 'current-password',
      value: this.state.values.password,
      error: this.state.errors.password,
      inputState: this.state.errors.password ? 'error' : 'default',
      onChange: (value) => this.handleInputChange('password', value),
      onBlur: (value) => this.handleInputBlur('password', value)
    });
    this.inputs.set('password', passwordInput);
    container.appendChild(passwordInput.render());
    
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
      text: 'Войти',
      type: 'submit',
      variant: 'primary',
      size: 'lg',
      block: true,
      loading: this.state.isLoading,
      onClick: () => {} // Handled by form submit
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
   * Create switch to register link
   * @returns Link element
   */
  private createSwitchLink(): HTMLAnchorElement {
    const link = this.createElement(
      'a',
      {
        href: '#register',
        role: 'button'
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
   * Handle input value change
   * @param field - Field name
   * @param value - New value
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
    }
  };

  /**
   * Handle input blur (validation)
   * @param field - Field name
   * @param value - Current value
   */
  private handleInputBlur = (field: keyof LoginUserData, value: string): void => {
    this.validateField(field, value);
  };

  /**
   * Validate single field
   * @param field - Field name
   * @param value - Field value
   * @returns Whether field is valid
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
  private updateInputState(field: keyof LoginUserData): void {
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
    
    for (const field of Object.keys(this.state.values) as Array<keyof LoginUserData>) {
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
   * Handle submission error
   * @param error - Error object
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
        loginOrEmail: '',
        password: ''
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