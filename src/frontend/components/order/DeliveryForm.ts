/**
 * Форма доставки - L_Shop Frontend
 * Вариант 24: Добавлены поля deliveryType и comment
 */

import { Component, ComponentProps } from '../base/Component';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Toast } from '../ui/Toast';
import { CreateOrderData, PaymentMethod, DeliveryType } from '../../types/order';

/**
 * Пропсы формы доставки
 */
export interface DeliveryFormProps extends ComponentProps {
  /** Callback при отправке формы */
  onSubmit: (data: CreateOrderData) => Promise<void>;
  /** Начальные значения */
  initialValues?: Partial<CreateOrderData>;
  /** Заблокирована ли форма */
  disabled?: boolean;
}

/**
 * Состояние формы доставки
 */
export interface DeliveryFormState {
  /** Загрузка */
  loading: boolean;
  /** Ошибки валидации по полям */
  errors: Record<string, string>;
  /** Общая ошибка */
  generalError: string | null;
}

/**
 * Форма оформления доставки
 */
export class DeliveryForm extends Component<DeliveryFormProps> {
  private state: DeliveryFormState = {
    loading: false,
    errors: {},
    generalError: null,
  };

  // Ссылки на поля формы (optional, инициализируются в render)
  private firstNameInput?: Input;

  private addressInput?: Input;

  private phoneInput?: Input;

  private emailInput?: Input;

  private commentInput?: Input;

  private paymentSelect?: HTMLSelectElement;

  private deliveryTypeSelect?: HTMLSelectElement;

  private submitButton?: Button;

  protected getDefaultProps(): DeliveryFormProps {
    return {
      ...super.getDefaultProps(),
      className: 'delivery-form',
      onSubmit: async () => {},
    };
  }

  public render(): HTMLElement {
    const form = this.createElement('form', {
      className: 'delivery-form',
    });

    // Заголовок
    const title = this.createElement(
      'h2',
      {
        className: 'delivery-form__title',
      },
      ['Данные для доставки'],
    );
    form.appendChild(title);

    // Поле имени
    this.firstNameInput = new Input({
      className: 'delivery-form__input',
      id: 'delivery-firstName',
      placeholder: 'Имя получателя *',
      type: 'text',
      required: true,
      disabled: this.props.disabled,
    });
    const firstNameGroup = this.createFormGroup(
      'delivery-firstName',
      'Имя',
      this.firstNameInput.render(),
    );
    form.appendChild(firstNameGroup);

    // Поле адреса
    this.addressInput = new Input({
      className: 'delivery-form__input',
      id: 'delivery-address',
      placeholder: 'Адрес доставки *',
      type: 'text',
      required: true,
      disabled: this.props.disabled,
    });
    const addressGroup = this.createFormGroup(
      'delivery-address',
      'Адрес доставки',
      this.addressInput.render(),
    );
    form.appendChild(addressGroup);

    // Поле телефона
    this.phoneInput = new Input({
      className: 'delivery-form__input',
      id: 'delivery-phone',
      placeholder: '+375 (29) XXX-XX-XX',
      type: 'tel',
      required: true,
      disabled: this.props.disabled,
    });
    const phoneGroup = this.createFormGroup(
      'delivery-phone',
      'Телефон',
      this.phoneInput.render(),
    );
    form.appendChild(phoneGroup);

    // Добавляем обработчик маски телефона
    this.setupPhoneMask();

    // Поле email
    this.emailInput = new Input({
      className: 'delivery-form__input',
      id: 'delivery-email',
      placeholder: 'email@example.com',
      type: 'email',
      required: true,
      disabled: this.props.disabled,
    });
    const emailGroup = this.createFormGroup(
      'delivery-email',
      'Email',
      this.emailInput.render(),
    );
    form.appendChild(emailGroup);

    // Вариант 24: Выбор типа доставки
    const deliveryTypeGroup = this.createDeliveryTypeSelect();
    form.appendChild(deliveryTypeGroup);

    // Выбор способа оплаты
    const paymentGroup = this.createPaymentSelect();
    form.appendChild(paymentGroup);

    // Вариант 24: Поле комментария
    this.commentInput = new Input({
      className: 'delivery-form__input delivery-form__input--textarea',
      id: 'delivery-comment',
      placeholder: 'Комментарий к заказу (необязательно)',
      type: 'text',
      disabled: this.props.disabled,
    });
    const commentGroup = this.createFormGroup(
      'delivery-comment',
      'Комментарий',
      this.commentInput.render(),
    );
    commentGroup.classList.add('delivery-form__group--full');
    form.appendChild(commentGroup);

    // Отображение ошибок
    const errorContainer = this.createElement('div', {
      className: 'delivery-form__error-container',
    });
    form.appendChild(errorContainer);

    // Кнопка отправки
    this.submitButton = new Button({
      className: 'delivery-form__submit btn btn--primary',
      text: 'Подтвердить заказ',
      disabled: this.props.disabled || this.state.loading,
    });
    form.appendChild(this.submitButton.render());

    // Обработчик отправки
    this.addEventListener(form, 'submit', (e) => this.handleSubmit(e));

    return form;
  }

