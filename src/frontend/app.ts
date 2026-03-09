/**
 * Точка входа приложения - Фронтенд L_Shop
 * Инициализация основного приложения
 */

import { store } from './store/store.js';
import { router, APP_ROUTES, Route } from './router/router.js';
import { AuthService } from './services/auth.service.js';
import { Layout } from './components/layout/Layout.js';
import { AuthModal } from './components/auth/AuthModal.js';
import { ProfilePage } from './components/pages/ProfilePage.js';
import { CartPage } from './components/pages/CartPage.js';
import { DeliveryPage } from './components/pages/DeliveryPage.js';
import { MainPage } from './components/pages/MainPage.js';
import { CatalogPage } from './components/pages/CatalogPage.js';
import { PlaygroundPage } from './components/pages/PlaygroundPage.js';
import { NotFoundPage } from './components/pages/NotFoundPage.js';
import { OrdersPage } from './components/pages/OrdersPage.js';
import { ProductPage } from './components/pages/ProductPage.js';
import { AboutPage } from './components/pages/AboutPage.js';
import { ContactsPage } from './components/pages/ContactsPage.js';
import { AdminPage } from './components/pages/AdminPage.js';

// Импорт стилей страниц
import './styles/pages/delivery.css';
import './styles/pages/main-page.css';
import './styles/pages/profile-page.css';
import './styles/components/product-card.css';
import './styles/pages/product-page.css';
import './styles/pages/about-page.css';
import './styles/pages/contacts-page.css';
import './styles/pages/orders-page.css';
import './styles/pages/admin-page.css';
import './styles/pages/not-found-page.css';
// Импорт стилей UI компонентов
import './styles/components/toast.css';
// Импорт стилей корзины
import './styles/components/cart.css';

// Тема по умолчанию
const THEME_KEY = 'lshop-theme';

/**
 * Инициализировать тему
 */
function initTheme(): void {
  const savedTheme = localStorage.getItem(THEME_KEY);
  if (savedTheme) {
    document.documentElement.className = savedTheme;
  } else {
    // По умолчанию тёмная тема
    document.documentElement.classList.add('dark-theme');
    localStorage.setItem(THEME_KEY, 'dark-theme');
  }
}

/**
 * Переключить тему
 */
export function toggleTheme(): void {
  const isDark = document.documentElement.classList.contains('dark-theme');
  if (isDark) {
    document.documentElement.classList.remove('dark-theme');
    document.documentElement.classList.add('light-theme');
    localStorage.setItem(THEME_KEY, 'light-theme');
  } else {
    document.documentElement.classList.remove('light-theme');
    document.documentElement.classList.add('dark-theme');
    localStorage.setItem(THEME_KEY, 'dark-theme');
  }
}

/**
 * Application class
 * Manages app initialization and lifecycle
 */
class App {
  /** Компонент макета */
  private layout: Layout | null = null;

  /** Модальное окно аутентификации */
  private authModal: AuthModal | null = null;

  /** Элемент-контейнер приложения */
  private appContainer: HTMLElement | null = null;

  /** Флаг, что проверка авторизации уже выполнялась */
  private authChecked = false;

  /**
   * Инициализировать приложение
   */
  public async init(): Promise<void> {
    // Получить контейнер приложения
    this.appContainer = document.getElementById('app');

    if (!this.appContainer) {
      // Контейнер приложения не найден
      return;
    }

    // Очистить состояние загрузки
    this.appContainer.innerHTML = '';

    try {
      // Настроить роутер
      this.setupRouter();

      // Проверить авторизацию ДО рендеринга (чтобы избежать моргания)
      await this.checkAuthLazy();

      // Отрендерить макет приложения
      this.renderLayout();

      // Инициализировать роутер
      router.init();
    } catch (error) {
      // Ошибка инициализации приложения
      if (import.meta.env.DEV) {
        console.error('[App] Ошибка инициализации:', error);
      }
      this.showError('Ошибка инициализации приложения');
    }
  }

  /**
   * Отложенная проверка авторизации
   * Выполняется после загрузки страницы, не блокирует UI
   */
  private async checkAuthLazy(): Promise<void> {
    if (this.authChecked) return;
    this.authChecked = true;

    store.setLoading(true);

    try {
      const user = await AuthService.getCurrentUser();
      if (user) {
        store.setUser(user);
      } else {
        store.setUser(null);
      }
    } catch (error) {
      // Ошибка проверки аутентификации - пользователь не авторизован
      store.setUser(null);
    } finally {
      store.setLoading(false);
    }
  }

