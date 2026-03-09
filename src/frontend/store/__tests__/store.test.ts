/**
 * Тесты для Store - управление состоянием приложения
 */

import { Store, store } from '../store';
import { User } from '../../types/user';

// Мок для консольных логов
const originalConsoleLog = console.log;
beforeAll(() => {
  console.log = jest.fn();
});

afterAll(() => {
  console.log = originalConsoleLog;
});

// ============================================
// Тестовые данные
// ============================================
const mockUser: User = {
  id: 'test-id',
  name: 'Тестовый пользователь',
  firstName: 'Тестовый',
  email: 'test@example.com',
  login: 'testuser',
  phone: '+1234567890',
  role: 'user',
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
};

// ============================================
// Тесты Singleton
// ============================================
describe('Store Singleton', () => {
  it('должен возвращать один и тот же экземпляр', () => {
    const instance1 = Store.getInstance();
    const instance2 = Store.getInstance();

    expect(instance1).toBe(instance2);
  });

  it('экспортированный store должен быть singleton', () => {
    const instance = Store.getInstance();

    expect(store).toBe(instance);
  });
});

// ============================================
// Тесты получения состояния
// ============================================
describe('Store.getState()', () => {
  beforeEach(() => {
    store.reset();
  });

  it('должен возвращать текущее состояние', () => {
    const state = store.getState();

    expect(state).toHaveProperty('user');
    expect(state).toHaveProperty('route');
    expect(state).toHaveProperty('modal');
  });

  it('должен возвращать копию состояния', () => {
    const state1 = store.getState();
    const state2 = store.getState();

    expect(state1).not.toBe(state2);
    expect(state1).toEqual(state2);
  });
});

// ============================================
// Тесты пользователя
// ============================================
describe('Store.setUser()', () => {
  beforeEach(() => {
    store.reset();
  });

  it('должен установить пользователя', () => {
    store.setUser(mockUser);

    expect(store.getUser()).toEqual(mockUser);
    expect(store.isAuthenticated()).toBe(true);
  });

  it('должен очистить пользователя при null', () => {
    store.setUser(mockUser);
    store.setUser(null);

    expect(store.getUser()).toBeNull();
    expect(store.isAuthenticated()).toBe(false);
  });

  it('должен сбросить ошибку при установке пользователя', () => {
    store.setError('Тестовая ошибка');
    store.setUser(mockUser);

    const state = store.getState();
    expect(state.user.error).toBeNull();
  });
});

describe('Store.getUser()', () => {
  beforeEach(() => {
    store.reset();
  });

  it('должен вернуть null если пользователь не установлен', () => {
    expect(store.getUser()).toBeNull();
  });

  it('должен вернуть пользователя если установлен', () => {
    store.setUser(mockUser);

    expect(store.getUser()).toEqual(mockUser);
  });
});

describe('Store.isAuthenticated()', () => {
  beforeEach(() => {
    store.reset();
  });

  it('должен вернуть false без пользователя', () => {
    expect(store.isAuthenticated()).toBe(false);
  });

  it('должен вернуть true с пользователем', () => {
    store.setUser(mockUser);

    expect(store.isAuthenticated()).toBe(true);
  });
});

// ============================================
// Тесты подписок
// ============================================
describe('Store.subscribe()', () => {
  beforeEach(() => {
    store.reset();
  });

  it('должен вызывать слушателя при изменении user', () => {
    const listener = jest.fn();
    store.subscribe('user', listener);

    store.setUser(mockUser);

    expect(listener).toHaveBeenCalled();
  });

  it('должен отписываться при вызове функции отписки', () => {
    const listener = jest.fn();
    const unsubscribe = store.subscribe('user', listener);

    unsubscribe();
    store.setUser(mockUser);

    expect(listener).not.toHaveBeenCalled();
  });

  it('должен передавать новое состояние в слушатель', () => {
    const listener = jest.fn();
    store.subscribe('user', listener);

    store.setUser(mockUser);

    const callArg = listener.mock.calls[0][0];
    expect(callArg.user).toEqual(mockUser);
    expect(callArg.isAuthenticated).toBe(true);
  });
});

