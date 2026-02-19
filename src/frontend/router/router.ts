/**
 * Router - L_Shop Frontend
 * Клиентский SPA роутер с History API
 */

import { store } from '../store/store.js';

/**
 * Конфигурация маршрута
 */
export interface Route {
  /** Путь маршрута */
  path: string;
  /** Имя компонента страницы */
  component: string;
  /** Заголовок страницы */
  title?: string;
  /** Требуется ли аутентификация */
  requiresAuth?: boolean;
  /** Путь перенаправления если требуется авторизация и пользователь не авторизован */
  authRedirect?: string;
}

/**
 * Результат сопоставления маршрута
 */
export interface RouteMatch {
  /** Сопоставленный маршрут */
  route: Route;
  /** Параметры маршрута */
  params: Record<string, string>;
}

/**
 * Опции навигации роутера
 */
export interface NavigationOptions {
  /** Добавить в историю */
  replace?: boolean;
  /** Состояние для передачи */
  state?: unknown;
}

/**
 * Слушатель изменения маршрута
 */
export type RouteChangeListener = (route: Route, params: Record<string, string>) => void;

/**
 * Класс Router для клиентской навигации
 */
export class Router {
  /** Конфигурации маршрутов */
  private routes: Map<string, Route> = new Map();
  
  /** Слушатели изменения маршрута */
  private listeners: Set<RouteChangeListener> = new Set();
  
  /** Текущий маршрут */
  private currentRoute: Route | null = null;
  
  /** Текущие параметры */
  private currentParams: Record<string, string> = {};
  
  /** Маршрут 404 */
  private notFoundRoute: Route | null = null;
  
  /** Единственный экземпляр */
  private static instance: Router | null = null;

  /**
   * Получить экземпляр роутера (синглтон)
   * @returns Экземпляр роутера
   */
  public static getInstance(): Router {
    if (!Router.instance) {
      Router.instance = new Router();
    }
    return Router.instance;
  }

  /**
   * Создать экземпляр роутера
   * Приватный для паттерна синглтона
   */
  private constructor() {
    this.setupEventListeners();
  }

  /**
   * Зарегистрировать маршруты
   * @param routes - Массив конфигураций маршрутов
   */
  public registerRoutes(routes: Route[]): void {
    routes.forEach(route => {
      this.routes.set(route.path, route);
      
      // Установить маршрут 404
      if (route.path === '*') {
        this.notFoundRoute = route;
      }
    });
  }

  /**
   * Инициализировать роутер
   * Вызвать после регистрации маршрутов
   */
  public init(): void {
    // Обработать начальный маршрут
    this.handleRoute(window.location.pathname);
  }

  /**
   * Перейти по пути
   * @param path - Целевой путь
   * @param options - Опции навигации
   */
  public navigate(path: string, options: NavigationOptions = {}): void {
    // Не переходить если тот же путь
    if (path === window.location.pathname) {
      return;
    }
    
    // Обновить историю браузера
    if (options.replace) {
      window.history.replaceState(options.state, '', path);
    } else {
      window.history.pushState(options.state, '', path);
    }
    
    // Обработать изменение маршрута
    this.handleRoute(path);
  }

  /**
   * Назад в истории
   */
  public back(): void {
    window.history.back();
  }

  /**
   * Вперёд в истории
   */
  public forward(): void {
    window.history.forward();
  }

  /**
   * Перейти на конкретную позицию в истории
   * @param delta - Количество позиций для перехода
   */
  public go(delta: number): void {
    window.history.go(delta);
  }

  /**
   * Получить текущий маршрут
   * @returns Текущий маршрут или null
   */
  public getCurrentRoute(): Route | null {
    return this.currentRoute;
  }

  /**
   * Получить текущие параметры
   * @returns Текущие параметры маршрута
   */
  public getCurrentParams(): Record<string, string> {
    return { ...this.currentParams };
  }

  /**
   * Проверить соответствует ли текущий маршрут пути
   * @param path - Путь для проверки
   * @returns Соответствует ли текущий маршрут
   */
  public isActive(path: string): boolean {
    return this.currentRoute?.path === path;
  }

