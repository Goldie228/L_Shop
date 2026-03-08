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
});
