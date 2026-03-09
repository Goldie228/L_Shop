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
  | 'outline'
  | 'ghost'
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
  /** Только иконка (без текста) */
  iconOnly?: boolean;
  /** Иконка слева от текста */
  leftIcon?: string;
  /** Иконка справа от текста */
  rightIcon?: string;
  /** ARIA label для доступности */
  ariaLabel?: string;
}

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
      block: false,
      iconOnly: false,
      leftIcon: undefined,
      rightIcon: undefined,
    } as ButtonProps;
  }

  /**
   * Отрендерить элемент кнопки
   * @returns Элемент кнопки
   */
  public render(): HTMLButtonElement {
    const {
      text,
      variant = 'primary',
      size = 'md',
      type = 'button',
      disabled = false,
      loading = false,
      block = false,
      iconOnly = false,
      leftIcon,
      rightIcon,
      className,
      id,
      dataAttrs,
      onClick,
    } = this.props;

    // Создаём атрибуты для кнопки
    const attrs: Record<string, string | number | boolean> = {
      className: this.buildClassName(
        variant,
        size,
        block,
        iconOnly,
        loading,
        disabled,
        className,
      ),
      type,
      'aria-busy': loading,
      'aria-disabled': disabled || loading,
    };

    // Добавляем id если указан
    if (id !== undefined) {
      attrs.id = id;
    }

    // Создаём кнопку
    this.buttonElement = this.createElement('button', attrs);

    // Устанавливаем data атрибуты для тестирования
    if (dataAttrs && this.buttonElement) {
      Object.entries(dataAttrs).forEach(([key, value]) => {
        if (this.buttonElement) {
          this.buttonElement.dataset[key] = value;
        }
      });
    }

    // Добавляем testId если указан
    if (this.props.testId) {
      this.buttonElement.setAttribute('data-testid', this.props.testId);
    }

    // Добавляем aria-label если указан
    if (this.props.ariaLabel) {
      this.buttonElement.setAttribute('aria-label', this.props.ariaLabel);
    }

    // Рендерим содержимое кнопки
    this.renderContent(leftIcon, rightIcon, iconOnly, text, loading);

    // Добавляем обработчик клика
    if (onClick) {
      this.addEventListener(this.buttonElement, 'click', () => {
        if (!disabled && !loading) {
          onClick();
        }
      });
    }

    return this.buttonElement;
  }

  /**
   * Построить CSS классы для кнопки
   * @param variant - Вариант кнопки
   * @param size - Размер кнопки
   * @param block - Растянуть на всю ширину
   * @param iconOnly - Только иконка
   * @param loading - Состояние загрузки
   * @param disabled - Отключена ли кнопка
   * @param extraClassName - Дополнительные классы
   * @returns Строка с классами
   */
  private buildClassName(
    variant: ButtonVariant,
    size: ButtonSize,
    block: boolean,
    iconOnly: boolean,
    loading: boolean,
    disabled: boolean,
    extraClassName?: string,
  ): string {
    const classes = ['btn'];

    // Базовый вариант
    classes.push(`btn--${variant}`);

    // Размер
    classes.push(`btn--${size}`);

    // Модификаторы
    if (block) classes.push('btn--block');
    if (iconOnly) classes.push('btn--icon-only');
    if (loading) classes.push('btn--loading');
    if (disabled) classes.push('btn--disabled');

    // Дополнительные классы
    if (extraClassName) {
      classes.push(extraClassName);
    }

    return classes.join(' ');
  }

  /**
   * Создать SVG элемент спиннера для состояния загрузки
   * @returns SVG элемент спиннера
   */
  private createSpinnerElement(): SVGElement {
    // Создаем SVG спиннер безопасно через createSVGElement
    const svg = this.createSVGElement('svg', {
      className: 'btn__spinner',
      viewBox: '0 0 24 24',
      fill: 'none',
      xmlns: 'http://www.w3.org/2000/svg',
    }) as SVGSVGElement;

    // Создаем круг
    const circle = this.createSVGElement('circle', {
      cx: 12,
      cy: 12,
      r: 10,
      stroke: 'currentColor',
      'stroke-width': 3,
      'stroke-linecap': 'round',
      'stroke-dasharray': 31.416,
      'stroke-dashoffset': 10,
    });

    // Создаем анимацию вращения
    const animateTransform = this.createSVGElement('animateTransform', {
      attributeName: 'transform',
      type: 'rotate',
      from: '0 12 12',
      to: '360 12 12',
      dur: '1s',
      repeatCount: 'indefinite',
    });

    // Собираем иерархию
    circle.appendChild(animateTransform);
    svg.appendChild(circle);

    return svg;
  }

  /**
   * Отрендерить содержимое кнопки (иконки и текст)
   * @param leftIcon - Иконка слева
   * @param rightIcon - Иконка справа
   * @param iconOnly - Только иконка
   * @param text - Текст кнопки
   * @param loading - Состояние загрузки
   */
  private renderContent(
    leftIcon: string | undefined,
    rightIcon: string | undefined,
    iconOnly: boolean,
    text: string,
    loading: boolean,
  ): void {
    if (!this.buttonElement) return;

    // Очищаем содержимое
    this.buttonElement.innerHTML = '';

    // Добавляем левую иконку
    if (leftIcon) {
      const iconSpan = this.createElement('span', {
        className: 'btn__icon btn__icon--left',
      });
      // Используем безопасный метод для SVG
      const svgElement = this.createSVGFromString(leftIcon);
      if (svgElement) {
        iconSpan.appendChild(svgElement);
      }
      this.buttonElement.appendChild(iconSpan);
    }

    // Добавляем текст (если не iconOnly или если текст указаен)
    if (!iconOnly || text) {
      const textSpan = this.createElement(
        'span',
        {
          className: 'btn__text',
        },
        [text],
      );
      this.buttonElement.appendChild(textSpan);
    }

    // Добавляем правую иконку
    if (rightIcon) {
      const iconSpan = this.createElement('span', {
        className: 'btn__icon btn__icon--right',
      });
      // Используем безопасный метод для SVG
      const svgElement = this.createSVGFromString(rightIcon);
      if (svgElement) {
        iconSpan.appendChild(svgElement);
      }
      this.buttonElement.appendChild(iconSpan);
    }

    // Добавляем спиннер загрузки
    if (loading) {
      const spinnerSpan = this.createElement('span', {
        className: 'btn__spinner-wrapper',
      });
      const spinnerSvg = this.createSpinnerElement();
      spinnerSpan.appendChild(spinnerSvg);
      this.buttonElement.appendChild(spinnerSpan);
    }
  }

  /**
   * Установить состояние загрузки
   * @param loading - Состояние загрузки
   */
  public setLoading(loading: boolean): void {
    this.setProps({ loading });
    this.update();
  }

  /**
   * Установить состояние отключения
   * @param disabled - Состояние отключения
   */
  public setDisabled(disabled: boolean): void {
    this.setProps({ disabled });
    this.update();
  }

  /**
   * Выполнить программный клик
   */
  public click(): void {
    if (this.buttonElement && !this.props.disabled && !this.props.loading) {
      this.buttonElement.click();
    }
  }

  /**
   * Получить элемент кнопки
   * @returns Элемент кнопки
   */
  public getButtonElement(): HTMLButtonElement | null {
    return this.buttonElement;
  }
}
