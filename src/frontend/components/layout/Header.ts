/**
 * Компонент Header - L_Shop Frontend
 * Шапка сайта с навигацией, секцией пользователя и эффектами прокрутки
 *
 * @see src/frontend/styles/components/header.css - стили хедера
 * @see docs/DESIGN_SYSTEM.md - документация дизайн-системы
 */

import { Component, ComponentProps } from '../base/Component.js';
import { Button } from '../ui/Button.js';
import { Icon } from '../ui/Icon.js';
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
 * SVG иконка меню (бургер с анимацией)
 * Используется inline т.к. имеет специальную структуру для анимации
 */
const MENU_ICON = [
  '  <svg class="header__menu-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">',
  '    <line class="header__menu-line header__menu-line--top" x1="3" y1="6" x2="21" y2="6"></line>',
  '    <line class="header__menu-line header__menu-line--middle" x1="3" y1="12" x2="21" y2="12"></line>',
  '    <line class="header__menu-line header__menu-line--bottom" x1="3" y1="18" x2="21" y2="18"></line>',
  '  </svg>',
].join('\n');

/**
 * Сервис для работы с корзиной (импортируется динамически для избежания циклических зависимостей)
 */
import { api } from '../../services/api.js';

/**
 * SVG логотип L_Shop
 * Масштабируемый векторный логотип с буквой L
 */
const LOGO_ICON_SVG = [
  '  <svg class="header__logo-svg" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">',
  '    <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" style="font-family: \'Inter\', -apple-system, BlinkMacSystemFont, \'Segoe UI\', Roboto, sans-serif; font-size: 20px; font-weight: 700;" fill="currentColor">L</text>',
  '  </svg>',
].join('\n');

/**
 * Header component class
 *
 * @example
 * ```typescript
 * const header = new Header({
 *   onLoginClick: () => openAuthModal(),
 *   scrollThreshold: 50
 * });
 * document.body.prepend
 * ```
 */
export class Header extends Component<HeaderProps> {
  /** Элемент секции пользователя */
  private userSection: HTMLElement | null = null;

  /** Элемент мобильного меню */
  private mobileMenu: HTMLElement | null = null;

  /** Функция отписки от store */
  private unsubscribe: (() => void) | null = null;

  /** Функция отписки от router */
  private routerUnsubscribe: (() => void) | null = null;

  /** Функция отписки от cart */
  private cartUnsubscribe: (() => void) | null = null;

  /** Элемент бейджа корзины */
  private cartBadge: HTMLElement | null = null;

  /** Ссылка на обработчик прокрутки */
  private scrollHandler: (() => void) | null = null;

  /** Элемент выпадающего меню пользователя */
  private userDropdown: HTMLElement | null = null;

  /** Открыто ли выпадающее меню */
  private isDropdownOpen = false;

  /** Ссылка на обработчик клика вне dropdown для очистки */
  private boundDropdownClickHandler: ((e: MouseEvent) => void) | null = null;

  /** Элемент навигации для обновления активного пункта */
  private navElement: HTMLElement | null = null;

  /** Текущий активный путь */
  private currentPath: string = '/';

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

    // Cart button
    const cartButton = this.createCartButton();
    container.appendChild(cartButton);

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
    const logo = this.createElement('a', {
      href: '/',
      className: 'header__logo',
      'data-testid': 'header-logo',
    });

    // Создаём span для иконки и вставляем SVG через innerHTML
    const iconSpan = this.createElement('span', { className: 'header__logo-icon' });
    iconSpan.innerHTML = LOGO_ICON_SVG;
    logo.appendChild(iconSpan);

    // Создаём span для текста логотипа (без дополнительного класса)
    const textSpan = this.createElement('span', {}, ['L_Shop']);
    logo.appendChild(textSpan);

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

    // Получаем текущий путь
    const currentPath = window.location.pathname;

    // Ссылка на главную
    const homeItem = this.createElement('li', { className: 'header__nav-item' });
    const homeLink = this.createNavLink('Главная', '/', this.isActivePath('/', currentPath));
    homeItem.appendChild(homeLink);
    list.appendChild(homeItem);

