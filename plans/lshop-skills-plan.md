# План: Skills для L_Shop

## Обзор

Созданы специализированные skills для проекта L_Shop на основе документации [`CODING_STANDARDS.md`](docs/CODING_STANDARDS.md). Skills разбиты по узким областям, чтобы агент подгружал только то, что нужно в конкретной ситуации.

---

## Структура skills

```
.kilocode/skills/
├── typescript-standards/
│   └── SKILL.md          # TypeScript, типизация, any, interface/type
├── naming-conventions/
│   └── SKILL.md          # Правила именования переменных, функций, файлов
├── git-commits/
│   └── SKILL.md          # Conventional commits, типы коммитов
├── testing-guidelines/
│   └── SKILL.md          # Тесты, AAA, mockи, покрытие
├── error-handling/
│   └── SKILL.md          # Обработка ошибок, try-catch, middleware
└── code-comments/
    └── SKILL.md          # JSDoc, хорошие/плохие комментарии
```

---

## Описание skills

### 1. typescript-standards

**Файл:** [`.kilocode/skills/typescript-standards/SKILL.md`](.kilocode/skills/typescript-standards/SKILL.md)

**Описание:** Стандарты TypeScript для L_Shop. Типизация, запрет any, interface vs type, null/undefined, возвращаемые значения.

**Когда активируется:**
- Работа с типами TypeScript
- Создание интерфейсов и типов
- Проверка кода на `any`
- Обработка null/undefined

**Ключевые правила:**
- Запрет `any` - использовать `unknown`
- `interface` для объектов, `type` для объединений
- Всегда указывать возвращаемые типы
- Использовать `?.` и `??`

---

### 2. naming-conventions

**Файл:** [`.kilocode/skills/naming-conventions/SKILL.md`](.kilocode/skills/naming-conventions/SKILL.md)

**Описание:** Правила именования для L_Shop. Переменные, функции, классы, константы, файлы, переменные окружения.

**Когда активируется:**
- Именование переменных и функций
- Создание новых файлов
- Определение констант
- Настройка переменных окружения

**Ключевые правила:**
- Переменные/функции: `camelCase`
- Классы/интерфейсы: `PascalCase`
- Глобальные константы: `UPPER_SNAKE_CASE`
- Файлы: `kebab-case`

---

### 3. git-commits

**Файл:** [`.kilocode/skills/git-commits/SKILL.md`](.kilocode/skills/git-commits/SKILL.md)

**Описание:** Правила Git коммитов для L_Shop. Conventional commits, типы коммитов, формат сообщений.

**Когда активируется:**
- Создание коммитов
- Code review
- Проверка истории коммитов

**Ключевые правила:**
- Формат: `<тип>(<область>): <описание>`
- Типы: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`
- Описание на русском
- Заголовок до 72 символов

---

### 4. testing-guidelines

**Файл:** [`.kilocode/skills/testing-guidelines/SKILL.md`](.kilocode/skills/testing-guidelines/SKILL.md)

**Описание:** Правила тестирования для L_Shop. AAA паттерн, именование тестов, mockи, покрытие.

**Когда активируется:**
- Написание тестов
- Создание mockов
- Проверка покрытия кода

**Ключевые правила:**
- Паттерн AAA (Arrange-Act-Assert)
- Названия тестов на русском
- Минимальное покрытие 80%
- Моки для внешних зависимостей

---

### 5. error-handling

**Файл:** [`.kilocode/skills/error-handling/SKILL.md`](.kilocode/skills/error-handling/SKILL.md)

**Описание:** Обработка ошибок для L_Shop. Try-catch, пользовательские классы ошибок, middleware обработка.

**Когда активируется:**
- Обработка ошибок в коде
- Создание middleware
- Логирование ошибок

**Ключевые правила:**
- Все async функции в try-catch
- Пользовательские классы ошибок
- Централизованная обработка в middleware
- Логирование с префиксом сервиса

---

### 6. code-comments

**Файл:** [`.kilocode/skills/code-comments/SKILL.md`](.kilocode/skills/code-comments/SKILL.md)

**Описание:** Правила комментариев для L_Shop. JSDoc, хорошие и плохие комментарии, TODO маркеры.

**Когда активируется:**
- Написание JSDoc
- Добавление комментариев
- Создание TODO/FIXME/HACK маркеров

**Ключевые правила:**
- JSDoc для публичных функций
- Комментарии на русском
- Нет закомментированного кода
- Нет избыточных комментариев

---

## Как использовать

### Автоматическая активация

Агент автоматически активирует нужный skill на основе description в YAML frontmatter. Например:

- При работе с типами → `typescript-standards`
- При именовании → `naming-conventions`
- При коммитах → `git-commits`
- При тестах → `testing-guidelines`
- При ошибках → `error-handling`
- При комментариях → `code-comments`

### Ручная активация

Можно явно указать skill:

```
используй skill typescript-standards
```

---

## Преимущества разделения

1. **Точность выбора** - агент подгружает только нужный контекст
2. **Меньше шума** - каждый skill фокусируется на одной области
3. **Легче поддерживать** - изменения вносятся в конкретный файл
4. **Переиспользование** - skills можно использовать в других проектах

---

## Следующие шаги

1. ✅ Созданы все 6 skills
2. ⬜ Протестировать активацию skills
3. ⬜ При необходимости добавить новые skills
