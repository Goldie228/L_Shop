# Standarty oformlenija koda L_Shop

## Soderzhanie

1. [Obshhie principy](#obshhie-principy)
2. [TypeScript soglashenija](#typescript-soglashenija)
3. [Imenovanie](#imenovanie)
4. [Formatirovanie koda](#formatirovanie-koda)
5. [Kommentarii](#kommentarii)
6. [Rabota s oshibkami](#rabota-s-oshibkami)
7. [Testirovanie](#testirovanie)
8. [Git commity](#git-commity)
9. [Code review cheklist](#code-review-cheklist)

---

## Obshhie principy

### DRY (Don't Repeat Yourself)

Ne povtorjajte kod. Esli logika ispol'zuetsja bolee 2 raz - vydelite v funkciju.

```typescript
// PLOHO
function validateEmail(email: string): boolean {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

function validateUserEmail(email: string): boolean {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

// HOROSHO
function validateEmail(email: string): boolean {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}
```

### KISS (Keep It Simple, Stupid)

Derzhite kod prostym. Ne uslozhnjajte tam, gde eto ne nuzhno.

```typescript
// PLOHO
const getUserName = (user: User): string => {
  return user && user.name ? user.name : 'Unknown';
};

// HOROSHO
const getUserName = (user: User): string => user?.name ?? 'Unknown';
```

### SOLID

Principy SOLID dlja chistoj arhitektury:

| Princip | Opisanie |
|---------|----------|
| **S**ingle Responsibility | Odin klass/funkcija - odna otvetstvennost' |
| **O**pen/Closed | Otkryt dlja rasshirenija, zakryt dlja izmenenija |
| **L**iskov Substitution | Podtipy dolzhny zamenjat' bazovye tipy |
| **I**nterface Segregation | Mnogo specializirovannyh interfejsov luchshe odnogo obshhego |
| **D**ependency Inversion | Zavisimost' ot abstrakcij, ne ot konkretnyh klassov |

---

## TypeScript soglashenija

### Tipizacija

Vsegda ukazyvajte tipy dlja funkcij i peremennyh.

```typescript
// PLOHO
function getUser(id) {
  return users.find(u => u.id === id);
}

// HOROSHO
function getUser(id: string): User | undefined {
  return users.find((u: User) => u.id === id);
}
```

### Zapret any

Ispol'zovanie `any` zapreshheno. Ispol'zujte konkretnye tipy ili `unknown`.

```typescript
// PLOHO
function processData(data: any): void {
  console.log(data.value);
}

// HOROSHO
interface ProcessData {
  value: string;
}

function processData(data: ProcessData): void {
  console.log(data.value);
}

// Esli tip neizvesten
function processUnknown(data: unknown): void {
  if (typeof data === 'object' && data !== null && 'value' in data) {
    console.log((data as { value: string }).value);
  }
}
```

### Interface vs Type

Ispol'zujte `interface` dlja ob'ektov i `type` dlja ob'edinenij/primитивov.

```typescript
// Interface dlja ob'ektov
interface User {
  id: string;
  name: string;
  email: string;
}

// Type dlja ob'edinenij
type Status = 'pending' | 'completed' | 'cancelled';

// Type dlja primenija utility
type ReadonlyUser = Readonly<User>;
```

### Vozvrashhaemye znachenija

Vsegda ukazyvajte vozvrashhaemyj tip funkcii.

```typescript
// PLOHO
function calculateTotal(items) {
  return items.reduce((sum, item) => sum + item.price, 0);
}

// HOROSHO
function calculateTotal(items: CartItem[]): number {
  return items.reduce((sum: number, item: CartItem) => sum + item.price, 0);
}
```

### Null i Undefined

Ispol'zujte `strictNullChecks`. Javno obrabatyvajte `null` i `undefined`.

```typescript
// Ispol'zujte optional chaining
const userName = user?.name;

// Ispol'zujte nullish coalescing
const displayName = userName ?? 'Guest';

// Javnaja proverka
if (user !== null && user !== undefined) {
  // ...
}
```

---

## Imenovanie

### Peremennye

Ispol'zujte camelCase. Imena dolzhny byt' osmyslennymi.

```typescript
// PLOHO
const d = new Date();
const u = getUser(id);
const flag = true;

// HOROSHO
const currentDate = new Date();
const foundUser = getUser(id);
const isAuthenticated = true;
```

### Funkcii

Ispol'zujte camelCase. Imena funkcij dolzhny nachinat'sja s glagola.

```typescript
// PLOHO
function user() { }
function data() { }

// HOROSHO
function getUser() { }
function fetchData() { }
function calculateTotal() { }
function validateEmail() { }
```

### Klassy i Interfejsy

Ispol'zujte PascalCase.

```typescript
// Klassy
class UserService { }
class AuthMiddleware { }

// Interfejsy (bez prefiksa I)
interface User { }
interface CartItem { }
```

### Konstanty

Ispol'zujte UPPER_SNAKE_CASE dlja global'nyh konstant.

```typescript
// Global'nye konstanty
const SESSION_DURATION_MINUTES = 10;
const MAX_CART_ITEMS = 100;
const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  NOT_FOUND: 404,
  INTERNAL_ERROR: 500,
} as const;

// Lokal'nye konstanty - camelCase
const maxRetries = 3;
const defaultTimeout = 5000;
```

### Fajly

Ispol'zujte kebab-case dlja imen fajlov.

```
// PLOHO
UserService.ts
authMiddleware.ts
auth-request.ts

// HOROSHO
user.service.ts
auth.middleware.ts
auth-request.ts
```

### Peremennye okruzhenija

Ispol'zujte UPPER_SNAKE_CASE.

```env
DATABASE_URL=http://localhost:5432
API_KEY=secret123
NODE_ENV=development
```

---

## Formatirovanie koda

### Otstupy

Ispol'zujte 2 probela dlja otstupov.

```typescript
// PLOHO (4 probela)
function example() {
    const x = 1;
    if (x > 0) {
        return x;
    }
}

// HOROSHO (2 probela)
function example() {
  const x = 1;
  if (x > 0) {
    return x;
  }
}
```

### Skobki

Otkryvajushhaja skobka na toj zhe stroke.

```typescript
// PLOHO
if (condition)
{
  // ...
}

// HOROSHO
if (condition) {
  // ...
}
```

### Stroki

Maksimal'naja dlina stroki - 100 simvolov.

```typescript
// PLOHO
const veryLongVariableName = someFunctionWithLongName(param1, param2, param3, param4, param5);

// HOROSHO
const veryLongVariableName = someFunctionWithLongName(
  param1,
  param2,
  param3,
  param4,
  param5,
);
```

### Perenosy strok

- Pustaja strova mezhdu funkcijami
- Pustaja stroka pered `return`
- Gruppirovka svjazannogo koda

```typescript
function getUser(id: string): User | undefined {
  const users = readUsersFromFile();
  const user = users.find(u => u.id === id);

  return user;
}

function createUser(data: CreateUserData): User {
  const id = generateId();
  const hashedPassword = hashPassword(data.password);

  const user: User = {
    id,
    name: data.name,
    email: data.email,
    password: hashedPassword,
    createdAt: new Date().toISOString(),
  };

  saveUser(user);

  return user;
}
```

### Importy

Gruppirujte importy:
1. Vneshnie moduli
2. Vnutrennie moduli
3. Tipy

```typescript
// Vneshnie moduli
import express, { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';

// Vnutrennie moduli
import { User } from '../models/user.model';
import { createUser, findUserByEmail } from '../services/user.service';

// Tipy
import type { AuthRequest } from '../middleware/auth-request';
```

### Kavychki

Ispol'zujte odinarnye kavychki dlja strok.

```typescript
// PLOHO
const message = "Hello, World!";

// HOROSHO
const message = 'Hello, World!';

// Iskljuchenie: stroki s vstavkami
const greeting = `Hello, ${name}!`;
```

### Tochka s zapjatoj

Ne stav'te točku s zapjatoj v konce strok (esli ispol'zuetsja Prettier).

```typescript
// PLOHO
const x = 1;
const y = 2;

// HOROSHO (Prettier avtomaticheski dobavljaet)
const x = 1
const y = 2
```

---

## Kommentarii

### JSDoc dlja funkcij

Vse publichnye funkcii dolzhny imet' JSDoc kommentarij.

```typescript
/**
 * Sozdaet novogo pol'zovatelja v sisteme.
 * 
 * @param data - Dannye dlja sozdanija pol'zovatelja
 * @returns Sozdannyj pol'zovatel'
 * @throws {Error} Esli pol'zovatel' s takim email uzhe sushhestvuet
 * 
 * @example
 * ```typescript
 * const user = createUser({
 *   name: 'Ivan',
 *   email: 'ivan@example.com',
 *   password: 'secret123'
 * });
 * ```
 */
function createUser(data: CreateUserData): User {
  // ...
}
```

### Russkie kommentarii

Vse kommentarii v kode dolzhny byt' na russkom jazyke.

```typescript
// PLOHO
// Check if user exists
if (!user) {
  return null;
}

// HOROSHO
// Proverjaem sushhestvovanie pol'zovatelja
if (!user) {
  return null;
}
```

### Kommentarii dlja slozhnoj logiki

```typescript
// Heshiruem parol' per sohraneniem v bazu
// Ispol'zuem bcrypt s 10 rundami soli
const hashedPassword = await bcrypt.hash(password, 10);

// Fil'truem tovary po kategorii i cene
// Sortiruem po vozrastaniju ceny
const filteredProducts = products
  .filter(p => p.category === category)
  .filter(p => p.price >= minPrice && p.price <= maxPrice)
  .sort((a, b) => a.price - b.price);
```

### TODO kommentarii

```typescript
// TODO: Dobavit' validaciju telefona
// FIXME: Ispol'zovat' transakcii pri sozdanii zakaza
// HACK: Vremennoe reshenie, perepisat' pri vozmozhnosti
```

---

## Rabota s oshibkami

### Try-Catch

Vse async funkcii dolzhny imet' obrabotku oshibok.

```typescript
// PLOHO
async function getUser(id: string): Promise<User> {
  const response = await fetch(`/api/users/${id}`);
  return response.json();
}

// HOROSHO
async function getUser(id: string): Promise<User | null> {
  try {
    const response = await fetch(`/api/users/${id}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }
    
    return response.json();
  } catch (error) {
    console.error('[UserService] Error fetching user:', error);
    return null;
  }
}
```

### Pol'zovatel'skie oshibki

Sozdavajte specifichnye oshibki dlja raznyh situacij.

```typescript
// Klassy oshibok
class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

class NotFoundError extends Error {
  constructor(resource: string) {
    super(`${resource} not found`);
    this.name = 'NotFoundError';
  }
}

class AuthenticationError extends Error {
  constructor(message: string = 'Authentication failed') {
    super(message);
    this.name = 'AuthenticationError';
  }
}
```

### Obrabotka v middleware

```typescript
// error.middleware.ts
export function errorHandler(
  error: Error,
  req: Request,
  res: Response,
  _next: NextFunction,
): void {
  console.error('[ErrorHandler]', error);

  if (error instanceof ValidationError) {
    res.status(400).json({ error: error.message });
    return;
  }

  if (error instanceof AuthenticationError) {
    res.status(401).json({ error: error.message });
    return;
  }

  if (error instanceof NotFoundError) {
    res.status(404).json({ error: error.message });
    return;
  }

  // Neizvestnaja oshibka
  res.status(500).json({ error: 'Internal server error' });
}
```

---

## Testirovanie

### Struktura testa

Ispol'zujte pattern AAA (Arrange, Act, Assert).

```typescript
describe('UserService', () => {
  describe('createUser', () => {
    it('dolzhen sozdat polzovatelja s korrektnymi dannymi', () => {
      // Arrange
      const userData = {
        name: 'Ivan',
        email: 'ivan@test.com',
        password: 'password123',
      };

      // Act
      const user = createUser(userData);

      // Assert
      expect(user).toBeDefined();
      expect(user.name).toBe('Ivan');
      expect(user.email).toBe('ivan@test.com');
    });
  });
});
```

### Imenovanie testov

Testy dolzhny opisyvat' ozhidaemoe povedenie.

```typescript
// PLOHO
it('test1', () => { });
it('works', () => { });

// HOROSHO
it('dolzhen vernut polzovatelja po ID', () => { });
it('dolzhen vykinut oshibku pri nekorrektnom email', () => { });
it('pri pustom spiske dolzhen vernut pustoj massiv', () => { });
```

### Pokrytie testami

Minimal'noe pokrytie - 80%.

```bash
# Proverka pokrytija
npm run test:coverage
```

### Mocki

Ispol'zujte mocki dlja vneshnih zavisimostej.

```typescript
// Mock funkcii
const mockReadFile = jest.fn();
jest.mock('../utils/file.utils', () => ({
  readJsonFile: mockReadFile,
}));

// Mock vremeni
jest.useFakeTimers();
jest.setSystemTime(new Date('2024-01-01'));
```

---

## Git commity

### Conventional Commits

Format: `<tip>(<oblast'>): <opisanie>`

### Tipy commitov

| Tip | Opisanie | Primer |
|-----|----------|--------|
| `feat` | Novaja funkcija | `feat(auth): add password reset` |
| `fix` | Ispravlenie baga | `fix(cart): correct total calculation` |
| `docs` | Dokumentacija | `docs(api): update endpoints` |
| `style` | Formatirovanie | `style: fix indentation` |
| `refactor` | Refaktoring | `refactor(user): extract validation` |
| `test` | Testy | `test(auth): add login tests` |
| `chore` | Obsluzhivanie | `chore: update dependencies` |

### Pravila

1. **Edinica izmenenij**: Odin commit - odno logicheskoe izmenenie
2. **Opisanie**: Na russkom jazyke, v povestitel'nom naklonenii
3. **Dlina**: Ne bolee 72 simvolov v zagolovke

```bash
# PLOHO
git commit -m "fix"
git commit -m "ispravil bagi"
git commit -m "feat: dobavil novuju funkcionalnost kotoraja pozvoljaet polzovateljam..."

# HOROSHO
git commit -m "feat(auth): add session expiration check"
git commit -m "fix(cart): correct item quantity validation"
git commit -m "docs: add development guide"
```

---

## Code review cheklist

### Pered otpravkoj na review

- [ ] Kod prohodit `npm run lint` bez oshibok
- [ ] Kod otformatirovan `npm run format`
- [ ] Vse testy prohodjat `npm test`
- [ ] Net `any` tipov
- [ ] Vse funkcii tipizirovany
- [ ] Dobavleny kommentarii k slozhnoj logike
- [ ] Obnovlena dokumentacija (esli nuzhno)

### Pri prosmotre koda

- [ ] Kod chitaetsja legko
- [ ] Imena peremennyh i funkcij ponjatny
- [ ] Net dublirovanija koda
- [ ] Obrabotany vse vozmozhnye oshibki
- [ ] Net utechek pamjati (v async funkcijah)
- [ ] Logika razbita na funkcii
- [ ] Testy pokryvajut novyj kod
- [ ] Net hardcoded znachenij (ispol'zujte konstanty)

### Posle review

- [ ] Vse zamechanija ispravleny
- [ ] Provedena samoproverka
- [ ] Commit sootvetstvuet conventional commits

---

## Primer kachestvennogo koda

```typescript
/**
 * Servis dlja raboty s pol'zovateljami.
 * Soderzhit metody dlja sozdanija, poiska i obnovlenija pol'zovatelej.
 */
import bcrypt from 'bcryptjs';
import { User } from '../models/user.model';
import { readJsonFile, writeJsonFile } from '../utils/file.utils';
import { generateId } from '../utils/id.utils';

// Konstanty
const USERS_FILE = 'users.json';
const SALT_ROUNDS = 10;

/**
 * Dannye dlja sozdanija novogo pol'zovatelja.
 */
interface CreateUserData {
  name: string;
  email: string;
  login: string;
  phone: string;
  password: string;
}

/**
 * Sozdaet novogo pol'zovatelja v sisteme.
 * 
 * @param data - Dannye dlja sozdanija pol'zovatelja
 * @returns Sozdannyj pol'zovatel'
 * @throws {Error} Esli pol'zovatel' s takim email uzhe sushhestvuet
 */
export async function createUser(data: CreateUserData): Promise<User> {
  try {
    // Poluchaem spisok sushhestvujushhih pol'zovatelej
    const users = await readJsonFile<User[]>(USERS_FILE);
    
    // Proverjaem unikal'nost' email
    const existingUser = users.find((u: User) => u.email === data.email);
    if (existingUser) {
      throw new Error('Polzovatel s takim email uzhe sushhestvuet');
    }
    
    // Heshiruem parol'
    const hashedPassword = await bcrypt.hash(data.password, SALT_ROUNDS);
    
    // Sozdaem novogo pol'zovatelja
    const newUser: User = {
      id: generateId(),
      name: data.name,
      email: data.email,
      login: data.login,
      phone: data.phone,
      password: hashedPassword,
      createdAt: new Date().toISOString(),
    };
    
    // Sohranjaem v fajl
    users.push(newUser);
    await writeJsonFile(USERS_FILE, users);
    
    return newUser;
  } catch (error) {
    console.error('[UserService] Error creating user:', error);
    throw error;
  }
}

/**
 * Ishhet pol'zovatelja po email.
 * 
 * @param email - Email pol'zovatelja
 * @returns Pol'zovatel' ili undefined, esli ne najden
 */
export async function findUserByEmail(email: string): Promise<User | undefined> {
  try {
    const users = await readJsonFile<User[]>(USERS_FILE);
    return users.find((u: User) => u.email === email);
  } catch (error) {
    console.error('[UserService] Error finding user:', error);
    return undefined;
  }
}
```

---

## Dopolnitel'nye resursy

- [TypeScript Best Practices](https://www.typescriptlang.org/docs/handbook/declaration-files/do-s-and-don-ts.html)
- [ESLint Rules](https://eslint.org/docs/rules/)
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Conventional Commits](https://www.conventionalcommits.org/)