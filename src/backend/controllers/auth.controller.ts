import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth-request';
import { SessionService } from '../services/session.service';
import { UserService } from '../services/user.service';
import { registerSchema, loginRequestSchema, validate } from '../utils/validation';
import { comparePassword } from '../utils/hash.utils';
import { config } from '../config/constants';
import { createContextLogger } from '../utils/logger';
import {
  ValidationError,
  ConflictError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
} from '../errors';

const logger = createContextLogger('AuthController');
const sessionService = new SessionService();
const userService = new UserService();

/**
 * Регистрация нового пользователя
 * Создаёт пользователя и устанавливает сессию
 * @param req - Запрос с данными пользователя (name, email, login, phone, password)
 * @param res - Ответ Express
 * @throws {ValidationError} При невалидных данных
 * @throws {ConflictError} При существующем email или login
 * @returns 201 с данными пользователя или ошибка через error middleware
 */
export async function register(req: Request, res: Response): Promise<undefined> {
  // Валидация входных данных через Zod
  const validation = validate(registerSchema, req.body);

  if (!validation.success) {
    throw new ValidationError(validation.error || 'Ошибка валидации', { field: validation.field });
  }

  if (!validation.data) {
    throw new ValidationError('Внутренняя ошибка валидации');
  }

  const {
    name,
    email,
    login: userLogin,
    phone,
    password,
  } = validation.data;

  const existingUser = await userService.findByEmailOrLogin(email, userLogin);
  if (existingUser) {
    if (existingUser.email === email) {
      throw new ConflictError('Пользователь с таким email уже существует', { field: 'email' });
    }
    throw new ConflictError('Пользователь с таким логином уже существует', { field: 'login' });
  }

  // Пароль хешируется внутри UserService
  const newUser = await userService.createUser({
    name,
    firstName: name, // Используем name как firstName для обратной совместимости
    email,
    login: userLogin,
    phone,
    password,
  });

  const token = await sessionService.createSession(newUser.id);
  res.cookie('sessionToken', token, {
    httpOnly: true,
    secure: config.isProduction,
    sameSite: 'strict',
    maxAge: config.sessionDurationMs,
  });

  logger.info({ userId: newUser.id, email: newUser.email }, 'Пользователь зарегистрирован');

  res.status(201).json({
    message: 'Регистрация успешна',
    user: {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
    },
  });
}

/**
 * Вход пользователя в систему
 * Проверяет учётные данные и создаёт сессию
 * @param req - Запрос с данными для входа (login, password)
 * @param res - Ответ Express
 * @throws {AuthenticationError} При неверных учётных данных
 * @throws {AuthorizationError} При заблокированном аккаунте
 * @returns 200 с данными пользователя или ошибка через error middleware
 */
export async function login(req: Request, res: Response): Promise<undefined> {
  // Валидация входных данных через Zod
  const validation = validate(loginRequestSchema, req.body);

  if (!validation.success) {
    throw new ValidationError(validation.error || 'Ошибка валидации', { field: validation.field });
  }

  if (!validation.data) {
    throw new ValidationError('Внутренняя ошибка валидации');
  }

  const { login: userLogin, password } = validation.data;

  const user = await userService.findByLoginOrEmail(userLogin);

  if (!user) {
    logger.warn({ login: userLogin }, 'Попытка входа с несуществующим логином');
    throw new AuthenticationError('Неверный логин или пароль');
  }

  // Проверка блокировки пользователя
  if (user.isBlocked) {
    logger.warn({ userId: user.id }, 'Попытка входа заблокированного пользователя');
    throw new AuthorizationError('Аккаунт заблокирован');
  }

  const isPasswordValid = await comparePassword(password, user.password);

  if (!isPasswordValid) {
    logger.warn({ userId: user.id }, 'Неверный пароль при входе');
    throw new AuthenticationError('Неверный логин или пароль');
  }

  const token = await sessionService.createSession(user.id);
  res.cookie('sessionToken', token, {
    httpOnly: true,
    secure: config.isProduction,
    sameSite: 'strict',
    maxAge: config.sessionDurationMs,
  });

  logger.info({ userId: user.id, email: user.email }, 'Пользователь вошёл в систему');

  res.json({
    message: 'Вход выполнен успешно',
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
}

/**
 * Выход пользователя из системы
 * Удаляет сессию и очищает cookie
 * @param req - Запрос (содержит sessionToken в cookies)
 * @param res - Ответ Express
 * @returns 200 с сообщением об успешном выходе
 */
export async function logout(req: Request, res: Response): Promise<undefined> {
  const token = req.cookies?.sessionToken;

  if (token) {
    await sessionService.deleteSession(token);
  }

  res.clearCookie('sessionToken', {
    httpOnly: true,
    sameSite: 'strict',
  });

  logger.info('Пользователь вышел из системы');

  res.json({ message: 'Выход выполнен успешно' });
}

/**
 * Получение информации о текущем пользователе
 * Требует авторизации
 * @param req - AuthRequest с userId (установлен authMiddleware)
 * @param res - Ответ Express
 * @throws {AuthenticationError} Если userId отсутствует (ошибка middleware)
 * @throws {NotFoundError} Если пользователь не найден
 * @throws {AuthorizationError} Если аккаунт заблокирован
 * @returns 200 с данными пользователя
 */
export async function getCurrentUser(req: AuthRequest, res: Response): Promise<undefined> {
  const { userId } = req;

  if (!userId) {
    throw new AuthenticationError('Не авторизован');
  }

  const user = await userService.getUserById(userId);

  if (!user) {
    throw new NotFoundError('Пользователь не найден');
  }

  // Проверка блокировки
  if (user.isBlocked) {
    throw new AuthorizationError('Аккаунт заблокирован');
  }

  // Возвращаем данные пользователя без пароля
  res.json({
    id: user.id,
    name: user.name,
    email: user.email,
    login: user.login,
    phone: user.phone,
    role: user.role,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  });
}

/**
 * Получение конфигурации сессии (публичный endpoint)
 * Возвращает длительность сессии в минутах
 * @param req - Запрос
 * @param res - Ответ Express
 * @returns 200 с конфигурацией сессии
 */
export function getSessionConfig(_req: Request, res: Response): void {
  res.json({
    sessionDurationMinutes: config.sessionDurationMinutes,
  });
}
