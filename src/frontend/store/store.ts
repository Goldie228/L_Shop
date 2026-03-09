import { User } from '../types/user';

/**
 * Типы модальных окон
 */
export type ModalType = 'auth' | string;

/**
 * Тип события сессии для обратного вызова
 */
export type SessionEvent = 'warning' | 'expired';

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
 * Состояние корзины
 */
interface CartState {
  /** Количество товаров в корзине */
  itemsCount: number;
  /** Общая сумма корзины */
  totalSum: number;
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
  /** Состояние корзины */
  cart: CartState;
}

/**
 * Callback для событий сессии
 */
export type SessionCallback = (event: SessionEvent) => void;

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

  /** Таймер предупреждения о сессии */
  private sessionWarningTimer: ReturnType<typeof setTimeout> | null = null;

  /** Время сессии в миллисекундах (15 минут) */
  private static readonly SESSION_TIMEOUT = 15 * 60 * 1000;

  /** Время предупреждения до окончания сессии (1 минута) */
  private static readonly SESSION_WARNING_TIME = 1 * 60 * 1000;

  /** Callback для событий сессии */
  private sessionCallback: SessionCallback | null = null;

  /** Слушатели изменений для канала 'user' */
  private userListeners: Array<(state: StoreState) => void> = [];

  /** Слушатели изменений для канала 'route' */
  private routeListeners: Array<(state: StoreState) => void> = [];

  /** Слушатели изменений для канала 'modal' */
  private modalListeners: Array<(state: StoreState) => void> = [];

  /** Глобальные слушатели всех изменений */
  private globalListeners: Array<(state: StoreState) => void> = [];

  /** Слушатели изменений для канала 'cart' */
  private cartListeners: Array<(state: StoreState) => void> = [];

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
    cart: {
      itemsCount: 0,
      totalSum: 0,
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
   * Устанавливает callback для событий сессии
   *
   * @param callback - Функция, вызываемая при событиях сессии
   *
   * @example
   * ```typescript
   * store.setSessionCallback((event) => {
   *   if (event === 'warning') {
   *     showSessionWarningModal();
   *   } else if (event === 'expired') {
   *     showSessionExpiredMessage();
   *   }
   * });
   * ```
   */
  public setSessionCallback(callback: SessionCallback | null): void {
    this.sessionCallback = callback;
  }

  /**
   * Продлевает сессию (сбрасывает таймеры)
   *
   * @example
   * ```typescript
   * store.extendSession(); // Продлить сессию на 15 минут
   * ```
   */
  public extendSession(): void {
    if (!this.state.user.isAuthenticated) return;

    // Очищаем предыдущие таймеры
    this.clearSessionTimers();

    // Запускаем новые таймеры
    this.startSessionTimers();
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
    // Используем structuredClone для более эффективного копирования
    return structuredClone(this.state);
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
    // Очищаем предыдущие таймеры
    this.clearSessionTimers();

    // Обновляем состояние
    this.state.user.user = user;
    this.state.user.isAuthenticated = user !== null;
    this.state.user.error = null;

    // Запускаем таймеры сессии для не-null пользователя
    if (user !== null) {
      this.startSessionTimers();
    }

    // Уведомляем слушателей канала 'user'
    this.notifyChannel('user');
  }

  /**
   * Очищает все таймеры сессии
   *
   * @private
   */
  private clearSessionTimers(): void {
    if (this.sessionTimer) {
      clearTimeout(this.sessionTimer);
      this.sessionTimer = null;
    }
    if (this.sessionWarningTimer) {
      clearTimeout(this.sessionWarningTimer);
      this.sessionWarningTimer = null;
    }
  }

  /**
   * Запускает таймеры сессии (предупреждение и истечение)
   *
   * @private
   */
  private startSessionTimers(): void {
    // Таймер предупреждения (за 1 минуту до истечения)
    const warningTime = Store.SESSION_TIMEOUT - Store.SESSION_WARNING_TIME;
    this.sessionWarningTimer = setTimeout(() => {
      if (this.sessionCallback) {
        this.sessionCallback('warning');
      }
    }, warningTime);

    // Таймер истечения сессии
    this.sessionTimer = setTimeout(() => {
      if (this.sessionCallback) {
        this.sessionCallback('expired');
      }
      this.setUser(null);
    }, Store.SESSION_TIMEOUT);
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
   * @param {'user' | 'route' | 'modal' | 'cart'} channel - Канал для подписки
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
    channel: 'user' | 'route' | 'modal' | 'cart',
    listener: (state: StoreState) => void,
  ): () => void {
    const listenersMap = {
      user: this.userListeners,
      route: this.routeListeners,
      modal: this.modalListeners,
      cart: this.cartListeners,
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
    // Очищаем все таймеры
    this.clearSessionTimers();

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
      cart: {
        itemsCount: 0,
        totalSum: 0,
      },
    };

    // Уведомляем все каналы
    this.notifyChannel('user');
    this.notifyChannel('route');
    this.notifyChannel('modal');
    this.notifyChannel('cart');
  }

  /**
   * Устанавливает состояние корзины
   *
   * @param itemsCount - Количество товаров
   * @param totalSum - Общая сумма
   *
   * @example
   * ```typescript
   * store.setCartState(5, 15000);
   * ```
   */
  public setCartState(itemsCount: number, totalSum: number): void {
    this.state.cart.itemsCount = itemsCount;
    this.state.cart.totalSum = totalSum;
    this.notifyChannel('cart');
  }

  /**
   * Возвращает количество товаров в корзине
   *
   * @returns Количество товаров
   */
  public getCartItemsCount(): number {
    return this.state.cart.itemsCount;
  }

  /**
   * Возвращает общую сумму корзины
   *
   * @returns Общая сумма
   */
  public getCartTotalSum(): number {
    return this.state.cart.totalSum;
  }

  /**
   * Сбрасывает состояние корзины
   *
   * @example
   * ```typescript
   * store.resetCart();
   * ```
   */
  public resetCart(): void {
    this.state.cart.itemsCount = 0;
    this.state.cart.totalSum = 0;
    this.notifyChannel('cart');
  }

  /**
   * Очищает всех слушателей (для предотвращения утечек памяти)
   *
   * @example
   * ```typescript
   * store.clearAllListeners();
   * ```
   */
  public clearAllListeners(): void {
    this.userListeners = [];
    this.routeListeners = [];
    this.modalListeners = [];
    this.cartListeners = [];
    this.globalListeners = [];
  }

  /**
   * Уведомляет слушателей конкретного канала
   *
   * @private
   * @param {'user' | 'route' | 'modal' | 'cart'} channel - Канал для уведомления
   */
  private notifyChannel(channel: 'user' | 'route' | 'modal' | 'cart'): void {
    // Все слушатели получают полное состояние StoreState
    const state = this.getState();

    const listenersMap = {
      user: this.userListeners,
      route: this.routeListeners,
      modal: this.modalListeners,
      cart: this.cartListeners,
    };

    // Вызываем канальные listeners
    listenersMap[channel].forEach((listener) => {
      try {
        listener(state);
      } catch {
        // Ошибка в слушателе игнорируется
      }
    });

    // Глобальные listeners всегда получают полное состояние
    this.globalListeners.forEach((listener) => {
      try {
        listener(state);
      } catch {
        // Ошибка в глобальном слушателе игнорируется
      }
    });
  }
}

/**
 * Экспортированный синглтон Store
 */
export const store = Store.getInstance();
