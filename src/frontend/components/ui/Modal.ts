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
export type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

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
  /** Размер модального окна */
  size?: ModalSize;
  /** Тип анимации */
  animation?: ModalAnimation;
  /** Открыто ли модальное окно */
  isOpen?: boolean;
  /** Показать кнопку закрытия */
  showClose?: boolean;
  /** Закрыть по клику на фон */
  closeOnBackdrop?: boolean;
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
 * SVG иконка закрытия
 */
const CLOSE_ICON = `
  <svg class="modal__close-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
`;

/**
 * Класс компонента модального окна
 * 
 * @example
 * ```typescript
 * // Создание модального окна
 * const modal = new Modal({
 *   title: 'Подтверждение',
 *   size: 'md',
 *   animation: 'scale',
 *   onClose: () => console.log('Modal closed')
 * });
 * 
 * // Добавление содержимого
 * modal.setContent('<p>Вы уверены?</p>');
 * 
 * // Открытие
 * modal.open();
 * ```
 */
export class Modal extends Component<ModalProps> {
  /** Элемент фона */
  private backdrop: HTMLDivElement | null = null;
  
  /** Элемент содержимого модального окна */
  private modalElement: HTMLDivElement | null = null;
  
  /** Ранее сфокусированный элемент */
  private previousFocus: HTMLElement | null = null;
  
  /** Элементы для focus trap */
  private focusableElements: HTMLElement[] = [];
  
  /** Первый фокусируемый элемент */
  private firstFocusable: HTMLElement | null = null;
  
  /** Последний фокусируемый элемент */
  private lastFocusable: HTMLElement | null = null;
  
  /** Уникальный ID для aria-labelledby */
  private titleId: string;

  /**
   * Получить пропсы по умолчанию
   */
  protected getDefaultProps(): ModalProps {
    return {
      ...super.getDefaultProps(),
      size: 'md',
      animation: 'scale',
      isOpen: false,
      showClose: true,
      closeOnBackdrop: true,
      closeOnEscape: true,
    };
  }

