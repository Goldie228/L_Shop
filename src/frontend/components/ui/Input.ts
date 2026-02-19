/**
 * Компонент Input - L_Shop Frontend
 * Переиспользуемое поле ввода с состояниями валидации и размерами
 * 
 * @see src/frontend/styles/components/input.css - стили ввода
 * @see docs/DESIGN_SYSTEM.md - документация дизайн-системы
 */

import { Component, ComponentProps } from '../base/Component.js';

/**
 * Типы ввода
 */
export type InputType = 'text' | 'email' | 'password' | 'tel' | 'number' | 'search';

/**
 * Состояние ввода
 */
export type InputState = 'default' | 'error' | 'success';

/**
 * Размеры ввода
 */
export type InputSize = 'sm' | 'md' | 'lg';

/**
 * Интерфейс пропсов ввода
 */
export interface InputProps extends ComponentProps {
  /** Тип ввода */
  type?: InputType;
  /** Имя ввода */
  name: string;
  /** Размер ввода */
  size?: InputSize;
  /** Плейсхолдер ввода */
  placeholder?: string;
  /** Значение ввода */
  value?: string;
  /** Текст лейбла */
  label?: string;
  /** Обязательное ли поле */
  required?: boolean;
  /** Только для чтения */
  readonly?: boolean;
  /** Состояние ввода */
  inputState?: InputState;
  /** Вспомогательный текст */
  helperText?: string;
  /** Сообщение об ошибке */
  error?: string;
  /** Атрибут autocomplete */
  autocomplete?: string;
  /** Паттерн для валидации */
  pattern?: string;
  /** Минимальная длина */
  minLength?: number;
  /** Максимальная длина */
  maxLength?: number;
  /** Идентификатор для тестирования */
  testId?: string;
  /** Обработчик изменения ввода */
  onChange?: (value: string) => void;
  /** Обработчик blur ввода */
  onBlur?: (value: string) => void;
  /** Обработчик focus ввода */
  onFocus?: () => void;
}

/**
 * SVG иконка глаза (показать пароль)
 */
const EYE_ICON = `
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
    <circle cx="12" cy="12" r="3"></circle>
  </svg>
`;

/**
 * SVG иконка закрытого глаза (скрыть пароль)
 */
const EYE_OFF_ICON = `
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
    <line x1="1" y1="1" x2="23" y2="23"></line>
  </svg>
`;

/**
 * SVG иконка галочки для состояния success
 */
const CHECK_ICON = `
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
    <polyline points="20 6 9 17 4 12"></polyline>
  </svg>
`;

/**
 * SVG иконка ошибки
 */
const ERROR_ICON = `
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
  </svg>
`;

/**
 * Класс компонента ввода
 * 
 * @example
 * ```typescript
 * // Создание обычного ввода
 * const input = new Input({
 *   name: 'email',
 *   type: 'email',
 *   label: 'Email',
 *   placeholder: 'Введите email',
 *   required: true
 * });
 * 
 * // Ввод с валидацией
 * const passwordInput = new Input({
 *   name: 'password',
 *   type: 'password',
 *   label: 'Пароль',
 *   helperText: 'Минимум 8 символов',
 *   minLength: 8
 * });
 * ```
 */
export class Input extends Component<InputProps> {
  /** Ссылка на элемент ввода */
  private inputElement: HTMLInputElement | null = null;
  
  /** Ссылка на кнопку переключения пароля */
  private passwordToggle: HTMLButtonElement | null = null;
  
  /** Состояние видимости пароля */
  private passwordVisible = false;

  /**
   * Получить пропсы по умолчанию
   */
  protected getDefaultProps(): InputProps {
    return {
      ...super.getDefaultProps(),
      type: 'text',
      size: 'md',
      inputState: 'default',
      required: false,
      readonly: false,
    } as InputProps;
  }

