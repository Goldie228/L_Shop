/**
 * Header Component - L_Shop Frontend
 * Site header with navigation, user section, and scroll effects
 * 
 * @see src/frontend/styles/components/header.css - стили хедера
 * @see docs/DESIGN_SYSTEM.md - документация дизайн-системы
 */

import { Component, ComponentProps } from '../base/Component.js';
import { Button } from '../ui/Button.js';
import { store } from '../../store/store.js';
import { User, getUserDisplayInfo } from '../../types/user.js';
import { AuthService } from '../../services/auth.service.js';
import { router } from '../../router/router.js';

/**
 * Header props
 */
export interface HeaderProps extends ComponentProps {
  /** Callback when login button clicked */
  onLoginClick?: () => void;
  /** Threshold for scrolled state in pixels */
  scrollThreshold?: number;
}

/**
 * SVG иконки
 */
const MENU_ICON = `
  <svg class="header__menu-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <line class="header__menu-line header__menu-line--top" x1="3" y1="6" x2="21" y2="6"></line>
    <line class="header__menu-line header__menu-line--middle" x1="3" y1="12" x2="21" y2="12"></line>
    <line class="header__menu-line header__menu-line--bottom" x1="3" y1="18" x2="21" y2="18"></line>
  </svg>
`;

const CHEVRON_DOWN_ICON = `
  <svg class="header__dropdown-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <polyline points="6 9 12 15 18 9"></polyline>
  </svg>
`;

/**
 * Header component class
 * 
 * @example
 * ```typescript
 * const header = new Header({
 *   onLoginClick: () => openAuthModal(),
 *   scrollThreshold: 50
 * });
 * document.body.prepend(header.render());
 * ```
 */
export class Header extends Component<HeaderProps> {
  /** User section element */
  private userSection: HTMLElement | null = null;
  
  /** Mobile menu element */
  private mobileMenu: HTMLElement | null = null;
  
  /** Store unsubscribe function */
  private unsubscribe: (() => void) | null = null;
  
  /** Scroll handler reference */
  private scrollHandler: (() => void) | null = null;
  
  /** User dropdown element */
  private userDropdown: HTMLElement | null = null;
  
  /** Is dropdown open */
  private isDropdownOpen: boolean = false;

  /**
   * Get default props
   */
  protected getDefaultProps(): HeaderProps {
    return {
      ...super.getDefaultProps(),
      scrollThreshold: 50,
    };
  }

  /**
   * Render header
   * @returns Header element
   */
  public render(): HTMLElement {
    const header = this.createElement('header', {
      className: 'header',
      role: 'banner',
      'data-testid': 'header',
    });
    
    const container = this.createElement('div', {
      className: 'header__container',
    });
    
    // Logo
    const logo = this.createLogo();
    container.appendChild(logo);
    
    // Navigation
    const nav = this.createNavigation();
    container.appendChild(nav);
    
    // User section
    this.userSection = this.createUserSection();
    container.appendChild(this.userSection);
    
    // Mobile menu toggle
    const menuToggle = this.createMenuToggle();
    container.appendChild(menuToggle);
    
    header.appendChild(container);
    
    // Mobile menu (separate from container)
    this.mobileMenu = this.createMobileMenu();
    header.appendChild(this.mobileMenu);
    
    this.element = header;
    return header;
  }

  /**
   * Create logo element
   * @returns Logo element
   */
  private createLogo(): HTMLAnchorElement {
    const logo = this.createElement(
      'a',
      {
        href: '/',
        className: 'header__logo',
        'data-testid': 'header-logo',
      },
      [
        `<span class="header__logo-icon">L</span>`,
        `<span>L_Shop</span>`,
      ]
    );
    
    this.addEventListener(logo, 'click', (e) => {
      e.preventDefault();
      router.navigate('/');
    });
    
    return logo;
  }