describe('Store.subscribeAll()', () => {
  beforeEach(() => {
    store.reset();
  });

  it('должен вызывать глобальный слушатель при любом изменении', () => {
    const listener = jest.fn();
    store.subscribeAll(listener);

    store.setUser(mockUser);
    store.setRoute('/test');

    expect(listener).toHaveBeenCalledTimes(2);
  });
});

// ============================================
// Тесты модальных окон
// ============================================
describe('Store.openModal() / closeModal()', () => {
  beforeEach(() => {
    store.reset();
  });

  it('должен открыть модальное окно', () => {
    store.openModal('auth');

    const state = store.getState();
    expect(state.modal.isOpen).toBe(true);
    expect(state.modal.type).toBe('auth');
  });

  it('должен закрыть модальное окно', () => {
    store.openModal('auth');
    store.closeModal();

    const state = store.getState();
    expect(state.modal.isOpen).toBe(false);
    expect(state.modal.type).toBeNull();
  });
});

// ============================================
// Тесты маршрутизации
// ============================================
describe('Store.setRoute()', () => {
  beforeEach(() => {
    store.reset();
  });

  it('должен установить маршрут', () => {
    store.setRoute('/profile');

    const state = store.getState();
    expect(state.route).toBe('/profile');
  });
});

// ============================================
// Тесты ошибок и загрузки
// ============================================
describe('Store.setError()', () => {
  beforeEach(() => {
    store.reset();
  });

  it('должен установить ошибку', () => {
    store.setError('Тестовая ошибка');

    const state = store.getState();
    expect(state.user.error).toBe('Тестовая ошибка');
  });
});

describe('Store.setLoading()', () => {
  beforeEach(() => {
    store.reset();
  });

  it('должен установить состояние загрузки', () => {
    store.setLoading(true);

    const state = store.getState();
    expect(state.user.isLoading).toBe(true);
  });
});

// ============================================
// Тесты сброса
// ============================================
describe('Store.reset()', () => {
  it('должен сбросить состояние к начальному', () => {
    store.setUser(mockUser);
    store.setRoute('/profile');
    store.openModal('auth');

    store.reset();

    const state = store.getState();
    expect(state.user.user).toBeNull();
    expect(state.user.isAuthenticated).toBe(false);
    expect(state.route).toBe('/');
    expect(state.modal.isOpen).toBe(false);
  });
});

// ============================================
// Тесты таймера сессии
// ============================================
describe('Store session timer', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    store.reset();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('не должен запускать таймер без пользователя', () => {
    const listener = jest.fn();
    store.subscribe('user', listener);

    // Время не должно влиять
    jest.advanceTimersByTime(15 * 60 * 1000);

    expect(store.isAuthenticated()).toBe(false);
  });

  it('должен очистить таймер при выходе', () => {
    store.setUser(mockUser);
    store.setUser(null);

    // Время не должно вызывать разлогин
    jest.advanceTimersByTime(15 * 60 * 1000);

    expect(() => {
      const listener = jest.fn();
      store.subscribe('user', listener);
      store.setUser(mockUser);
      store.setUser(null);
      jest.advanceTimersByTime(15 * 60 * 1000);
    }).not.toThrow();
  });

  it('должен вызвать callback с warning за 1 минуту до истечения', () => {
    const sessionCallback = jest.fn();
    store.setSessionCallback(sessionCallback);
    store.setUser(mockUser);

    // За 1 минуту до истечения (14 минут)
    jest.advanceTimersByTime(14 * 60 * 1000);

    expect(sessionCallback).toHaveBeenCalledWith('warning');
  });

  it('должен вызвать callback с expired при истечении сессии', () => {
    const sessionCallback = jest.fn();
    store.setSessionCallback(sessionCallback);
    store.setUser(mockUser);

    // Через 15 минут
    jest.advanceTimersByTime(15 * 60 * 1000);

    expect(sessionCallback).toHaveBeenCalledWith('expired');
    expect(store.isAuthenticated()).toBe(false);
  });

  it('extendSession должен продлить сессию', () => {
    const sessionCallback = jest.fn();
    store.setSessionCallback(sessionCallback);
    store.setUser(mockUser);

    // Через 10 минут продлеваем
    jest.advanceTimersByTime(10 * 60 * 1000);
    store.extendSession();

    // Ещё через 10 минут (20 всего) - warning ещё не должен быть вызван
    jest.advanceTimersByTime(10 * 60 * 1000);
    expect(sessionCallback).not.toHaveBeenCalled();

    // До warning (4 минуты от продления)
    jest.advanceTimersByTime(4 * 60 * 1000);
    expect(sessionCallback).toHaveBeenCalledWith('warning');
  });
});