  /**
   * Отрендерить элемент ввода
   * @returns Элемент контейнера
   */
  public render(): HTMLDivElement {
    const { 
      label, 
      inputState, 
      error, 
      helperText,
      size,
      className,
      testId,
      name
    } = this.props;
    
    // Построить классы контейнера
    const containerClasses = ['form-field'];
    containerClasses.push(`form-field--${size}`);
    
    if (inputState !== 'default') {
      containerClasses.push(`form-field--${inputState}`);
    }
    
    if (this.props.type === 'password') {
      containerClasses.push('form-field--password');
    }
    
    if (className) {
      containerClasses.push(className);
    }
    
    // Создать контейнер
    const container = this.createElement('div', {
      className: containerClasses.join(' '),
      'data-testid': testId ?? `input-${name}`,
    });
    
    // Добавить лейбл если передан
    if (label) {
      const labelElement = this.createLabel();
      container.appendChild(labelElement);
    }
    
    // Создать обёртку ввода
    const inputWrapper = this.createElement('div', {
      className: 'form-field__input-wrapper'
    });
    
    // Создать ввод
    this.inputElement = this.createInput();
    inputWrapper.appendChild(this.inputElement);
    
    // Добавить иконку успеха
    if (inputState === 'success') {
      const successIcon = this.createSuccessIcon();
      inputWrapper.appendChild(successIcon);
    }
    
    // Добавить переключатель пароля для типа password
    if (this.props.type === 'password') {
      this.passwordToggle = this.createPasswordToggle();
      inputWrapper.appendChild(this.passwordToggle);
    }
    
    container.appendChild(inputWrapper);
    
    // Добавить вспомогательный текст или ошибку
    if (error && inputState === 'error') {
      const errorElement = this.createErrorElement();
      container.appendChild(errorElement);
    } else if (helperText) {
      const helperElement = this.createHelperElement();
      container.appendChild(helperElement);
    }
    
    this.element = container;
    return container;
  }

  /**
   * Создать элемент лейбла
   * @returns Элемент лейбла
   */
  private createLabel(): HTMLLabelElement {
    const { name, label, required } = this.props;
    
    const labelClasses = ['form-field__label'];
    if (required) {
      labelClasses.push('form-field__label--required');
    }
    
    return this.createElement(
      'label',
      {
        for: name,
        className: labelClasses.join(' ')
      },
      [label!]
    );
  }

  /**
   * Создать элемент ввода
   * @returns Элемент ввода
   */
  private createInput(): HTMLInputElement {
    const {
      type,
      name,
      size,
      placeholder,
      value,
      required,
      readonly,
      autocomplete,
      pattern,
      minLength,
      maxLength,
      disabled,
      inputState
    } = this.props;
    
    // Классы ввода
    const inputClasses = ['form-field__input', `form-field__input--${size}`];
    
    if (inputState !== 'default') {
      inputClasses.push(`form-field__input--${inputState}`);
    }
    
    // Создать базовые атрибуты ввода
    const inputAttributes: Record<string, string | boolean> = {
      type: type || 'text',
      name,
      id: name,
      className: inputClasses.join(' '),
      placeholder: placeholder || '',
      value: value || '',
      required: required || false,
      readonly: readonly || false,
      disabled: disabled || false,
      autocomplete: autocomplete || 'off',
      'aria-invalid': inputState === 'error' ? 'true' : 'false',
    };
    
    // Добавить aria-describedby если есть
    const describedBy = this.getAriaDescribedBy();
    if (describedBy) {
      inputAttributes['aria-describedby'] = describedBy;
    }
    
    const input = this.createElement(
      'input',
      inputAttributes
    ) as HTMLInputElement;
    
    // Добавить дополнительные атрибуты
    if (pattern) input.setAttribute('pattern', pattern);
    if (minLength !== undefined) {
      input.setAttribute('minlength', String(minLength));
    }
    if (maxLength !== undefined) {
      input.setAttribute('maxlength', String(maxLength));
    }
    
    // Добавить слушатели событий
    this.addEventListener(input, 'input', this.handleInput);
    this.addEventListener(input, 'blur', this.handleBlur);
    this.addEventListener(input, 'focus', this.handleFocus);
    
    return input;
  }

  /**
   * Получить aria-describedby атрибут
   * @returns ID элемента описания или undefined
   */
  private getAriaDescribedBy(): string | undefined {
    const { name, error, helperText, inputState } = this.props;
    
    if (error && inputState === 'error') {
      return `${name}-error`;
    }
    
    if (helperText) {
      return `${name}-helper`;
    }
    
    return undefined;
  }

  /**
   * Создать иконку успеха
   * @returns Элемент иконки
   */
  private createSuccessIcon(): HTMLSpanElement {
    const icon = this.createElement('span', {
      className: 'form-field__success-icon',
      'aria-hidden': 'true'
    });
    icon.innerHTML = CHECK_ICON;
    return icon;
  }

  /**
   * Создать кнопку переключения пароля
   * @returns Элемент кнопки переключения
   */
  private createPasswordToggle(): HTMLButtonElement {
    const button = this.createElement(
      'button',
      {
        type: 'button',
        className: 'form-field__toggle-password',
        'aria-label': 'Показать пароль',
        'data-testid': 'password-toggle'
      }
    );
    
    // Добавить иконку глаза
    button.innerHTML = EYE_ICON;
    
    this.addEventListener(button, 'click', this.togglePasswordVisibility);
    
    return button;
  }

