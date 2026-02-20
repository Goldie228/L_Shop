/**
 * Точка входа приложения - Фронтенд L_Shop
 * Инициализация основного приложения
 */

import { store } from './store/store.js';
import { router, APP_ROUTES } from './router/router.js';
import { AuthService } from './services/auth.service.js';
import { Layout } from './components/layout/Layout.js';
import { AuthModal } from './components/auth/AuthModal.js';
import { MainPage } from './pages/MainPage.js';
import { Route } from './router/router.js';

/**
 * Application class
 * Manages app initialization and lifecycle
 */
class App {
  /** Компонент макета */
  private layout: Layout | null = null;
  
  /** Модальное окно аутентификации */
  private authModal: AuthModal | null = null;
  
  /** Текущий компонент страницы */
  private currentPage: MainPage | null = null;
  
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
    
    // Создать макет с Header, основной областью контента и Footer
    this.layout = new Layout();
    this.layout.mount(this.appContainer);
  }

  /**
   * Обработать изменение маршрута
   * @param route - Текущий маршрут
   */
  private handleRouteChange(route: Route): void {
    if (!this.layout) return;
    
    const mainContent = this.layout.getMainContent();
    if (!mainContent) return;
    
    // Очистить текущую страницу
    if (this.currentPage) {
      this.currentPage.unmount();
      this.currentPage = null;
    }
    
    // Отрендерить новую страницу на основе маршрута
    switch (route.component) {
      case 'MainPage':
        this.currentPage = new MainPage({
          onAuthClick: () => this.openAuthModal()
        });
        this.currentPage.mount(mainContent);
        break;
        
      case 'NotFoundPage':
        this.renderNotFoundPage();
        break;
        
      default:
        this.renderNotFoundPage();
    }
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
   * Открыть модальное окно аутентификации
   */
  private openAuthModal(): void {
    if (this.authModal) {
      this.authModal.open('login');
    }
  }
  
  /**
   * Обработать успешную аутентификацию
   */
  private handleAuthSuccess(): void {
    // Обновить страницу для обновления состояния пользователя
    if (this.currentPage) {
      this.currentPage.update();
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
