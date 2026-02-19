import 'express';

declare module 'express' {
  interface Request {
    /** ID авторизованного пользователя */
    userId?: string;
  }
}