  /**
   * Create navigation element
   * @returns Navigation element
   */
  private createNavigation(): HTMLElement {
    const nav = this.createElement('nav', {
      className: 'header__nav',
      role: 'navigation',
      'aria-label': 'Main navigation',
    });
    
    const list = this.createElement('ul', {
      className: 'header__nav-list',
    });
    
    // Home link
    const homeItem = this.createElement('li', { className: 'header__nav-item' });
    const homeLink = this.createNavLink('Главная', '/', true);
    homeItem.appendChild(homeLink);
    list.appendChild(homeItem);
    
    nav.appendChild(list);
    return nav;
  }

  /**
   * Create navigation link
   * @param text - Link text
   * @param href - Link href
   * @param isActive - Whether link is active
   * @returns Link element
   */
  private createNavLink(text: string, href: string, isActive: boolean = false): HTMLAnchorElement {
    const link = this.createElement(
      'a',
      {
        href,
        className: `header__nav-link${isActive ? ' header__nav-link--active' : ''}`,
        'data-testid': `nav-link-${text.toLowerCase()}`,
      },
      [text]
    );
    
    this.addEventListener(link, 'click', (e) => {
      e.preventDefault();
      router.navigate(href);
    });
    
    return link;
  }

  /**
   * Create user section
   * @returns User section element
   */
  private createUserSection(): HTMLElement {
    const state = store.getState();
    const section = this.createElement('div', {
      className: 'header__user',
      'data-testid': 'header-user-section',
    });
    
    if (state.user.isAuthenticated && state.user.user) {
      // User is logged in - create dropdown
      const userDropdown = this.createUserDropdown(state.user.user);
      section.appendChild(userDropdown);
    } else {
      // User is not logged in
      const loginButton = new Button({
        text: 'Войти',
        variant: 'primary',
        size: 'sm',
        testId: 'header-login-btn',
        onClick: () => this.handleLoginClick(),
      });
      section.appendChild(loginButton.render());
    }
    
    return section;
  }

  /**
   * Create user dropdown with avatar and menu
   * @param user - User object
   * @returns Dropdown element
   */
  private createUserDropdown(user: User): HTMLElement {
    const info = getUserDisplayInfo(user);
    
    const dropdown = this.createElement('div', {
      className: 'header__user-dropdown',
      'data-testid': 'user-dropdown',
    });
    
    // Trigger button
    const trigger = this.createElement('button', {
      type: 'button',
      className: 'header__user-trigger',
      'aria-expanded': 'false',
      'aria-haspopup': 'true',
      'data-testid': 'user-dropdown-trigger',
    });
    
    // Avatar
    const avatar = this.createElement(
      'span',
      { className: 'header__user-avatar' },
      [info.initials]
    );
    trigger.appendChild(avatar);
    
    // Name
    const name = this.createElement(
      'span',
      { className: 'header__user-name' },
      [info.displayName]
    );
    trigger.appendChild(name);
    
    // Chevron icon
    const chevron = this.createElement('span', { className: 'header__dropdown-chevron' });
    chevron.innerHTML = CHEVRON_DOWN_ICON;
    trigger.appendChild(chevron);
    
    this.addEventListener(trigger, 'click', () => this.toggleDropdown());
    
    dropdown.appendChild(trigger);
    
    // Dropdown menu
    this.userDropdown = this.createElement('div', {
      className: 'header__dropdown-menu',
      role: 'menu',
      'aria-hidden': 'true',
      'data-testid': 'user-dropdown-menu',
    });
    
    // User info in dropdown
    const userInfo = this.createElement('div', { className: 'header__dropdown-user-info' });
    const userName = this.createElement(
      'span',
      { className: 'header__dropdown-user-name' },
      [info.displayName]
    );
    const userEmail = this.createElement(
      'span',
      { className: 'header__dropdown-user-email' },
      [user.email]
    );
    userInfo.appendChild(userName);
    userInfo.appendChild(userEmail);
    this.userDropdown.appendChild(userInfo);
    
    // Divider
    const divider = this.createElement('div', { className: 'header__dropdown-divider' });
    this.userDropdown.appendChild(divider);
    
    // Logout button
    const logoutItem = this.createElement('div', { className: 'header__dropdown-item' });
    const logoutButton = new Button({
      text: 'Выйти',
      variant: 'ghost',
      size: 'sm',
      testId: 'header-logout-btn',
      onClick: () => this.handleLogout(),
    });
    logoutItem.appendChild(logoutButton.render());
    this.userDropdown.appendChild(logoutItem);
    
    dropdown.appendChild(this.userDropdown);
    
    // Close dropdown on outside click
    document.addEventListener('click', (e) => {
      if (this.isDropdownOpen && !dropdown.contains(e.target as Node)) {
        this.closeDropdown();
      }
    });
    
    return dropdown;
  }

