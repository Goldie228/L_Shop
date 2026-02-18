// Модель пользователя
export interface User {
  id: string;
  name: string;
  email: string;
  login: string;
  phone: string;
  password: string; // plain text для прототипа
  createdAt: string;
}
