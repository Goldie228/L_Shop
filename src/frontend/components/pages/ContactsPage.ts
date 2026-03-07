/**
 * Страница "Контакты" - L_Shop Frontend
 * Контактная информация компании с формой обратной связи
 */

import { Component, ComponentProps } from '../base/Component';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Modal } from '../ui/Modal';

/**
 * Пропсы страницы "Контакты"
 */
export interface ContactsPageProps extends ComponentProps {
  // Пока нет пропсов
}

/**
 * Интерфейс ошибок валидации формы
 */
interface FormErrors {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
}

/**
 * SVG Иконки для карточек контактов
 */
const ICONS = {
  address: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>`,
  phone: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>`,
  email: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>`,
  clock: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>`,
  map: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"></polygon><line x1="8" y1="2" x2="8" y2="18"></line><line x1="16" y1="6" x2="16" y2="22"></line></svg>`,
  check: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`,
};

/**
 * Контактная информация компании
 */
const COMPANY_INFO = {
  address: 'г. Минск, ул. Примерная, д. 123',
  phone: '+375 (29) 123-45-67',
  email: 'info@lshop.by',
  hoursWeekday: 'Пн–Пт: 9:00–21:00',
  hoursWeekend: 'Сб–Вс: 10:00–20:00',
};

/**
 * Страница "Контакты"
 */
export class ContactsPage extends Component<ContactsPageProps> {
  private formData = {
    name: '',
    email: '',
    subject: '',
    message: '',
  };

  private formErrors: FormErrors = {};
  private modal: Modal | null = null;
  private inputInstances: Map<string, Input> = new Map();

  constructor(props: ContactsPageProps = {}) {
    super(props);
  }

  protected getDefaultProps(): ContactsPageProps {
    return {
      ...super.getDefaultProps(),
      className: 'contacts-page',
    };
  }

  public render(): HTMLElement {
    const container = this.createElement('div', {
      className: 'contacts-page',
    });

    const innerContainer = this.createElement('div', {
      className: 'container',
    });

    // Заголовок
    const title = this.createElement('h1', {
      className: 'page-title',
    }, ['Контакты']);
    innerContainer.appendChild(title);

    // Контактная информация
    const contactsSection = this.createContactsSection();
    innerContainer.appendChild(contactsSection);

    // Секция карты
    const mapSection = this.createMapSection();
    innerContainer.appendChild(mapSection);

    // Форма обратной связи
    const feedbackSection = this.createFeedbackSection();
    innerContainer.appendChild(feedbackSection);

    container.appendChild(innerContainer);

    return container;
  }

  /**
   * Создать секцию с контактной информацией
   */
  private createContactsSection(): HTMLElement {
    const section = this.createElement('section', {
      className: 'contacts-page__section',
    });

    const sectionTitle = this.createElement('h2', {
      className: 'contacts-page__section-title',
    }, ['Свяжитесь с нами']);
    section.appendChild(sectionTitle);

    const contactsGrid = this.createElement('div', {
      className: 'contacts-page__grid',
    });

    // Адрес
    const addressCard = this.createContactCard(
      ICONS.address,
      'Адрес',
      [COMPANY_INFO.address]
    );
    contactsGrid.appendChild(addressCard);

    // Телефон
    const phoneCard = this.createContactCard(
      ICONS.phone,
      'Телефон',
      [COMPANY_INFO.phone]
    );
    contactsGrid.appendChild(phoneCard);

    // Email
    const emailCard = this.createContactCard(
      ICONS.email,
      'Email',
      [COMPANY_INFO.email]
    );
    contactsGrid.appendChild(emailCard);

    // Время работы
    const hoursCard = this.createContactCard(
      ICONS.clock,
      'Время работы',
      [COMPANY_INFO.hoursWeekday, COMPANY_INFO.hoursWeekend]
    );
    contactsGrid.appendChild(hoursCard);

    section.appendChild(contactsGrid);
    return section;
  }

  /**
   * Создать секцию с картой
   */
  private createMapSection(): HTMLElement {
    const section = this.createElement('section', {
      className: 'contacts-page__section contacts-page__map-section',
    });

    const sectionTitle = this.createElement('h2', {
      className: 'contacts-page__section-title',
    }, ['Мы на карте']);
    section.appendChild(sectionTitle);

    const mapContainer = this.createElement('div', {
      className: 'contacts-page__map-container',
    });

    // Заглушка карты (iframe карты можно добавить позже)
    const mapPlaceholder = this.createElement('div', {
      className: 'contacts-page__map-placeholder',
    });

    const mapIcon = this.createElement('div', {
      className: 'contacts-page__map-placeholder-icon',
    });
    mapIcon.innerHTML = ICONS.map;
    mapPlaceholder.appendChild(mapIcon);

    const mapText = this.createElement('p', {
      className: 'contacts-page__map-placeholder-text',
    }, ['г. Минск, ул. Примерная, д. 123']);
    mapPlaceholder.appendChild(mapText);

    mapContainer.appendChild(mapPlaceholder);

    section.appendChild(mapContainer);
    return section;
  }

  /**
   * Создать секцию с формой обратной связи
   */
  private createFeedbackSection(): HTMLElement {
    const section = this.createElement('section', {
      className: 'contacts-page__section',
    });

    const sectionTitle = this.createElement('h2', {
      className: 'contacts-page__section-title',
    }, ['Обратная связь']);
    section.appendChild(sectionTitle);

    const feedbackText = this.createElement('p', {
      className: 'contacts-page__text',
    }, [
      'Есть вопросы или предложения? Напишите нам! Мы ответим в течение 24 часов.'
    ]);
    section.appendChild(feedbackText);

    const form = this.renderForm();
    section.appendChild(form);

    // Создаём модальное окно для подтверждения
    this.modal = new Modal({
      title: 'Сообщение отправлено',
      size: 'sm',
      animation: 'scale',
      closeOnBackdrop: true,
      closeOnEscape: true,
    });
    section.appendChild(this.modal.render());

    return section;
  }

  /**
   * Создать карточку контакта с SVG иконкой
   */
  private createContactCard(iconSvg: string, title: string, lines: string[]): HTMLElement {
    const card = this.createElement('div', {
      className: 'contacts-page__card',
    });

    // Иконка
    const iconDiv = this.createElement('div', {
      className: 'contacts-page__card-icon',
    });
    iconDiv.innerHTML = iconSvg;
    card.appendChild(iconDiv);

    // Заголовок
    const titleEl = this.createElement('h3', {
      className: 'contacts-page__card-title',
    }, [title]);
    card.appendChild(titleEl);

    // Текст (может быть несколько строк)
    const textEl = this.createElement('div', {
      className: 'contacts-page__card-text',
    });
    lines.forEach((line, index) => {
      if (index > 0) {
        const br = this.createElement('br');
        textEl.appendChild(br);
      }
      textEl.appendChild(document.createTextNode(line));
    });
    card.appendChild(textEl);

    return card;
  }

  /**
   * Отрендерить форму обратной связи
   */
  private renderForm(): HTMLElement {
    const form = this.createElement('form', {
      className: 'contacts-page__form',
    });

    const formTitle = this.createElement('h3', {
      className: 'contacts-page__form-title',
    }, ['Напишите нам']);
    form.appendChild(formTitle);

    const formGrid = this.createElement('div', {
      className: 'contacts-page__form-grid',
    });

    // Имя
    const nameInput = new Input({
      name: 'name',
      label: 'Ваше имя',
      placeholder: 'Введите ваше имя',
      required: true,
      minLength: 2,
      size: 'md',
    });
    this.inputInstances.set('name', nameInput);
    formGrid.appendChild(nameInput.render());

    // Email
    const emailInput = new Input({
      name: 'email',
      type: 'email',
      label: 'Email',
      placeholder: 'example@mail.ru',
      required: true,
      size: 'md',
    });
    this.inputInstances.set('email', emailInput);
    formGrid.appendChild(emailInput.render());

    // Тема
    const subjectInput = new Input({
      name: 'subject',
      label: 'Тема',
      placeholder: 'Введите тему сообщения',
      required: true,
      minLength: 5,
      size: 'md',
    });
    this.inputInstances.set('subject', subjectInput);
    formGrid.appendChild(subjectInput.render());

    form.appendChild(formGrid);

    // Сообщение (полноширинное)
    const messageInput = new Input({
      name: 'message',
      label: 'Сообщение',
      placeholder: 'Введите ваше сообщение...',
      required: true,
      minLength: 10,
      size: 'md',
    });
    this.inputInstances.set('message', messageInput);
    form.appendChild(messageInput.render());

    // Блок для отображения ошибок
    const errorsContainer = this.createElement('div', {
      className: 'contacts-page__form-errors',
    });
    form.appendChild(errorsContainer);

    // Кнопки
    const actions = this.createElement('div', {
      className: 'contacts-page__form-actions',
    });

    const submitButton = new Button({
      text: 'Отправить',
      variant: 'primary',
      size: 'lg',
      type: 'submit',
    });
    actions.appendChild(submitButton.render());

    const resetButton = new Button({
      text: 'Очистить',
      variant: 'outline',
      size: 'lg',
      type: 'reset',
    });
    actions.appendChild(resetButton.render());

    form.appendChild(actions);

    // Обработчики событий
    this.addEventListener(form, 'submit', (e) => {
      e.preventDefault();
      this.handleSubmit(form);
    });

    this.addEventListener(form, 'reset', () => {
      this.handleReset(form);
    });

    // Валидация при потере фокуса
    this.inputInstances.forEach((input, fieldName) => {
      const inputElement = input.render().querySelector('input');
      if (inputElement) {
        this.addEventListener(inputElement, 'blur', () => {
          this.validateField(fieldName, inputElement.value);
        });
        this.addEventListener(inputElement, 'input', () => {
          if (this.formErrors[fieldName as keyof FormErrors]) {
            this.validateField(fieldName, inputElement.value);
          }
        });
      }
    });

    return form;
  }

  /**
   * Валидировать поле формы
   */
  private validateField(fieldName: string, value: string): boolean {
    let error: string | undefined;
    const trimmedValue = value.trim();

    switch (fieldName) {
      case 'name':
        if (!trimmedValue) {
          error = 'Поле "Имя" обязательно для заполнения';
        } else if (trimmedValue.length < 2) {
          error = 'Имя должно содержать минимум 2 символа';
        }
        break;

      case 'email':
        if (!trimmedValue) {
          error = 'Поле "Email" обязательно для заполнения';
        } else if (!this.isValidEmail(trimmedValue)) {
          error = 'Введите корректный email адрес';
        }
        break;

      case 'subject':
        if (!trimmedValue) {
          error = 'Поле "Тема" обязательно для заполнения';
        } else if (trimmedValue.length < 5) {
          error = 'Тема должна содержать минимум 5 символов';
        }
        break;

      case 'message':
        if (!trimmedValue) {
          error = 'Поле "Сообщение" обязательно для заполнения';
        } else if (trimmedValue.length < 10) {
          error = 'Сообщение должно содержать минимум 10 символов';
        }
        break;
    }

    this.formErrors[fieldName as keyof FormErrors] = error;

    // Обновляем UI инпута
    const input = this.inputInstances.get(fieldName);
    if (input) {
      input.setProps({
        error: error || undefined,
      });
    }

    return !error;
  }

  /**
   * Проверить email на корректность
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Валидировать всю форму
   */
  private validateForm(): boolean {
    let isValid = true;

    const fields = ['name', 'email', 'subject', 'message'];

    for (const field of fields) {
      const input = this.inputInstances.get(field);
      if (input) {
        const inputElement = input.render().querySelector('input, textarea');
        if (inputElement) {
          const fieldValid = this.validateField(field, (inputElement as HTMLInputElement | HTMLTextAreaElement).value);
          if (!fieldValid) {
            isValid = false;
          }
        }
      }
    }

    return isValid;
  }

  /**
   * Обработать отправку формы
   */
  private handleSubmit(form: HTMLFormElement): void {
    // Валидируем форму
    if (!this.validateForm()) {
      return;
    }

    const formData = new FormData(form);
    const data = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      subject: formData.get('subject') as string,
      message: formData.get('message') as string,
    };

    console.log('[ContactsPage] Форма отправлена:', data);

    // Показываем модальное окно с подтверждением
    this.showSuccessModal();
  }

  /**
   * Показать модальное окно успешной отправки
   */
  private showSuccessModal(): void {
    if (!this.modal) return;

    const successContent = this.createElement('div', {
      className: 'contacts-page__form-success',
    });

    const successIcon = this.createElement('div', {
      className: 'contacts-page__form-success-icon',
    });
    successIcon.innerHTML = ICONS.check;
    successContent.appendChild(successIcon);

    const successTitle = this.createElement('h3', {
      className: 'contacts-page__form-success-title',
    }, ['Спасибо за сообщение!']);
    successContent.appendChild(successTitle);

    const successText = this.createElement('p', {
      className: 'contacts-page__form-success-text',
    }, ['Мы получили ваше сообщение и ответим в течение 24 часов.']);
    successContent.appendChild(successText);

    this.modal.setContent(successContent);
    this.modal.open();
  }

  /**
   * Обработать сброс формы
   */
  private handleReset(form: HTMLFormElement): void {
    // Очищаем ошибки
    this.formErrors = {};
    this.formData = { name: '', email: '', subject: '', message: '' };

    // Сбрасываем инпуты
    this.inputInstances.forEach(input => {
      input.setProps({ error: undefined });
    });

    form.reset();
  }
}