  /**
   * Создать элемент ошибки
   * @returns Элемент ошибки
   */
  private createErrorElement(): HTMLDivElement {
    const { error, name } = this.props;
    
    const errorElement = this.createElement(
      'div',
      { 
        className: 'form-field__error',
        id: `${name}-error`,
        role: 'alert',
        'aria-live': 'polite'
      },
      []
    );
    
    // Добавить иконку ошибки
    const iconSpan = this.createElement('span', {
      className: 'form-field__error-icon',
      'aria-hidden': 'true'
    });
    iconSpan.innerHTML = ERROR_ICON;
    
    // Добавить текст ошибки
    const textSpan = this.createElement('span', {
      className: 'form-field__error-text'
    }, [error!]);
    
    errorElement.appendChild(iconSpan);
    errorElement.appendChild(textSpan);
    
    return errorElement;
  }

  /**
   * Создать вспомогательный элемент
   * @returns Вспомогательный элемент
   */
  private createHelperElement(): HTMLDivElement {
    const { helperText, name } = this.props;
    
    return this.createElement(
      'div',
      { 
        className: 'form-field__helper',
        id: `${name}-helper`
      },
      [helperText!]
    );
  }

  /**
   * Обработать изменение ввода
   * @param event - Событие ввода
   */
  private handleInput = (event: Event): void => {
    const value = (event.target as HTMLInputElement).value;
    this.props.value = value;
    
    if (this.props.onChange) {
      this.props.onChange(value);
    }
  };

  /**
   * Обработать blur ввода
   * @param event - Событие focus
   */
  private handleBlur = (event: Event): void => {
    const value = (event.target as HTMLInputElement).value;
    
    if (this.props.onBlur) {
      this.props.onBlur(value);
    }
  };

  /**
   * Обработать focus ввода
   */
  private handleFocus = (): void => {
    if (this.props.onFocus) {
      this.props.onFocus();
    }
  };

  /**
   * Переключить видимость пароля
   */
  private togglePasswordVisibility = (): void => {
    if (this.inputElement && this.passwordToggle) {
      this.passwordVisible = !this.passwordVisible;
      this.inputElement.type = this.passwordVisible ? 'text' : 'password';
      
      // Обновить иконку и aria-label
      this.passwordToggle.innerHTML = this.passwordVisible ? EYE_OFF_ICON : EYE_ICON;
      this.passwordToggle.setAttribute(
        'aria-label',
        this.passwordVisible ? 'Скрыть пароль' : 'Показать пароль'
      );
    }
  };

  /**
   * Получить текущее значение
   * @returns Значение ввода
   */
  public getValue(): string {
    return this.inputElement?.value || '';
  }

  /**
   * Установить значение ввода
   * @param value - Новое значение
   */
  public setValue(value: string): void {
    if (this.inputElement) {
      this.inputElement.value = value;
      this.props.value = value;
    }
  }

  /**
   * Установить состояние ошибки
   * @param error - Сообщение об ошибке
   */
  public setError(error: string): void {
    this.setProps({ inputState: 'error', error });
    this.update();
    
    // Добавить класс анимации shake
    if (this.element) {
      this.element.classList.add('form-field--shake');
      // Удалить класс после анимации
      setTimeout(() => {
        this.element?.classList.remove('form-field--shake');
      }, 500);
    }
  }

  /**
   * Очистить состояние ошибки
   */
  public clearError(): void {
    this.setProps({ inputState: 'default', error: undefined });
    this.update();
  }

  /**
   * Установить состояние успеха
   */
  public setSuccess(): void {
    this.setProps({ inputState: 'success' });
    this.update();
  }

  /**
   * Сбросить состояние к default
   */
  public resetState(): void {
    this.setProps({ inputState: 'default', error: undefined });
    this.update();
  }

  /**
   * Фокус на вводе
   */
  public focus(): void {
    this.inputElement?.focus();
  }

  /**
   * Валидировать ввод
   * @returns Валиден ли ввод
   */
  public validate(): boolean {
    if (!this.inputElement) return false;
    
    const isValid = this.inputElement.checkValidity();
    
    if (!isValid) {
      this.setError(this.inputElement.validationMessage);
    } else {
      this.clearError();
    }
    
    return isValid;
  }

  /**
   * Установить disabled состояние
   * @param disabled - Заблокирован ли ввод
   */
  public setDisabled(disabled: boolean): void {
    this.setProps({ disabled });
    if (this.inputElement) {
      this.inputElement.disabled = disabled;
    }
  }

  /**
   * Установить тип ввода
   * @param type - Новый тип ввода
   */
  public setType(type: InputType): void {
    this.setProps({ type });
    if (this.inputElement) {
      this.inputElement.type = type;
    }
  }
}

/**
 * Фабрика создания элемента ввода
 * @param props - Пропсы ввода
 * @returns Элемент контейнера ввода
 */
export function createInput(props: InputProps): HTMLDivElement {
  const input = new Input(props);
  return input.render();
}