  /**
   * Toggle user dropdown
   */
  private toggleDropdown(): void {
    if (this.isDropdownOpen) {
      this.closeDropdown();
    } else {
      this.openDropdown();
    }
  }

  /**
   * Open user dropdown
   */
  private openDropdown(): void {
    if (!this.userDropdown || !this.element) return;
    
    this.isDropdownOpen = true;
    this.userDropdown.classList.add('header__dropdown-menu--open');
    this.userDropdown.setAttribute('aria-hidden', 'false');
    
    const trigger = this.element.querySelector('.header__user-trigger');
    if (trigger) {
      trigger.setAttribute('aria-expanded', 'true');
    }
  }

  /**
   * Close user dropdown
   */
  private closeDropdown(): void {
    if (!this.userDropdown || !this.element) return;
    
    this.isDropdownOpen = false;
    this.userDropdown.classList.remove('header__dropdown-menu--open');
    this.userDropdown.setAttribute('aria-hidden', 'true');
    
    const trigger = this.element.querySelector('.header__user-trigger');
    if (trigger) {
      trigger.setAttribute('aria-expanded', 'false');
    }
  }

  /**
   * Create mobile menu toggle button
   * @returns Toggle button
   */
  private createMenuToggle(): HTMLButtonElement {
    const toggle = this.createElement(
      'button',
      {
        type: 'button',
        className: 'header__menu-toggle',
        'aria-label': 'Открыть меню',
        'aria-expanded': 'false',
        'aria-controls': 'mobile-menu',
        'data-testid': 'mobile-menu-toggle',
      }
    );
    
    toggle.innerHTML = MENU_ICON;
    
    this.addEventListener(toggle, 'click', () => this.toggleMobileMenu());
    
    return toggle;
  }

  /**
   * Create mobile menu
   * @returns Mobile menu element
   */
  private createMobileMenu(): HTMLElement {
    const menu = this.createElement('div', {
      className: 'header__mobile-menu',
      id: 'mobile-menu',
      'aria-hidden': 'true',
      'data-testid': 'mobile-menu',
    });
    
    // Navigation links
    const navList = this.createElement('ul', {
      className: 'header__mobile-nav-list',
    });
    
    const homeItem = this.createElement('li');
    const homeLink = this.createMobileNavLink('Главная', '/');
    homeItem.appendChild(homeLink);
    navList.appendChild(homeItem);
    
    menu.appendChild(navList);
    
    // User section for mobile
    const state = store.getState();
    const mobileUser = this.createElement('div', {
      className: 'header__mobile-user',
    });
    
    if (state.user.isAuthenticated && state.user.user) {
      const info = getUserDisplayInfo(state.user.user);
      
      const userInfo = this.createElement('div', { className: 'header__mobile-user-info' });
      const avatar = this.createElement('span', { className: 'header__user-avatar' }, [info.initials]);
      const name = this.createElement('span', { className: 'header__user-name' }, [info.displayName]);
      userInfo.appendChild(avatar);
      userInfo.appendChild(name);
      mobileUser.appendChild(userInfo);
      
      const logoutButton = new Button({
        text: 'Выйти',
        variant: 'secondary',
        block: true,
        testId: 'mobile-logout-btn',
        onClick: () => this.handleLogout(),
      });
      mobileUser.appendChild(logoutButton.render());
    } else {
      const loginButton = new Button({
        text: 'Войти',
        variant: 'primary',
        block: true,
        testId: 'mobile-login-btn',
        onClick: () => this.handleLoginClick(),
      });
      mobileUser.appendChild(loginButton.render());
    }
    
    menu.appendChild(mobileUser);
    
    return menu;
  }

