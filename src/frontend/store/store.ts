/**
 * Store - L_Shop Frontend
 * Управление состоянием приложения с подписками и таймером сессии
 */

import { User, UserState } from '../types/user.js';

/**
 * Длительность сессии по умолчанию (fallback)
 * Реальное значение получается с backend через /api/auth/session-config
 */
const DEFAULT_SESSION_DURATION_MINUTES = 10;

/** Хранит длительность сессии в минутах */
let sessionDurationMinutes = DEFAULT_SESSION_DURATION_MINUTES;

/**
 * Загрузить конфигурацию сессии с сервера
 * Следует вызвать при инициализации приложения
 */
export async function loadSessionConfig(): Promise<void> {
  try {
    const response = await fetch('/api/auth/session-config');
    if (response.ok) {
      const data = await response.json();
      sessionDurationMinutes = data.sessionDurationMinutes || DEFAULT_SESSION_DURATION_MINUTES;
      console.log(`[Store] Загружена конфигурация сессии: ${sessionDurationMinutes} минут`);
    }
  } catch (error) {
    console.warn('[Store] Не удалось загрузить конфигурацию сессии, используется значение по умолчанию');
  }
}

/**
 * Интерфейс состояния приложения
 */
export interface AppState {
  /** Состояние пользователя */
  user: UserState;
  /** Текущий маршрут */
  route: string;
  /** Состояние модального окна */
  modal: {
    /** Открыто ли модальное окно */
    isOpen: boolean;
    /** Тип модального окна */
    type: string | null;
  };
}

/**
 * Начальное состояние приложения
 */
const initialState: AppState = {
  user: {
    user: null,
    isAuthenticated: false,
    isLoading: false,
    error: null
  },
  route: '/',
  modal: {
    isOpen: false,
    type: null
  }
};

/**
 * Слушатель изменения состояния
 */
export type StateListener<T = unknown> = (state: T) => void;

/**
 * Класс Store для управления состоянием приложения
 * Реализует паттерн Singleton
 * 
 * @example
 * ```typescript
 * // Получить состояние
 * const state = store.getState();
 * 
 * // Установить пользователя
 * store.setUser(user);
 * 
 * // Подписаться на изменения
 * const unsubscribe = store.subscribe('user', (state) => {
 *   console.log('User state changed:', state);
 * });
 * 
 * // Таймер сессии
 * store.startSessionTimer();
 * store.resetSessionTimer(); // При активности пользователя
 * ```
 */
export class Store {
  /** Текущее состояние */
  private state: AppState;

  /** Слушатели состояния по ключам */
  private listeners: Map<keyof AppState, Set<StateListener>> = new Map();

  /** Глобальные слушатели */
  private globalListeners: Set<StateListener<AppState>> = new Set();

  /** Таймер сессии */
  private sessionTimer: ReturnType<typeof setTimeout> | null = null;

  /** Единственный экземпляр (Singleton) */
  private static instance: Store | null = null;

  /**
   * Получить экземпляр store (Singleton)
   * @returns Экземпляр store
   */
  public static getInstance(): Store {
    if (!Store.instance) {
      Store.instance = new Store();
    }
    return Store.instance;
  }

  /**
   * Создать экземпляр store
   * Приватный конструктор для паттерна Singleton
   */
  private constructor() {
    this.state = { ...initialState };
  }

  // =========================================
  // Получение состояния
  // =========================================

  /**
   * Получить текущее состояние приложения
   * @returns Копия текущего состояния
   */
  public getState(): AppState {
    return { ...this.state };
  }

  /**
   * Получить конкретный срез состояния
   * @param key - Ключ состояния
   * @returns Срез состояния
   */
  public getSlice<K extends keyof AppState>(key: K): AppState[K] {
    const value = this.state[key];
    // Вернуть копию для объектных типов, значение напрямую для примитивов
    if (typeof value === 'object' && value !== null) {
      return { ...value } as AppState[K];
    }
    return value;
  }

  /**
   * Получить текущего пользователя
   * @returns Объект пользователя или null
   */
  public getUser(): User | null {
    return this.state.user.user;
  }

  /**
   * Проверить, аутентифицирован ли пользователь
   * @returns true если пользователь аутентифицирован
   */
  public isAuthenticated(): boolean {
    return this.state.user.isAuthenticated;
  }

  // =========================================
  // Изменение состояния
  // =========================================

  /**
   * Обновить состояние
   * @param partial - Частичное состояние для слияния
   */
  public setState(partial: Partial<AppState>): void {
    const prevState = { ...this.state };
    this.state = { ...this.state, ...partial };

    // Уведомить конкретных слушателей
    for (const key of Object.keys(partial) as Array<keyof AppState>) {
      if (prevState[key] !== this.state[key]) {
        this.notifyListeners(key);
      }
    }

    // Уведомить глобальных слушателей
    this.notifyGlobalListeners();
  }

  /**
   * Обновить состояние пользователя
   * @param partial - Частичное состояние пользователя
   */
  public setUserState(partial: Partial<UserState>): void {
    this.setState({
      user: { ...this.state.user, ...partial }
    });
  }

