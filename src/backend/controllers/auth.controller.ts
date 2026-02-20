/**
 * Контроллер авторизации
 * Обрабатывает регистрацию, вход, выход и получение информации о пользователе
 */

import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth-request';
import { SessionService } from '../services/session.service';
import { UserService } from '../services/user.service';
import { isValidEmail, isValidPhone } from '../utils/validators';
import { comparePassword } from '../utils/hash.utils';
import { config } from '../config/constants';

const sessionService = new SessionService();
const userService = new UserService();

/**
 * Регистрация нового пользователя
 * Создаёт пользователя и устанавливает сессию
 */
export async function register(req: Request, res: Response): Promise<void> {
  try {
    const { name, email, login: userLogin, phone, password } = req.body;

    if (!name || !email || !userLogin || !phone || !password) {
      res.status(400).json({
        message: 'Все поля обязательны: name, email, login, phone, password',
        error: 'MISSING_FIELDS',
      });
      return;
    }

    if (!isValidEmail(email)) {
      res.status(400).json({
        message: 'Некорректный формат email',
        error: 'INVALID_EMAIL',
      });
      return;
    }

    // Формат телефона: +1234567890 (10-15 цифр)
    if (!isValidPhone(phone)) {
      res.status(400).json({
        message: 'Некорректный формат телефона. Ожидается: +1234567890 (10-15 цифр)',
        error: 'INVALID_PHONE',
      });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({
        message: 'Пароль должен содержать минимум 6 символов',
        error: 'WEAK_PASSWORD',
      });
      return;
    }

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

    res.status(201).json({
      message: 'Регистрация успешна',
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
      },
    });
  } catch (error) {
    console.error('[AuthController] Ошибка регистрации:', error);
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
    const { login: userLogin, password } = req.body;

    if (!userLogin || !password) {
      res.status(400).json({
        message: 'Логин и пароль обязательны',
        error: 'MISSING_CREDENTIALS',
      });
      return;
    }

    const user = await userService.findByLoginOrEmail(userLogin);

    if (!user) {
      res.status(401).json({
        message: 'Неверный логин или пароль',
        error: 'INVALID_CREDENTIALS',
      });
      return;
    }

    const isPasswordValid = await comparePassword(password, user.password);

    if (!isPasswordValid) {
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

    res.json({
      message: 'Вход выполнен успешно',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error('[AuthController] Ошибка входа:', error);
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

    res.json({ message: 'Выход выполнен успешно' });
  } catch (error) {
    // Даже при ошибке возвращаем успешный ответ, чтобы клиент мог очистить cookie
    console.error('[AuthController] Ошибка выхода:', error);
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

    // Возвращаем данные пользователя без пароля
    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      login: user.login,
      phone: user.phone,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  } catch (error) {
    console.error('[AuthController] Ошибка получения пользователя:', error);
    res.status(500).json({
      message: 'Ошибка при получении данных пользователя',
      error: 'GET_USER_ERROR',
    });
  }
}