  /**
   * Create mobile navigation link
   * @param text - Link text
   * @param href - Link href
   * @returns Link element
   */
  private createMobileNavLink(text: string, href: string): HTMLAnchorElement {
    const link = this.createElement(
      'a',
      {
        href,
        className: 'header__mobile-nav-link',
        'data-testid': `mobile-nav-${text.toLowerCase()}`,
      },
      [text]
    );
    
    this.addEventListener(link, 'click', (e) => {
      e.preventDefault();
      this.closeMobileMenu();
      router.navigate(href);
    });
    
    return link;
  }

  /**
   * Toggle mobile menu
   */
  private toggleMobileMenu(): void {
    if (!this.mobileMenu) return;
    
    const isOpen = this.mobileMenu.classList.contains('header__mobile-menu--open');
    
    if (isOpen) {
      this.closeMobileMenu();
    } else {
      this.openMobileMenu();
    }
  }

  /**
   * Open mobile menu
   */
  private openMobileMenu(): void {
    if (!this.mobileMenu || !this.element) return;
    
    this.mobileMenu.classList.add('header__mobile-menu--open');
    this.mobileMenu.setAttribute('aria-hidden', 'false');
    document.body.classList.add('menu-open');
    
    const toggle = this.element.querySelector('.header__menu-toggle');
    if (toggle) {
      toggle.setAttribute('aria-expanded', 'true');
      toggle.setAttribute('aria-label', 'Закрыть меню');
      toggle.classList.add('header__menu-toggle--active');
    }
  }

  /**
   * Close mobile menu
   */
  private closeMobileMenu(): void {
    if (!this.mobileMenu || !this.element) return;
    
    this.mobileMenu.classList.remove('header__mobile-menu--open');
    this.mobileMenu.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('menu-open');
    
    const toggle = this.element.querySelector('.header__menu-toggle');
    if (toggle) {
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'Открыть меню');
      toggle.classList.remove('header__menu-toggle--active');
    }
  }

  /**
   * Handle scroll for header background change
   */
  private handleScroll(): void {
    if (!this.element) return;
    
    const { scrollThreshold } = this.props;
    const isScrolled = window.scrollY > (scrollThreshold ?? 50);
    
    if (isScrolled) {
      this.element.classList.add('header--scrolled');
    } else {
      this.element.classList.remove('header--scrolled');
    }
  }

  /**
   * Handle login button click
   */
  private handleLoginClick(): void {
    this.closeMobileMenu();
    this.closeDropdown();
    
    if (this.props.onLoginClick) {
      this.props.onLoginClick();
    }
  }

  /**
   * Handle logout
   */
  private async handleLogout(): Promise<void> {
    try {
      await AuthService.logout();
      store.setUser(null);
      this.closeMobileMenu();
      this.closeDropdown();
      this.updateUserSection();
    } catch (error) {
      console.error('[Header] Logout error:', error);
    }
  }

  /**
   * Update user section after auth change
   */
  private updateUserSection(): void {
    if (!this.element || !this.userSection || !this.mobileMenu) return;
    
    // Update desktop user section
    const newUserSection = this.createUserSection();
    this.userSection.replaceWith(newUserSection);
    this.userSection = newUserSection;
    
    // Update mobile menu
    const newMobileMenu = this.createMobileMenu();
    this.mobileMenu.replaceWith(newMobileMenu);
    this.mobileMenu = newMobileMenu;
  }

  /**
   * Called after component is mounted
   */
  protected onMounted(): void {
    // Subscribe to store changes
    this.unsubscribe = store.subscribe('user', () => {
      this.updateUserSection();
    });
    
    // Add scroll listener for header background
    this.scrollHandler = () => this.handleScroll();
    window.addEventListener('scroll', this.scrollHandler, { passive: true });
    
    // Initial scroll check
    this.handleScroll();
  }

  /**
   * Called after component is unmounted
   */
  protected onUnmounted(): void {
    // Unsubscribe from store
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }
    
    // Remove scroll listener
    if (this.scrollHandler) {
      window.removeEventListener('scroll', this.scrollHandler);
      this.scrollHandler = null;
    }
    
    // Close mobile menu
    document.body.classList.remove('menu-open');
  }
}
