/**
 * Компонент ConfirmModal - L_Shop Frontend
 * Модальное окно для подтверждения действий
 *
 * @example
 * ```typescript
 * const confirmModal = new ConfirmModal({
 *   message: 'Вы уверены?',
 *   title: 'Подтверждение',
 * });
 *
 * const result = await confirmModal.show();
 * if (result) {
 *   // Пользователь подтвердил
 * }
 * ```
 */

import { Component, ComponentProps } from '../base/Component.js';
import { Modal } from './Modal.js';
import { Button } from './Button.js';

/**
 * Пропсы компонента ConfirmModal
 */
export interface ConfirmModalProps extends ComponentProps {
  /** Текст сообщения для подтверждения */
  message: string;
  /** Заголовок модального окна */
  title?: string;
  /** Текст кнопки подтверждения */
  confirmText?: string;
  /** Текст кнопки отмены */
  cancelText?: string;
  /** Размер модального окна */
  size?: 'small' | 'medium' | 'large' | 'fullscreen';
}

/**
 * Класс компонента ConfirmModal
 *
 * Предоставляет удобный интерфейс для подтверждения действий
 * с использованием Promise API.
 */
export class ConfirmModal extends Component<ConfirmModalProps> {
  private modal: Modal | null = null;

  private resolve: ((value: boolean) => void) | null = null;

  /**
   * Показать модальное окно подтверждения
   * @returns Promise<boolean> - true если подтверждено, false если отменено
   */
  public show(): Promise<boolean> {
    return new Promise((resolve) => {
      this.resolve = resolve;
      this.modal?.open();
    });
  }

  /**
   * Закрыть модальное окно (программно)
   */
  public close(): void {
    this.modal?.close();
    this.resolve?.(false);
  }

  public override render(): HTMLElement {
    const {
      message,
      title = 'Подтверждение',
      confirmText = 'Подтвердить',
      cancelText = 'Отмена',
      size = 'medium',
    } = this.props;

    // Создаем модальное окно с onClose колбэком
    this.modal = new Modal({
      title,
      size,
      animation: 'scale',
      showCloseButton: false,
      closeOnOverlayClick: false,
      onClose: () => this.handleClose(),
    });

    // Контейнер содержимого
    const content = this.createElement('div', {
      className: 'confirm-modal__content',
    });

    // Сообщение
    const messageEl = this.createElement('p', {
      className: 'confirm-modal__message',
    }, [message]);
    content.appendChild(messageEl);

    // Кнопки
    const buttons = this.createElement('div', {
      className: 'confirm-modal__buttons',
    });

    const cancelButton = new Button({
      text: cancelText,
      variant: 'outline',
      size: 'md',
      onClick: () => this.handleCancel(),
    });
    buttons.appendChild(cancelButton.render());

    const confirmButton = new Button({
      text: confirmText,
      variant: 'primary',
      size: 'md',
      onClick: () => this.handleConfirm(),
    });
    buttons.appendChild(confirmButton.render());

    content.appendChild(buttons);
    this.modal.setContent(content);

    return this.modal.render();
  }

  /**
   * Обработчик закрытия модального окна (через onClose)
   */
  private handleClose(): void {
    this.resolve?.(false);
  }

  /**
   * Обработчик нажатия на кнопку подтверждения
   */
  private handleConfirm(): void {
    this.modal?.close();
    this.resolve?.(true);
  }

  /**
   * Обработчик нажатия на кнопку отмены
   */
  private handleCancel(): void {
    this.modal?.close();
    this.resolve?.(false);
  }
}
