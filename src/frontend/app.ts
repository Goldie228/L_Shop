/**
 * App Entry Point - L_Shop Frontend
 * Main application initialization
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
  /** Layout component */
  private layout: Layout | null = null;
  
  /** Auth modal component */
  private authModal: AuthModal | null = null;
  
  /** Current page component */
  private currentPage: MainPage | null = null;
  
  /** App container element */
  private appContainer: HTMLElement | null = null;

  /**
   * Initialize application
   */
  public async init(): Promise<void> {
    console.log('L_Shop Frontend: Initializing...');
    
    // Get app container
    this.appContainer = document.getElementById('app');
    
    if (!this.appContainer) {
      console.error('App container not found');
      return;
    }
    
    // Clear loading state
    this.appContainer.innerHTML = '';
    
    try {
      // Check authentication status
      await this.checkAuth();
      
      // Setup router
      this.setupRouter();
      
      // Render app layout
      this.renderLayout();
      
      // Initialize router
      router.init();
      
      console.log('L_Shop Frontend: Initialized successfully');
    } catch (error) {
      console.error('L_Shop Frontend: Initialization error', error);
      this.showError('Ошибка инициализации приложения');
    }
  }

  /**
   * Check current authentication status
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
      console.error('Auth check error:', error);
      store.setUser(null);
    }
  }

  /**
   * Setup router with routes
   */
  private setupRouter(): void {
    // Register routes
    router.registerRoutes(APP_ROUTES);
    
    // Subscribe to route changes
    router.subscribe((route: Route) => {
      this.handleRouteChange(route);
    });
  }

  /**
   * Render app layout
   */
  private renderLayout(): void {
    if (!this.appContainer) return;
    
    // Create layout with Header, Main content area, and Footer
    this.layout = new Layout();
    this.layout.mount(this.appContainer);
  }

  /**
   * Handle route change
   * @param route - Current route
   */
  private handleRouteChange(route: Route): void {
    if (!this.layout) return;
    
    const mainContent = this.layout.getMainContent();
    if (!mainContent) return;
    
    // Clear current page
    if (this.currentPage) {
      this.currentPage.unmount();
      this.currentPage = null;
    }
    
    // Render new page based on route
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
   * Render 404 page
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
   * Open auth modal
   */
  private openAuthModal(): void {
    if (this.authModal) {
      this.authModal.open('login');
    }
  }

  /**
   * Handle successful authentication
   */
  private handleAuthSuccess(): void {
    // Refresh page to update user state
    if (this.currentPage) {
      this.currentPage.update();
    }
  }

  /**
   * Show error message
   * @param message - Error message
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

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const app = new App();
  app.init();
});

// Add global styles for loading and error states
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
