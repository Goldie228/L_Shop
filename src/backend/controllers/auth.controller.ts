import { Request, Response } from 'express';
import { readJsonFile, writeJsonFile } from '../utils/file.utils';
import { User } from '../models/user.model';
import { SessionService } from '../services/session.service';
import { generateId } from '../utils/id.utils';
import { isValidEmail, isValidPhone } from '../utils/validators';

const USERS_FILE = 'users.json';
const sessionService = new SessionService();

// Регистрация пользователя
export async function register(req: Request, res: Response): Promise<void> {
  const { name, email, login, phone, password } = req.body;
  // Валидация
  if (!name || !email || !login || !phone || !password) {
    res.status(400).json({ message: 'Missing fields' });
    return;
  }
  if (!isValidEmail(email)) {
    res.status(400).json({ message: 'Invalid email' });
    return;
  }
  if (!isValidPhone(phone)) {
    res.status(400).json({ message: 'Invalid phone' });
    return;
  }

  const users = await readJsonFile<User>(USERS_FILE);
  // Проверка уникальности email, login
  if (users.some(u => u.email === email || u.login === login)) {
    res.status(409).json({ message: 'User already exists' });
    return;
  }

  const newUser: User = {
    id: generateId(),
    name,
    email,
    login,
    phone,
    password, // plain
    createdAt: new Date().toISOString(),
  };
  users.push(newUser);
  await writeJsonFile(USERS_FILE, users);

  // Создаем сессию и устанавливаем куку
  const token = await sessionService.createSession(newUser.id);
  res.cookie('sessionToken', token, {
    httpOnly: true,
    secure: false, // в продакшене true
    sameSite: 'strict',
    maxAge: 10 * 60 * 1000,
  });
  res.status(201).json({ message: 'Registered successfully', user: { id: newUser.id, name, email } });
}

// Вход пользователя
export async function login(req: Request, res: Response): Promise<void> {
  const { login, password } = req.body;
  if (!login || !password) {
    res.status(400).json({ message: 'Missing credentials' });
    return;
  }

  const users = await readJsonFile<User>(USERS_FILE);
  const user = users.find(u => (u.login === login || u.email === login) && u.password === password);
  if (!user) {
    res.status(401).json({ message: 'Invalid credentials' });
    return;
  }

  const token = await sessionService.createSession(user.id);
  res.cookie('sessionToken', token, {
    httpOnly: true,
    secure: false,
    sameSite: 'strict',
    maxAge: 10 * 60 * 1000,
  });
  res.json({ message: 'Logged in', user: { id: user.id, name: user.name, email: user.email } });
}

// Выход пользователя
export async function logout(req: Request, res: Response): Promise<void> {
  const token = req.cookies.sessionToken;
  if (token) {
    await sessionService.deleteSession(token);
    res.clearCookie('sessionToken');
  }
  res.json({ message: 'Logged out' });
}

// Получение текущего пользователя
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
  res.json({
    id: user.id,
    name: user.name,
    email: user.email,
    login: user.login,
    phone: user.phone,
  });
}
