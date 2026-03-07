/**
 * Контроллер авторизации
 * Обрабатывает регистрацию, вход, выход и получение информации о пользователе
 */

import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth-request';
import { SessionService } from '../services/session.service';
import { UserService } from '../services/user.service';
import { registerSchema, loginRequestSchema, validate } from '../utils/validation';
import { comparePassword } from '../utils/hash.utils';
import { config } from '../config/constants';
import { createContextLogger } from '../utils/logger';

const logger = createContextLogger('AuthController');
const sessionService = new SessionService();
const userService = new UserService();

/**
 * Регистрация нового пользователя
 * Создаёт пользователя и устанавливает сессию
 */
export async function register(req: Request, res: Response): Promise<void> {
  try {
    // Валидация входных данных через Zod
    const validation = validate(registerSchema, req.body);

    if (!validation.success) {
      res.status(400).json({
        message: validation.error,
        error: 'VALIDATION_ERROR',
        field: validation.field,
      });
      return;
    }

    const { name, email, login: userLogin, phone, password } = validation.data!;

    const existingUser = await userService.findByEmailOrLogin(email, userLogin);
    if (existingUser) {
      if (existingUser.email === email) {
        res.status(409).json({
          message: 'Пользователь с таким email уже существует',
          error: 'EMAIL_EXISTS',
        });
        return;
      }
      res.status(409).json({
        message: 'Пользователь с таким логином уже существует',
        error: 'LOGIN_EXISTS',
      });
      return;
    }

    // Пароль хешируется внутри UserService
    const newUser = await userService.createUser({
      name,
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
  } catch (error) {
    logger.error({ error }, 'Ошибка регистрации');
    res.status(500).json({
      message: 'Ошибка при регистрации',
      error: 'REGISTRATION_ERROR',
    });
  }
}

/**
 * Вход пользователя в систему
 * Проверяет учётные данные и создаёт сессию
 */
export async function login(req: Request, res: Response): Promise<void> {
  try {
    // Валидация входных данных через Zod
    const validation = validate(loginRequestSchema, req.body);

    if (!validation.success) {
      res.status(400).json({
        message: validation.error,
        error: 'VALIDATION_ERROR',
        field: validation.field,
      });
      return;
    }

    const { login: userLogin, password } = validation.data!;

    const user = await userService.findByLoginOrEmail(userLogin);

    if (!user) {
      logger.warn({ login: userLogin }, 'Попытка входа с несуществующим логином');
      res.status(401).json({
        message: 'Неверный логин или пароль',
        error: 'INVALID_CREDENTIALS',
      });
      return;
    }

    // Проверка блокировки пользователя
    if (user.isBlocked) {
      logger.warn({ userId: user.id }, 'Попытка входа заблокированного пользователя');
      res.status(403).json({
        message: 'Аккаунт заблокирован',
        error: 'ACCOUNT_BLOCKED',
      });
      return;
    }

    const isPasswordValid = await comparePassword(password, user.password);

    if (!isPasswordValid) {
      logger.warn({ userId: user.id }, 'Неверный пароль при входе');
      res.status(401).json({
        message: 'Неверный логин или пароль',
        error: 'INVALID_CREDENTIALS',
      });
      return;
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
  } catch (error) {
    logger.error({ error }, 'Ошибка входа');
    res.status(500).json({
      message: 'Ошибка при входе',
      error: 'LOGIN_ERROR',
    });
  }
}

/**
 * Выход пользователя из системы
 * Удаляет сессию и очищает cookie
 */
export async function logout(req: Request, res: Response): Promise<void> {
  try {
    const token = req.cookies?.sessionToken;

    if (token) {
      await sessionService.deleteSession(token);
      res.clearCookie('sessionToken', {
        httpOnly: true,
        sameSite: 'strict',
      });
    }

    logger.info('Пользователь вышел из системы');

    res.json({ message: 'Выход выполнен успешно' });
  } catch (error) {
    // Даже при ошибке возвращаем успешный ответ, чтобы клиент мог очистить cookie
    logger.error({ error }, 'Ошибка выхода');
    res.json({ message: 'Выход выполнен успешно' });
  }
}

/**
 * Получение информации о текущем пользователе
 * Требует авторизации
 */
export async function getCurrentUser(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { userId } = req;

    if (!userId) {
      res.status(401).json({
        message: 'Не авторизован',
        error: 'UNAUTHORIZED',
      });
      return;
    }

    const user = await userService.getUserById(userId);

    if (!user) {
      res.status(404).json({
        message: 'Пользователь не найден',
        error: 'USER_NOT_FOUND',
      });
      return;
    }

    // Проверка блокировки
    if (user.isBlocked) {
      res.status(403).json({
        message: 'Аккаунт заблокирован',
        error: 'ACCOUNT_BLOCKED',
      });
      return;
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
  } catch (error) {
    logger.error({ error }, 'Ошибка получения пользователя');
    res.status(500).json({
      message: 'Ошибка при получении данных пользователя',
      error: 'GET_USER_ERROR',
    });
  }
}

/**
 * Получение конфигурации сессии (публичный endpoint)
 * Возвращает длительность сессии в минутах
 */
export function getSessionConfig(_req: Request, res: Response): void {
  res.json({
    sessionDurationMinutes: config.sessionDurationMinutes,
  });
}