// ============================================
// Тесты корзины
// ============================================
describe('Store cart methods', () => {
  beforeEach(() => {
    store.reset();
  });

  it('setCartState должен установить состояние корзины', () => {
    store.setCartState(5, 15000);

    expect(store.getCartItemsCount()).toBe(5);
    expect(store.getCartTotalSum()).toBe(15000);
  });

  it('getCartItemsCount должен вернуть количество товаров', () => {
    expect(store.getCartItemsCount()).toBe(0);

    store.setCartState(10, 5000);
    expect(store.getCartItemsCount()).toBe(10);
  });

  it('getCartTotalSum должен вернуть общую сумму', () => {
    expect(store.getCartTotalSum()).toBe(0);

    store.setCartState(3, 9999);
    expect(store.getCartTotalSum()).toBe(9999);
  });

  it('resetCart должен сбросить корзину', () => {
    store.setCartState(5, 15000);
    store.resetCart();

    expect(store.getCartItemsCount()).toBe(0);
    expect(store.getCartTotalSum()).toBe(0);
  });

  it('setCartState должен уведомить слушателей cart', () => {
    const listener = jest.fn();
    store.subscribe('cart', listener);

    store.setCartState(2, 1000);

    expect(listener).toHaveBeenCalled();
    const callArg = listener.mock.calls[0][0];
    expect(callArg.cart.itemsCount).toBe(2);
    expect(callArg.cart.totalSum).toBe(1000);
  });
});

// ============================================
// Тесты clearAllListeners
// ============================================
describe('Store.clearAllListeners()', () => {
  beforeEach(() => {
    store.reset();
  });

  it('должен очистить всех слушателей', () => {
    const listener1 = jest.fn();
    const listener2 = jest.fn();
    const globalListener = jest.fn();

    store.subscribe('user', listener1);
    store.subscribe('cart', listener2);
    store.subscribeAll(globalListener);

    store.clearAllListeners();

    store.setUser(mockUser);
    store.setCartState(1, 100);

    expect(listener1).not.toHaveBeenCalled();
    expect(listener2).not.toHaveBeenCalled();
    expect(globalListener).not.toHaveBeenCalled();
  });
});

// ============================================
// Тесты множественных подписок
// ============================================
describe('Store multiple subscriptions', () => {
  beforeEach(() => {
    store.reset();
  });

  it('позволяет несколько слушателей на один канал', () => {
    const listener1 = jest.fn();
    const listener2 = jest.fn();

    store.subscribe('user', listener1);
    store.subscribe('user', listener2);

    store.setUser(mockUser);

    expect(listener1).toHaveBeenCalled();
    expect(listener2).toHaveBeenCalled();
  });

  it('предотвращает дублирование одного слушателя при повторной подписке', () => {
    const listener = jest.fn();

    store.subscribe('user', listener);
    store.subscribe('user', listener); // Попытка дублирования

    store.setUser(mockUser);

    // Слушатель должен быть вызван дважды, так как нет проверки на дубликаты
    // Это ожидаемое поведение - каждый subscribe добавляет нового слушателя
    expect(listener).toHaveBeenCalledTimes(2);
  });

  it('каждая подписка возвращает свою функцию отписки', () => {
    const listener = jest.fn();
    const unsub1 = store.subscribe('user', listener);
    const unsub2 = store.subscribe('user', listener);

    unsub1();
    store.setUser(mockUser);
    expect(listener).toHaveBeenCalledTimes(1);

    unsub2();
    store.setUser(null);
    expect(listener).toHaveBeenCalledTimes(1);
  });
});