  /**
   * Настроить роутер с маршрутами
   */
  private setupRouter(): void {
    // Зарегистрировать маршруты
    router.registerRoutes(APP_ROUTES);

    // Подписаться на изменения маршрутов
    router.subscribe((route: Route) => {
      this.handleRouteChange(route);
    });
  }

  /**
   * Отрендерить макет приложения
   */
  private renderLayout(): void {
    if (!this.appContainer) return;

    // Создать и инициализировать модальное окно аутентификации
    this.authModal = new AuthModal({
      onAuth: () => this.handleAuthSuccess(),
    });
    document.body.appendChild(this.authModal.render());

    // Слушатель глобального события для открытия модалки авторизации
    document.addEventListener('openAuthModal', () => {
      this.openAuthModal();
    });

    // Создать макет с Header, основной областью контента и Footer
    this.layout = new Layout({
      onLoginClick: () => this.openAuthModal(),
    });
    this.layout.mount(this.appContainer);
  }

  /**
   * Обработать успешную аутентификацию
   */
  private handleAuthSuccess(): void {
    // Обновить UI после успешной авторизации
    // Логирование удалено (только для отладки)
  }

  /**
   * Обработать изменение маршрута
   * @param route - Текущий маршрут
   */
  private handleRouteChange(route: Route): void {
    if (!this.layout) return;

    const mainContent = this.layout.getMainContent();
    if (!mainContent) return;

    // Проверить требуется ли авторизация
    if (route.requiresAuth && !store.isAuthenticated()) {
      router.navigate(route.authRedirect || '/');
      return;
    }

    // Отрендерить страницу на основе маршрута
    switch (route.component) {
      case 'HomePage':
        this.renderHomePage();
        break;

      case 'CatalogPage':
        this.renderCatalogPage();
        break;

      case 'ProfilePage':
        this.renderProfilePage();
        break;

      case 'CartPage':
        this.renderCartPage();
        break;

      case 'DeliveryPage':
        this.renderDeliveryPage();
        break;

      case 'OrdersPage':
        this.renderOrdersPage();
        break;

      case 'ProductPage':
        this.renderProductPage(route.params?.id);
        break;

      case 'AboutPage':
        this.renderAboutPage();
        break;

      case 'ContactsPage':
        this.renderContactsPage();
        break;

      case 'PlaygroundPage':
        this.renderPlaygroundPage();
        break;

      case 'AdminPage':
        this.renderAdminPage();
        break;

      case 'NotFoundPage':
        this.renderNotFoundPage();
        break;

      default:
        this.renderNotFoundPage();
    }
  }

  /**
   * Отрендерить страницу профиля
   */
  private renderProfilePage(): void {
    if (!this.layout) return;

    const mainContent = this.layout.getMainContent();
    if (!mainContent) return;

    const user = store.getUser();
    if (!user) {
      router.navigate('/');
      return;
    }

    mainContent.innerHTML = '';
    const profilePage = new ProfilePage({ user });
    mainContent.appendChild(profilePage.render());
  }

  /**
   * Отрендерить домашнюю страницу с каталогом продуктов
   */
  private renderHomePage(): void {
    if (!this.layout) return;

    const mainContent = this.layout.getMainContent();
    if (!mainContent) return;

    mainContent.innerHTML = '';
    const mainPage = new MainPage({
      onAddToCart: (productId) => {
        // Логирование удалено (только для отладки)
      },
    });
    mainContent.appendChild(mainPage.render());
  }

  /**
   * Отрендерить страницу каталога
   */
  private renderCatalogPage(): void {
    if (!this.layout) return;

    const mainContent = this.layout.getMainContent();
    if (!mainContent) return;

    mainContent.innerHTML = '';
    const catalogPage = new CatalogPage({});
    mainContent.appendChild(catalogPage.render());
  }

  /**
   * Отрендерить страницу 404
   */
  private renderNotFoundPage(): void {
    if (!this.layout) return;

    const mainContent = this.layout.getMainContent();
    if (!mainContent) return;

    mainContent.innerHTML = '';
    const notFoundPage = new NotFoundPage();
    mainContent.appendChild(notFoundPage.render());
  }

  /**
   * Отрендерить страницу оформления доставки
   */
  private renderDeliveryPage(): void {
    if (!this.layout) return;

    const mainContent = this.layout.getMainContent();
    if (!mainContent) return;

    mainContent.innerHTML = '';
    const deliveryPage = new DeliveryPage();
    mainContent.appendChild(deliveryPage.render());
  }

