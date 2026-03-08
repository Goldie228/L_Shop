import { User } from '../types/user';

/**
 * Типы модальных окон
 */
export type ModalType = 'auth' | string;

/**
 * Состояние модального окна
 */
interface ModalState {
  /** Флаг открытия модального окна */
  isOpen: boolean;
  /** Тип модального окна */
  type: ModalType | null;
}

/**
 * Состояние пользователя (внутренний интерфейс)
 */
interface UserState {
  /** Объект пользователя или null */
  user: User | null;
  /** Ошибка аутентификации или null */
  error: string | null;
  /** Флаг загрузки */
  isLoading: boolean;
  /** Флаг аутентификации */
  isAuthenticated: boolean;
}

/**
 * Глобальное состояние приложения
 */
export interface StoreState {
  /** Состояние пользователя */
  user: UserState;
  /** Текущий маршрут */
  route: string;
  /** Состояние модального окна */
  modal: ModalState;
}

/**
 * Класс Store для управления состоянием приложения (Синглтон)
 *
 * @example
 * ```typescript
 * const store = Store.getInstance();
 * store.setUser(user);
 * const state = store.getState();
 * ```
 */
export class Store {
  /** Единственный экземпляр Store */
  private static instance: Store | null = null;

  /** Таймер сессии */
  private sessionTimer: ReturnType<typeof setTimeout> | null = null;

  /** Время сессии в миллисекундах (15 минут) */
  private static readonly SESSION_TIMEOUT = 15 * 60 * 1000;

  /** Слушатели изменений для канала 'user' */
  private userListeners: Array<(state: StoreState) => void> = [];

  /** Слушатели изменений для канала 'route' */
  private routeListeners: Array<(state: StoreState) => void> = [];

  /** Слушатели изменений для канала 'modal' */
  private modalListeners: Array<(state: StoreState) => void> = [];

  /** Глобальные слушатели всех изменений */
  private globalListeners: Array<(state: StoreState) => void> = [];

  /** Текущее состояние */
  private state: StoreState = {
    user: {
      user: null,
      error: null,
      isLoading: false,
      isAuthenticated: false,
    },
    route: '/',
    modal: {
      isOpen: false,
      type: null,
    },
  };

  /**
   * Приватный конструктор для синглтона
   */
  private constructor() {
    // Инициализация состояния по умолчанию уже выполнена выше
  }

  /**
   * Возвращает экземпляр Store (синглтон)
   *
   * @returns {Store} Единственный экземпляр Store
   *
   * @example
   * ```typescript
   * const store = Store.getInstance();
   * ```
   */
  public static getInstance(): Store {
    if (!Store.instance) {
      Store.instance = new Store();
    }
    return Store.instance;
  }

  /**
   * Возвращает глубокую копию текущего состояния
   *
   * @returns {StoreState} Глубокий клон состояния
   *
   * @example
   * ```typescript
   * const state = store.getState();
   * console.log(state.user.user);
   * ```
   */
  public getState(): StoreState {
    // Глубокое копирование через JSON
    return JSON.parse(JSON.stringify(this.state));
  }

  /**
   * Устанавливает пользователя и управляет таймером сессии
   *
   * @param {User | null} user - Пользователь или null для выхода
   *
   * @throws {Error} При ошибке установки пользователя
   *
   * @example
   * ```typescript
   * store.setUser(mockUser); // Вход
   * store.setUser(null); // Выход
   * ```
   */
  public setUser(user: User | null): void {
    // Очищаем предыдущий таймер
    if (this.sessionTimer) {
      clearTimeout(this.sessionTimer);
      this.sessionTimer = null;
    }

    // Обновляем состояние
    this.state.user.user = user;
    this.state.user.isAuthenticated = user !== null;
    this.state.user.error = null;

    // Запускаем таймер сессии для не-null пользователя
    if (user !== null) {
      this.sessionTimer = setTimeout(() => {
        this.setUser(null);
      }, Store.SESSION_TIMEOUT);
    }

    // Уведомляем слушателей канала 'user'
    this.notifyChannel('user');
  }

  /**
   * Возвращает текущего пользователя
   *
   * @returns {User | null} Пользователь или null
   */
  public getUser(): User | null {
    return this.state.user.user;
  }

  /**
   * Проверяет, аутентифицирован ли пользователь
   *
   * @returns {boolean} true если пользователь аутентифицирован
   */
  public isAuthenticated(): boolean {
    return this.state.user.isAuthenticated;
  }

