/**
 * Точка входа приложения - Фронтенд L_Shop
 * Инициализация основного приложения
 */

import { store } from './store/store.js';
import { router, APP_ROUTES } from './router/router.js';
import { AuthService, AuthEventEmitter } from './services/auth.service.js';
import { Layout } from './components/layout/Layout.js';
import { AuthModal } from './components/auth/AuthModal.js';
import { ProfilePage } from './components/pages/ProfilePage.js';
import { DeliveryPage } from './components/pages/DeliveryPage.js';
import { MainPage } from './components/pages/MainPage.js';
import { Route } from './router/router.js';

// Импорт стилей страниц
import './styles/pages/delivery.css';
import './styles/components/product-card.css';

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

  /**
   * Инициализировать приложение
   */
  public async init(): Promise<void> {
    console.log('L_Shop Frontend: Инициализация...');
    
    // Получить контейнер приложения
    this.appContainer = document.getElementById('app');
    
    if (!this.appContainer) {
      console.error('Контейнер приложения не найден');
      return;
    }
    
    // Очистить состояние загрузки
    this.appContainer.innerHTML = '';
    
    try {
      // Проверить статус аутентификации
      await this.checkAuth();
      
      // Настроить роутер
      this.setupRouter();
      
      // Отрендерить макет приложения
      this.renderLayout();
      
      // Инициализировать роутер
      router.init();
      
      console.log('L_Shop Frontend: Инициализировано успешно');
    } catch (error) {
      console.error('L_Shop Frontend: Ошибка инициализации', error);
      this.showError('Ошибка инициализации приложения');
    }
  }

  /**
   * Проверить текущий статус аутентификации
   */
  private async checkAuth(): Promise<void> {
    store.setLoading(true);
    
    try {
      const user = await AuthService.getCurrentUser();
      if (user) {
        store.setUser(user);
      } else {
        store.setUser(null);
      }
    } catch (error) {
      console.error('Ошибка проверки аутентификации:', error);
      store.setUser(null);
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
    console.log('Авторизация успешна');
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

      case 'ProfilePage':
        this.renderProfilePage();
        break;

      case 'DeliveryPage':
        this.renderDeliveryPage();
        break;

      case 'OrdersPage':
        this.renderOrdersPage();
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
        console.log('Добавлен в корзину:', productId);
      },
    });
    mainContent.appendChild(mainPage.render());
  }

  /**
   * Отрендерить страницу 404
   */
  private renderNotFoundPage(): void {
    if (!this.layout) return;
    
    const mainContent = this.layout.getMainContent();
    if (!mainContent) return;
    
    mainContent.innerHTML = `
      <div class="page not-found-page">
        <div class="layout__content text-center">
          <h1 class="not-found__title">404</h1>
          <p class="not-found__text">Страница не найдена</p>
          <a href="/" class="btn btn--primary">На главную</a>
        </div>
      </div>
    `;
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

    // Заглушка для страницы заказов
    mainContent.innerHTML = `
      <div class="page orders-page">
        <div class="container">
          <h1 class="page__title">Мои заказы</h1>
          <p class="text-secondary">Список ваших заказов будет отображён здесь.</p>
        </div>
      </div>
    `;
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
