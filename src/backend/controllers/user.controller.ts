/**
 * Контроллер управления пользователями для админ-панели
 * Предоставляет API для управления пользователями: получение списка,
 * изменение роли, блокировка/разблокировка
 */

import { Response } from 'express';
import { AuthRequest } from '../middleware/auth-request';
import { UserService, GetUsersParams } from '../services/user.service';
import { SessionService } from '../services/session.service';
import { User } from '../models/user.model';
import { comparePassword, hashPassword } from '../utils/hash.utils';
import { createContextLogger } from '../utils/logger';
import {
  validate,
  updateUserRoleSchema,
  updateProfileSchema,
  changePasswordSchema,
} from '../utils/validation';

const logger = createContextLogger('UserController');

const userService = new UserService();
const sessionService = new SessionService();

/**
 * Тип для пользователя без пароля (используется в ответах API)
 */
export type UserWithoutPassword = Omit<User, 'password'>;

/**
 * Удалить пароль из объекта пользователя
 */
function removePassword(user: User): UserWithoutPassword {
  const { password: _password, ...userWithoutPassword } = user;
  return userWithoutPassword;
}

/**
 * Получить всех пользователей с пагинацией и фильтрацией
 * GET /api/admin/users
 * Защищено: требуется роль admin
 * @param req - AuthRequest с query параметрами (search, role, limit, offset, sort)
 * @param res - Ответ Express
 * @returns 200 с массивом пользователей без паролей и метаданными пагинации
 */
export async function getAllUsers(req: AuthRequest, res: Response): Promise<undefined> {
  try {
    // Парсим query параметры
    let isBlockedValue: boolean | undefined;
    if (req.query.isBlocked === 'true') {
      isBlockedValue = true;
    } else if (req.query.isBlocked === 'false') {
      isBlockedValue = false;
    }

    const params: GetUsersParams = {
      search: req.query.search as string | undefined,
      role: req.query.role as 'user' | 'admin' | undefined,
      isBlocked: isBlockedValue,
      limit: req.query.limit ? parseInt(req.query.limit as string, 10) : 20,
      offset: req.query.offset ? parseInt(req.query.offset as string, 10) : 0,
      sort: req.query.sort as GetUsersParams['sort'] | undefined,
    };

    // Валидация limit и offset
    if (params.limit && (params.limit < 1 || params.limit > 100)) {
      res.status(400).json({
        message: 'limit должен быть от 1 до 100',
        error: 'INVALID_LIMIT',
      });
      return;
    }

    if (params.offset && params.offset < 0) {
      res.status(400).json({
        message: 'offset должен быть неотрицательным',
        error: 'INVALID_OFFSET',
      });
      return;
    }

    // Валидация role
    if (params.role && !['user', 'admin'].includes(params.role)) {
      res.status(400).json({
        message: 'Некорректная роль. Допустимые значения: user, admin',
        error: 'INVALID_ROLE',
      });
      return;
    }

    const result = await userService.getUsersWithPagination(params);

    // Удаляем пароли из ответа
    const usersWithoutPassword = result.users.map(removePassword);

    res.status(200).json({
      users: usersWithoutPassword,
      pagination: {
        total: result.total,
        limit: result.limit,
        offset: result.offset,
        hasMore: result.hasMore,
      },
    });
  } catch (error) {
    logger.error({ err: error }, 'Ошибка при получении пользователей');
    res.status(500).json({
      message: 'Ошибка при получении списка пользователей',
      error: 'INTERNAL_ERROR',
    });
  }
}

/**
 * Получить пользователя по ID
 * GET /api/admin/users/:id
 * Защищено: требуется роль admin
 */
export async function getUserById(req: AuthRequest, res: Response): Promise<undefined> {
  try {
    const { id } = req.params;

    if (!id) {
      res.status(400).json({
        message: 'ID пользователя не указан',
        error: 'MISSING_USER_ID',
      });
      return;
    }

    const user = await userService.getUserById(id);

    if (!user) {
      res.status(404).json({
        message: 'Пользователь не найден',
        error: 'USER_NOT_FOUND',
      });
      return;
    }

    res.status(200).json(removePassword(user));
  } catch (error) {
    logger.error({ err: error }, 'Ошибка при получении пользователя');
    res.status(500).json({
      message: 'Ошибка при получении пользователя',
      error: 'INTERNAL_ERROR',
    });
  }
}

/**
 * Изменить роль пользователя
 * PUT /api/admin/users/:id/role
 * Защищено: требуется роль admin, нельзя менять свою роль
 * @param req - AuthRequest с params { id } и body { role }
 * @param res - Ответ Express
 * @returns 200 с обновлённым пользователем без пароля
 */
