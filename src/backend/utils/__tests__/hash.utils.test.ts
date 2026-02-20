/**
 * Тесты для утилит хеширования
 */

import { hashPassword, comparePassword } from '../hash.utils';

describe('Тесты утилит хеширования', () => {
  describe('Хеширование пароля', () => {
    it('должен возвращать хеш пароля', async () => {
      const password = 'testPassword123';
      const hash = await hashPassword(password);

      expect(hash).toBeDefined();
      expect(hash).not.toBe(password);
      expect(hash.length).toBeGreaterThan(0);
    });

    it('должен генерировать разные хеши для одинаковых паролей', async () => {
      const password = 'testPassword123';
      const hash1 = await hashPassword(password);
      const hash2 = await hashPassword(password);

      expect(hash1).not.toBe(hash2);
    });
  });

  describe('Сравнение паролей', () => {
    it('должен возвращать true для правильного пароля', async () => {
      const password = 'testPassword123';
      const hash = await hashPassword(password);

      const result = await comparePassword(password, hash);

      expect(result).toBe(true);
    });

    it('должен возвращать false для неправильного пароля', async () => {
      const password = 'testPassword123';
      const wrongPassword = 'wrongPassword';
      const hash = await hashPassword(password);

      const result = await comparePassword(wrongPassword, hash);

      expect(result).toBe(false);
    });
  });
});
