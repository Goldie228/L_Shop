/**
 * Компонент Header - L_Shop Frontend
 * Шапка сайта с навигацией, секцией пользователя и эффектами прокрутки
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
 * Пропсы для компонента Header
 */
export interface HeaderProps extends ComponentProps {
  /** Callback при нажатии кнопки входа */
  onLoginClick?: () => void;
  /** Порог состояния прокрутки в пикселях */
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

const SEARCH_ICON = `
  <svg class="header__search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="11" cy="11" r="8"></circle>
    <path d="M21 21l-4.35-4.35"></path>
  </svg>
`;

/**
 * SVG логотип L_Shop
 * Масштабируемый векторный логотип с буквой L
 */
const LOGO_ICON_SVG = `
  <svg class="header__logo-svg" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
    <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 20px; font-weight: 700;" fill="currentColor">L</text>
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
  /** Элемент секции пользователя */
  private userSection: HTMLElement | null = null;

  /** Элемент мобильного меню */
  private mobileMenu: HTMLElement | null = null;

  /** Функция отписки от store */
  private unsubscribe: (() => void) | null = null;

  /** Ссылка на обработчик прокрутки */
  private scrollHandler: (() => void) | null = null;

  /** Элемент выпадающего меню пользователя */
  private userDropdown: HTMLElement | null = null;

  /** Открыто ли выпадающее меню */
  private isDropdownOpen: boolean = false;

  /**
   * Получить пропсы по умолчанию
   */
  protected getDefaultProps(): HeaderProps {
    return {
      ...super.getDefaultProps(),
      scrollThreshold: 50,
    };
  }

  /**
   * Отрендерить хедер
   * @returns Элемент хедера
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

    // Search
    const search = this.createSearch();
    container.appendChild(search);

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
   * Создать элемент логотипа
   * @returns Элемент логотипа
   */
  private createLogo(): HTMLAnchorElement {
    const logo = this.createElement(
      'a',
      {
        href: '/',
        className: 'header__logo',
        'data-testid': 'header-logo',
      },
      [`<span class="header__logo-icon">${LOGO_ICON_SVG}</span>`, `<span>L_Shop</span>`],
    );

    this.addEventListener(logo, 'click', (e) => {
      e.preventDefault();
      router.navigate('/');
    });

    return logo;
  }

  /**
   * Создать элемент навигации
   * @returns Элемент навигации
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

    // Shop link
    const shopItem = this.createElement('li', { className: 'header__nav-item' });
    const shopLink = this.createNavLink('Магазин', '/shop');
    shopItem.appendChild(shopLink);
    list.appendChild(shopItem);

    // About link
    const aboutItem = this.createElement('li', { className: 'header__nav-item' });
    const aboutLink = this.createNavLink('О нас', '/about');
    aboutItem.appendChild(aboutLink);
    list.appendChild(aboutItem);

    // Contact link
    const contactItem = this.createElement('li', { className: 'header__nav-item' });
    const contactLink = this.createNavLink('Контакты', '/contact');
    contactItem.appendChild(contactLink);
    list.appendChild(contactItem);

    nav.appendChild(list);
    return nav;
  }

  /**
   * Создать элемент поиска
   * @returns Элемент поиска
   */
  private createSearch(): HTMLElement {
    const search = this.createElement('div', {
      className: 'header__search',
      'data-testid': 'header-search',
    });

    const input = this.createElement('input', {
      type: 'search',
      className: 'header__search-input',
      placeholder: 'Поиск товаров...',
      'aria-label': 'Поиск товаров',
      'data-testid': 'search-input',
    });

     // Обработка нажатия Enter для поиска
     this.addEventListener(input, 'keydown', (e) => {
      if (e instanceof KeyboardEvent && e.key === 'Enter') {
        e.preventDefault();
        const query = input.value.trim();
        if (query) {
          this.handleSearch(query);
        }
      }
    });

    const icon = this.createElement('span', { className: 'header__search-icon-wrapper' });
    icon.innerHTML = SEARCH_ICON;

    search.appendChild(input);
    search.appendChild(icon);

    return search;
  }

  /**
   * Обработать поисковый запрос
   * @param query - Поисковый запрос
   */
  private handleSearch(query: string): void {
    // TODO: Реализовать поиск через router.navigate или API вызов
    console.log('[Header] Search query:', query);
    // Пример: router.navigate(`/search?q=${encodeURIComponent(query)}`);
  }

  /**
   * Создать элемент навигационной ссылки
   * @param text - Текст ссылки
   * @param href - URL ссылки
   * @param isActive - Активна ли ссылка
   * @returns Элемент ссылки
   */
  private createNavLink(text: string, href: string, isActive: boolean = false): HTMLAnchorElement {
    const link = this.createElement(
      'a',
      {
        href,
        className: `header__nav-link${isActive ? ' header__nav-link--active' : ''}`,
        'data-testid': `nav-link-${text.toLowerCase()}`,
      },
      [text],
    );

    this.addEventListener(link, 'click', (e) => {
      e.preventDefault();
      router.navigate(href);
    });

    return link;
  }

  /**
   * Создать секцию пользователя
   * @returns Элемент секции пользователя
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
   * Создать выпадающее меню пользователя с аватаром и меню
   * @param user - Объект пользователя
   * @returns Элемент выпадающего меню
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
    const avatar = this.createElement('span', { className: 'header__user-avatar' }, [
      info.initials,
    ]);
    trigger.appendChild(avatar);

    // Name
    const name = this.createElement('span', { className: 'header__user-name' }, [info.displayName]);
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
    const userName = this.createElement('span', { className: 'header__dropdown-user-name' }, [
      info.displayName,
    ]);
    const userEmail = this.createElement('span', { className: 'header__dropdown-user-email' }, [
      user.email,
    ]);
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

     // Закрыть выпадающее меню при клике вне его
     document.addEventListener('click', (e) => {
      if (this.isDropdownOpen && !dropdown.contains(e.target as Node)) {
        this.closeDropdown();
      }
    });

    return dropdown;
  }

  /**
   * Переключить выпадающее меню пользователя
   */
  private toggleDropdown(): void {
    if (this.isDropdownOpen) {
      this.closeDropdown();
    } else {
      this.openDropdown();
    }
  }

  /**
   * Открыть выпадающее меню пользователя
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
   * Закрыть выпадающее меню пользователя
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
   * Создать кнопку переключения мобильного меню
   * @returns Кнопка переключения
   */
  private createMenuToggle(): HTMLButtonElement {
    const toggle = this.createElement('button', {
      type: 'button',
      className: 'header__menu-toggle',
      'aria-label': 'Открыть меню',
      'aria-expanded': 'false',
      'aria-controls': 'mobile-menu',
      'data-testid': 'mobile-menu-toggle',
    });

    toggle.innerHTML = MENU_ICON;

    this.addEventListener(toggle, 'click', () => this.toggleMobileMenu());

    return toggle;
  }

  /**
   * Создать мобильное меню
   * @returns Элемент мобильного меню
   */
  private createMobileMenu(): HTMLElement {
    const menu = this.createElement('div', {
      className: 'header__mobile-menu',
      id: 'mobile-menu',
      'aria-hidden': 'true',
      'data-testid': 'mobile-menu',
    });

     // Ссылки навигации
     const navList = this.createElement('ul', {
      className: 'header__mobile-nav-list',
    });

    const homeItem = this.createElement('li');
    const homeLink = this.createMobileNavLink('Главная', '/');
    homeItem.appendChild(homeLink);
    navList.appendChild(homeItem);

    const shopItem = this.createElement('li');
    const shopLink = this.createMobileNavLink('Магазин', '/shop');
    shopItem.appendChild(shopLink);
    navList.appendChild(shopItem);

    const aboutItem = this.createElement('li');
    const aboutLink = this.createMobileNavLink('О нас', '/about');
    aboutItem.appendChild(aboutLink);
    navList.appendChild(aboutItem);

    const contactItem = this.createElement('li');
    const contactLink = this.createMobileNavLink('Контакты', '/contact');
    contactItem.appendChild(contactLink);
    navList.appendChild(contactItem);

    menu.appendChild(navList);

    // User section for mobile
    const state = store.getState();
    const mobileUser = this.createElement('div', {
      className: 'header__mobile-user',
    });

    if (state.user.isAuthenticated && state.user.user) {
      const info = getUserDisplayInfo(state.user.user);

      const userInfo = this.createElement('div', { className: 'header__mobile-user-info' });
      const avatar = this.createElement('span', { className: 'header__user-avatar' }, [
        info.initials,
      ]);
      const name = this.createElement('span', { className: 'header__user-name' }, [
        info.displayName,
      ]);
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
      [text],
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