  /**
   * Отрендерить страницу заказов пользователя
   */
  private renderOrdersPage(): void {
    if (!this.layout) return;

    const mainContent = this.layout.getMainContent();
    if (!mainContent) return;

    mainContent.innerHTML = '';
    const ordersPage = new OrdersPage();
    mainContent.appendChild(ordersPage.render());
  }

  /**
   * Отрендерить страницу корзины
   */
  private renderCartPage(): void {
    if (!this.layout) return;

    const mainContent = this.layout.getMainContent();
    if (!mainContent) return;

    mainContent.innerHTML = '';
    const cartPage = new CartPage();
    mainContent.appendChild(cartPage.render());
  }

  /**
   * Отрендерить страницу playground для тестирования компонентов
   */
  private renderPlaygroundPage(): void {
    if (!this.layout) return;

    const mainContent = this.layout.getMainContent();
    if (!mainContent) return;

    mainContent.innerHTML = '';
    const playgroundPage = new PlaygroundPage();
    mainContent.appendChild(playgroundPage.render());
  }

  /**
   * Отрендерить страницу товара
   * @param productId - ID товара (опционально, может быть в route.params)
   */
  private renderProductPage(productId?: string): void {
    if (!this.layout) return;

    const mainContent = this.layout.getMainContent();
    if (!mainContent) return;

    mainContent.innerHTML = '';
    const productPage = new ProductPage({ productId });
    mainContent.appendChild(productPage.render());
    // Вызвать init для загрузки данных
    productPage.init().catch((error) => {
      if (import.meta.env.DEV) {
        console.error('[App] Ошибка загрузки товара:', error);
      }
    });
  }

  /**
   * Отрендерить страницу "О нас"
   */
  private renderAboutPage(): void {
    if (!this.layout) return;

    const mainContent = this.layout.getMainContent();
    if (!mainContent) return;

    mainContent.innerHTML = '';
    const aboutPage = new AboutPage();
    mainContent.appendChild(aboutPage.render());
  }

  /**
   * Отрендерить страницу "Контакты"
   */
  private renderContactsPage(): void {
    if (!this.layout) return;

    const mainContent = this.layout.getMainContent();
    if (!mainContent) return;

    mainContent.innerHTML = '';
    const contactsPage = new ContactsPage();
    mainContent.appendChild(contactsPage.render());
  }

  /**
   * Отрендерить страницу админ-панели
   */
  private renderAdminPage(): void {
    if (!this.layout) return;

    const mainContent = this.layout.getMainContent();
    if (!mainContent) return;

    // Проверка прав администратора
    const user = store.getUser();
    if (!user || user.role !== 'admin') {
      router.navigate('/');
      return;
    }

    mainContent.innerHTML = '';
    const adminPage = new AdminPage();
    // mount синхронный, данные загружаются в onMount
    adminPage.mount(mainContent);
  }

  /**
   * Открыть модальное окно аутентификации
   */
  private openAuthModal(): void {
    if (this.authModal) {
      this.authModal.open('login');
    }
  }

  /**
   * Показать сообщение об ошибке
   * @param message - Сообщение об ошибке
   */
  private showError(message: string): void {
    if (!this.appContainer) return;

    this.appContainer.innerHTML = `
      <div class="app-error">
        <div class="layout__content text-center">
          <h1>Ошибка</h1>
          <p>${message}</p>
          <button class="btn btn--primary" onclick="location.reload()">
            Перезагрузить
          </button>
        </div>
      </div>
    `;
  }
}

// Инициализировать приложение при готовности DOM
document.addEventListener('DOMContentLoaded', () => {
  // Инициализировать тему
  initTheme();

  const app = new App();
  app.init();
});

// Добавить глобальные стили для состояний загрузки и ошибок
const style = document.createElement('style');
style.textContent = `
  .app-loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    gap: var(--spacing-md);
    color: var(--color-text-secondary);
  }
  
  .noscript-warning {
    position: fixed;
    inset: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: var(--color-bg-primary);
    text-align: center;
    padding: var(--spacing-lg);
  }
  
  .noscript-warning h1 {
    margin-bottom: var(--spacing-md);
    color: var(--color-error);
  }
  
  .app-error {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    padding: var(--spacing-lg);
  }
  
  .app-error h1 {
    color: var(--color-error);
    margin-bottom: var(--spacing-md);
  }
  
  .not-found-page {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 50vh;
  }
  
  .not-found__title {
    font-size: 6rem;
    color: var(--color-primary);
    margin-bottom: var(--spacing-sm);
  }
  
  .not-found__text {
    font-size: var(--font-size-xl);
    color: var(--color-text-secondary);
    margin-bottom: var(--spacing-lg);
  }
`;
document.head.appendChild(style);