  /**
   * Подписывается на изменения конкретного канала
   *
   * @param {'user' | 'route' | 'modal'} channel - Канал для подписки
   * @param {(state: StoreState) => void} listener - Функция-слушатель
   *
   * @returns {() => void} Функция отписки
   *
   * @example
   * ```typescript
   * const unsubscribe = store.subscribe('user', (state) => {
   *   console.log('User changed:', state.user);
   * });
   * // Отписаться: unsubscribe();
   * ```
   */
  public subscribe(
    channel: 'user' | 'route' | 'modal',
    listener: (state: StoreState) => void,
  ): () => void {
    const listenersMap = {
      user: this.userListeners,
      route: this.routeListeners,
      modal: this.modalListeners,
    };

    const channelListeners = listenersMap[channel];
    channelListeners.push(listener);

    // Возвращаем функцию отписки
    return () => {
      const index = channelListeners.indexOf(listener);
      if (index > -1) {
        channelListeners.splice(index, 1);
      }
    };
  }

  /**
   * Подписывается на все изменения состояния
   *
   * @param {(state: StoreState) => void} listener - Функция-слушатель
   *
   * @returns {() => void} Функция отписки
   *
   * @example
   * ```typescript
   * const unsubscribe = store.subscribeAll((state) => {
   *   console.log('State changed:', state);
   * });
   * ```
   */
  public subscribeAll(listener: (state: StoreState) => void): () => void {
    this.globalListeners.push(listener);

    // Возвращаем функцию отписки
    return () => {
      const index = this.globalListeners.indexOf(listener);
      if (index > -1) {
        this.globalListeners.splice(index, 1);
      }
    };
  }

  /**
   * Открывает модальное окно
   *
   * @param {ModalType} type - Тип модального окна
   *
   * @example
   * ```typescript
   * store.openModal('auth');
   * ```
   */
  public openModal(type: ModalType): void {
    this.state.modal.isOpen = true;
    this.state.modal.type = type;
    this.notifyChannel('modal');
  }

  /**
   * Закрывает модальное окно
   *
   * @example
   * ```typescript
   * store.closeModal();
   * ```
   */
  public closeModal(): void {
    this.state.modal.isOpen = false;
    this.state.modal.type = null;
    this.notifyChannel('modal');
  }

  /**
   * Устанавливает текущий маршрут
   *
   * @param {string} route - Новый маршрут
   *
   * @example
   * ```typescript
   * store.setRoute('/profile');
   * ```
   */
  public setRoute(route: string): void {
    this.state.route = route;
    this.notifyChannel('route');
  }

  /**
   * Устанавливает ошибку
   *
   * @param {string | null} error - Текст ошибки или null для очистки
   *
   * @example
   * ```typescript
   * store.setError('Ошибка входа');
   * store.setError(null); // Очистить
   * ```
   */
  public setError(error: string | null): void {
    this.state.user.error = error;
    this.notifyChannel('user');
  }

  /**
   * Устанавливает состояние загрузки
   *
   * @param {boolean} loading - Флаг загрузки
   *
   * @example
   * ```typescript
   * store.setLoading(true); // Начать загрузку
   * store.setLoading(false); // Завершить загрузку
   * ```
   */
  public setLoading(loading: boolean): void {
    this.state.user.isLoading = loading;
    this.notifyChannel('user');
  }

  /**
   * Сбрасывает состояние к начальным значениям
   *
   * @example
   * ```typescript
   * store.reset();
   * ```
   */
  public reset(): void {
    // Очищаем таймер
    if (this.sessionTimer) {
      clearTimeout(this.sessionTimer);
      this.sessionTimer = null;
    }

    // Сбрасываем состояние
    this.state = {
      user: {
        user: null,
        error: null,
        isLoading: false,
        isAuthenticated: false,
      },
      route: '/',
      modal: {
        isOpen: false,
        type: null,
      },
    };

    // Уведомляем все каналы
    this.notifyChannel('user');
    this.notifyChannel('route');
    this.notifyChannel('modal');
  }

  /**
   * Уведомляет слушателей конкретного канала
   *
   * @private
   * @param {'user' | 'route' | 'modal'} channel - Канал для уведомления
   */
  private notifyChannel(channel: 'user' | 'route' | 'modal'): void {
    // Определяем состояние для канала
    const channelState: StoreState | UserState = channel === 'user' ? JSON.parse(JSON.stringify(this.state.user)) : this.getState();

    const listenersMap = {
      user: this.userListeners,
      route: this.routeListeners,
      modal: this.modalListeners,
    };

    // Вызываем канальные listeners
    listenersMap[channel].forEach((listener) => {
      try {
        // Приводим тип для user канала
        listener(channelState as StoreState);
      } catch (error) {
        console.error(`Ошибка в слушателе канала ${channel}:`, error);
      }
    });

    // Глобальные listeners всегда получают полное состояние
    const fullState = this.getState();
    this.globalListeners.forEach((listener) => {
      try {
        listener(fullState);
      } catch (error) {
        console.error('Ошибка в глобальном слушателе:', error);
      }
    });
  }
}

/**
 * Экспортированный синглтон Store
 */
export const store = Store.getInstance();
