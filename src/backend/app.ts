import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import authRoutes from './routes/auth.routes';
import { errorHandler } from './middleware/error.middleware';
import { ensureDataFiles } from './utils/file.utils';
import { PORT, FRONTEND_URL } from './config/constants';

const app = express();

// Настройка CORS
app.use(cors({
  origin: FRONTEND_URL,
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

// Маршруты
app.use('/api/auth', authRoutes);
// Здесь позже подключатся остальные модули (продукты, корзина, заказы)

// Обработка ошибок
app.use(errorHandler);

// Инициализация файлов данных перед запуском
ensureDataFiles().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
});