    // Ссылка на каталог
    const catalogItem = this.createElement('li', { className: 'header__nav-item' });
    const catalogLink = this.createNavLink('Каталог', '/catalog', this.isActivePath('/catalog', currentPath));
    catalogItem.appendChild(catalogLink);
    list.appendChild(catalogItem);

    // Ссылка на корзину
    const cartItem = this.createElement('li', { className: 'header__nav-item' });
    const cartLink = this.createNavLink('Корзина', '/cart', this.isActivePath('/cart', currentPath));
    cartItem.appendChild(cartLink);
    list.appendChild(cartItem);

    nav.appendChild(list);
    this.navElement = nav;
    return nav;
  }

  /**
   * Проверить, является ли путь активным
   * @param linkPath - Путь ссылки
   * @param currentPath - Текущий путь
   */
  private isActivePath(linkPath: string, currentPath: string): boolean {
    // Точное совпадение для главной
    if (linkPath === '/') {
      return currentPath === '/' || currentPath === '';
    }
    // Для каталога - только /catalog
    if (linkPath === '/catalog') {
      return currentPath === '/catalog';
    }
    return currentPath.startsWith(linkPath);
  }

  /**
   * Обновить активный пункт меню
   */
  private updateActiveNavLink(): void {
    if (!this.navElement) return;

    const currentPath = window.location.pathname;
    const links = this.navElement.querySelectorAll('.header__nav-link');

    links.forEach((link) => {
      const href = link.getAttribute('href');
      if (href) {
        const isActive = this.isActivePath(href, currentPath);
        link.classList.toggle('header__nav-link--active', isActive);
      }
    });
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

    const icon = new Icon({ name: 'search', size: 20, className: 'header__search-icon-wrapper' });
    search.appendChild(input);
    search.appendChild(icon.render());

    return search;
  }

  /**
   * Обработать поисковый запрос
   * @param query - Поисковый запрос
   */
  private handleSearch(query: string): void {
    // Логирование удалено (только для отладки)
  }

  /**
   * Создать кнопку корзины
   * @returns Элемент кнопки корзины
   */
  private createCartButton(): HTMLButtonElement {
    const cartButton = this.createElement('button', {
      type: 'button',
      className: 'header__cart-btn',
      'aria-label': 'Корзина',
      'data-testid': 'header-cart-btn',
    });

    const cartIcon = new Icon({ name: 'cart', size: 24, className: 'header__cart-icon' });
    cartButton.appendChild(cartIcon.render());

    // Добавляем бейдж с количеством товаров
    const itemsCount = store.getCartItemsCount();
    if (itemsCount > 0) {
      this.cartBadge = this.createElement('span', {
        className: 'header__cart-badge',
        'data-testid': 'cart-badge',
      }, [String(itemsCount > 99 ? '99+' : itemsCount)]);
      cartButton.appendChild(this.cartBadge);
    }

    this.addEventListener(cartButton, 'click', () => {
      router.navigate('/cart');
    });

    return cartButton;
  }

  /**
   * Обновить бейдж корзины
   */
  private updateCartBadge(): void {
    if (!this.element) return;

    const cartBtn = this.element.querySelector('.header__cart-btn');
    if (!cartBtn) return;

    // Удаляем старый бейдж
    const oldBadge = cartBtn.querySelector('.header__cart-badge');
    if (oldBadge) {
      oldBadge.remove();
    }

    // Создаём новый бейдж если есть товары
    const itemsCount = store.getCartItemsCount();
    if (itemsCount > 0) {
      this.cartBadge = this.createElement('span', {
        className: 'header__cart-badge',
        'data-testid': 'cart-badge',
      }, [String(itemsCount > 99 ? '99+' : itemsCount)]);
      cartBtn.appendChild(this.cartBadge);
    } else {
      this.cartBadge = null;
    }
  }

  /**
   * Загрузить данные корзины
   */
  private async loadCartData(): Promise<void> {
    if (!store.isAuthenticated()) return;

    try {
      const cart = await api.get<{ items: unknown[]; totalSum: number }>('/api/cart');
      if (cart && cart.items) {
        store.setCartState(cart.items.length, cart.totalSum || 0);
      }
    } catch (error) {
      // Игнорируем ошибки (например, 401)
    }
  }

  /**
   * Создать элемент навигационной ссылки
   * @param text - Текст ссылки
   * @param href - URL ссылки
   * @param isActive - Активна ли ссылка
   * @returns Элемент ссылки
   */
  private createNavLink(text: string, href: string, isActive = false): HTMLAnchorElement {
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
    const chevronIcon = new Icon({ name: 'chevron-down', size: 16, className: 'header__dropdown-chevron' });
    trigger.appendChild(chevronIcon.render());

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

    // Profile link
    const profileItem = this.createElement('div', { className: 'header__dropdown-item' });
    const profileButton = new Button({
      text: 'Профиль',
      variant: 'ghost',
      size: 'sm',
      testId: 'header-profile-btn',
      onClick: () => {
        this.closeDropdown();
        router.navigate('/profile');
      },
    });
    profileItem.appendChild(profileButton.render());
    this.userDropdown.appendChild(profileItem);

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
    // Сохраняем ссылку на обработчик для очистки при unmount
    this.boundDropdownClickHandler = (e: MouseEvent) => {
      if (this.isDropdownOpen && !dropdown.contains(e.target as Node)) {
        this.closeDropdown();
      }
    };
    document.addEventListener('click', this.boundDropdownClickHandler);

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

    // Ссылка на каталог
    const catalogItem = this.createElement('li');
    const catalogLink = this.createMobileNavLink('Каталог', '/catalog');
    catalogItem.appendChild(catalogLink);
    navList.appendChild(catalogItem);

    // Ссылка на корзину
    const cartNavItem = this.createElement('li');
    const cartNavLink = this.createMobileNavLink('Корзина', '/cart');
    cartNavItem.appendChild(cartNavLink);
    navList.appendChild(cartNavItem);

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
    } else {
      // Fallback: отправляем глобальное событие для открытия модалки авторизации
      document.dispatchEvent(new CustomEvent('openAuthModal'));
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
  protected onMount(): void {
    // Subscribe to store changes
    this.unsubscribe = store.subscribe('user', () => {
      this.updateUserSection();
      // При изменении авторизации загружаем корзину
      if (store.isAuthenticated()) {
        this.loadCartData();
      } else {
        store.resetCart();
      }
    });

    // Subscribe to cart changes
    this.cartUnsubscribe = store.subscribe('cart', () => {
      this.updateCartBadge();
    });

    // Subscribe to router changes for updating active nav link
    this.routerUnsubscribe = router.subscribe(() => {
      this.updateActiveNavLink();
    });

    // Add scroll listener for header background
    this.scrollHandler = () => this.handleScroll();
    window.addEventListener('scroll', this.scrollHandler, { passive: true });

    // Initial scroll check
    this.handleScroll();

    // Initial active nav link update
    this.updateActiveNavLink();

    // Load cart data if authenticated
    if (store.isAuthenticated()) {
      this.loadCartData();
    }
  }

  /**
   * Called after component is unmounted
   */
  protected onUnmount(): void {
    // Unsubscribe from store
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }

    // Unsubscribe from cart
    if (this.cartUnsubscribe) {
      this.cartUnsubscribe();
      this.cartUnsubscribe = null;
    }

    // Unsubscribe from router
    if (this.routerUnsubscribe) {
      this.routerUnsubscribe();
      this.routerUnsubscribe = null;
    }

    // Remove scroll listener
    if (this.scrollHandler) {
      window.removeEventListener('scroll', this.scrollHandler);
      this.scrollHandler = null;
    }

    // Remove dropdown click handler (исправление утечки памяти)
    if (this.boundDropdownClickHandler) {
      document.removeEventListener('click', this.boundDropdownClickHandler);
      this.boundDropdownClickHandler = null;
    }

    // Close mobile menu
    document.body.classList.remove('menu-open');
  }
}