  /**
   * Установить текущего пользователя
   * При установке пользователя автоматически запускается таймер сессии
   * @param user - Объект пользователя или null
   */
  public setUser(user: User | null): void {
    this.setUserState({
      user,
      isAuthenticated: user !== null,
      isLoading: false,
      error: null
    });

    // Управление таймером сессии
    if (user) {
      this.startSessionTimer();
    } else {
      this.clearSessionTimer();
    }
  }

  /**
   * Установить состояние загрузки
   * @param isLoading - Состояние загрузки
   */
  public setLoading(isLoading: boolean): void {
    this.setUserState({ isLoading });
  }

  /**
   * Установить состояние ошибки
   * @param error - Сообщение об ошибке или null
   */
  public setError(error: string | null): void {
    this.setUserState({ error, isLoading: false });
  }

  /**
   * Выход пользователя из системы
   * Очищает данные пользователя и останавливает таймер сессии
   */
  public logout(): void {
    this.clearSessionTimer();
    this.setUserState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null
    });
  }

  /**
   * Установить текущий маршрут
   * @param route - Путь маршрута
   */
  public setRoute(route: string): void {
    this.setState({ route });
  }

  /**
   * Открыть модальное окно
   * @param type - Тип модального окна
   */
  public openModal(type: string): void {
    this.setState({
      modal: { isOpen: true, type }
    });
  }

  /**
   * Закрыть модальное окно
   */
  public closeModal(): void {
    this.setState({
      modal: { isOpen: false, type: null }
    });
  }

  // =========================================
  // Подписка на изменения
  // =========================================

  /**
   * Подписаться на изменения конкретного ключа состояния
   * @param key - Ключ состояния для отслеживания
   * @param listener - Функция слушателя
   * @returns Функция отписки
   */
  public subscribe<K extends keyof AppState>(
    key: K,
    listener: StateListener<AppState[K]>
  ): () => void {
    if (!this.listeners.has(key)) {
      this.listeners.set(key, new Set());
    }

    const listeners = this.listeners.get(key)!;
    listeners.add(listener as StateListener);

    // Вернуть функцию отписки
    return () => {
      listeners.delete(listener as StateListener);
    };
  }

  /**
   * Подписаться на все изменения состояния
   * @param listener - Функция слушателя
   * @returns Функция отписки
   */
  public subscribeAll(listener: StateListener<AppState>): () => void {
    this.globalListeners.add(listener);

    return () => {
      this.globalListeners.delete(listener);
    };
  }

  // =========================================
  // Таймер сессии
  // =========================================

  /**
   * Запустить таймер сессии
   * Автоматически вызывается при setUser с валидным пользователем
   * По истечении времени пользователь будет разлогинен
   */
  public startSessionTimer(): void {
    this.clearSessionTimer();

    this.sessionTimer = setTimeout(() => {
      this.handleSessionExpired();
    }, sessionDurationMinutes * 60 * 1000);

    console.log(
      `[Store] Таймер сессии запущен на ${sessionDurationMinutes} минут`
    );
  }

  /**
   * Сбросить таймер сессии
   * Вызывается при активности пользователя для продления сессии
   */
  public resetSessionTimer(): void {
    if (this.state.user.isAuthenticated) {
      this.startSessionTimer();
    }
  }

  /**
   * Очистить таймер сессии
   * Вызывается при logout или установке null пользователя
   */
  public clearSessionTimer(): void {
    if (this.sessionTimer) {
      clearTimeout(this.sessionTimer);
      this.sessionTimer = null;
      console.log('[Store] Таймер сессии очищен');
    }
  }

  /**
   * Обработать истечение сессии
   * Разлогинивает пользователя и показывает сообщение
   */
  private handleSessionExpired(): void {
    console.log('[Store] Сессия истекла');

    // Очистить таймер
    this.sessionTimer = null;

    // Разлогинить пользователя
    this.setUserState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: 'Сессия истекла. Пожалуйста, войдите снова.'
    });

    // Можно добавить редирект на страницу входа или открытие модального окна
    // Это будет реализовано в app.ts через подписку на изменения
  }

  // =========================================
  // Приватные методы
  // =========================================

  /**
   * Уведомить слушателей для конкретного ключа
   * @param key - Ключ состояния
   */
  private notifyListeners(key: keyof AppState): void {
    const listeners = this.listeners.get(key);
    if (listeners) {
      const slice = this.getSlice(key);
      listeners.forEach(listener => {
        try {
          listener(slice);
        } catch (error) {
          console.error(`[Store] Ошибка слушателя для ${key}:`, error);
        }
      });
    }
  }

  /**
   * Уведомить глобальных слушателей
   */
  private notifyGlobalListeners(): void {
    const state = this.getState();
    this.globalListeners.forEach(listener => {
      try {
        listener(state);
      } catch (error) {
        console.error('[Store] Ошибка глобального слушателя:', error);
      }
    });
  }

  /**
   * Сбросить состояние к начальному
   */
  public reset(): void {
    this.clearSessionTimer();
    this.state = { ...initialState };
    this.notifyGlobalListeners();

    for (const key of Object.keys(initialState) as Array<keyof AppState>) {
      this.notifyListeners(key);
    }
  }
}

/**
 * Экземпляр store (Singleton)
 */
export const store = Store.getInstance();
