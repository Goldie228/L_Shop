/**
 * Компонент кнопки - L_Shop Frontend
 * Переиспользуемая кнопка с вариантами и состояниями
 */

import { Component, ComponentProps } from '../base/Component';

/**
 * Типы вариантов кнопки
 */
export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success' | 'link';

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
  /** Обработчик клика */
  onClick?: (event: MouseEvent) => void;
}

/**
 * Класс компонента кнопки
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
      iconOnly: false
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
      className 
    } = this.props;
    
    // Построить имена классов
    const classes = ['btn'];
    classes.push(`btn--${variant}`);
    classes.push(`btn--${size}`);
    
    if (loading) classes.push('btn--loading');
    if (block) classes.push('btn--block');
    if (iconOnly) classes.push('btn--icon');
    if (className) classes.push(className);
    
    // Создать элемент кнопки
    const button = this.createElement(
      'button',
      {
        type: type || 'button',
        className: classes.join(' '),
        disabled: disabled || loading || false
      },
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
    const { icon, text, loading, iconOnly } = this.props;
    const children: (string | Element)[] = [];
    
    // Добавить иконку
    if (icon && !loading) {
      const iconSpan = this.createElement('span', { className: 'btn__icon' });
      iconSpan.innerHTML = icon;
      children.push(iconSpan);
    }
    
    // Добавить текст (скрыт при загрузке)
    if (text && !iconOnly) {
      children.push(text);
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
    }
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
