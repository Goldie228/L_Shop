/**
 * Компонент Toast - L_Shop Frontend
 * Всплывающие уведомления об успехе или ошибке
 *
 * @see src/frontend/styles/components/toast.css - стили тоста
 * @see docs/DESIGN_SYSTEM.md - документация дизайн-системы
 */

import { Component, ComponentProps } from '../base/Component.js';

/**
 * Типы тостов
 */
export type ToastType = 'success' | 'error' | 'warning' | 'info';

/**
 * Интерфейс пропсов Toast
 */
export interface ToastProps extends ComponentProps {
  /** Тип тоста */
  type?: ToastType;
  /** Заголовок тоста */
  title?: string;
  /** Сообщение тоста */
  message: string;
  /** Длительность показа в мс (0 - бесконечно) */
  duration?: number;
  /** Показывать кнопку закрытия */
  showCloseButton?: boolean;
  /** Обработчик закрытия */
  onClose?: () => void;
  /** Идентификатор для тестирования */
  testId?: string;
}

/**
 * SVG иконки для разных типов тостов
 */
const ICONS: Record<ToastType, string> = {
  success: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
         stroke-linecap="round" stroke-linejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
      <polyline points="22 4 12 14.01 9 11.01"></polyline>
    </svg>
  `,
  error: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
         stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="10"></circle>
      <line x1="15" y1="9" x2="9" y2="15"></line>
      <line x1="9" y1="9" x2="15" y2="15"></line>
    </svg>
  `,
  warning: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
         stroke-linecap="round" stroke-linejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
      <line x1="12" y1="9" x2="12" y2="13"></line>
      <line x1="12" y1="17" x2="12.01" y2="17"></line>
    </svg>
  `,
  info: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
         stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="10"></circle>
      <line x1="12" y1="16" x2="12" y2="12"></line>
      <line x1="12" y1="8" x2="12.01" y2="8"></line>
    </svg>
  `,
};

/**
 * Класс компонента Toast
 *
 * @example
 * ```typescript
 * // Создание тоста
 * const toast = new Toast({
 *   type: 'success',
 *   title: 'Успех',
 *   message: 'Заказ успешно оформлен!',
 *   duration: 5000,
 *   onClose: () => console.log('Toast closed')
 * });
 *
 * // Показать
 * toast.open();
 *
 * // Закрыть программно
 * toast.close();
 * ```
 */
export class Toast extends Component<ToastProps> {
  /** Таймер автозакрытия */
  private autoCloseTimer: ReturnType<typeof setTimeout> | null = null;

  /**
   * Получить пропсы по умолчанию
   */
  protected getDefaultProps(): ToastProps {
    return {
      ...super.getDefaultProps(),
      type: 'info',
      duration: 5000,
      showCloseButton: true,
    } as ToastProps;
  }

  /**
   * Показать toast с типом success
   * @param message - сообщение
   * @param title - заголовок (опционально)
   * @param duration - длительность в мс
   */
  public static showSuccess(message: string, title?: string, duration?: number): void {
    const toast = new Toast({
      type: 'success',
      message,
      title: title ?? 'Успех',
      duration: duration ?? 5000,
    });
    toast.open();
  }

  /**
   * Показать toast с типом error
   * @param message - сообщение
   * @param title - заголовок (опционально)
   * @param duration - длительность в мс
   */
  public static showError(message: string, title?: string, duration?: number): void {
    const toast = new Toast({
      type: 'error',
      message,
      title: title ?? 'Ошибка',
      duration: duration ?? 7000,
    });
    toast.open();
  }

  /**
   * Показать toast с типом warning
   * @param message - сообщение
   * @param title - заголовок (опционально)
   * @param duration - длительность в мс
   */
  public static showWarning(message: string, title?: string, duration?: number): void {
    const toast = new Toast({
      type: 'warning',
      message,
      title: title ?? 'Внимание',
      duration: duration ?? 5000,
    });
    toast.open();
  }

  /**
   * Показать toast с типом info
   * @param message - сообщение
   * @param title - заголовок (опционально)
   * @param duration - длительность в мс
   */
  public static showInfo(message: string, title?: string, duration?: number): void {
    const toast = new Toast({
      type: 'info',
      message,
      title: title ?? 'Информация',
      duration: duration ?? 5000,
    });
    toast.open();
  }

  /**
   * Отрендерить элемент тоста
   * @returns Элемент контейнера
   */
  public render(): HTMLDivElement {
    const {
      type, title, message, testId,
    } = this.props;

    this.element = this.createElement('div', {
      className: 'toast',
      'data-testid': testId ?? `toast-${type}`,
      'data-type': type!,
    }) as HTMLDivElement;

    // Иконка (безопасное создание SVG)
    const iconContainer = this.createElement('div', {
      className: 'toast__icon',
    });
    const iconSvg = this.createSVGFromString(ICONS[type!]);
    if (iconSvg) {
      iconContainer.appendChild(iconSvg);
    }
    this.element.appendChild(iconContainer);

    // Контент
    const content = this.createElement('div', {
      className: 'toast__content',
    });

    if (title) {
      const titleEl = this.createElement(
        'div',
        {
          className: 'toast__title',
        },
        [title],
      );
      content.appendChild(titleEl);
    }

    const messageEl = this.createElement(
      'div',
      {
        className: 'toast__message',
      },
      [message],
    );
    content.appendChild(messageEl);

    this.element.appendChild(content);

    // Кнопка закрытия (безопасное создание SVG)
    if (this.props.showCloseButton) {
      const closeBtn = this.createElement('button', {
        className: 'toast__close',
        type: 'button',
        'aria-label': 'Закрыть уведомление',
      });

      const closeIconSvg = this.createSVGFromString(`
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
             stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      `);
      if (closeIconSvg) {
        closeBtn.appendChild(closeIconSvg);
      }

      this.addEventListener(closeBtn, 'click', () => this.close());
      this.element.appendChild(closeBtn);
    }

    return this.element as HTMLDivElement;
  }

  /**
   * Открыть тост (добавить в DOM и запустить таймер)
   */
  public open(): void {
    if (!this.element) {
      this.render();
    }

    // Создать контейнер тостов если не существует
    let container = document.getElementById('toast-container');
    if (!container) {
      container = this.createElement('div', {
        id: 'toast-container',
        className: 'toast-container',
      });
      document.body.appendChild(container);
    }

    // Добавить тост в контейнер
    if (this.element) {
      container.appendChild(this.element);
    }

    // Запустить таймер автозакрытия
    if (this.props.duration && this.props.duration > 0) {
      this.autoCloseTimer = setTimeout(() => {
        this.close();
      }, this.props.duration);
    }

    // Добавить анимацию появления
    requestAnimationFrame(() => {
      this.element?.classList.add('toast--visible');
    });
  }

  /**
   * Закрыть тост
   */
  public close(): void {
    if (this.autoCloseTimer) {
      clearTimeout(this.autoCloseTimer);
      this.autoCloseTimer = null;
    }

    if (this.element) {
      this.element.classList.remove('toast--visible');
      this.element.classList.add('toast--closing');

      // Удалить после анимации
      setTimeout(() => {
        this.element?.remove();
        this.props.onClose?.();
      }, 300);
    }
  }

  /**
   * Уничтожить компонент
   */
  public destroy(): void {
    if (this.autoCloseTimer) {
      clearTimeout(this.autoCloseTimer);
    }
    super.destroy();
  }
}