  /**
   * Создать группу поля формы
   */
  private createFormGroup(id: string, label: string, input: HTMLElement): HTMLElement {
    const group = this.createElement('div', {
      className: 'delivery-form__group',
    });

    const labelEl = this.createElement(
      'label',
      {
        className: 'delivery-form__label',
        for: id,
      },
      [label],
    );
    group.appendChild(labelEl);
    group.appendChild(input);

    // Контейнер для ошибки
    const errorEl = this.createElement('span', {
      className: 'delivery-form__field-error',
      id: `${id}-error`,
    });
    group.appendChild(errorEl);

    return group;
  }

  /**
   * Создать выбор типа доставки (Вариант 24)
   */
  private createDeliveryTypeSelect(): HTMLElement {
    const group = this.createElement('div', {
      className: 'delivery-form__group',
    });

    const label = this.createElement(
      'label',
      {
        className: 'delivery-form__label',
        for: 'delivery-type',
      },
      ['Тип доставки'],
    );
    group.appendChild(label);

    this.deliveryTypeSelect = this.createElement('select', {
      className: 'delivery-form__select',
      id: 'delivery-type',
      name: 'deliveryType',
    }) as HTMLSelectElement;

    // Опции типа доставки
    const options: { value: DeliveryType; label: string }[] = [
      { value: 'courier', label: 'Курьером' },
      { value: 'pickup', label: 'Самовывоз' },
    ];

    options.forEach((opt) => {
      const option = this.createElement(
        'option',
        {
          value: opt.value,
        },
        [opt.label],
      ) as HTMLOptionElement;
      this.deliveryTypeSelect?.appendChild(option);
    });

    group.appendChild(this.deliveryTypeSelect);
    return group;
  }

  /**
   * Создать выбор способа оплаты
   */
  private createPaymentSelect(): HTMLElement {
    const group = this.createElement('div', {
      className: 'delivery-form__group',
    });

    const label = this.createElement(
      'label',
      {
        className: 'delivery-form__label',
        for: 'payment-method',
      },
      ['Способ оплаты'],
    );
    group.appendChild(label);

    this.paymentSelect = this.createElement('select', {
      className: 'delivery-form__select',
      id: 'payment-method',
      name: 'paymentMethod',
      required: 'true',
    }) as HTMLSelectElement;

    // Опции способа оплаты
    const options: { value: PaymentMethod; label: string }[] = [
      { value: 'cash', label: 'Наличными при получении' },
      { value: 'card', label: 'Картой при получении' },
      { value: 'online', label: 'Онлайн оплата' },
    ];

    options.forEach((opt) => {
      const option = this.createElement(
        'option',
        {
          value: opt.value,
        },
        [opt.label],
      ) as HTMLOptionElement;
      this.paymentSelect?.appendChild(option);
    });

    group.appendChild(this.paymentSelect);
    return group;
  }

  /**
   * Обработчик отправки формы
   */
  private async handleSubmit(e: Event): Promise<void> {
    e.preventDefault();

    // Очистить предыдущие ошибки
    this.clearErrors();

    // Получить значения формы
    const data: CreateOrderData = {
      firstName: this.firstNameInput?.getValue() ?? '',
      deliveryAddress: this.addressInput?.getValue() ?? '',
      phone: this.phoneInput?.getValue() ?? '',
      email: this.emailInput?.getValue() ?? '',
      paymentMethod: (this.paymentSelect?.value ?? 'cash') as PaymentMethod,
      deliveryType: (this.deliveryTypeSelect?.value ?? 'courier') as DeliveryType,
      comment: this.commentInput?.getValue() ?? '',
    };

    // Валидация
    const errors = this.validate(data);
    if (Object.keys(errors).length > 0) {
      this.showErrors(errors);
      return;
    }

    // Отправить форму
    this.setState({ loading: true });
    this.submitButton?.disable();

    try {
      await this.props.onSubmit(data);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Ошибка при оформлении заказа';
      this.setState({
        loading: false,
        generalError: message,
      });
      this.submitButton?.enable();
      this.updateGeneralError();
      // Показать уведомление об ошибке
      Toast.showError(message);
    }
  }

