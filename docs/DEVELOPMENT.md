# instrukciya po razrabotke L_Shop

## Vvedenie

L_Shop - eto prototip internet-magazina, razrabotannyj na Express + TypeScript (backend) i SPA na chistom TypeScript (frontend). Proekt ispol'zuet fajlovoe hranenie dannyh (JSON) bez vneshnih baz dannyh.

### Cel' proekta

Sozdanie funkcional'nogo prototipa internet-magazina s:
- Polnocennoj sistemoj autentifikacii
- Katalogom tovarov s fil'traciej
- Korzinoj pokupok
- Oformleniem zakazov

### Komanda razrabotchikov

| Razrabotchik | Rol' | Variant | Otvetstvennost' |
|--------------|------|---------|-----------------|
| **Gleb** | Timlid | - | Infrastruktura, autentifikacija, integracija |
| **Nikita P.** | Backend/Frontend | 17 | Modul' produktov |
| **Timofej** | Backend/Frontend | 21 | Modul' korziny |
| **Nikita T.** | Backend/Frontend | 24 | Modul' zakazov/dostavki |

---

## Trebovanija k okruzheniju

### Obyazatel'nye trebovanija

| Programmnoe obespechenie | Minimal'naja versija | Rekomenduemaja versija |
|--------------------------|---------------------|------------------------|
| Node.js | v18.0.0 | v20.x LTS |
| npm | v9.0.0 | v10.x |

### Proverka versij

```bash
# Proverit' versiju Node.js
node --version

# Proverit' versiju npm
npm --version
```

### Rekomenduemye instrumenty

- **VS Code** - redaktor koda
- **Git** - sistema kontrolja versij
- **Postman** ili **Insomnia** - testirovanie API

### Rasshirenija VS Code (rekomenduemye)

- ESLint
- Prettier - Code formatter
- TypeScript Hero
- Thunder Client (dlja testirovanija API)

---

## Ustanovka i zapusk proekta

### Pervichnaja ustanovka

```bash
# 1. Klonirovat' repozitorij
git clone <url-repozitorija>
cd L_Shop

# 2. Ustanovit' zavisimosti
npm install

# 3. Skopirovat' fajl okruzhenija
cp .env.example .env

# 4. Redaktirovat' .env pri neobhodimosti
```

### Konfiguracija okruzhenija (.env)

```env
# Port servera
PORT=3000

# Rezhim razrabotki
NODE_ENV=development
```

### Zapusk v rezhime razrabotki

```bash
# Zapusk s avtoperezagruzkoj (nodemon)
npm run dev
```

Server budet dostupen po adresu: `http://localhost:3000`

### Kompiljacija proekta

```bash
# Sgenerirovat' JavaScript fajly v dist/
npm run build
```

### Zapusk produkshn versii

```bash
# Zapusk skompilirovannogo proekta
npm start
```

### Zapolnenie testovymi dannymi

```bash
# Sozdat' testovyh pol'zovatelej i dannye
npm run seed
```

---

## Struktura proekta