export async function updateUserRole(req: AuthRequest, res: Response): Promise<undefined> {
  try {
    const { id } = req.params;

    if (!id) {
      res.status(400).json({
        message: 'ID пользователя не указан',
        error: 'MISSING_USER_ID',
      });
      return;
    }

    // Валидация через Zod
    const validation = validate(updateUserRoleSchema, req.body);
    if (!validation.success || !validation.data) {
      res.status(400).json({
        message: validation.error || 'Некорректная роль',
        error: 'INVALID_ROLE',
        field: validation.field,
      });
      return;
    }

    const { role } = validation.data;

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

    logger.info(
      { userId: id, newRole: role, adminId: currentUserId },
      'Роль пользователя изменена',
    );
    res.status(200).json(removePassword(updatedUser));
  } catch (error) {
    logger.error({ err: error }, 'Ошибка при изменении роли');
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
 */
export async function toggleUserBlock(req: AuthRequest, res: Response): Promise<undefined> {
  try {
    const { id } = req.params;

    if (!id) {
      res.status(400).json({
        message: 'ID пользователя не указан',
        error: 'MISSING_USER_ID',
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

    const action = updatedUser.isBlocked ? 'заблокирован' : 'разблокирован';
    logger.info(
      { userId: id, isBlocked: updatedUser.isBlocked, adminId: currentUserId },
      `Пользователь ${action}`,
    );

    res.status(200).json({
      message: `Пользователь успешно ${action}`,
      user: removePassword(updatedUser),
    });
  } catch (error) {
    logger.error({ err: error }, 'Ошибка при блокировке');
    res.status(500).json({
      message: 'Ошибка при блокировке пользователя',
      error: 'INTERNAL_ERROR',
    });
  }
}

/**
 * Удалить пользователя
 * DELETE /api/admin/users/:id
 * Защищено: требуется роль admin, нельзя удалить себя
 */
export async function deleteUser(req: AuthRequest, res: Response): Promise<undefined> {
  try {
    const { id } = req.params;

    if (!id) {
      res.status(400).json({
        message: 'ID пользователя не указан',
        error: 'MISSING_USER_ID',
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

    // Запрет на удаление себя
    if (id === currentUserId) {
      res.status(403).json({
        message: 'Нельзя удалить свою учетную запись',
        error: 'CANNOT_DELETE_SELF',
      });
      return;
    }

    const deleted = await userService.deleteUser(id);

    if (!deleted) {
      res.status(404).json({
        message: 'Пользователь не найден',
        error: 'USER_NOT_FOUND',
      });
      return;
    }

    // Удаляем все сессии пользователя
    await sessionService.deleteAllUserSessions(id);

    logger.info({ userId: id, adminId: currentUserId }, 'Пользователь удалён');
    res.status(200).json({ message: 'Пользователь успешно удалён' });
  } catch (error) {
    logger.error({ err: error }, 'Ошибка при удалении пользователя');
    res.status(500).json({
      message: 'Ошибка при удалении пользователя',
      error: 'INTERNAL_ERROR',
    });
  }
}

/**
 * Обновить профиль пользователя (имя, email)
 * PUT /api/users/profile
 * Защищено: требуется авторизация
 */
export async function updateProfile(req: AuthRequest, res: Response): Promise<undefined> {
  try {
    // Валидация через Zod
    const validation = validate(updateProfileSchema, req.body);
    if (!validation.success || !validation.data) {
      res.status(400).json({
        message: validation.error || 'Ошибка валидации',
        error: 'VALIDATION_ERROR',
        field: validation.field,
      });
      return;
    }

    const { name, email, phone } = validation.data;

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

    // Обновляем профиль
    if (name && email) {
      const updatedUser = await userService.updateProfile(currentUserId, name, email);
      if (!updatedUser) {
        res.status(404).json({
          message: 'Пользователь не найден',
          error: 'USER_NOT_FOUND',
        });
        return;
      }
      logger.info({ userId: currentUserId }, 'Профиль обновлён');
      res.status(200).json(removePassword(updatedUser));
      return;
    }

    // Частичное обновление
    const updateData: Partial<Omit<User, 'id' | 'createdAt'>> = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (phone) updateData.phone = phone;

    const updatedUser = await userService.updateUser(currentUserId, updateData);

    if (!updatedUser) {
      res.status(404).json({
        message: 'Пользователь не найден',
        error: 'USER_NOT_FOUND',
      });
      return;
    }

    logger.info({ userId: currentUserId }, 'Профиль обновлён');
    res.status(200).json(removePassword(updatedUser));
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
 */
export async function updatePassword(req: AuthRequest, res: Response): Promise<undefined> {
  try {
    // Валидация через Zod
    const validation = validate(changePasswordSchema, req.body);
    if (!validation.success || !validation.data) {
      res.status(400).json({
        message: validation.error || 'Ошибка валидации',
        error: 'VALIDATION_ERROR',
        field: validation.field,
      });
      return;
    }

    const { currentPassword, newPassword } = validation.data;

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

/**
 * Получить статистику по пользователям
 * GET /api/admin/users/stats
 * Защищено: требуется роль admin
 */
export async function getUsersStats(_req: AuthRequest, res: Response): Promise<undefined> {
  try {
    const stats = await userService.getUsersCount();
    res.status(200).json(stats);
  } catch (error) {
    logger.error({ err: error }, 'Ошибка при получении статистики пользователей');
    res.status(500).json({
      message: 'Ошибка при получении статистики',
      error: 'INTERNAL_ERROR',
    });
  }
}
