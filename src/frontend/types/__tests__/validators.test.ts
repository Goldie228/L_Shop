/**
 * Тесты для валидаторов пользовательского ввода
 */

import {
  validateEmail,
  validateLogin,
  validatePassword,
  validatePhone,
  validateName,
  validatePasswordConfirmation,
} from '../user';

// ============================================
// Тесты validateEmail
// ============================================
describe('validateEmail()', () => {
  it('должен принять корректный email', () => {
    const result = validateEmail('test@example.com');
    expect(result.isValid).toBe(true);
    expect(result.error).toBeNull();
  });

  it('должен отклонить пустой email', () => {
    const result = validateEmail('');
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Email обязателен');
  });

  it('должен отклонить email без @', () => {
    const result = validateEmail('testexample.com');
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Неверный формат email');
  });

  it('должен отклонить email без домена', () => {
    const result = validateEmail('test@');
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Неверный формат email');
  });

  it('должен отклонить email без локальной части', () => {
    const result = validateEmail('@example.com');
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Неверный формат email');
  });
});

// ============================================
// Тесты validateLogin
// ============================================
describe('validateLogin()', () => {
  it('должен принять корректный логин', () => {
    const result = validateLogin('testuser');
    expect(result.isValid).toBe(true);
    expect(result.error).toBeNull();
  });

  it('должен принять email как логин', () => {
    const result = validateLogin('test@example.com');
    expect(result.isValid).toBe(true);
    expect(result.error).toBeNull();
  });

  it('должен отклонить пустой логин', () => {
    const result = validateLogin('');
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Логин или email обязателен');
  });

  it('должен отклонить слишком короткий логин', () => {
    const result = validateLogin('ab');
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Логин должен содержать минимум 3 символа');
  });

  it('должен отклонить слишком длинный логин', () => {
    const result = validateLogin('a'.repeat(31));
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Логин должен содержать максимум 30 символов');
  });

  it('должен принять логин ровно 3 символа', () => {
    const result = validateLogin('abc');
    expect(result.isValid).toBe(true);
  });

  it('должен принять логин ровно 30 символов', () => {
    const result = validateLogin('a'.repeat(30));
    expect(result.isValid).toBe(true);
  });
});

// ============================================
// Тесты validatePassword
// ============================================
describe('validatePassword()', () => {
  it('должен принять корректный пароль', () => {
    const result = validatePassword('password123');
    expect(result.isValid).toBe(true);
    expect(result.error).toBeNull();
  });

  it('должен отклонить пустой пароль', () => {
    const result = validatePassword('');
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Пароль обязателен');
  });

  it('должен отклонить слишком короткий пароль', () => {
    const result = validatePassword('12345');
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Пароль должен содержать минимум 6 символов');
  });

  it('должен отклонить слишком длинный пароль', () => {
    const result = validatePassword('a'.repeat(101));
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Пароль слишком длинный');
  });

  it('должен принять пароль ровно 6 символов', () => {
    const result = validatePassword('123456');
    expect(result.isValid).toBe(true);
  });
});

// ============================================
// Тесты validatePhone
// ============================================
describe('validatePhone()', () => {
  it('должен принять корректный телефон', () => {
    const result = validatePhone('+1234567890');
    expect(result.isValid).toBe(true);
    expect(result.error).toBeNull();
  });

  it('должен отклонить пустой телефон', () => {
    const result = validatePhone('');
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Номер телефона обязателен');
  });

  it('должен отклонить телефон без +', () => {
    const result = validatePhone('1234567890');
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Телефон должен быть в формате +1234567890');
  });

  it('должен отклонить слишком короткий телефон', () => {
    const result = validatePhone('+12345');
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Телефон должен быть в формате +1234567890');
  });

  it('должен отклонить телефон с буквами', () => {
    const result = validatePhone('+12345abc90');
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Телефон должен быть в формате +1234567890');
  });
});

// ============================================
// Тесты validateName
// ============================================
describe('validateName()', () => {
  it('должен принять корректное имя', () => {
    const result = validateName('Иван');
    expect(result.isValid).toBe(true);
    expect(result.error).toBeNull();
  });

  it('должен отклонить пустое имя', () => {
    const result = validateName('');
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Имя обязательно');
  });

  it('должен отклонить слишком короткое имя', () => {
    const result = validateName('А');
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Имя должно содержать минимум 2 символа');
  });

  it('должен отклонить слишком длинное имя', () => {
    const result = validateName('А'.repeat(51));
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Имя должно содержать максимум 50 символов');
  });

  it('должен принять имя ровно 2 символа', () => {
    const result = validateName('Ав');
    expect(result.isValid).toBe(true);
  });
});

// ============================================
// Тесты validatePasswordConfirmation
// ============================================
describe('validatePasswordConfirmation()', () => {
  it('должен принять совпадающие пароли', () => {
    const result = validatePasswordConfirmation('password', 'password');
    expect(result.isValid).toBe(true);
    expect(result.error).toBeNull();
  });

  it('должен отклонить пустое подтверждение', () => {
    const result = validatePasswordConfirmation('password', '');
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Подтверждение пароля обязательно');
  });

  it('должен отклонить несовпадающие пароли', () => {
    const result = validatePasswordConfirmation('password', 'Password');
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Пароли не совпадают');
  });
});