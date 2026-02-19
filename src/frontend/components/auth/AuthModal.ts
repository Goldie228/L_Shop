/**
 * Auth Modal Component - L_Shop Frontend
 * Modal with login/register forms and tab switching
 */

import { Component, ComponentProps } from '../base/Component';
import { Modal } from '../ui/Modal';
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';
import { store } from '../../store/store';

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
 * Contains login and register forms with tab switching
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
      initialMode: 'login'
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
      onClose: () => this.handleClose()
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
    const container = this.createElement('div');
    
    // Create tabs
    const tabs = this.createTabs();
    container.appendChild(tabs);
    
    // Create form container
    const formContainer = this.createElement('div', {
      className: 'auth-modal__form-container'
    });
    
    // Create forms
    this.loginForm = new LoginForm({
      onSuccess: () => this.handleAuthSuccess(),
      onSwitchToRegister: () => this.switchToRegister()
    });
    
    this.registerForm = new RegisterForm({
      onSuccess: () => this.handleAuthSuccess(),
      onSwitchToLogin: () => this.switchToLogin()
    });
    
    // Show initial form
    if (this.mode === 'login') {
      formContainer.appendChild(this.loginForm.render());
      this.registerForm.render(); // Pre-render but don't attach
    } else {
      formContainer.appendChild(this.registerForm.render());
      this.loginForm.render(); // Pre-render but don't attach
    }
    
    container.appendChild(formContainer);
    
    return container;
  }

  /**
   * Create tab buttons
   * @returns Tabs container
   */
  private createTabs(): HTMLDivElement {
    const tabs = this.createElement('div', {
      className: 'auth-form__tabs'
    });
    
    // Login tab
    const loginTab = this.createElement(
      'button',
      {
        type: 'button',
        className: `auth-form__tab ${this.mode === 'login' ? 'auth-form__tab--active' : ''}`,
        role: 'tab',
        'aria-selected': this.mode === 'login'
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
        className: `auth-form__tab ${this.mode === 'register' ? 'auth-form__tab--active' : ''}`,
        role: 'tab',
        'aria-selected': this.mode === 'register'
      },
      ['Регистрация']
    );
    this.addEventListener(registerTab, 'click', () => this.switchToRegister());
    this.tabButtons.set('register', registerTab);
    tabs.appendChild(registerTab);
    
    return tabs;
  }

  /**
   * Switch to login mode
   */
  private switchToLogin(): void {
    if (this.mode === 'login') return;
    
    this.mode = 'login';
    this.updateTabs();
    this.updateForm();
  }

  /**
   * Switch to register mode
   */
  private switchToRegister(): void {
    if (this.mode === 'register') return;
    
    this.mode = 'register';
    this.updateTabs();
    this.updateForm();
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
  }

  /**
   * Update displayed form
   */
  private updateForm(): void {
    if (!this.modal) return;
    
    const body = this.modal.getBody();
    if (!body) return;
    
    const formContainer = body.querySelector('.auth-modal__form-container');
    if (!formContainer) return;
    
    // Clear container
    formContainer.innerHTML = '';
    
    // Add appropriate form
    if (this.mode === 'login' && this.loginForm) {
      formContainer.appendChild(this.loginForm.getElement() || this.loginForm.render());
    } else if (this.mode === 'register' && this.registerForm) {
      formContainer.appendChild(this.registerForm.getElement() || this.registerForm.render());
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
    if (mode) {
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
    if (this.mode !== mode) {
      this.mode = mode;
      this.updateTabs();
      this.updateForm();
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