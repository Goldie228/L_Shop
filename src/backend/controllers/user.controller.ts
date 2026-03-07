/**
 * Контроллер управления пользователями для админ-панели
 * Предоставляет API для управления пользователями: получение списка,
 * изменение роли, блокировка/разблокировка
 */

import { Response } from 'express';
import { AuthRequest } from '../middleware/auth-request';
import { UserService } from '../services/user.service';
import { SessionService } from '../services/session.service';
import { User } from '../models/user.model';
import { comparePassword, hashPassword } from '../utils/hash.utils';
import { createContextLogger } from '../utils/logger';

const logger = createContextLogger('UserController');

const userService = new UserService();
const sessionService = new SessionService();

/**
 * Тип для пользователя без пароля (используется в ответах API)
 */
export type UserWithoutPassword = Omit<User, 'password'>;

/**
 * Получить всех пользователей
 * GET /api/admin/users
 * Защищено: требуется роль admin
 * @returns Массив пользователей без паролей
 */
export async function getAllUsers(_req: AuthRequest, res: Response): Promise<void> {
  try {
    const users = await userService.getAllUsers();
    // Удаляем пароли из ответа
    const usersWithoutPassword: UserWithoutPassword[] = users.map(
      ({ password: _password, ...user }: User) => user,
    );
    res.status(200).json(usersWithoutPassword);
  } catch (error) {
    console.error('[UserController] Ошибка при получении пользователей:', error);
    res.status(500).json({
      message: 'Ошибка при получении списка пользователей',
      error: 'INTERNAL_ERROR',
    });
  }
}

/**
 * Изменить роль пользователя
 * PUT /api/admin/users/:id/role
 * Защищено: требуется роль admin, нельзя менять свою роль
 * @param req.params.id - ID пользователя
 * @param req.body.role - Новая роль ('user' | 'admin')
 * @returns Обновлённый пользователь без пароля
 */
export async function updateUserRole(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { role } = req.body;

    // Валидация роли
    if (!role || !['user', 'admin'].includes(role)) {
      res.status(400).json({
        message: 'Некорректная роль. Допустимые значения: user, admin',
        error: 'INVALID_ROLE',
      });
      return;
    }

    // Получаем ID текущего админа из сессии
    const token = req.cookies?.sessionToken;
    if (!token) {
      res.status(401).json({
        message: 'Не авторизован',
        error: 'NO_TOKEN',
      });
      return;
    }

    const currentUserId = await sessionService.getUserIdByToken(token);
    if (!currentUserId) {
      res.status(401).json({
        message: 'Сессия недействительна',
        error: 'INVALID_SESSION',
      });
      return;
    }

    // Запрет на изменение своей роли
    if (id === currentUserId) {
      res.status(403).json({
        message: 'Нельзя изменить свою собственную роль',
        error: 'CANNOT_CHANGE_OWN_ROLE',
      });
      return;
    }

    const updatedUser = await userService.updateUserRole(id, role);

    if (!updatedUser) {
      res.status(404).json({
        message: 'Пользователь не найден',
        error: 'USER_NOT_FOUND',
      });
      return;
    }

    // Удаляем пароль из ответа
    const { password: _password, ...userWithoutPassword } = updatedUser;
    res.status(200).json(userWithoutPassword);
  } catch (error) {
    console.error('[UserController] Ошибка при изменении роли:', error);
    res.status(500).json({
      message: 'Ошибка при изменении роли пользователя',
      error: 'INTERNAL_ERROR',
    });
  }
}

/**
 * Заблокировать или разблокировать пользователя
 * PUT /api/admin/users/:id/block
 * Защищено: требуется роль admin, нельзя блокировать себя
 * @param req.params.id - ID пользователя
 * @returns Обновлённый пользователь без пароля
 */