  /**
   * Подписаться на изменения маршрута
   * @param listener - Функция слушателя
   * @returns Функция отписки
   */
  public subscribe(listener: RouteChangeListener): () => void {
    this.listeners.add(listener);
    
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Обработать изменение маршрута
   * @param path - Текущий путь
   */
  private handleRoute(path: string): void {
    const match = this.matchRoute(path);
    
    if (!match) {
      // Обработать 404
      if (this.notFoundRoute) {
        this.currentRoute = this.notFoundRoute;
        this.currentParams = {};
      } else {
        console.error(`Маршрут не найден: ${path}`);
        return;
      }
    } else {
      this.currentRoute = match.route;
      this.currentParams = match.params;
    }
    
    // Проверить требование авторизации
    if (this.currentRoute.requiresAuth) {
      const state = store.getState();
      if (!state.user.isAuthenticated) {
        const redirectPath = this.currentRoute.authRedirect || '/';
        this.navigate(redirectPath, { replace: true });
        return;
      }
    }
    
    // Обновить заголовок документа
    if (this.currentRoute.title) {
      document.title = `${this.currentRoute.title} | L_Shop`;
    } else {
      document.title = 'L_Shop';
    }
    
    // Обновить store
    store.setRoute(path);
    
    // Уведомить слушателей
    this.notifyListeners();
  }

  /**
   * Сопоставить путь с маршрутом
   * @param path - Путь для сопоставления
   * @returns Результат сопоставления маршрута или null
   */
  private matchRoute(path: string): RouteMatch | null {
    // Сначала попробовать точное совпадение
    const exactRoute = this.routes.get(path);
    if (exactRoute) {
      return { route: exactRoute, params: {} };
    }
    
    // Попробовать сопоставление по шаблону для динамических маршрутов
    for (const [pattern, route] of this.routes) {
      const params = this.matchPattern(pattern, path);
      if (params !== null) {
        return { route, params };
      }
    }
    
    return null;
  }

  /**
   * Сопоставить шаблон маршрута с путём
   * @param pattern - Шаблон маршрута (например, /user/:id)
   * @param path - Фактический путь
   * @returns Объект параметров или null если нет совпадения
   */
  private matchPattern(pattern: string, path: string): Record<string, string> | null {
    const patternParts = pattern.split('/').filter(Boolean);
    const pathParts = path.split('/').filter(Boolean);
    
    // Должно быть одинаковое количество частей
    if (patternParts.length !== pathParts.length) {
      return null;
    }
    
    const params: Record<string, string> = {};
    
    for (let i = 0; i < patternParts.length; i++) {
      const patternPart = patternParts[i];
      const pathPart = pathParts[i];
      
      // Динамический параметр
      if (patternPart.startsWith(':')) {
        const paramName = patternPart.slice(1);
        params[paramName] = pathPart;
      }
      // Требуется точное совпадение
      else if (patternPart !== pathPart) {
        return null;
      }
    }
    
    return params;
  }

  /**
   * Настроить слушатели событий
   */
  private setupEventListeners(): void {
    // Обработать назад/вперёд браузера
    window.addEventListener('popstate', () => {
      this.handleRoute(window.location.pathname);
    });
    
    // Обработать клики по ссылкам
    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      const link = target.closest('a[href]');
      
      if (link) {
        const href = link.getAttribute('href');
        
        // Обрабатывать только внутренние ссылки
        if (href && href.startsWith('/') && !link.hasAttribute('target')) {
          event.preventDefault();
          this.navigate(href);
        }
      }
    });
  }

  /**
   * Уведомить слушателей об изменении маршрута
   */
  private notifyListeners(): void {
    if (this.currentRoute) {
      this.listeners.forEach(listener => {
        try {
          listener(this.currentRoute!, this.currentParams);
        } catch (error) {
          console.error('Ошибка слушателя роутера:', error);
        }
      });
    }
  }
}

/**
 * Маршруты приложения
 */
export const APP_ROUTES: Route[] = [
  { path: '/', component: 'MainPage', title: 'Главная' },
  { path: '*', component: 'NotFoundPage', title: 'Страница не найдена' }
];

/**
 * Экземпляр роутера по умолчанию
 */
export const router = Router.getInstance();
