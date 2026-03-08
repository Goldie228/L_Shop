/**
 * Компонент Modal - L_Shop Frontend
 * Переиспользуемое модальное окно с анимациями и accessibility
 *
 * @see src/frontend/styles/components/modal.css - стили модального окна
 * @see docs/DESIGN_SYSTEM.md - документация дизайн-системы
 */

import { Component, ComponentProps } from '../base/Component.js';

/**
 * Типы размеров модального окна
 */
export type ModalSize = 'small' | 'medium' | 'large' | 'fullscreen';

/**
 * Типы состояний модального окна
 */
export type ModalState = 'open' | 'closing' | 'closed';

/**
 * Типы анимаций модального окна
 */
export type ModalAnimation = 'scale' | 'slide-up' | 'fade' | 'none';

/**
 * Интерфейс пропсов модального окна
 */
export interface ModalProps extends ComponentProps {
  /** Заголовок модального окна */
  title?: string;
  /** SVG иконка для заголовка (inline SVG строка) */
  icon?: string;
  /** Размер модального окна */
  size?: ModalSize;
  /** Тип анимации */
  animation?: ModalAnimation;
  /** Закрыть по клику на overlay */
  closeOnOverlayClick?: boolean;
  /** Показать кнопку закрытия */
  showCloseButton?: boolean;
  /** Закрыть по клавише Escape */
  closeOnEscape?: boolean;
  /** Кастомный класс модального окна */
  modalClass?: string;
  /** Идентификатор для тестирования */
  testId?: string;
  /** Обработчик закрытия */
  onClose?: () => void;
  /** Обработчик открытия */
  onOpen?: () => void;
}

/**
 * SVG иконка закрытия по умолчанию
 */
const DEFAULT_CLOSE_ICON = `
  <svg class="modal__close-icon" viewBox="0 0 24 24"
       fill="none" stroke="currentColor" stroke-width="2"
       stroke-linecap="round" stroke-linejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
`;

/**
 * Класс компонента модального окна
 *
 * Поддерживает:
 * - Различные размеры (small, medium, large, fullscreen)
 * - Анимации появления (scale, slide-up, fade, none)
 * - Focus trap и доступность (a11y)
 * - Закрытие по Escape и клику на overlay
 * - Блокировку скролла body
 * - Вложенные модалки (stacking context)
 *
 * @example
 * ```typescript
 * // Создание модального окна
 * const modal = new Modal({
 *   title: 'Подтверждение',
 *   size: 'medium',
 *   animation: 'scale',
 *   onClose: () => console.log('Modal closed')
 * });
 *
 * // Добавление содержимого
 * modal.setContent(document.createElement('div'));
 *
 * // Открытие
 * modal.open();
 * ```
 */
export class Modal extends Component<ModalProps> {
  /** Элемент фона (overlay) */
  private backdrop: HTMLDivElement | null = null;

  /** Элемент содержимого модального окна */
  private modalElement: HTMLDivElement | null = null;

  /** Элемент, который открыл модалку (для возврата фокуса) */
  private triggerElement: HTMLElement | null = null;

  /** Элементы для focus trap */
  private focusableElements: HTMLElement[] = [];

  /** Первый фокусируемый элемент */
  private firstFocusable: HTMLElement | null = null;

  /** Последний фокусируемый элемент */
  private lastFocusable: HTMLElement | null = null;

  /** Уникальный ID для aria-labelledby */
  private titleId: string;

  /** Текущее состояние модалки */
  private state: ModalState = 'closed';

  /**
   * Получить пропсы по умолчанию
   */
  protected getDefaultProps(): ModalProps {
    return {
      ...super.getDefaultProps(),
      size: 'medium',
      animation: 'scale',
      closeOnOverlayClick: true,
      showCloseButton: true,
      closeOnEscape: true,
    };
  }

