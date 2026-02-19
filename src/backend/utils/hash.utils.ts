import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 10;

/**
 * Хеширует пароль с использованием bcrypt
 * @param password - Пароль в открытом виде
 * @returns Хешированный пароль
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Сравнивает пароль с хешем
 * @param password - Пароль в открытом виде
 * @param hashedPassword - Хешированный пароль
 * @returns true если пароль совпадает
 */
export async function comparePassword(
  password: string,
  hashedPassword: string,
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}