```
L_Shop/
|-- src/
|   |-- backend/                 # Backend na Express + TypeScript
|   |   |-- app.ts               # Tochka vhoda, konfiguracija servera
|   |   |-- config/              # Konfiguracionnye fajly
|   |   |   |-- constants.ts     # Konstanty proekta
|   |   |-- controllers/         # Kontrollery (obrabotka HTTP-zaprosov)
|   |   |   |-- auth.controller.ts
|   |   |-- data/                # JSON-fajly s dannymi
|   |   |   |-- users.json
|   |   |   |-- sessions.json
|   |   |   |-- products.json
|   |   |   |-- carts.json
|   |   |   |-- orders.json
|   |   |-- middleware/          # Middleware (promzhutochnaja obrabotka)
|   |   |   |-- auth.middleware.ts    # Proverka avtorizacii
|   |   |   |-- error.middleware.ts   # Obrabotka oshibok
|   |   |   |-- auth-request.ts      # Rasshirenie Request
|   |   |-- models/              # Modeli dannyh (TypeScript interfaces)
|   |   |   |-- user.model.ts
|   |   |   |-- session.model.ts
|   |   |   |-- product.model.ts
|   |   |   |-- cart.model.ts
|   |   |   |-- order.model.ts
|   |   |-- routes/              # Marshruty API
|   |   |   |-- auth.routes.ts
|   |   |-- scripts/             # Skripty
|   |   |   |-- seed.ts          # Zapolnenie testovymi dannymi
|   |   |-- services/            # Biznes-logika
|   |   |   |-- user.service.ts
|   |   |   |-- session.service.ts
|   |   |-- types/               # TypeScript tipy i deklaracii
|   |   |   |-- express.d.ts     # Rasshirenie Express Request
|   |   |-- utils/               # Vspomogatel'nye funkcii
|   |       |-- file.utils.ts    # Rabota s fajlami
|   |       |-- hash.utils.ts    # Heshirovanie parolej
|   |       |-- id.utils.ts      # Generacija ID
|   |       |-- validators.ts    # Validacija dannyh
|   |-- frontend/                # SPA frontend (planiruetsja)
|-- docs/                        # Dokumentacija
|   |-- API.md                   # API dokumentacija
|   |-- ARCHITECTURE.md          # Arhitektura proekta
|   |-- DEVELOPMENT.md           # Instrukcija po razrabotke
|   |-- CODING_STANDARDS.md      # Standarty oformlenija koda
|   |-- CONTRIBUTING.md          # Pravila vklada
|-- dist/                        # Skompilirovannyj kod (sozdaetsja avtomaticheski)
|-- node_modules/                # Zavisimosti (ne versiruetsja)
|-- .env.example                 # Primer konfiguracii
|-- .eslintrc.js                 # Nastrojki ESLint
|-- .prettierrc                  # Nastrojki Prettier
|-- .gitignore                   # Ignoriruemye fajly Git
|-- jest.config.js               # Nastrojki Jest
|-- package.json                 # Opisanie proekta i skripty
|-- tsconfig.json                # Nastrojki TypeScript
|-- LICENSE                      # Licenzija MIT
```

### Opisanie katalogov

#### `src/backend/`

Osnovnoj katalog backend-a. Soderzhit ves' kod servernoj chasti.

#### `src/backend/config/`

Konfiguracionnye fajly s konstantami i nastrojkami.

#### `src/backend/controllers/`

Kontrollery prinimajut HTTP-zaprosy, provodjat validaciju vhodnyh dannyh i vozvrashhajut otvety. Ne dolzhny soderzhat' biznes-logiku.

#### `src/backend/middleware/`

Middleware - promzhutochnye funkcii, kotorye vypolnjajutsja do kontrollerov:
- `auth.middleware.ts` - proverka autentifikacii
- `error.middleware.ts` - centralizovannaja obrabotka oshibok

#### `src/backend/models/`

TypeScript interfejsy i tipy dannyh. Opisyvajut strukturu hranimyh ob'ektov.

#### `src/backend/routes/`

Opisanie marshrutov API. Svjazyvajut URL s kontrollerami.

#### `src/backend/services/`

Biznes-logika prilozhenija. Rabota s dannymi, vypolnenie operacij.

#### `src/backend/utils/`

Vspomogatel'nye funkcii:
- heshirovanie parolej
- generacija ID
- validacija dannyh
- rabota s fajlami

#### `src/backend/data/`

JSON-fajly s dannymi pol'zovatelej, sessij, tovarov i t.d.

---

## Rabota s Git

### Vetki

| Vetka | Naznachenie |
|-------|-------------|
| `main` | Zashhishhennaja vetka, tol'ko cherez PR |
| `review` | Pustaja vetka dlja rev'ju |
| `feature/<modul'>-<imja>` | Feature-vetki dlja novyh funkcij |
| `fix/<opisanie>` | Vetki dlja ispravlenija bagov |

### Sozdanie feature-vetki

```bash
# Sozdat' novuju vetku ot main
git checkout main
git pull origin main
git checkout -b feature/auth-login

# Rabotat' v vetke
git add .
git commit -m "feat(auth): add login functionality"

# Otpravit' vetku v repozitorij
git push origin feature/auth-login
```

### Conventional Commits

Ispol'zuem format conventional commits:

```
<tip>(<oblast'>): <opisanie>

[neobjazatel'noe telo]
```

#### Tipy commitov

| Tip | Opisanie |
|-----|----------|
| `feat` | Novaja funkcija |
| `fix` | Ispravlenie baga |
| `docs` | Izmenenie dokumentacii |
| `style` | Formatirovanie, nedostajushhie tochki s zapjatoj |
| `refactor` | Refaktoring bez izmenenija funkcional'nosti |
| `test` | Dobavlenie ili ispravlenie testov |
| `chore` | Obnovlenie zavisimostej, konfiguracii |

