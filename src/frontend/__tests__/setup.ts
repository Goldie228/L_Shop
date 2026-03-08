/**
 * Настройка тестового окружения для фронтенда
 *
 * Этот файл запускается перед каждым тестовым файлом.
 * Здесь можно настроить моки, глобальные переменные и расширить Jest.
 */

// ============================================
// Мок для localStorage
// ============================================
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// ============================================
// Мок для sessionStorage
// ============================================
const sessionStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'sessionStorage', {
  value: sessionStorageMock,
});

// ============================================
// Мок для fetch
// ============================================
global.fetch = jest.fn();

// ============================================
// Мок для import.meta.env (Vite)
// ============================================
Object.defineProperty(global, 'importMeta', {
  value: {
    env: {
      VITE_API_URL: 'http://localhost:3001',
    },
  },
  writable: true,
});

// ============================================
// Очистка после каждого теста
// ============================================
afterEach(() => {
  // Очистить localStorage
  localStorageMock.clear();

  // Очистить мок fetch
  (global.fetch as jest.Mock).mockClear();

  // Очистить DOM
  document.body.innerHTML = '';

  // Очистить классы с document.documentElement
  document.documentElement.className = '';
});

// ============================================
// Расширение Jest матчеров для DOM
// ============================================
expect.extend({
  toBeInTheDocument(received: Element | null) {
    const pass = received !== null && document.body.contains(received);
    return {
      pass,
      message: () =>
        pass
          ? `expected element not to be in the document`
          : `expected element to be in the document`,
    };
  },

  toHaveClass(received: Element | null, className: string) {
    const pass = received !== null && received.classList.contains(className);
    return {
      pass,
      message: () =>
        pass
          ? `expected element not to have class "${className}"`
          : `expected element to have class "${className}"`,
    };
  },

  toHaveAttribute(received: Element | null, attr: string, value?: string) {
    const attrValue = received?.getAttribute(attr);
    const pass = value !== undefined ? attrValue === value : attrValue !== null;
    return {
      pass,
      message: () =>
        pass
          ? `expected element not to have attribute "${attr}"`
          : `expected element to have attribute "${attr}"${value ? `="${value}"` : ''}`,
    };
  },
});
