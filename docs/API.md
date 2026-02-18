# API Документация L_Shop

Базовый URL: `http://localhost:3000/api`

## Авторизация

### POST /auth/register

Регистрация нового пользователя.

**Request body:**
```json
{
  "name": "Ivan Ivanov",
  "email": "ivan@example.com",
  "login": "ivan123",
  "phone": "+375291234567",
  "password": "secret123"
}
```

**Response 201:**
```json
{
  "message": "Registered successfully",
  "user": {
    "id": "uuid",
    "name": "Ivan Ivanov",
    "email": "ivan@example.com"
  }
}
```

**Errors:**
- 400 - Missing fields / Invalid email / Invalid phone
- 409 - User already exists

---

### POST /auth/login

Вход в систему.

**Request body:**
```json
{
  "login": "ivan123",  // login или email
  "password": "secret123"
}
```

**Response 200:**
```json
{
  "message": "Logged in",
  "user": {
    "id": "uuid",
    "name": "Ivan Ivanov",
    "email": "ivan@example.com"
  }
}
```

**Errors:**
- 400 - Missing credentials
- 401 - Invalid credentials

---

### POST /auth/logout

Выход из системы.

**Response 200:**
```json
{
  "message": "Logged out"
}
```

---

### GET /auth/me

Получение информации о текущем пользователе.

**Requires:** Authorization (sessionToken cookie)

**Response 200:**
```json
{
  "id": "uuid",
  "name": "Ivan Ivanov",
  "email": "ivan@example.com",
  "login": "ivan123",
  "phone": "+375291234567"
}
```

**Errors:**
- 401 - Unauthorized / Session expired
- 404 - User not found

---

## Продукты (будет добавлено Никитой П.)

## Корзина (будет добавлена Тимофеем)

## Заказы (будут добавлены Никитой Т.)
