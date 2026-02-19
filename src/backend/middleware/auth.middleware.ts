import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth-request';
import { SessionService } from '../services/session.service';

const sessionService = new SessionService();

/**
 * Middleware for authorization check
 * Verifies presence and validity of sessionToken in cookies
 * Adds userId to request on successful verification
 */
export async function authMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const token = req.cookies?.sessionToken;

    if (!token) {
      res.status(401).json({
        message: 'Unauthorized',
        error: 'NO_TOKEN',
      });
      return;
    }

    const userId = await sessionService.getUserIdByToken(token);

    if (!userId) {
      res.clearCookie('sessionToken', {
        httpOnly: true,
        sameSite: 'strict',
      });

      res.status(401).json({
        message: 'Session expired',
        error: 'SESSION_EXPIRED',
      });
      return;
    }

    // Add userId to request
    req.userId = userId;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({
      message: 'Internal server error during authentication',
      error: 'AUTH_ERROR',
    });
  }
}

/**
 * Optional authorization
 * Does not block the request, but adds userId if present
 */
export async function optionalAuth(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const token = req.cookies?.sessionToken;

    if (token) {
      const userId = await sessionService.getUserIdByToken(token);
      if (userId) {
        req.userId = userId;
      }
    }

    next();
  } catch (error) {
    console.error('Optional auth error:', error);
    next();
  }
}
