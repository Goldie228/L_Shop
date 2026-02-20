import { isValidEmail, isValidPhone } from '../validators';

describe('Тесты валидаторов', () => {
  describe('Валидация email', () => {
    it('должен возвращать true для валидного email', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
      expect(isValidEmail('user.name@domain.org')).toBe(true);
    });

    it('должен возвращать false для невалидного email', () => {
      expect(isValidEmail('invalid')).toBe(false);
      expect(isValidEmail('test@')).toBe(false);
      expect(isValidEmail('@domain.com')).toBe(false);
    });
  });

  describe('Валидация телефона', () => {
    it('должен возвращать true для валидного телефона', () => {
      expect(isValidPhone('+375291234567')).toBe(true);
      expect(isValidPhone('1234567890')).toBe(true);
    });

    it('должен возвращать false для невалидного телефона', () => {
      expect(isValidPhone('123')).toBe(false);
      expect(isValidPhone('abc')).toBe(false);
    });
  });
});