export async function toggleUserBlock(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    // Получаем ID текущего админа из сессии
    const token = req.cookies?.sessionToken;
    if (!token) {
      res.status(401).json({
        message: 'Не авторизован',
        error: 'NO_TOKEN',
      });
      return;
    }

    const currentUserId = await sessionService.getUserIdByToken(token);
    if (!currentUserId) {
      res.status(401).json({
        message: 'Сессия недействительна',
        error: 'INVALID_SESSION',
      });
      return;
    }

    // Запрет на блокировку себя
    if (id === currentUserId) {
      res.status(403).json({
        message: 'Нельзя заблокировать свою учетную запись',
        error: 'CANNOT_BLOCK_SELF',
      });
      return;
    }

    const updatedUser = await userService.toggleUserBlock(id);

    if (!updatedUser) {
      res.status(404).json({
        message: 'Пользователь не найден',
        error: 'USER_NOT_FOUND',
      });
      return;
    }

    // Удаляем пароль из ответа
    const { password: _, ...userWithoutPassword } = updatedUser;
    const action = updatedUser.isBlocked ? 'заблокирован' : 'разблокирован';
    res.status(200).json({
      message: `Пользователь успешно ${action}`,
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error('[UserController] Ошибка при блокировке:', error);
    res.status(500).json({
      message: 'Ошибка при блокировке пользователя',
      error: 'INTERNAL_ERROR',
    });
  }
}

/**
 * Обновить профиль пользователя (имя, email)
 * PUT /api/users/profile
 * Защищено: требуется авторизация
 * @param req.body.name - Новое имя
 * @param req.body.email - Новый email
 * @returns Обновлённый пользователь без пароля
 */
export async function updateProfile(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { name, email } = req.body;

    // Валидация обязательных полей
    if (!name || typeof name !== 'string' || name.trim().length < 3) {
      res.status(400).json({
        message: 'Имя должно содержать минимум 3 символа',
        error: 'INVALID_NAME',
      });
      return;
    }

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      res.status(400).json({
        message: 'Некорректный email',
        error: 'INVALID_EMAIL',
      });
      return;
    }

    // Получаем ID текущего пользователя из сессии
    const token = req.cookies?.sessionToken;
    if (!token) {
      res.status(401).json({
        message: 'Не авторизован',
        error: 'NO_TOKEN',
      });
      return;
    }

    const currentUserId = await sessionService.getUserIdByToken(token);
    if (!currentUserId) {
      res.status(401).json({
        message: 'Сессия недействительна',
        error: 'INVALID_SESSION',
      });
      return;
    }

    const updatedUser = await userService.updateProfile(currentUserId, name, email);

    if (!updatedUser) {
      res.status(404).json({
        message: 'Пользователь не найден',
        error: 'USER_NOT_FOUND',
      });
      return;
    }

    // Удаляем пароль из ответа
    const { password: _pwd, ...userWithoutPassword } = updatedUser;
    logger.info({ userId: currentUserId }, 'Профиль обновлён');
    res.status(200).json(userWithoutPassword);
  } catch (error) {
    logger.error({ err: error }, 'Ошибка при обновлении профиля');

    if (error instanceof Error && error.message === 'EMAIL_EXISTS') {
      res.status(409).json({
        message: 'Email уже используется другим пользователем',
        error: 'EMAIL_EXISTS',
      });
      return;
    }

    res.status(500).json({
      message: 'Ошибка при обновлении профиля',
      error: 'INTERNAL_ERROR',
    });
  }
}

/**
 * Изменить пароль пользователя
 * PUT /api/users/password
 * Защищено: требуется авторизация
 * @param req.body.currentPassword - Текущий пароль
 * @param req.body.newPassword - Новый пароль (минимум 6 символов)
 * @returns Успешный ответ
 */
export async function updatePassword(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { currentPassword, newPassword } = req.body;

    // Валидация
    if (!newPassword || typeof newPassword !== 'string' || newPassword.length < 6) {
      res.status(400).json({
        message: 'Новый пароль должен содержать минимум 6 символов',
        error: 'INVALID_PASSWORD',
      });
      return;
    }

    if (!currentPassword || typeof currentPassword !== 'string') {
      res.status(400).json({
        message: 'Необходимо указать текущий пароль',
        error: 'CURRENT_PASSWORD_REQUIRED',
      });
      return;
    }

    // Получаем ID текущего пользователя из сессии
    const token = req.cookies?.sessionToken;
    if (!token) {
      res.status(401).json({
        message: 'Не авторизован',
        error: 'NO_TOKEN',
      });
      return;
    }

    const currentUserId = await sessionService.getUserIdByToken(token);
    if (!currentUserId) {
      res.status(401).json({
        message: 'Сессия недействительна',
        error: 'INVALID_SESSION',
      });
      return;
    }

    // Получаем пользователя для проверки текущего пароля
    const user = await userService.getUserById(currentUserId);
    if (!user) {
      res.status(404).json({
        message: 'Пользователь не найден',
        error: 'USER_NOT_FOUND',
      });
      return;
    }

    // Проверяем текущий пароль
    const isPasswordValid = await comparePassword(currentPassword, user.password);
    if (!isPasswordValid) {
      res.status(401).json({
        message: 'Неверный текущий пароль',
        error: 'INVALID_CURRENT_PASSWORD',
      });
      return;
    }

    // Хешируем и обновляем пароль
    const hashedPassword = await hashPassword(newPassword);
    await userService.updatePassword(currentUserId, hashedPassword);

    logger.info({ userId: currentUserId }, 'Пароль изменён');
    res.status(200).json({ message: 'Пароль успешно изменён' });
  } catch (error) {
    logger.error({ err: error }, 'Ошибка при смене пароля');
    res.status(500).json({
      message: 'Ошибка при смене пароля',
      error: 'INTERNAL_ERROR',
    });
  }
}