  /**
   * Создать экземпляр модального окна
   */
  constructor(props: ModalProps) {
    super(props);
    // Генерируем уникальный ID для заголовка
    this.titleId = `modal-title-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Отрендерить модальное окно
   * @returns Элемент фона
   */
  public render(): HTMLDivElement {
    const { testId, isOpen } = this.props;
    
    // Создать фон
    this.backdrop = this.createElement('div', {
      className: `modal-backdrop${isOpen ? ' modal-backdrop--visible' : ''}`,
      'aria-hidden': !isOpen,
      'data-testid': testId ? `${testId}-backdrop` : 'modal-backdrop',
    });
    
    // Создать модальное окно
    this.modalElement = this.createModal();
    this.backdrop.appendChild(this.modalElement);
    
    // Добавить слушатели событий
    if (this.props.closeOnBackdrop) {
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
    const { size, modalClass, isOpen, title, animation, testId } = this.props;
    
    // Построить классы модального окна
    const classes = ['modal', `modal--${size}`];
    
    // Добавить класс анимации
    if (animation !== 'none') {
      classes.push(`modal--animate-${animation}`);
    }
    
    if (modalClass) classes.push(modalClass);
    if (isOpen) classes.push('modal--visible');
    
    // Создать атрибуты
    const attrs: Record<string, string | boolean> = {
      className: classes.join(' '),
      role: 'dialog',
      'aria-modal': 'true',
      'data-testid': testId ?? 'modal',
    };
    
    if (title) {
      attrs['aria-labelledby'] = this.titleId;
    }
    
    const modal = this.createElement('div', attrs);
    
    // Предотвратить всплытие клика
    this.addEventListener(modal, 'click', (e) => e.stopPropagation());
    
    // Добавить заголовок
    if (title || this.props.showClose) {
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
    const { title, showClose } = this.props;
    
    const header = this.createElement('div', { 
      className: 'modal__header',
      'data-testid': 'modal-header',
    });
    
    // Добавить заголовок
    if (title) {
      const titleElement = this.createElement(
        'h2',
        {
          className: 'modal__title',
          id: this.titleId,
        },
        [title]
      );
      header.appendChild(titleElement);
    }
    
    // Добавить кнопку закрытия
    if (showClose) {
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
    const button = this.createElement(
      'button',
      {
        type: 'button',
        className: 'modal__close',
        'aria-label': 'Закрыть модальное окно',
        'data-testid': 'modal-close',
      }
    );
    
    // Добавить иконку закрытия
    button.innerHTML = CLOSE_ICON;
    
    this.addEventListener(button, 'click', this.close);
    
    return button;
  }

  /**
   * Обработать клик на фон
   * @param event - Событие клика
   */
  private handleBackdropClick = (event: MouseEvent): void => {
    if (event.target === this.backdrop) {
      this.close();
    }
  };

  /**
   * Обработать нажатие клавиши
   * @param event - Событие клавиатуры
   */
  private handleKeyDown = (event: KeyboardEvent): void => {
    if (event.key === 'Escape' && this.props.isOpen) {
      this.close();
    }
    
    // Focus trap - Tab
    if (event.key === 'Tab' && this.props.isOpen) {
      this.handleTabKey(event);
    }
  };

  /**
   * Обработать клавишу Tab для focus trap
   * @param event - Событие клавиатуры
   */
  private handleTabKey(event: KeyboardEvent): void {
    if (!this.modalElement) return;
    
    // Обновляем список фокусируемых элементов
    this.updateFocusableElements();
    
    if (this.focusableElements.length === 0) return;
    
    if (event.shiftKey) {
      // Shift + Tab
      if (document.activeElement === this.firstFocusable) {
        event.preventDefault();
        this.lastFocusable?.focus();
      }
    } else {
      // Tab
      if (document.activeElement === this.lastFocusable) {
        event.preventDefault();
        this.firstFocusable?.focus();
      }
    }
  }

  /**
   * Обновить список фокусируемых элементов
   */
  private updateFocusableElements(): void {
    if (!this.modalElement) return;
    
    this.focusableElements = Array.from(
      this.modalElement.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input:not([disabled]), ' +
        'select:not([disabled]), textarea:not([disabled]), ' +
        '[tabindex]:not([tabindex="-1"]):not([disabled])'
      )
    );
    
    this.firstFocusable = this.focusableElements[0] || null;
    this.lastFocusable = this.focusableElements[this.focusableElements.length - 1] || null;
  }

  /**
   * Открыть модальное окно
   */
  public open(): void {
    if (this.backdrop && this.modalElement) {
      // Сохранить текущий фокус
      this.previousFocus = document.activeElement as HTMLElement;
      
      // Показать модальное окно с анимацией
      // Сначала показываем backdrop
      this.backdrop.classList.add('modal-backdrop--visible');
      
      // Затем с небольшой задержкой показываем модальное окно
      // Это создаёт плавную анимацию
      requestAnimationFrame(() => {
        this.modalElement?.classList.add('modal--visible');
      });
      
      this.backdrop.setAttribute('aria-hidden', 'false');
      
      // Заблокировать прокрутку страницы
      document.body.classList.add('modal-open');
      
      // Сфокусировать первый фокусируемый элемент после анимации
      setTimeout(() => {
        this.updateFocusableElements();
        this.focusFirst();
      }, 150);
      
      this.props.isOpen = true;
      
      // Вызвать обработчик открытия
      if (this.props.onOpen) {
        this.props.onOpen();
      }
    }
  }

  /**
   * Закрыть модальное окно
   */
  public close = (): void => {
    if (this.backdrop && this.modalElement) {
      // Сначала скрываем модальное окно
      this.modalElement.classList.remove('modal--visible');
      
      // Затем с задержкой скрываем backdrop
      setTimeout(() => {
        this.backdrop?.classList.remove('modal-backdrop--visible');
        this.backdrop?.setAttribute('aria-hidden', 'true');
      }, 150);
      
      // Разблокировать прокрутку страницы
      document.body.classList.remove('modal-open');
      
      // Восстановить фокус
      if (this.previousFocus) {
        this.previousFocus.focus();
      }
      
      this.props.isOpen = false;
      
      // Вызвать обработчик закрытия
      if (this.props.onClose) {
        this.props.onClose();
      }
    }
  };

  /**
   * Сфокусировать первый фокусируемый элемент
   */
  private focusFirst(): void {
    if (this.firstFocusable) {
      this.firstFocusable.focus();
    } else if (this.modalElement) {
      // Если нет фокусируемых элементов, фокусируем само модальное окно
      this.modalElement.setAttribute('tabindex', '-1');
      this.modalElement.focus();
    }
  }

  /**
   * Установить содержимое модального окна
   * @param content - Элемент содержимого или строка
   */
  public setContent(content: Element | string): void {
    if (!this.modalElement) return;
    
    const body = this.modalElement.querySelector('.modal__body');
    if (body) {
      body.innerHTML = '';
      
      if (typeof content === 'string') {
        body.innerHTML = content;
      } else {
        body.appendChild(content);
      }
      
      // Обновляем список фокусируемых элементов
      this.updateFocusableElements();
    }
  }

  /**
   * Установить футер модального окна
   * @param content - Содержимое футера
   */
  public setFooter(content: Element | string): void {
    if (!this.modalElement) return;
    
    const footer = this.modalElement.querySelector('.modal__footer');
    if (footer) {
      footer.innerHTML = '';
      
      if (typeof content === 'string') {
        footer.innerHTML = content;
      } else {
        footer.appendChild(content);
      }
      
      // Обновляем список фокусируемых элементов
      this.updateFocusableElements();
    }
  }

  /**
   * Получить элемент тела модального окна
   * @returns Элемент тела
   */
  public getBody(): HTMLDivElement | null {
    return this.modalElement?.querySelector('.modal__body') || null;
  }

  /**
   * Получить элемент футера модального окна
   * @returns Элемент футера
   */
  public getFooter(): HTMLDivElement | null {
    return this.modalElement?.querySelector('.modal__footer') || null;
  }

  /**
   * Переключить видимость модального окна
   */
  public toggle(): void {
    if (this.props.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  /**
   * Проверить, открыто ли модальное окно
   * @returns Открыто ли модальное окно
   */
  public isOpen(): boolean {
    return this.props.isOpen || false;
  }

  /**
   * Установить заголовок модального окна
   * @param title - Новый заголовок
   */
  public setTitle(title: string): void {
    if (!this.modalElement) return;
    
    const titleElement = this.modalElement.querySelector('.modal__title');
    if (titleElement) {
      titleElement.textContent = title;
    }
  }

  /**
   * Очистка при отмонтировании
   */
  protected onUnmounted(): void {
    document.removeEventListener('keydown', this.handleKeyDown);
    document.body.classList.remove('modal-open');
    super.onUnmounted();
  }
}

/**
 * Фабрика создания элемента модального окна
 * @param props - Пропсы модального окна
 * @returns Элемент фона модального окна
 */
export function createModal(props: ModalProps): HTMLDivElement {
  const modal = new Modal(props);
  return modal.render();
}