#### Primery

```bash
feat(auth): add password hashing
fix(cart): correct item quantity calculation
docs(api): update authentication endpoints
refactor(user): extract validation to utils
test(session): add unit tests for session service
```

### Pull Request

1. Sozdat' vetku ot `main`
2. Vnesti izmenenija
3. Otkryt' Pull Request v `main`
4. Zhdat' code review
5. Ispravit' zamechanija
6. Smerzh' posle odobrenija

---

## Zapusk testov

### Vse testy

```bash
npm test
```

### Rezhim slezhenija

```bash
npm run test:watch
```

### Otchet o pokrytii

```bash
npm run test:coverage
```

### Struktura testov

Testy raspolagajutsja v katalogah `__tests__`:

```
src/backend/
|-- services/
|   |-- __tests__/
|   |   |-- session.service.test.ts
|-- utils/
    |-- __tests__/
        |-- validators.test.ts
        |-- id.utils.test.ts
```

### Imenovanie testov

- Fajly testov: `<imja>.test.ts`
- Opisyvajut povedenie: "dolzhen...", "pri ... dolzhen..."

---

## Otladka i logirovanie

### Logirovanie v kontrollery

```typescript
// Ispol'zujte console.log dlja otladki
console.log('[AuthController] Login attempt:', { login });

// Ispol'zujte console.error dlja oshibok
console.error('[AuthController] Login error:', error);
```

### Otladka v VS Code

1. Otkryt' fajl dlja otladki
2. Postavit' tochku ostanova (F9)
3. Zapustit' otladku (F5)
4. Vybrat' konfiguraciju "Node.js"

### Konfiguracija otladki (.vscode/launch.json)

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Dev",
      "runtimeExecutable": "npm",
      "runtimeArgs": ["run", "dev"],
      "console": "integratedTerminal"
    }
  ]
}
```

---

## Chastye problemy i reshenija

### Port uzhe ispol'zuetsja

**Oshibka:** `Error: listen EADDRINUSE: address already in use :::3000`

**Reshenie:**
```bash
# Najti process na portu 3000
lsof -i :3000

# Ubit' process
kill -9 <PID>
```

### Moduli ne najdeny

**Oshibka:** `Cannot find module '...'`

**Reshenie:**
```bash
# Pereustanovit' zavisimosti
rm -rf node_modules package-lock.json
npm install
```

### Oshibki TypeScript

**Oshibka:** `Type '...' is not assignable to type '...'`

**Reshenie:**
- Prover'te sootvetstvie tipov
- Ispol'zujte tipizaciju argumentov i vozvrashhaemyh znachenij
- Izbezhajte `any`

### ESLint oshibki

**Oshibka:** `ESLint: ...`

**Reshenie:**
```bash
# Avtomaticheski ispravit' prostye oshibki
npm run lint -- --fix

# Formatirovat' kod
npm run format
```

### Testy ne prohodjat

**Oshibka:** Testy padajut

**Reshenie:**
- Prover'te, chto vse zavisimosti ustanovleny
- Prover'te, chto fajly dannyh sushhestvujut
- Zapustite `npm run seed` dlja sozdanija testovyh dannyh

---

## Poleznye komandy

### Razrabotka

```bash
# Zapusk servera v rezhime razrabotki
npm run dev

# Proverka koda
npm run lint

# Formatirovanie koda
npm run format

# Kompiljacija
npm run build
```

### Testirovanie

```bash
# Zapusk vseh testov
npm test

# Zapusk konkretnogo testa
npm test -- --testPathPattern=validators

# Rezhim slezhenija
npm run test:watch

# Otchet o pokrytii
npm run test:coverage
```

### Git

```bash
# Status
git status

# Istorija commitov
git log --oneline -10

# Raznica
git diff

# Otpravit' izmenenija
git add .
git commit -m "feat: description"
git push origin <branch>
```

### NPM

```bash
# Proverit' ustarevshie pakety
npm outdated

# Obnovit' pakety
npm update

# Ustanovit' konkretnuju versiju
npm install package@version
```

---

## Dopolnitel'nye resursy

- [Arhitektura proekta](ARCHITECTURE.md)
- [API dokumentacija](API.md)
- [Standarty oformlenija koda](CODING_STANDARDS.md)
- [Pravila vklada](CONTRIBUTING.md)