/**
 * Header Component - L_Shop Frontend
 * Site header with navigation and user section
 */

import { Component, ComponentProps } from '../base/Component';
import { Button } from '../ui/Button';
import { store } from '../../store/store';
import { User, getUserDisplayInfo } from '../../types/user';
import { AuthService } from '../../services/auth.service';
import { router } from '../../router/router';

/**
 * Header props
 */
export interface HeaderProps extends ComponentProps {
  /** Callback when login button clicked */
  onLoginClick?: () => void;
}

/**
 * Header component class
 */
export class Header extends Component<HeaderProps> {
  /** User section element */
  private userSection: HTMLElement | null = null;
  
  /** Mobile menu element */
  private mobileMenu: HTMLElement | null = null;
  
  /** Store unsubscribe function */
  private unsubscribe: (() => void) | null = null;

  /**
   * Get default props
   */
  protected getDefaultProps(): HeaderProps {
    return {
      ...super.getDefaultProps()
    };
  }

  /**
   * Render header
   * @returns Header element
   */
  public render(): HTMLElement {
    const header = this.createElement('header', {
      className: 'header',
      role: 'banner'
    });
    
    const container = this.createElement('div', {
      className: 'header__container'
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
        className: 'header__logo'
      },
      [
        `<span class="header__logo-icon">L</span>`,
        `<span>L_Shop</span>`
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
      'aria-label': 'Main navigation'
    });
    
    const list = this.createElement('ul', {
      className: 'header__nav-list'
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
        className: `header__nav-link ${isActive ? 'header__nav-link--active' : ''}`
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
      className: 'header__user'
    });
    
    if (state.user.isAuthenticated && state.user.user) {
      // User is logged in
      const userInfo = this.createUserInfo(state.user.user);
      section.appendChild(userInfo);
      
      const logoutButton = new Button({
        text: 'Выйти',
        variant: 'ghost',
        size: 'sm',
        onClick: () => this.handleLogout()
      });
      section.appendChild(logoutButton.render());
    } else {
      // User is not logged in
      const loginButton = new Button({
        text: 'Войти',
        variant: 'primary',
        size: 'sm',
        onClick: () => this.handleLoginClick()
      });
      section.appendChild(loginButton.render());
    }
    
    return section;
  }

  /**
   * Create user info display
   * @param user - User object
   * @returns User info element
   */
  private createUserInfo(user: User): HTMLElement {
    const info = getUserDisplayInfo(user);
    
    const container = this.createElement('div', {
      className: 'header__user-info'
    });
    
    // Avatar
    const avatar = this.createElement(
      'span',
      { className: 'header__user-avatar' },
      [info.initials]
    );
    container.appendChild(avatar);
    
    // Name
    const name = this.createElement(
      'span',
      { className: 'header__user-name' },
      [info.displayName]
    );
    container.appendChild(name);
    
    return container;
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
        'aria-label': 'Toggle menu',
        'aria-expanded': 'false'
      },
      [
        `<svg class="header__menu-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="3" y1="6" x2="21" y2="6"></line>
          <line x1="3" y1="12" x2="21" y2="12"></line>
          <line x1="3" y1="18" x2="21" y2="18"></line>
        </svg>`
      ]
    );
    
    this.addEventListener(toggle, 'click', () => this.toggleMobileMenu());
    
    return toggle;
  }

  /**
   * Create mobile menu
   * @returns Mobile menu element
   */
  private createMobileMenu(): HTMLElement {
    const menu = this.createElement('div', {
      className: 'header__mobile-menu'
    });
    
    // Navigation links
    const navList = this.createElement('ul', {
      className: 'header__mobile-nav-list'
    });
    
    const homeItem = this.createElement('li');
    const homeLink = this.createMobileNavLink('Главная', '/');
    homeItem.appendChild(homeLink);
    navList.appendChild(homeItem);
    
    menu.appendChild(navList);
    
    // User section for mobile
    const state = store.getState();
    const mobileUser = this.createElement('div', {
      className: 'header__mobile-user'
    });
    
    if (state.user.isAuthenticated && state.user.user) {
      const userInfo = this.createUserInfo(state.user.user);
      mobileUser.appendChild(userInfo);
      
      const logoutButton = new Button({
        text: 'Выйти',
        variant: 'secondary',
        block: true,
        onClick: () => this.handleLogout()
      });
      mobileUser.appendChild(logoutButton.render());
    } else {
      const loginButton = new Button({
        text: 'Войти',
        variant: 'primary',
        block: true,
        onClick: () => this.handleLoginClick()
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
        className: 'header__mobile-nav-link'
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
    document.body.classList.add('menu-open');
    
    const toggle = this.element.querySelector('.header__menu-toggle');
    if (toggle) {
      toggle.setAttribute('aria-expanded', 'true');
    }
  }

  /**
   * Close mobile menu
   */
  private closeMobileMenu(): void {
    if (!this.mobileMenu || !this.element) return;
    
    this.mobileMenu.classList.remove('header__mobile-menu--open');
    document.body.classList.remove('menu-open');
    
    const toggle = this.element.querySelector('.header__menu-toggle');
    if (toggle) {
      toggle.setAttribute('aria-expanded', 'false');
    }
  }

  /**
   * Handle login button click
   */
  private handleLoginClick(): void {
    this.closeMobileMenu();
    
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
      this.updateUserSection();
    } catch (error) {
      console.error('Logout error:', error);
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
    
    // Close mobile menu
    document.body.classList.remove('menu-open');
  }
}