/**
 * Компонент модального окна аутентификации - Фронтенд L_Shop
 * Модальное окно с формами входа/регистрации и анимированным переключением вкладок
 * 
 * @see src/frontend/styles/components/modal.css - стили модального окна
 * @see src/frontend/styles/components/forms.css - стили форм
 * @see docs/DESIGN_SYSTEM.md - документация дизайн-системы
 */

import { Component, ComponentProps } from '../base/Component.js';
import { Modal } from '../ui/Modal.js';
import { LoginForm } from './LoginForm.js';
import { RegisterForm } from './RegisterForm.js';
import { store } from '../../store/store.js';

/**
 * Режим модального окна аутентификации
 */
export type AuthMode = 'login' | 'register';

/**
 * Свойства модального окна аутентификации
 */
export interface AuthModalProps extends ComponentProps {
  /** Начальный режим */
  initialMode?: AuthMode;
  /** Callback при успешной аутентификации */
  onAuth?: () => void;
}

/**
 * Компонент модального окна аутентификации
 * Содержит формы входа и регистрации с анимированным переключением вкладок
 * 
 * @example
 * ```typescript
 * const authModal = new AuthModal({
 *   initialMode: 'login',
 *   onAuth: () => console.log('Пользователь аутентифицирован')
 * });
 * 
 * // Открыть модальное окно
 * authModal.open();
 * 
 * // Переключиться на регистрацию
 * authModal.setMode('register');
 * ```
 */
export class AuthModal extends Component<AuthModalProps> {
  /** Экземпляр модального окна */
  private modal: Modal | null = null;
  
  /** Текущий режим */
  private mode: AuthMode;
  
  /** Форма входа */
  private loginForm: LoginForm | null = null;
  
  /** Форма регистрации */
  private registerForm: RegisterForm | null = null;
  
  /** Кнопки вкладок */
  private tabButtons: Map<string, HTMLButtonElement> = new Map();
  
  /** Элемент-контейнер формы */
  private formContainer: HTMLDivElement | null = null;
  
  /** Идёт ли анимация в данный момент */
  private isAnimating: boolean = false;

  /**
   * Создать модальное окно аутентификации
   */
  constructor(props: Partial<AuthModalProps> = {}) {
    super(props);
    this.mode = this.props.initialMode || 'login';
  }

  /**
   * Получить свойства по умолчанию
   */
  protected getDefaultProps(): AuthModalProps {
    return {
      ...super.getDefaultProps(),
      initialMode: 'login',
    };
  }

  /**
   * Отрендерить модальное окно аутентификации
   * @returns Элемент-фон модального окна
   */
  public render(): HTMLDivElement {
    // Создать модальное окно
    this.modal = new Modal({
      size: 'sm',
      modalClass: 'modal--auth',
      showClose: true,
      closeOnBackdrop: true,
      closeOnEscape: true,
      testId: 'auth-modal',
      onClose: () => this.handleClose(),
    });
    
    const modalElement = this.modal.render();
    
    // Создать контент
    const content = this.createContent();
    this.modal.setContent(content);
    
    this.element = modalElement;
    return modalElement;
  }

  /**
   * Создать контент модального окна
   * @returns Элемент контента
   */
  private createContent(): HTMLDivElement {
    const container = this.createElement('div', {
      className: 'auth-modal',
    });
    
    // Создать вкладки
    const tabs = this.createTabs();
    container.appendChild(tabs);
    
    // Создать контейнер формы с анимационной обёрткой
    this.formContainer = this.createElement('div', {
      className: 'auth-modal__form-container',
      'data-testid': 'auth-form-container',
    });
    
    // Создать формы
    this.loginForm = new LoginForm({
      onSuccess: () => this.handleAuthSuccess(),
      onSwitchToRegister: () => this.switchToRegister(),
    });
    
    this.registerForm = new RegisterForm({
      onSuccess: () => this.handleAuthSuccess(),
      onSwitchToLogin: () => this.switchToLogin(),
    });
    
    // Показать начальную форму
    if (this.mode === 'login') {
      this.formContainer.appendChild(this.loginForm.render());
    } else {
      this.formContainer.appendChild(this.registerForm.render());
    }
    
    container.appendChild(this.formContainer);
    
    return container;
  }

