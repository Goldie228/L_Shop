/**
 * Компонент кнопки - L_Shop Frontend
 * Переиспользуемая кнопка с вариантами, размерами и состояниями
 *
 * @see src/frontend/styles/components/button.css - стили кнопки
 * @see docs/DESIGN_SYSTEM.md - документация дизайн-системы
 */

import { Component, ComponentProps } from '../base/Component.js';

/**
 * Типы вариантов кнопки
 */
export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';

/**
 * Типы размеров кнопки
 */
export type ButtonSize = 'sm' | 'md' | 'lg';

/**
 * Интерфейс пропсов кнопки
 */
export interface ButtonProps extends ComponentProps {
  /** Текст кнопки */
  text: string;
  /** Вариант кнопки */
  variant?: ButtonVariant;
  /** Размер кнопки */
  size?: ButtonSize;
  /** Атрибут type кнопки */
  type?: 'button' | 'submit' | 'reset';
  /** Отключена ли кнопка */
  disabled?: boolean;
  /** Состояние загрузки */
  loading?: boolean;
  /** Обработчик клика */
  onClick?: () => void;
  /** Идентификатор для тестирования */
  testId?: string;
  /** Растянуть на всю ширину */
  block?: boolean;
}

/**
 * SVG иконка спиннера для состояния загрузки
 */
const SPINNER_ICON = `
  <svg class="btn__spinner" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-dasharray="31.416" stroke-dashoffset="10">
      <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="1s" repeatCount="indefinite"/>
    </circle>
  </svg>
`;

/**
 * Компонент кнопки с вариантами, размерами и состояниями
 *
 * @example
 * ```typescript
 * const button = new Button({
 *   text: 'Сохранить',
 *   variant: 'primary',
 *   size: 'md',
 *   onClick: () => console.log('Clicked!')
 * });
 * container.appendChild(button.render());
 *
 * // Установка состояния загрузки
 * button.setLoading(true);
 *
 * // Программный клик
 * button.click();
 * ```
 */
export class Button extends Component<ButtonProps> {
  /** Элемент кнопки */
  private buttonElement: HTMLButtonElement | null = null;

  /**
   * Создать экземпляр кнопки
   * @param props - Пропсы кнопки
   */
  constructor(props: ButtonProps) {
    super(props);
  }

  /**
   * Получить пропсы по умолчанию
   * @returns Пропсы по умолчанию
   */
  protected getDefaultProps(): ButtonProps {
    return {
      ...super.getDefaultProps(),
      text: '',
      variant: 'primary',
      size: 'md',
      type: 'button',
      disabled: false,
      loading: false,
    } as ButtonProps;
  }

  /**
   * Отрендерить элемент кнопки
   * @returns Элемент кнопки
   */
  public render(): HTMLButtonElement {
    const { variant, size, type, loading, disabled, className, testId, text, block } =
      this.props;

    // Построить имена классов
    const classes = ['btn'];
    classes.push(`btn--${variant ?? 'primary'}`);
    classes.push(`btn--${size ?? 'md'}`);

    if (loading) classes.push('btn--loading');
    if (block) classes.push('btn--block');
    if (className) classes.push(className);

    // Создать атрибуты кнопки
    const attributes: Record<string, string | boolean> = {
      type: type ?? 'button',
      className: classes.join(' '),
      disabled: disabled || loading || false,
      'data-testid': testId ?? `btn-${variant ?? 'primary'}-${size ?? 'md'}`,
      'aria-busy': loading ? 'true' : 'false',
      'aria-disabled': (disabled || loading) ? 'true' : 'false',
    };

    // Создать элемент кнопки
    const button = this.createElement(
      'button',
      attributes,
      this.renderContent()
    );

    // Добавить обработчик клика
    this.addEventListener(button, 'click', this.handleClick);

    this.buttonElement = button;
    this.element = button;
    return button;
  }

  /**
   * Отрендерить содержимое кнопки
   * @returns Массив дочерних узлов
   */
  private renderContent(): (string | Element)[] {
    const { text, loading } = this.props;
    const children: (string | Element)[] = [];

    // Добавить спиннер при загрузке
    if (loading) {
      const spinnerWrapper = this.createElement('span', {
        className: 'btn__spinner-wrapper',
      });
      spinnerWrapper.innerHTML = SPINNER_ICON;
      children.push(spinnerWrapper);
    }

    // Добавить текст (скрыт при загрузке для сохранения ширины)
    if (text) {
      const textSpan = this.createElement('span', {
        className: loading ? 'btn__text btn__text--hidden' : 'btn__text',
      });
      textSpan.textContent = text;
      children.push(textSpan);
    }

    return children;
  }

  /**
   * Обработать событие клика
   * @param event - Событие клика
   */
  private handleClick = (event: MouseEvent): void => {
    // Не предотвращаем стандартное поведение для submit кнопок
    // Это позволяет форме отправляться нормально
    if (this.props.type !== 'submit') {
      event.preventDefault();
    }
    
    if (!this.props.disabled && !this.props.loading && this.props.onClick) {
      this.props.onClick();
    }
  };

  /**
   * Установить состояние загрузки
   * @param loading - Состояние загрузки
   *
   * @example
   * ```typescript
   * button.setLoading(true);  // Показать спиннер
   * button.setLoading(false); // Скрыть спиннер
   * ```
   */
  public setLoading(loading: boolean): void {
    this.setProps({ loading });
    this.update();
  }

  /**
   * Установить состояние disabled
   * @param disabled - Состояние disabled
   *
   * @example
   * ```typescript
   * button.setDisabled(true);  // Отключить кнопку
   * button.setDisabled(false); // Включить кнопку
   * ```
   */
  public setDisabled(disabled: boolean): void {
    this.setProps({ disabled });
    if (this.buttonElement) {
      this.buttonElement.disabled = disabled;
      this.buttonElement.setAttribute('aria-disabled', disabled ? 'true' : 'false');
    }
  }

  /**
   * Выполнить программный клик по кнопке
   *
   * @example
   * ```typescript
   * button.click(); // Вызовет onClick обработчик
   * ```
   */
  public click(): void {
    if (this.buttonElement && !this.props.disabled && !this.props.loading) {
      this.buttonElement.click();
    }
  }
}
