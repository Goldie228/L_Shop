# Развёртывание L_Shop

## Содержание

1. [Требования к серверу](#требования-к-серверу)
2. [Подготовка к развёртыванию](#подготовка-к-развёртыванию)
3. [Сборка проекта](#сборка-проекта)
4. [Развёртывание на VPS](#развёртывание-на-vps)
5. [Развёртывание с Docker](#развёртывание-с-docker)
6. [Развёртывание на PaaS](#развёртывание-на-paas)
7. [Переменные окружения](#переменные-окружения)
8. [Nginx конфигурация](#nginx-конфигурация)
9. [SSL сертификаты](#ssl-сертификаты)
10. [Мониторинг и логи](#мониторинг-и-логи)
11. [Резервное копирование](#резервное-копирование)

---

## Требования к серверу

### Минимальные требования

| Параметр | Значение |
|----------|----------|
| CPU | 1 vCPU |
| RAM | 1 GB |
| Диск | 10 GB SSD |
| ОС | Ubuntu 20.04+ / Debian 11+ |

### Рекомендуемые требования

| Параметр | Значение |
|----------|----------|
| CPU | 2 vCPU |
| RAM | 2 GB |
| Диск | 20 GB SSD |

### Необходимое ПО

- **Node.js** v18.0.0 или выше
- **npm** v9.0.0 или выше
- **Git**
- **Nginx** (для проксирования)
- **PM2** (для управления процессами)

---

## Подготовка к развёртыванию

### 1. Установка Node.js на сервере

```bash
# Установка Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Проверка версии
node --version
npm --version
```

### 2. Установка PM2

```bash
sudo npm install -g pm2
```

### 3. Установка Nginx

```bash
sudo apt update
sudo apt install nginx
```

### 4. Клонирование репозитория

```bash
# Создать директорию для приложения
sudo mkdir -p /var/www/lshop
sudo chown $USER:$USER /var/www/lshop

# Клонировать репозиторий
git clone https://github.com/YOUR_USERNAME/L_Shop.git /var/www/lshop
cd /var/www/lshop
```

---

## Сборка проекта

### Локальная сборка

```bash
# Установка зависимостей
npm install --production

# Сборка TypeScript
npm run build
```

### Структура после сборки

```
L_Shop/
├── dist/                    # Скомпилированный код
│   ├── backend/
│   │   ├── app.js
│   │   ├── controllers/
│   │   ├── services/
│   │   └── ...
│   └── frontend/
│       └── ...
├── src/backend/data/        # JSON файлы данных
├── package.json
└── .env                     # Переменные окружения
```

---

## Развёртывание на VPS

### Шаг 1: Настройка переменных окружения

```bash
# Создать .env файл
cp .env.example .env
nano .env
```

```env
# Server Configuration
PORT=3001
NODE_ENV=production

# Frontend Configuration
FRONTEND_URL=https://yourdomain.com

# Session Configuration
SESSION_DURATION_MINUTES=10

# Data Storage
DATA_DIR=/var/www/lshop/src/backend/data
```

### Шаг 2: Установка зависимостей и сборка

```bash
cd /var/www/lshop

# Установка зависимостей (только production)
npm install --production

# Сборка TypeScript
npm run build
```

### Шаг 3: Настройка PM2

```bash
# Создать конфигурацию PM2
nano ecosystem.config.js
```

```javascript
module.exports = {
  apps: [{
    name: 'lshop-backend',
    script: 'dist/backend/app.js',
    instances: 1,
    exec_mode: 'fork',
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    },
    error_file: '/var/log/lshop/error.log',
    out_file: '/var/log/lshop/out.log',
    log_file: '/var/log/lshop/combined.log',
    time: true
  }]
};
```

```bash
# Создать директорию для логов
sudo mkdir -p /var/log/lshop
sudo chown $USER:$USER /var/log/lshop

# Запуск приложения
pm2 start ecosystem.config.js

# Сохранить конфигурацию PM2
pm2 save

# Настроить автозапуск
pm2 startup
```

### Шаг 4: Проверка статуса

```bash
pm2 status
pm2 logs lshop-backend
```

---

## Развёртывание с Docker

### Dockerfile

Создайте файл `Dockerfile` в корне проекта:

```dockerfile
# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Копируем package файлы
COPY package*.json ./
COPY tsconfig.json ./

# Устанавливаем зависимости
RUN npm ci

# Копируем исходный код
COPY src ./src

# Собираем TypeScript
RUN npm run build

# Stage 2: Production
FROM node:20-alpine

WORKDIR /app

# Копируем только production зависимости
COPY package*.json ./
RUN npm ci --only=production

# Копируем собранный код
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/src/backend/data ./src/backend/data

# Создаём непривилегированного пользователя
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001
RUN chown -R nodejs:nodejs /app

USER nodejs

# Переменные окружения по умолчанию
ENV NODE_ENV=production
ENV PORT=3001

EXPOSE 3001

CMD ["node", "dist/backend/app.js"]
```

### docker-compose.yml

```yaml
version: '3.8'

services:
  lshop:
    build: .
    container_name: lshop
    restart: unless-stopped
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - PORT=3001
      - FRONTEND_URL=https://yourdomain.com
      - SESSION_DURATION_MINUTES=10
    volumes:
      - ./data:/app/src/backend/data
      - ./logs:/var/log/lshop
    healthcheck:
      test: ["CMD", "wget", "-q", "--spider", "http://localhost:3001/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
```

### Команды Docker

```bash
# Сборка образа
docker build -t lshop:latest .

# Запуск контейнера
docker-compose up -d

# Просмотр логов
docker-compose logs -f

# Остановка контейнера
docker-compose down
```

---

## Развёртывание на PaaS

### Heroku

1. Создать `Procfile`:

```
web: node dist/backend/app.js
```

2. Установить buildpack для Node.js

3. Развёртывание:

```bash
# Логин
heroku login

# Создать приложение
heroku create lshop-app

# Установить переменные окружения
heroku config:set NODE_ENV=production
heroku config:set SESSION_DURATION_MINUTES=10

# Развёртывание
git push heroku main
```

### Railway

```bash
# Установка CLI
npm install -g @railway/cli

# Логин
railway login

# Инициализация
railway init

# Переменные окружения
railway variables set NODE_ENV=production
railway variables set SESSION_DURATION_MINUTES=10

# Развёртывание
railway up
```

### Render

1. Подключить репозиторий GitHub
2. Выбрать тип "Web Service"
3. Команда сборки: `npm install && npm run build`
4. Команда запуска: `node dist/backend/app.js`
5. Добавить переменные окружения в настройках

---

## Переменные окружения

### Production конфигурация

| Переменная | Обязательно | По умолчанию | Описание |
|------------|-------------|--------------|----------|
| `PORT` | Нет | `3001` | Порт сервера |
| `NODE_ENV` | Да | - | `production` |
| `FRONTEND_URL` | Да | - | URL фронтенда для CORS |
| `SESSION_DURATION_MINUTES` | Нет | `10` | Время жизни сессии |
| `DATA_DIR` | Нет | `./src/backend/data` | Директория для JSON файлов |

### Безопасность

```bash
# Никогда не коммитьте .env файл!
# Добавьте в .gitignore:
.env
.env.production
.env.local
```

---

## Nginx конфигурация

### Базовая конфигурация

```nginx
# /etc/nginx/sites-available/lshop
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # Редирект с www на без www
    if ($host = www.yourdomain.com) {
        return 301 https://yourdomain.com$request_uri;
    }

    # Редирект HTTP на HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    # SSL сертификаты
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    # SSL настройки
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10d;
    ssl_session_timeout 1d;

    # Безопасность
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Статические файлы фронтенда
    location / {
        root /var/www/lshop/dist/frontend;
        index index.html;
        try_files $uri $uri/ /index.html;
        
        # Кэширование статических файлов
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # API проксирование
    location /api {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;

        # Таймауты
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Health check
    location /health {
        proxy_pass http://127.0.0.1:3001/health;
        access_log off;
    }

    # Gzip сжатие
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/json application/xml;
    gzip_comp_level 6;
}
```

### Активация конфигурации

```bash
# Создать симлинк
sudo ln -s /etc/nginx/sites-available/lshop /etc/nginx/sites-enabled/

# Проверить конфигурацию
sudo nginx -t

# Перезагрузить Nginx
sudo systemctl reload nginx
```

---

## SSL сертификаты

### Let's Encrypt (Certbot)

```bash
# Установка Certbot
sudo apt install certbot python3-certbot-nginx

# Получение сертификата
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Автоматическое обновление (проверка)
sudo certbot renew --dry-run
```

### Ручное обновление

```bash
# Обновить сертификаты
sudo certbot renew

# Перезагрузить Nginx
sudo systemctl reload nginx
```

---

## Мониторинг и логи

### PM2 мониторинг

```bash
# Статус процессов
pm2 status

# Логи в реальном времени
pm2 logs lshop-backend

# Мониторинг
pm2 monit

# Информация о процессе
pm2 describe lshop-backend
```

### PM2 Plus (опционально)

```bash
# Подключение к PM2 Plus
pm2 link <secret_key> <public_key>

# Веб-интерфейс мониторинга
# https://app.pm2.io
```

### Логи Nginx

```bash
# Access логи
tail -f /var/log/nginx/access.log

# Error логи
tail -f /var/log/nginx/error.log
```

### Логи приложения

```bash
# Application логи
tail -f /var/log/lshop/out.log
tail -f /var/log/lshop/error.log
```

---

## Резервное копирование

### Скрипт бэкапа

```bash
#!/bin/bash
# /var/www/lshop/backup.sh

BACKUP_DIR="/var/backups/lshop"
DATE=$(date +%Y%m%d_%H%M%S)
DATA_DIR="/var/www/lshop/src/backend/data"

# Создать директорию для бэкапов
mkdir -p $BACKUP_DIR

# Бэкап данных
tar -czf $BACKUP_DIR/data_$DATE.tar.gz $DATA_DIR

# Удалить старые бэкапы (старше 30 дней)
find $BACKUP_DIR -name "data_*.tar.gz" -mtime +30 -delete

echo "Backup created: $BACKUP_DIR/data_$DATE.tar.gz"
```

### Cron задача

```bash
# Редактировать crontab
crontab -e

# Бэкап каждый день в 2:00
0 2 * * * /var/www/lshop/backup.sh >> /var/log/lshop/backup.log 2>&1
```

---

## Обновление приложения

### Процесс обновления

```bash
# 1. Перейти в директорию
cd /var/www/lshop

# 2. Создать бэкап
./backup.sh

# 3. Получить изменения
git pull origin main

# 4. Установить зависимости
npm install --production

# 5. Собрать проект
npm run build

# 6. Перезапустить приложение
pm2 restart lshop-backend

# 7. Проверить статус
pm2 status
pm2 logs lshop-backend --lines 50
```

### Откат к предыдущей версии

```bash
# Откат к предыдущему коммиту
git reset --hard HEAD~1

# Или к конкретному коммиту
git reset --hard <commit-hash>

# Пересобрать и перезапустить
npm run build
pm2 restart lshop-backend
```

---

## Устранение неполадок

### Приложение не запускается

```bash
# Проверить логи
pm2 logs lshop-backend --lines 100

# Проверить порт
lsof -i :3001

# Проверить права доступа
ls -la /var/www/lshop/src/backend/data/
```

### Nginx возвращает 502

```bash
# Проверить, что приложение запущено
pm2 status

# Проверить Nginx конфигурацию
sudo nginx -t

# Проверить логи Nginx
sudo tail -f /var/log/nginx/error.log
```

### Проблемы с SSL

```bash
# Проверить сертификат
sudo certbot certificates

# Обновить сертификат
sudo certbot renew --force-renewal
```

---

## Чеклист перед развёртыванием

- [ ] Изменён `NODE_ENV=production` в `.env`
- [ ] Установлен `FRONTEND_URL` для production
- [ ] Сменены default пароли (если есть)
- [ ] Настроен SSL сертификат
- [ ] Настроен Nginx
- [ ] Настроен PM2 с автозапуском
- [ ] Настроено резервное копирование
- [ ] Проверена работа health check endpoint

---

*Документ создан: март 2026*