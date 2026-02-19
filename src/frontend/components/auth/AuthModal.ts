/**
 * Auth Modal Component - L_Shop Frontend
 * Modal with login/register forms and animated tab switching
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
 * Auth modal mode
 */
export type AuthMode = 'login' | 'register';

/**
 * Auth modal props
 */
export interface AuthModalProps extends ComponentProps {
  /** Initial mode */
  initialMode?: AuthMode;
  /** Callback on successful auth */
  onAuth?: () => void;
}

/**
 * Auth modal component
 * Contains login and register forms with animated tab switching
 * 
 * @example
 * ```typescript
 * const authModal = new AuthModal({
 *   initialMode: 'login',
 *   onAuth: () => console.log('User authenticated')
 * });
 * 
 * // Open modal
 * authModal.open();
 * 
 * // Switch to register
 * authModal.setMode('register');
 * ```
 */
export class AuthModal extends Component<AuthModalProps> {
  /** Modal instance */
  private modal: Modal | null = null;
  
  /** Current mode */
  private mode: AuthMode;
  
  /** Login form */
  private loginForm: LoginForm | null = null;
  
  /** Register form */
  private registerForm: RegisterForm | null = null;
  
  /** Tab buttons */
  private tabButtons: Map<string, HTMLButtonElement> = new Map();
  
  /** Form container element */
  private formContainer: HTMLDivElement | null = null;
  
  /** Is currently animating */
  private isAnimating: boolean = false;

  /**
   * Create auth modal
   */
  constructor(props: Partial<AuthModalProps> = {}) {
    super(props);
    this.mode = this.props.initialMode || 'login';
  }

  /**
   * Get default props
   */
  protected getDefaultProps(): AuthModalProps {
    return {
      ...super.getDefaultProps(),
      initialMode: 'login',
    };
  }

  /**
   * Render auth modal
   * @returns Modal backdrop element
   */
  public render(): HTMLDivElement {
    // Create modal
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
    
    // Create content
    const content = this.createContent();
    this.modal.setContent(content);
    
    this.element = modalElement;
    return modalElement;
  }

  /**
   * Create modal content
   * @returns Content element
   */
  private createContent(): HTMLDivElement {
    const container = this.createElement('div', {
      className: 'auth-modal',
    });
    
    // Create tabs
    const tabs = this.createTabs();
    container.appendChild(tabs);
    
    // Create form container with animation wrapper
    this.formContainer = this.createElement('div', {
      className: 'auth-modal__form-container',
      'data-testid': 'auth-form-container',
    });
    
    // Create forms
    this.loginForm = new LoginForm({
      onSuccess: () => this.handleAuthSuccess(),
      onSwitchToRegister: () => this.switchToRegister(),
    });
    
    this.registerForm = new RegisterForm({
      onSuccess: () => this.handleAuthSuccess(),
      onSwitchToLogin: () => this.switchToLogin(),
    });
    
    // Show initial form
    if (this.mode === 'login') {
      this.formContainer.appendChild(this.loginForm.render());
    } else {
      this.formContainer.appendChild(this.registerForm.render());
    }
    
    container.appendChild(this.formContainer);
    
    return container;
  }

  /**
   * Create tab buttons
   * @returns Tabs container
   */
  private createTabs(): HTMLDivElement {
    const tabs = this.createElement('div', {
      className: 'auth-form__tabs',
      role: 'tablist',
      'aria-label': 'Выбор формы авторизации',
    });
    
    // Login tab
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
    
    // Register tab
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
    
    // Tab indicator (animated underline)
    const indicator = this.createElement('div', {
      className: 'auth-form__tab-indicator',
    });
    tabs.appendChild(indicator);
    
    // Set initial indicator position
    requestAnimationFrame(() => {
      this.updateTabIndicator(false);
    });
    
    return tabs;
  }

  /**
   * Update tab indicator position
   * @param animate - Whether to animate the transition
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
   * Switch to login mode
   */
  private switchToLogin(): void {
    if (this.mode === 'login' || this.isAnimating) return;
    
    this.mode = 'login';
    this.updateTabs();
    this.animateFormSwitch('login');
  }

  /**
   * Switch to register mode
   */
  private switchToRegister(): void {
    if (this.mode === 'register' || this.isAnimating) return;
    
    this.mode = 'register';
    this.updateTabs();
    this.animateFormSwitch('register');
  }

  /**
   * Update tab button states
   */
  private updateTabs(): void {
    this.tabButtons.forEach((button, key) => {
      const isActive = key === this.mode;
      button.classList.toggle('auth-form__tab--active', isActive);
      button.setAttribute('aria-selected', String(isActive));
    });
    
    // Update indicator position
    this.updateTabIndicator();
  }

  /**
   * Animate form switch
   * @param newMode - New mode to show
   */
  private animateFormSwitch(newMode: AuthMode): void {
    const container = this.formContainer;
    if (!container) return;
    
    this.isAnimating = true;
    
    // Add exit animation class
    container.classList.add('auth-modal__form-container--exit');
    
    // Wait for exit animation
    setTimeout(() => {
      // Clear container
      container.innerHTML = '';
      
      // Add enter animation class
      container.classList.remove('auth-modal__form-container--exit');
      container.classList.add('auth-modal__form-container--enter');
      
      // Add appropriate form
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
      
      // Remove enter animation class after animation completes
      setTimeout(() => {
        container.classList.remove('auth-modal__form-container--enter');
        this.isAnimating = false;
      }, 200);
    }, 150);
  }

  /**
   * Update displayed form (without animation)
   */
  private updateForm(): void {
    if (!this.formContainer) return;
    
    // Clear container
    this.formContainer.innerHTML = '';
    
    // Add appropriate form
    if (this.mode === 'login' && this.loginForm) {
      this.formContainer.appendChild(this.loginForm.getElement() || this.loginForm.render());
    } else if (this.mode === 'register' && this.registerForm) {
      this.formContainer.appendChild(this.registerForm.getElement() || this.registerForm.render());
    }
  }

  /**
   * Handle successful authentication
   */
  private handleAuthSuccess(): void {
    // Close modal
    this.close();
    
    // Call callback
    if (this.props.onAuth) {
      this.props.onAuth();
    }
  }

  /**
   * Handle modal close
   */
  private handleClose(): void {
    // Reset forms
    if (this.loginForm) {
      this.loginForm.reset();
    }
    if (this.registerForm) {
      this.registerForm.reset();
    }
    
    // Close modal in store
    store.closeModal();
  }

  /**
   * Open modal
   * @param mode - Optional mode to open with
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
   * Close modal
   */
  public close(): void {
    if (this.modal) {
      this.modal.close();
    }
  }

  /**
   * Toggle modal visibility
   */
  public toggle(): void {
    if (this.modal) {
      this.modal.toggle();
    }
  }

  /**
   * Check if modal is open
   * @returns Whether modal is open
   */
  public isOpen(): boolean {
    return this.modal?.isOpen() || false;
  }

  /**
   * Set mode
   * @param mode - Auth mode
   */
  public setMode(mode: AuthMode): void {
    if (this.mode !== mode && !this.isAnimating) {
      this.mode = mode;
      this.updateTabs();
      this.animateFormSwitch(mode);
    }
  }

  /**
   * Get current mode
   * @returns Current auth mode
   */
  public getMode(): AuthMode {
    return this.mode;
  }
}
