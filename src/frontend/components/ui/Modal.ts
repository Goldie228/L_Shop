/**
 * Компонент Modal - L_Shop Frontend
 * Переиспользуемое модальное окно с фоном
 */

import { Component, ComponentProps } from '../base/Component';

/**
 * Типы размеров модального окна
 */
export type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'fullscreen';

/**
 * Интерфейс пропсов модального окна
 */
export interface ModalProps extends ComponentProps {
  /** Заголовок модального окна */
  title?: string;
  /** Размер модального окна */
  size?: ModalSize;
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
  /** Обработчик закрытия */
  onClose?: () => void;
}

/**
 * Класс компонента модального окна
 */
export class Modal extends Component<ModalProps> {
  /** Элемент фона */
  private backdrop: HTMLDivElement | null = null;
  
  /** Элемент содержимого модального окна */
  private modalElement: HTMLDivElement | null = null;
  
  /** Ранее сфокусированный элемент */
  private previousFocus: HTMLElement | null = null;

  /**
   * Получить пропсы по умолчанию
   */
  protected getDefaultProps(): ModalProps {
    return {
      ...super.getDefaultProps(),
      size: 'md',
      isOpen: false,
      showClose: true,
      closeOnBackdrop: true,
      closeOnEscape: true
    };
  }

  /**
   * Отрендерить модальное окно
   * @returns Элемент фона
   */
  public render(): HTMLDivElement {
    // Создать фон
    this.backdrop = this.createElement('div', {
      className: `modal-backdrop ${this.props.isOpen ? 'modal-backdrop--visible' : ''}`,
      'aria-hidden': !this.props.isOpen
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
    const { size, modalClass, isOpen, title } = this.props;
    
    // Построить классы модального окна
    const classes = ['modal'];
    classes.push(`modal--${size}`);
    if (modalClass) classes.push(modalClass);
    if (isOpen) classes.push('modal--visible');
    
    // Создать контейнер модального окна
    const attrs: Record<string, string | boolean> = {
      className: classes.join(' '),
      role: 'dialog',
      'aria-modal': 'true'
    };
    
    if (title) {
      attrs['aria-labelledby'] = 'modal-title';
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
    const body = this.createElement('div', { className: 'modal__body' });
    modal.appendChild(body);
    
    // Добавить слот для футера (опционально)
    const footer = this.createElement('div', { className: 'modal__footer' });
    modal.appendChild(footer);
    
    return modal;
  }

  /**
   * Создать заголовок модального окна
   * @returns Элемент заголовка
   */
  private createHeader(): HTMLDivElement {
    const { title, showClose } = this.props;
    
    const header = this.createElement('div', { className: 'modal__header' });
    
    // Добавить заголовок
    if (title) {
      const titleElement = this.createElement(
        'h2',
        {
          className: 'modal__title',
          id: 'modal-title'
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
        'aria-label': 'Закрыть модальное окно'
      }
    );
    
    // Добавить иконку закрытия
    button.innerHTML = `
      <svg class="modal__close-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
      </svg>
    `;
    
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
  };

  /**
   * Открыть модальное окно
   */
  public open(): void {
    if (this.backdrop && this.modalElement) {
      // Сохранить текущий фокус
      this.previousFocus = document.activeElement as HTMLElement;
      
      // Показать модальное окно
      this.backdrop.classList.add('modal-backdrop--visible');
      this.modalElement.classList.add('modal--visible');
      this.backdrop.setAttribute('aria-hidden', 'false');
      
      // Заблокировать прокрутку страницы
      document.body.classList.add('modal-open');
      
      // Сфокусировать первый фокусируемый элемент
      this.focusFirst();
      
      this.props.isOpen = true;
    }
  }

  /**
   * Закрыть модальное окно
   */
  public close = (): void => {
    if (this.backdrop && this.modalElement) {
      // Скрыть модальное окно
      this.backdrop.classList.remove('modal-backdrop--visible');
      this.modalElement.classList.remove('modal--visible');
      this.backdrop.setAttribute('aria-hidden', 'true');
      
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
    if (!this.modalElement) return;
    
    const focusable = this.modalElement.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    if (focusable.length > 0) {
      focusable[0].focus();
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
