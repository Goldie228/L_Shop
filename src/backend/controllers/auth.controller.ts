import { Request, Response } from 'express';
import { readJsonFile, writeJsonFile } from '../utils/file.utils';
import { User } from '../models/user.model';
import { SessionService } from '../services/session.service';
import { generateId } from '../utils/id.utils';
import { isValidEmail, isValidPhone } from '../utils/validators';
import { config } from '../config/constants';

const USERS_FILE = 'users.json';
const sessionService = new SessionService();

/**
 * Регистрация нового пользователя
 * Создаёт пользователя и устанавливает сессию
 */
export async function register(req: Request, res: Response): Promise<void> {
  const { name, email, login, phone, password } = req.body;

  // Валидация обязательных полей
  if (!name || !email || !login || !phone || !password) {
    res.status(400).json({ message: 'Missing fields' });
    return;
  }

  // Валидация email
  if (!isValidEmail(email)) {
    res.status(400).json({ message: 'Invalid email' });
    return;
  }

  // Валидация телефона
  if (!isValidPhone(phone)) {
    res.status(400).json({ message: 'Invalid phone' });
    return;
  }

  const users = await readJsonFile<User>(USERS_FILE);

  // Проверка уникальности email и login
  if (users.some(u => u.email === email || u.login === login)) {
    res.status(409).json({ message: 'User already exists' });
    return;
  }

  // Создание нового пользователя
  const newUser: User = {
    id: generateId(),
    name,
    email,
    login,
    phone,
    password, // В реальном проекте нужно хешировать!
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);
  await writeJsonFile(USERS_FILE, users);

  // Создаём сессию и устанавливаем cookie
  const token = await sessionService.createSession(newUser.id);
  res.cookie('sessionToken', token, {
    httpOnly: true,
    secure: config.isProduction, // В продакшене используем HTTPS
    sameSite: 'strict',
    maxAge: config.sessionDurationMs,
  });

  res.status(201).json({
    message: 'Registered successfully',
    user: { id: newUser.id, name, email },
  });
}

/**
 * Вход пользователя в систему
 * Проверяет учётные данные и создаёт сессию
 */
export async function login(req: Request, res: Response): Promise<void> {
  const { login, password } = req.body;

  // Проверка наличия учётных данных
  if (!login || !password) {
    res.status(400).json({ message: 'Missing credentials' });
    return;
  }

  const users = await readJsonFile<User>(USERS_FILE);

  // Поиск пользователя по login или email с проверкой пароля
  const user = users.find(
    u => (u.login === login || u.email === login) && u.password === password
  );

  if (!user) {
    res.status(401).json({ message: 'Invalid credentials' });
    return;
  }

  // Создаём сессию и устанавливаем cookie
  const token = await sessionService.createSession(user.id);
  res.cookie('sessionToken', token, {
    httpOnly: true,
    secure: config.isProduction,
    sameSite: 'strict',
    maxAge: config.sessionDurationMs,
  });

  res.json({
    message: 'Logged in',
    user: { id: user.id, name: user.name, email: user.email },
  });
}

/**
 * Выход пользователя из системы
 * Удаляет сессию и очищает cookie
 */
export async function logout(req: Request, res: Response): Promise<void> {
  const token = req.cookies.sessionToken;

  if (token) {
    await sessionService.deleteSession(token);
    res.clearCookie('sessionToken');
  }

  res.json({ message: 'Logged out' });
}

/**
 * Получение информации о текущем пользователе
 * Требует авторизации
 */
export async function getCurrentUser(req: Request, res: Response): Promise<void> {
  const userId = (req as unknown as { userId: string }).userId;

  if (!userId) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  const users = await readJsonFile<User>(USERS_FILE);
  const user = users.find(u => u.id === userId);

  if (!user) {
    res.status(404).json({ message: 'User not found' });
    return;
  }

  // Возвращаем данные пользователя без пароля
  res.json({
    id: user.id,
    name: user.name,
    email: user.email,
    login: user.login,
    phone: user.phone,
  });
}
