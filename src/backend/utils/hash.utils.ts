/**
 * Утилиты для хеширования паролей
 */

import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 10;

/**
 * Хеширует пароль с использованием bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Сравнивает пароль с хешем
 */
export async function comparePassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}
