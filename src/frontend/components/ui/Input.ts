/**
 * Компонент Input - L_Shop Frontend
 * Переиспользуемое поле ввода с состояниями валидации
 */

import { Component, ComponentProps } from '../base/Component';

/**
 * Типы ввода
 */
export type InputType = 'text' | 'email' | 'password' | 'tel' | 'number' | 'search';

/**
 * Состояние ввода
 */
export type InputState = 'default' | 'error' | 'success';

/**
 * Интерфейс пропсов ввода
 */
export interface InputProps extends ComponentProps {
  /** Тип ввода */
  type?: InputType;
  /** Имя ввода */
  name: string;
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
  /** Обработчик изменения ввода */
  onChange?: (value: string) => void;
  /** Обработчик blur ввода */
  onBlur?: (value: string) => void;
  /** Обработчик focus ввода */
  onFocus?: () => void;
}

/**
 * Класс компонента ввода
 */
export class Input extends Component<InputProps> {
  /** Ссылка на элемент ввода */
  private inputElement: HTMLInputElement | null = null;

  /**
   * Получить пропсы по умолчанию
   */
  protected getDefaultProps(): InputProps {
    return {
      ...super.getDefaultProps(),
      type: 'text',
      inputState: 'default',
      required: false,
      readonly: false
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
      className 
    } = this.props;
    
    // Построить классы контейнера
    const containerClasses = ['form-field'];
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
      className: containerClasses.join(' ')
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
    
    // Добавить переключатель пароля для типа password
    if (this.props.type === 'password') {
      const toggle = this.createPasswordToggle();
      inputWrapper.appendChild(toggle);
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
      placeholder,
      value,
      required,
      readonly,
      autocomplete,
      pattern,
      minLength,
      maxLength,
      disabled
    } = this.props;
    
    const input = this.createElement(
      'input',
      {
        type: type || 'text',
        name,
        id: name,
        className: 'form-field__input',
        placeholder: placeholder || '',
        value: value || '',
        required: required || false,
        readonly: readonly || false,
        disabled: disabled || false,
        autocomplete: autocomplete || 'off',
        'aria-invalid': this.props.inputState === 'error' ? 'true' : 'false'
      }
    ) as HTMLInputElement;
    
    // Добавить дополнительные атрибуты
    if (pattern) input.setAttribute('pattern', pattern);
    if (minLength !== undefined) input.setAttribute('minlength', String(minLength));
    if (maxLength !== undefined) input.setAttribute('maxlength', String(maxLength));
    
    // Добавить слушатели событий
    this.addEventListener(input, 'input', this.handleInput);
    this.addEventListener(input, 'blur', this.handleBlur);
    this.addEventListener(input, 'focus', this.handleFocus);
    
    return input;
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
        'aria-label': 'Переключить видимость пароля'
      }
    );
    
    // Добавить иконку глаза
    button.innerHTML = `
      <svg class="form-field__toggle-password-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
        <circle cx="12" cy="12" r="3"></circle>
      </svg>
    `;
    
    this.addEventListener(button, 'click', this.togglePasswordVisibility);
    
    return button;
  }

  /**
   * Создать элемент ошибки
   * @returns Элемент ошибки
   */
  private createErrorElement(): HTMLDivElement {
    const { error } = this.props;
    
    return this.createElement(
      'div',
      { className: 'form-field__error' },
      [
        `<svg class="form-field__error-icon" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
        </svg>`,
        error!
      ]
    );
  }

  /**
   * Создать вспомогательный элемент
   * @returns Вспомогательный элемент
   */
  private createHelperElement(): HTMLDivElement {
    const { helperText } = this.props;
    
    return this.createElement(
      'div',
      { className: 'form-field__helper' },
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
  }

  /**
   * Обработать blur ввода
   * @param event - Событие focus
   */
  private handleBlur = (event: Event): void => {
    const value = (event.target as HTMLInputElement).value;
    
    if (this.props.onBlur) {
      this.props.onBlur(value);
    }
  }

  /**
   * Обработать focus ввода
   */
  private handleFocus = (): void => {
    if (this.props.onFocus) {
      this.props.onFocus();
    }
  }

  /**
   * Переключить видимость пароля
   */
  private togglePasswordVisibility = (): void => {
    if (this.inputElement) {
      const isPassword = this.inputElement.type === 'password';
      this.inputElement.type = isPassword ? 'text' : 'password';
    }
  }

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
