/**
 * Store - L_Shop Frontend
 * Простое управление состоянием с подписками
 */

import { User, UserState } from '../types/user.js';

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
 * Класс Store для управления состоянием
 */
export class Store {
  /** Текущее состояние */
  private state: AppState;
  
  /** Слушатели состояния */
  private listeners: Map<keyof AppState, Set<StateListener>> = new Map();
  
  /** Глобальные слушатели */
  private globalListeners: Set<StateListener<AppState>> = new Set();
  
  /** Единственный экземпляр */
  private static instance: Store | null = null;

  /**
   * Получить экземпляр store (синглтон)
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
   * Приватный для паттерна синглтона
   */
  private constructor() {
    this.state = { ...initialState };
  }

  /**
   * Получить текущее состояние
   * @returns Текущее состояние
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
   * @param user - Объект пользователя или null
   */
  public setUser(user: User | null): void {
    this.setUserState({
      user,
      isAuthenticated: user !== null,
      isLoading: false,
      error: null
    });
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

  /**
   * Подписаться на изменения состояния
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
          console.error(`Ошибка слушателя store для ${key}:`, error);
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
        console.error('Ошибка глобального слушателя store:', error);
      }
    });
  }

  /**
   * Сбросить состояние к начальному
   */
  public reset(): void {
    this.state = { ...initialState };
    this.notifyGlobalListeners();
    
    for (const key of Object.keys(initialState) as Array<keyof AppState>) {
      this.notifyListeners(key);
    }
  }
}

/**
 * Экземпляр store по умолчанию
 */
export const store = Store.getInstance();
