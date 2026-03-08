import { Response } from 'express';
import { AuthRequest } from '../middleware/auth-request';
import { CartService } from '../services/cart.service';
import { addToCartSchema, updateCartQuantitySchema, validate } from '../utils/validation';
import { ValidationError, AuthenticationError } from '../errors';

const cartService = new CartService();

/**
 * Получить корзину текущего пользователя
 * Требует авторизации
 * @param req - AuthRequest с userId
 * @param res - Ответ Express
 * @throws {AuthenticationError} Если не авторизован
 * @throws {NotFoundError} Если корзина не найдена
 * @throws {CartError} При ошибках получения корзины
 * @returns 200 с данными корзины
 */
export async function getCart(req: AuthRequest, res: Response): Promise<undefined> {
  const { userId } = req;

  if (!userId) {
    throw new AuthenticationError('Не авторизован');
  }

  const cart = await cartService.getCart(userId);
  res.json(cart);
}

/**
 * Добавить продукт в корзину
 * Требует авторизации
 * @param req - AuthRequest с userId и телом { productId, quantity }
 * @param res - Ответ Express
 * @throws {AuthenticationError} Если не авторизован
 * @throws {ValidationError} При невалидных данных
 * @throws {NotFoundError} Если продукт не найден
 * @throws {CartError} При ошибках добавления
 * @returns 200 с обновлённой корзиной
 */
export async function addItem(req: AuthRequest, res: Response): Promise<undefined> {
  const { userId } = req;

  if (!userId) {
    throw new AuthenticationError('Не авторизован');
  }

  // Валидация тела запроса через Zod
  const validation = validate(addToCartSchema, req.body);
  if (!validation.success || !validation.data) {
    throw new ValidationError(validation.error || 'Ошибка валидации', { field: validation.field });
  }

  const { productId, quantity } = validation.data;

  const cart = await cartService.addItem(userId, productId, quantity);
  res.json(cart);
}

/**
 * Изменить количество продукта в корзине
 * Требует авторизации
 * @param req - AuthRequest с userId, params { productId }, body { quantity }
 * @param res - Ответ Express
 * @throws {AuthenticationError} Если не авторизован
 * @throws {ValidationError} При невалидных данных
 * @throws {NotFoundError} Если продукт или корзина не найдены
 * @throws {CartError} При ошибках обновления
 * @returns 200 с обновлённой корзиной
 */
export async function updateItem(req: AuthRequest, res: Response): Promise<undefined> {
  const { userId } = req;
  const { productId } = req.params;

  if (!userId) {
    throw new AuthenticationError('Не авторизован');
  }

  if (!productId) {
    throw new ValidationError('productId обязателен', { field: 'productId' });
  }

  // Валидация quantity через Zod
  const validation = validate(updateCartQuantitySchema, req.body);
  if (!validation.success || !validation.data) {
    throw new ValidationError(validation.error || 'Ошибка валидации', { field: validation.field });
  }

  const { quantity } = validation.data;

  const cart = await cartService.updateItem(userId, productId, quantity);
  res.json(cart);
}

/**
 * Удалить продукт из корзины
 * Требует авторизации
 * @param req - AuthRequest с userId, params { productId }
 * @param res - Ответ Express
 * @throws {AuthenticationError} Если не авторизован
 * @throws {ValidationError} При отсутствии productId
 * @throws {NotFoundError} Если продукт или корзина не найдены
 * @throws {CartError} При ошибках удаления
 * @returns 200 с обновлённой корзиной
 */
export async function removeItem(req: AuthRequest, res: Response): Promise<undefined> {
  const { userId } = req;
  const { productId } = req.params;

  if (!userId) {
    throw new AuthenticationError('Не авторизован');
  }

  if (!productId) {
    throw new ValidationError('productId обязателен', { field: 'productId' });
  }

  const cart = await cartService.removeItem(userId, productId);
  res.json(cart);
}
