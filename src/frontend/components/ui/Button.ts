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
export type ButtonVariant = 
  | 'primary' 
  | 'secondary' 
  | 'ghost' 
  | 'outline'
  | 'danger' 
  | 'success' 
  | 'link';

/**
 * Типы размеров кнопки
 */
export type ButtonSize = 'sm' | 'md' | 'lg';

/**
 * Интерфейс пропсов кнопки
 */
export interface ButtonProps extends ComponentProps {
  /** Вариант кнопки */
  variant?: ButtonVariant;
  /** Размер кнопки */
  size?: ButtonSize;
  /** Атрибут type кнопки */
  type?: 'button' | 'submit' | 'reset';
  /** Загружается ли кнопка */
  loading?: boolean;
  /** Кнопка на всю ширину */
  block?: boolean;
  /** Только иконка */
  iconOnly?: boolean;
  /** Текст кнопки */
  text?: string;
  /** SVG строка иконки */
  icon?: string;
  /** Позиция иконки (слева или справа) */
  iconPosition?: 'left' | 'right';
  /** Обработчик клика */
  onClick?: (event: MouseEvent) => void;
  /** Идентификатор для тестирования */
  testId?: string;
  /** Атрибут aria-label для accessibility */
  ariaLabel?: string;
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
 * Класс компонента кнопки
 * 
 * @example
 * ```typescript
 * // Создание основной кнопки
 * const button = new Button({
 *   text: 'Сохранить',
 *   variant: 'primary',
 *   size: 'md',
 *   onClick: () => console.log('Clicked!')
 * });
 * 
 * // Кнопка с иконкой
 * const iconButton = new Button({
 *   text: 'Добавить',
 *   icon: '<svg>...</svg>',
 *   variant: 'secondary'
 * });
 * 
 * // Кнопка загрузки
 * const loadingButton = new Button({
 *   text: 'Отправка...',
 *   loading: true
 * });
 * ```
 */
export class Button extends Component<ButtonProps> {
  /**
   * Получить пропсы по умолчанию
   */
  protected getDefaultProps(): ButtonProps {
    return {
      ...super.getDefaultProps(),
      variant: 'primary',
      size: 'md',
      type: 'button',
      loading: false,
      block: false,
      iconOnly: false,
      iconPosition: 'left',
    };
  }

  /**
   * Отрендерить элемент кнопки
   * @returns Элемент кнопки
   */
  public render(): HTMLButtonElement {
    const { 
      variant, 
      size, 
      type, 
      loading, 
      block, 
      iconOnly,
      disabled,
      className,
      testId,
      ariaLabel,
      text,
    } = this.props;
    
    // Построить имена классов
    const classes = ['btn'];
    classes.push(`btn--${variant}`);
    classes.push(`btn--${size}`);
    
    if (loading) classes.push('btn--loading');
    if (block) classes.push('btn--block');
    if (iconOnly) classes.push('btn--icon');
    if (className) classes.push(className);
    
    // Создать атрибуты кнопки
    const attributes: Record<string, string | boolean> = {
      type: type || 'button',
      className: classes.join(' '),
      disabled: disabled || loading || false,
      'data-testid': testId ?? `btn-${variant}-${size}`,
      'aria-busy': loading ? 'true' : 'false',
      'aria-disabled': disabled || loading ? 'true' : 'false',
    };
    
    // Добавить aria-label если указан или для iconOnly кнопки
    if (ariaLabel) {
      attributes['aria-label'] = ariaLabel;
    } else if (iconOnly && text) {
      attributes['aria-label'] = text;
    }
    
    // Создать элемент кнопки
    const button = this.createElement(
      'button',
      attributes,
      this.renderContent()
    );
    
    // Добавить обработчик клика
    if (this.props.onClick) {
      this.addEventListener(button, 'click', this.handleClick);
    }
    
    this.element = button;
    return button;
  }

  /**
   * Отрендерить содержимое кнопки
   * @returns Массив дочерних узлов
   */
  private renderContent(): (string | Element)[] {
    const { icon, text, loading, iconOnly, iconPosition } = this.props;
    const children: (string | Element)[] = [];
    
    // Добавить спиннер при загрузке
    if (loading) {
      const spinnerWrapper = this.createElement('span', { 
        className: 'btn__spinner-wrapper' 
      });
      spinnerWrapper.innerHTML = SPINNER_ICON;
      children.push(spinnerWrapper);
    }
    
    // Добавить иконку слева
    if (icon && !loading && iconPosition === 'left') {
      const iconSpan = this.createElement('span', { 
        className: 'btn__icon btn__icon--left' 
      });
      iconSpan.innerHTML = icon;
      children.push(iconSpan);
    }
    
    // Добавить текст (скрыт при загрузке для сохранения ширины)
    if (text && !iconOnly) {
      const textSpan = this.createElement('span', { 
        className: loading ? 'btn__text btn__text--hidden' : 'btn__text' 
      });
      textSpan.textContent = text;
      children.push(textSpan);
    }
    
    // Добавить иконку справа
    if (icon && !loading && iconPosition === 'right') {
      const iconSpan = this.createElement('span', { 
        className: 'btn__icon btn__icon--right' 
      });
      iconSpan.innerHTML = icon;
      children.push(iconSpan);
    }
    
    return children;
  }

  /**
   * Обработать событие клика
   * @param event - Событие клика
   */
  private handleClick = (event: MouseEvent): void => {
    if (!this.props.disabled && !this.props.loading && this.props.onClick) {
      this.props.onClick(event);
    }
  };

  /**
   * Установить состояние загрузки
   * @param loading - Состояние загрузки
   */
  public setLoading(loading: boolean): void {
    this.setProps({ loading });
    this.update();
  }

  /**
   * Установить состояние disabled
   * @param disabled - Состояние disabled
   */
  public setDisabled(disabled: boolean): void {
    this.setProps({ disabled });
    if (this.element) {
      (this.element as HTMLButtonElement).disabled = disabled;
      this.element.setAttribute('aria-disabled', disabled ? 'true' : 'false');
    }
  }

  /**
   * Установить текст кнопки
   * @param text - Новый текст
   */
  public setText(text: string): void {
    this.setProps({ text });
    this.update();
  }

  /**
   * Установить вариант кнопки
   * @param variant - Новый вариант
   */
  public setVariant(variant: ButtonVariant): void {
    this.setProps({ variant });
    this.update();
  }
}

/**
 * Фабрика создания элемента кнопки
 * @param props - Пропсы кнопки
 * @returns Элемент кнопки
 */
export function createButton(props: ButtonProps): HTMLButtonElement {
  const button = new Button(props);
  return button.render();
}