  /**
   * Создать экземпляр модального окна
   * @param props - Пропсы компонента
   */
  constructor(props: Partial<ModalProps>) {
    super(props);
    this.titleId = `modal-title-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Отрендерить модальное окно
   * @returns Элемент фона (overlay)
   */
  public render(): HTMLDivElement {
    const { testId } = this.props;

    // Создать overlay
    this.backdrop = this.createElement('div', {
      className: 'modal-backdrop',
      'aria-hidden': 'true',
      'data-testid': testId ? `${testId}-backdrop` : 'modal-backdrop',
    });

    // Создать модальное окно
    this.modalElement = this.createModal();
    this.backdrop.appendChild(this.modalElement);

    // Добавить слушатели событий
    if (this.props.closeOnOverlayClick) {
      this.addEventListener(this.backdrop, 'click', this.handleBackdropClick);
    }

    if (this.props.closeOnEscape) {
      document.addEventListener('keydown', this.handleKeyDown);
    }

    this.element = this.backdrop;
    return this.backdrop;
  }

  /**
   * Создать элемент модального окна
   * @returns Элемент модального окна
   */
  private createModal(): HTMLDivElement {
    const {
      size, modalClass, title, animation, testId, showCloseButton,
    } = this.props;
    // Построить классы
    const classes = ['modal', `modal--${size}`];

    // Добавить класс анимации
    if (animation !== 'none') {
      classes.push(`modal--animate-${animation}`);
    }

    if (modalClass) classes.push(modalClass);

    const attrs: Record<string, string | boolean> = {
      className: classes.join(' '),
      role: 'dialog',
      'aria-modal': 'true',
      'data-testid': testId ?? 'modal',
    };

    // Добавить aria-labelledby только если есть заголовок
    if (title) {
      attrs['aria-labelledby'] = this.titleId;
    }

    const modal = this.createElement('div', attrs);

    // Предотвратить всплытие клика
    this.addEventListener(modal, 'click', (e) => e.stopPropagation());

    // Добавить заголовок
    if (title || showCloseButton) {
      const header = this.createHeader();
      modal.appendChild(header);
    }

    // Добавить слот для тела
    const body = this.createElement('div', {
      className: 'modal__body',
      'data-testid': 'modal-body',
    });
    modal.appendChild(body);

    // Добавить слот для футера (опционально)
    const footer = this.createElement('div', {
      className: 'modal__footer',
      'data-testid': 'modal-footer',
    });
    modal.appendChild(footer);

    return modal;
  }

  /**
   * Создать заголовок модального окна
   * @returns Элемент заголовка
   */
  private createHeader(): HTMLDivElement {
    const { title, showCloseButton, icon } = this.props;

    const header = this.createElement('div', {
      className: 'modal__header',
      'data-testid': 'modal-header',
    });

    // Контейнер для иконки и заголовка
    const titleContainer = this.createElement('div', {
      className: 'modal__title-container',
    });

    // Добавить иконку безопасным способом
    if (icon) {
      const iconElement = this.createElement('div', {
        className: 'modal__icon',
      });

      // Парсим и sanitizуем SVG строку
      const svg = this.createSVGFromString(icon);
      if (svg) {
        iconElement.appendChild(svg);
      }

      titleContainer.appendChild(iconElement);
    }

    // Добавить заголовок
    if (title) {
      const titleElement = this.createElement(
        'h2',
        {
          className: 'modal__title',
          id: this.titleId,
        },
        [title],
      );
      titleContainer.appendChild(titleElement);
    }

    header.appendChild(titleContainer);

    // Добавить кнопку закрытия
    if (showCloseButton) {
      const closeButton = this.createCloseButton();
      header.appendChild(closeButton);
    }

    return header;
  }

  /**
   * Создать кнопку закрытия
   * @returns Элемент кнопки закрытия
   */
  private createCloseButton(): HTMLButtonElement {
    const button = this.createElement('button', {
      className: 'modal__close',
      type: 'button',
      'aria-label': 'Закрыть модальное окно',
    }) as HTMLButtonElement;

    // Безопасно вставить SVG иконку
    const iconSvg = this.props.icon || DEFAULT_CLOSE_ICON;
    const svg = this.createSVGFromString(iconSvg);
    if (svg) {
      button.appendChild(svg);
    }

    this.addEventListener(button, 'click', this.handleClose);
    return button;
  }

  /**
   * Обработчик клика по backdrop
   */
  private handleBackdropClick = (): void => {
    if (this.props.closeOnOverlayClick && this.state === 'open') {
      this.close();
    }
  };

  /**
   * Обработчик закрытия (по клику на кнопку)
   */
  private handleClose = (): void => {
    this.close();
  };

  /**
   * Обработчик нажатия клавиш
   */
  private handleKeyDown = (event: KeyboardEvent): void => {
    if (this.state !== 'open') return;

    if (event.key === 'Escape' && this.props.closeOnEscape) {
      this.close();
    }

    // Focus trap
    if (event.key === 'Tab' && this.modalElement) {
      this.handleTabKey(event);
    }
  };

  /**
   * Обработчик клавиши Tab для focus trap
   */
  private handleTabKey(event: KeyboardEvent): void {
    if (!this.modalElement) return;

    // Найти все фокусируемые элементы
    this.updateFocusableElements();

    if (this.focusableElements.length === 0) return;

    const isShiftPressed = event.shiftKey;

    if (isShiftPressed && document.activeElement === this.firstFocusable) {
      event.preventDefault();
      this.lastFocusable?.focus();
    } else if (!isShiftPressed && document.activeElement === this.lastFocusable) {
      event.preventDefault();
      this.firstFocusable?.focus();
    }
  }

  /**
   * Обновить список фокусируемых элементов
   */
  private updateFocusableElements(): void {
    if (!this.modalElement) return;

    const focusableSelectors = [
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      'a[href]',
      '[tabindex]:not([tabindex="-1"])',
    ];

    this.focusableElements = Array.from(
      this.modalElement.querySelectorAll<HTMLElement>(focusableSelectors.join(', ')),
    ).filter((el) => {
      const style = window.getComputedStyle(el);
      return style.display !== 'none' && style.visibility !== 'hidden';
    });

    if (this.focusableElements.length > 0) {
      const [first, ...rest] = this.focusableElements;
      this.firstFocusable = first;
      this.lastFocusable = rest.length > 0 ? rest[rest.length - 1] : first;
    }
  }

  /**
   * Открыть модальное окно
   */
  public open(): void {
    if (this.state === 'open') return;

    // Сохранить элемент, который открыл модалку
    this.triggerElement = document.activeElement as HTMLElement;

    // Монтировать если ещё не смонтировано
    if (!this.element || !this.modalElement) {
      this.render();
    }

    // Добавить в DOM если не добавлен
    if (this.element && !this.element.parentNode) {
      document.body.appendChild(this.element);
    }

    // Заблокировать скролл body
    document.body.classList.add('modal-open');

    // Показать overlay
    if (this.backdrop) {
      this.backdrop.setAttribute('aria-hidden', 'false');
    }

    // Показать модалку с анимацией
    this.state = 'open';
    if (this.modalElement) {
      this.modalElement.classList.add('modal--visible');
    }

    // Вызвать onOpen колбэк
    this.props.onOpen?.();

    // Установить фокус на первый элемент
    setTimeout(() => {
      this.updateFocusableElements();
      this.firstFocusable?.focus();
    }, 50);
  }

  /**
   * Закрыть модальное окно
   */
  public close(): void {
    if (this.state !== 'open') return;

    this.state = 'closing';

    // Убрать класс видимости для запуска анимации
    if (this.modalElement) {
      this.modalElement.classList.remove('modal--visible');
    }

    // Ждём завершения анимации (300ms)
    setTimeout(() => {
      this.finishClose();
    }, 300);
  }

  /**
   * Завершить закрытие и очистить DOM
   */
  private finishClose(): void {
    // Удалить из DOM
    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }

    // Разблокировать скролл
    document.body.classList.remove('modal-open');

    // Удалить обработчик клавиатуры
    document.removeEventListener('keydown', this.handleKeyDown);

    // Сбросить состояние
    this.state = 'closed';
    this.backdrop = null;
    this.modalElement = null;

    // Вернуть фокус к триггеру
    if (this.triggerElement) {
      this.triggerElement.focus();
      this.triggerElement = null;
    }

    // Вызвать onClose колбэк
    this.props.onClose?.();
  }

  /**
   * Полная очистка компонента
   */
  public destroy(): void {
    // Убрать слушатели событий
    if (this.props.closeOnEscape) {
      document.removeEventListener('keydown', this.handleKeyDown);
    }

    // Завершить закрытие если открыто
    if (this.state === 'open' || this.state === 'closing') {
      this.state = 'closed';
      if (this.element && this.element.parentNode) {
        this.element.parentNode.removeChild(this.element);
      }
      document.body.classList.remove('modal-open');
    }

    // Вызвать unmount базового класса
    super.unmount();
  }

  /**
   * Установить содержимое модального окна
   * @param content - HTMLElement для вставки в body модалки
   */
  public setContent(content: HTMLElement): void {
    if (!this.modalElement) {
      throw new Error('Modal не смонтирован. Сначала вызовите render() или open()');
    }

    // Найти body контейнер
    const body = this.modalElement.querySelector('.modal__body');
    if (body) {
      // Очистить предыдущее содержимое безопасным способом
      while (body.firstChild) {
        body.removeChild(body.firstChild);
      }
      body.appendChild(content);
    }
  }

  /**
   * Получить текущее состояние
   * @returns Текущее состояние модалки
   */
  public getState(): ModalState {
    return this.state;
  }

  /**
   * Проверить, открыта ли модалка
   * @returns true если модалка открыта
   */
  public isOpen(): boolean {
    return this.state === 'open';
  }

  /**
   * Переключить состояние модального окна
   * Если открыто - закрывает, если закрыто - открывает
   */
  public toggle(): void {
    if (this.state === 'open') {
      this.close();
    } else {
      this.open();
    }
  }
}
