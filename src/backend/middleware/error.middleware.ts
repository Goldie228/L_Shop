import { Request, Response, NextFunction } from 'express';

// Общий обработчик ошибок
export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction,
): void {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal server error' });
}
