import { isValidBelarusPhone, isValidEmail, isValidPhone, isValidPrice } from '../validators';

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

  describe('Валидация белорусского телефона', () => {
    it('должен возвращать true для валидных белорусских номеров', () => {
      expect(isValidBelarusPhone('+375291234567')).toBe(true);
      expect(isValidBelarusPhone('+375441234567')).toBe(true);
      expect(isValidBelarusPhone('+375172345678')).toBe(true);
    });

    it('должен возвращать false для невалидных белорусских номеров', () => {
      expect(isValidBelarusPhone('+37529')).toBe(false); // короткий
      expect(isValidBelarusPhone('+3752912345678')).toBe(false); // длинный
      expect(isValidBelarusPhone('375291234567')).toBe(false); // без +
      expect(isValidBelarusPhone('+380291234567')).toBe(false); // не Беларусь
      expect(isValidBelarusPhone('abc')).toBe(false); // не цифры
      expect(isValidBelarusPhone('')).toBe(false); // пустая строка
    });
  });

  describe('Валидация цены', () => {
    it('должен возвращать true для валидных цен', () => {
      expect(isValidPrice(0.01)).toBe(true);
      expect(isValidPrice(100)).toBe(true);
      expect(isValidPrice(999999.99)).toBe(true);
      expect(isValidPrice('50.50')).toBe(true);
      expect(isValidPrice('0.01')).toBe(true);
    });

    it('должен возвращать false для невалидных цен', () => {
      expect(isValidPrice(0)).toBe(false); // ноль недопустим
      expect(isValidPrice(-1)).toBe(false); // отрицательное
      expect(isValidPrice(1000000)).toBe(false); // превышает максимум
      expect(isValidPrice('abc')).toBe(false); // не число
      expect(isValidPrice(NaN)).toBe(false); // NaN
      expect(isValidPrice(Infinity)).toBe(false); // бесконечность
      // @ts-ignore - тестируем null
      expect(isValidPrice(null)).toBe(false);
      // @ts-ignore - тестируем undefined
      expect(isValidPrice(undefined)).toBe(false);
    });
  });
});
