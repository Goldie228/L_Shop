/**
 * Router - L_Shop Frontend
 * Простой клиентский роутер на History API
 */

/**
 * Интерфейс маршрута
 */
export interface Route {
  /** Путь маршрута */
  path: string;
  /** Имя компонента страницы (для обратной совместимости) */
  component?: string;
  /** Заголовок страницы */
  title?: string;
  /** Обработчик маршрута */
  handler?: () => void;
  /** Требуется ли аутентификация */
  requiresAuth?: boolean;
  /** Путь перенаправления если требуется авторизация */
  authRedirect?: string;
}

/**
 * Слушатель изменения маршрута
 */
export type RouteChangeListener = (route: Route) => void;

/**
 * Класс Router для клиентской навигации
 * Использует History API для навигации без перезагрузки страницы
 * 
 * @example
 * ```typescript
 * const router = new Router();
 * 
 * // Простой способ регистрации
 * router.register('/', () => {
 *   console.log('Главная страница');
 * });
 * 
 * // Или через конфигурацию
 * router.registerRoutes([
 *   { path: '/', component: 'HomePage', handler: () => {} },
 *   { path: '*', component: 'NotFoundPage', handler: () => {} }
 * ]);
 * 
 * router.init();
 * 
 * // Программная навигация
 * router.navigate('/');
 * ```
 */
export class Router {
  /** Зарегистрированные маршруты */
  private routes: Map<string, Route>;

  /** Текущий маршрут */
  private currentRoute: Route | null = null;

  /** Слушатели изменения маршрута */
  private listeners: Set<RouteChangeListener> = new Set();

  /** Привязанный обработчик popstate */
  private boundPopStateHandler: (event: PopStateEvent) => void;

  /**
   * Создать экземпляр роутера
   */
  constructor() {
    this.routes = new Map();
    this.boundPopStateHandler = this.handlePopState.bind(this);
  }

  /**
   * Зарегистрировать маршрут (простой способ)
   * @param path - Путь маршрута (например, '/' или '*')
   * @param handler - Функция-обработчик, вызываемая при переходе на маршрут
   */
  public register(path: string, handler: () => void): void {
    this.routes.set(path, { path, handler });
  }

  /**
   * Зарегистрировать маршруты из массива конфигураций
   * @param routes - Массив конфигураций маршрутов
   */
  public registerRoutes(routes: Route[]): void {
    routes.forEach(route => {
      this.routes.set(route.path, route);
    });
  }

  /**
   * Перейти по указанному пути
   * @param path - Целевой путь
   */
  public navigate(path: string): void {
    // Не переходить, если тот же путь
    if (path === window.location.pathname) {
      return;
    }

    // Добавить запись в историю
    window.history.pushState({}, '', path);

    // Обработать маршрут
    this.handleRoute(path);
  }

  /**
   * Получить текущий маршрут
   * @returns Текущий маршрут или null
   */
  public getCurrentRoute(): Route | null {
    return this.currentRoute;
  }

  /**
   * Подписаться на изменения маршрута
   * @param listener - Функция-слушатель
   * @returns Функция отписки
   */
  public subscribe(listener: RouteChangeListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Инициализировать роутер
   * Устанавливает обработчик popstate и обрабатывает текущий URL
   */
  public init(): void {
    // Добавить обработчик для кнопок браузера назад/вперёд
    window.addEventListener('popstate', this.boundPopStateHandler);

    // Обработать начальный маршрут
    this.handleRoute(window.location.pathname);
  }

  /**
   * Уничтожить роутер и очистить ресурсы
   * Удаляет все слушатели событий
   */
  public destroy(): void {
    window.removeEventListener('popstate', this.boundPopStateHandler);
    this.routes.clear();
    this.listeners.clear();
    this.currentRoute = null;
  }

  /**
   * Обработать событие popstate (навигация браузера)
   * @param event - Событие PopStateEvent
   */
  private handlePopState(event: PopStateEvent): void {
    this.handleRoute(window.location.pathname);
  }

  /**
   * Найти маршрут по пути
   * @param path - Путь для поиска
   * @returns Найденный маршрут или undefined
   */
  private matchRoute(path: string): Route | undefined {
    // Сначала ищем точное совпадение
    const exactRoute = this.routes.get(path);
    if (exactRoute) {
      return exactRoute;
    }

    // Если точного совпадения нет, ищем маршрут 404
    return this.routes.get('*');
  }

  /**
   * Обработать маршрут
   * @param path - Путь для обработки
   */
  private handleRoute(path: string): void {
    const route = this.matchRoute(path);

    if (route) {
      this.currentRoute = route;

      // Обновить заголовок документа
      if (route.title) {
        document.title = `${route.title} | L_Shop`;
      } else {
        document.title = 'L_Shop';
      }

      // Вызвать обработчик если есть
      if (route.handler) {
        route.handler();
      }

      // Уведомить слушателей
      this.notifyListeners();
    } else {
      // Если нет обработчика, просто логируем
      console.warn(`[Router] Нет обработчика для маршрута: ${path}`);
    }
  }

  /**
   * Уведомить всех слушателей об изменении маршрута
   */
  private notifyListeners(): void {
    if (this.currentRoute) {
      this.listeners.forEach(listener => {
        try {
          listener(this.currentRoute!);
        } catch (error) {
          console.error('[Router] Ошибка слушателя:', error);
        }
      });
    }
  }
}

/**
 * Маршруты приложения
 */
export const APP_ROUTES: Route[] = [
  { path: '/', component: 'HomePage', title: 'Главная' },
  { path: '/profile', component: 'ProfilePage', title: 'Профиль', requiresAuth: true, authRedirect: '/' },
  { path: '/cart', component: 'CartPage', title: 'Корзина', requiresAuth: true, authRedirect: '/' },
  { path: '/delivery', component: 'DeliveryPage', title: 'Оформление заказа', requiresAuth: true, authRedirect: '/' },
  { path: '/orders', component: 'OrdersPage', title: 'Мои заказы', requiresAuth: true, authRedirect: '/' },
  { path: '*', component: 'NotFoundPage', title: 'Страница не найдена' }
];

/**
 * Экземпляр роутера (singleton)
 */
export const router = new Router();