  /**
   * Создать кнопки вкладок
   * @returns Контейнер вкладок
   */
  private createTabs(): HTMLDivElement {
    const tabs = this.createElement('div', {
      className: 'auth-form__tabs',
      role: 'tablist',
      'aria-label': 'Выбор формы авторизации',
    });
    
    // Вкладка входа
    const loginTab = this.createElement(
      'button',
      {
        type: 'button',
        className: `auth-form__tab${this.mode === 'login' ? ' auth-form__tab--active' : ''}`,
        role: 'tab',
        'aria-selected': String(this.mode === 'login'),
        'aria-controls': 'login-panel',
        'data-testid': 'tab-login',
      },
      ['Вход']
    );
    this.addEventListener(loginTab, 'click', () => this.switchToLogin());
    this.tabButtons.set('login', loginTab);
    tabs.appendChild(loginTab);
    
    // Вкладка регистрации
    const registerTab = this.createElement(
      'button',
      {
        type: 'button',
        className: `auth-form__tab${this.mode === 'register' ? ' auth-form__tab--active' : ''}`,
        role: 'tab',
        'aria-selected': String(this.mode === 'register'),
        'aria-controls': 'register-panel',
        'data-testid': 'tab-register',
      },
      ['Регистрация']
    );
    this.addEventListener(registerTab, 'click', () => this.switchToRegister());
    this.tabButtons.set('register', registerTab);
    tabs.appendChild(registerTab);
    
    // Индикатор вкладки (анимированное подчёркивание)
    const indicator = this.createElement('div', {
      className: 'auth-form__tab-indicator',
    });
    tabs.appendChild(indicator);
    
    // Установить начальную позицию индикатора
    requestAnimationFrame(() => {
      this.updateTabIndicator(false);
    });
    
    return tabs;
  }

  /**
   * Обновить позицию индикатора вкладки
   * @param animate - Нужно ли анимировать переход
   */
  private updateTabIndicator(animate: boolean = true): void {
    const indicator = this.element?.querySelector('.auth-form__tab-indicator') as HTMLElement | null;
    const activeTab = this.tabButtons.get(this.mode);
    
    if (indicator && activeTab) {
      const tabRect = activeTab.getBoundingClientRect();
      const tabsRect = activeTab.parentElement?.getBoundingClientRect();
      
      if (tabsRect) {
        const left = activeTab.offsetLeft;
        const width = tabRect.width;
        
        indicator.style.setProperty('--indicator-left', `${left}px`);
        indicator.style.setProperty('--indicator-width', `${width}px`);
        
        if (!animate) {
          indicator.classList.add('auth-form__tab-indicator--no-transition');
          requestAnimationFrame(() => {
            indicator.classList.remove('auth-form__tab-indicator--no-transition');
          });
        }
      }
    }
  }

  /**
   * Переключиться на режим входа
   */
  private switchToLogin(): void {
    if (this.mode === 'login' || this.isAnimating) return;
    
    this.mode = 'login';
    this.updateTabs();
    this.animateFormSwitch('login');
  }

  /**
   * Переключиться на режим регистрации
   */
  private switchToRegister(): void {
    if (this.mode === 'register' || this.isAnimating) return;
    
    this.mode = 'register';
    this.updateTabs();
    this.animateFormSwitch('register');
  }

  /**
   * Обновить состояния кнопок вкладок
   */
  private updateTabs(): void {
    this.tabButtons.forEach((button, key) => {
      const isActive = key === this.mode;
      button.classList.toggle('auth-form__tab--active', isActive);
      button.setAttribute('aria-selected', String(isActive));
    });
    
    // Обновить позицию индикатора
    this.updateTabIndicator();
  }

