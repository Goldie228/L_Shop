/**
 * Контроллер корзины
 * Обрабатывает операции с корзиной пользователя
 */

import { Response } from 'express';
import { AuthRequest } from '../middleware/auth-request';
import { CartService } from '../services/cart.service';

const cartService = new CartService();

/**
 * Получить корзину текущего пользователя
 * Требует авторизации
 */
export async function getCart(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { userId } = req;

    if (!userId) {
      res.status(401).json({
        message: 'Не авторизован',
        error: 'UNAUTHORIZED',
      });
      return;
    }

    const cart = await cartService.getCart(userId);
    res.json(cart);
  } catch (error) {
    console.error('[CartController] Ошибка получения корзины:', error);
    res.status(500).json({
      message: 'Ошибка при получении корзины',
      error: 'GET_CART_ERROR',
    });
  }
}

/**
 * Добавить продукт в корзину
 * Требует авторизации
 */
export async function addItem(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { userId } = req;
    const { productId, quantity } = req.body;

    if (!userId) {
      res.status(401).json({
        message: 'Не авторизован',
        error: 'UNAUTHORIZED',
      });
      return;
    }

    if (!productId || !quantity || quantity < 1) {
      res.status(400).json({
        message: 'productId и quantity (положительное число) обязательны',
        error: 'INVALID_REQUEST',
      });
      return;
    }

    const cart = await cartService.addItem(userId, productId, quantity);
    res.json(cart);
  } catch (error) {
    console.error('[CartController] Ошибка добавления в корзину:', error);

    const message = error instanceof Error ? error.message : 'Ошибка при добавлении в корзину';

    if (message === 'Product not found') {
      res.status(404).json({
        message: 'Продукт не найден',
        error: 'PRODUCT_NOT_FOUND',
      });
      return;
    }

    if (message === 'Product is out of stock') {
      res.status(400).json({
        message: 'Продукт отсутствует на складе',
        error: 'OUT_OF_STOCK',
      });
      return;
    }

    res.status(500).json({
      message: 'Ошибка при добавлении в корзину',
      error: 'ADD_ITEM_ERROR',
    });
  }
}

/**
 * Изменить количество продукта в корзине
 * Требует авторизации
 */
export async function updateItem(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { userId } = req;
    const { productId } = req.params;
    const { quantity } = req.body;

    if (!userId) {
      res.status(401).json({
        message: 'Не авторизован',
        error: 'UNAUTHORIZED',
      });
      return;
    }

    if (!productId || quantity === undefined || quantity < 0) {
      res.status(400).json({
        message: 'productId и quantity (неотрицательное число) обязательны',
        error: 'INVALID_REQUEST',
      });
      return;
    }

    const cart = await cartService.updateItem(userId, productId, quantity);
    res.json(cart);
  } catch (error) {
    console.error('[CartController] Ошибка обновления корзины:', error);

    const message = error instanceof Error ? error.message : 'Ошибка при обновлении корзины';

    if (message === 'Cart not found') {
      res.status(404).json({
        message: 'Корзина не найдена',
        error: 'CART_NOT_FOUND',
      });
      return;
    }

    if (message === 'Item not found in cart') {
      res.status(404).json({
        message: 'Товар не найден в корзине',
        error: 'ITEM_NOT_FOUND',
      });
      return;
    }

    res.status(500).json({
      message: 'Ошибка при обновлении корзины',
      error: 'UPDATE_ITEM_ERROR',
    });
  }
}

/**
 * Удалить продукт из корзины
 * Требует авторизации
 */
export async function removeItem(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { userId } = req;
    const { productId } = req.params;

    if (!userId) {
      res.status(401).json({
        message: 'Не авторизован',
        error: 'UNAUTHORIZED',
      });
      return;
    }

    if (!productId) {
      res.status(400).json({
        message: 'productId обязателен',
        error: 'INVALID_REQUEST',
      });
      return;
    }

    const cart = await cartService.removeItem(userId, productId);
    res.json(cart);
  } catch (error) {
    console.error('[CartController] Ошибка удаления из корзины:', error);

    const message = error instanceof Error ? error.message : 'Ошибка при удалении из корзины';

    if (message === 'Cart not found') {
      res.status(404).json({
        message: 'Корзина не найдена',
        error: 'CART_NOT_FOUND',
      });
      return;
    }

    res.status(500).json({
      message: 'Ошибка при удалении из корзины',
      error: 'REMOVE_ITEM_ERROR',
    });
  }
}