  /**
   * Валидация формы
   */
  private validate(data: CreateOrderData): Record<string, string> {
    const errors: Record<string, string> = {};

    if (!data.firstName.trim()) {
      errors.firstName = 'Укажите имя';
    }

    if (!data.deliveryAddress.trim()) {
      errors.address = 'Укажите адрес доставки';
    }

    if (!data.phone.trim()) {
      errors.phone = 'Укажите телефон';
    } else {
      // Удаляем все нечисловые символы для валидации
      const digitsOnly = data.phone.replace(/\D/g, '');
      if (digitsOnly.length < 10 || digitsOnly.length > 15) {
        errors.phone = 'Номер телефона должен содержать от 10 до 15 цифр';
      }
    }

    if (!data.email.trim()) {
      errors.email = 'Укажите email';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      errors.email = 'Некорректный формат email';
    }

    return errors;
  }

  /**
   * Показать ошибки валидации
   */
  private showErrors(errors: Record<string, string>): void {
    Object.entries(errors).forEach(([field, message]) => {
      const errorEl = document.getElementById(`${field}-error`);
      if (errorEl) {
        errorEl.textContent = message;
      }

      const inputEl = document.getElementById(field);
      if (inputEl) {
        inputEl.classList.add('input--error');
      }
    });
  }

   /**
    * Очистить ошибки
    */
   private clearErrors(): void {
     // Очистить тексты ошибок
     document.querySelectorAll('.delivery-form__field-error').forEach((el) => {
       el.textContent = '';
     });

     // Убрать класс ошибки с полей
     document.querySelectorAll('.input--error').forEach((el) => {
       el.classList.remove('input--error');
     });

    this.state.generalError = null;
    const errorContainer = this.element?.querySelector('.delivery-form__error-container');
    if (errorContainer) {
      errorContainer.textContent = '';
    }
  }

  /**
   * Обновить отображение общей ошибки
   */
  private updateGeneralError(): void {
    const errorContainer = this.element?.querySelector('.delivery-form__error-container');
    if (errorContainer && this.state.generalError) {
      errorContainer.textContent = this.state.generalError;
      errorContainer.classList.add('delivery-form__error-container--visible');
    }
  }

  /**
   * Установить состояние
   */
  private setState(newState: Partial<DeliveryFormState>): void {
    this.state = { ...this.state, ...newState };
  }

  /**
   * Настроить маску телефона для поля phoneInput
   * Формат: +375 (29) XXX-XX-XX
   */
  private setupPhoneMask(): void {
    const input = this.phoneInput?.getInputElement();
    if (!input) {
      return;
    }

    // Обработчик ввода
    const onInput = (e: Event): void => {
      const target = e.target as HTMLInputElement;
      let value = target.value.replace(/\D/g, ''); // Оставляем только цифры

      // Ограничиваем до 13 цифр (375 + 2 + 7)
      if (value.length > 13) {
        value = value.slice(0, 13);
      }

      // Форматируем
      let formatted = '';
      if (value.length > 0) {
        // Код страны: +375
        if (value.length >= 3) {
          formatted = `+${value.slice(0, 3)}`;
        } else {
          formatted = `+${value}`;
        }

        // Код оператора: (29)
        if (value.length >= 5) {
          formatted += ` (${value.slice(3, 5)}`;
        } else if (value.length > 3) {
          formatted += ` (${value.slice(3)}`;
        }

        // Номер: XXX-XX-XX
        if (value.length >= 7) {
          const rest = value.slice(5, 13);
          formatted += `) ${rest.slice(0, 3)}`;
          if (rest.length > 3) {
            formatted += `-${rest.slice(3, 5)}`;
          }
          if (rest.length > 5) {
            formatted += `-${rest.slice(5, 7)}`;
          }
        } else if (value.length > 5) {
          formatted += `) ${value.slice(5)}`;
        } else if (value.length > 3) {
          formatted += ')';
        }
      }

      target.value = formatted;
    };

    // Обработчик фокуса - показываем маску если поле пустое
    const onFocus = (): void => {
      if (!input.value) {
        input.value = '+375 (29)';
      }
    };

    // Обработчик потери фокуса - валидация
    const onBlur = (): void => {
      const value = input.value.replace(/\D/g, '');
      if (value.length < 13) {
        new Toast({
          type: 'error',
          title: 'Ошибка валидации',
          message: 'Введите полный номер телефона в формате +375 (29) XXX-XX-XX',
          duration: 5000,
        }).open();
        input.focus();
      }
    };

    this.addEventListener(input, 'input', onInput);
    this.addEventListener(input, 'focus', onFocus);
    this.addEventListener(input, 'blur', onBlur);
  }
}