  /**
   * Анимировать переключение формы
   * @param newMode - Новый режим для отображения
   */
  private animateFormSwitch(newMode: AuthMode): void {
    const container = this.formContainer;
    if (!container) return;
    
    this.isAnimating = true;
    
    // Добавить класс анимации выхода
    container.classList.add('auth-modal__form-container--exit');
    
    // Ждать завершения анимации выхода
    setTimeout(() => {
      // Очистить контейнер
      container.innerHTML = '';
      
      // Добавить класс анимации входа
      container.classList.remove('auth-modal__form-container--exit');
      container.classList.add('auth-modal__form-container--enter');
      
      // Добавить соответствующую форму
      if (newMode === 'login' && this.loginForm) {
        const formElement = this.loginForm.getElement() || this.loginForm.render();
        formElement.setAttribute('id', 'login-panel');
        formElement.setAttribute('role', 'tabpanel');
        formElement.setAttribute('aria-labelledby', 'tab-login');
        container.appendChild(formElement);
      } else if (newMode === 'register' && this.registerForm) {
        const formElement = this.registerForm.getElement() || this.registerForm.render();
        formElement.setAttribute('id', 'register-panel');
        formElement.setAttribute('role', 'tabpanel');
        formElement.setAttribute('aria-labelledby', 'tab-register');
        container.appendChild(formElement);
      }
      
      // Удалить класс анимации входа после завершения анимации
      setTimeout(() => {
        container.classList.remove('auth-modal__form-container--enter');
        this.isAnimating = false;
      }, 200);
    }, 150);
  }

  /**
   * Обновить отображаемую форму (без анимации)
   */
  private updateForm(): void {
    if (!this.formContainer) return;
    
    // Очистить контейнер
    this.formContainer.innerHTML = '';
    
    // Добавить соответствующую форму
    if (this.mode === 'login' && this.loginForm) {
      this.formContainer.appendChild(this.loginForm.getElement() || this.loginForm.render());
    } else if (this.mode === 'register' && this.registerForm) {
      this.formContainer.appendChild(this.registerForm.getElement() || this.registerForm.render());
    }
  }

  /**
   * Обработать успешную аутентификацию
   */
  private handleAuthSuccess(): void {
    // Закрыть модальное окно
    this.close();
    
    // Вызвать callback
    if (this.props.onAuth) {
      this.props.onAuth();
    }
  }

  /**
   * Обработать закрытие модального окна
   */
  private handleClose(): void {
    // Сбросить формы
    if (this.loginForm) {
      this.loginForm.reset();
    }
    if (this.registerForm) {
      this.registerForm.reset();
    }
    
    // Закрыть модальное окно в store
    store.closeModal();
  }

  /**
   * Открыть модальное окно
   * @param mode - Опциональный режим для открытия
   */
  public open(mode?: AuthMode): void {
    if (mode && mode !== this.mode) {
      this.mode = mode;
      this.updateTabs();
      this.updateForm();
    }
    
    if (this.modal) {
      this.modal.open();
    }
  }

  /**
   * Закрыть модальное окно
   */
  public close(): void {
    if (this.modal) {
      this.modal.close();
    }
  }

  /**
   * Переключить видимость модального окна
   */
  public toggle(): void {
    if (this.modal) {
      this.modal.toggle();
    }
  }

  /**
   * Проверить, открыто ли модальное окно
   * @returns Открыто ли модальное окно
   */
  public isOpen(): boolean {
    return this.modal?.isOpen() || false;
  }

  /**
   * Установить режим
   * @param mode - Режим аутентификации
   */
  public setMode(mode: AuthMode): void {
    if (this.mode !== mode && !this.isAnimating) {
      this.mode = mode;
      this.updateTabs();
      this.animateFormSwitch(mode);
    }
  }

  /**
   * Получить текущий режим
   * @returns Текущий режим аутентификации
   */
  public getMode(): AuthMode {
    return this.mode;
  }
}
