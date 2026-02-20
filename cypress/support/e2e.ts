// Файл поддержки E2E тестов Cypress
// Импорты глобальных команд и конфигураций

// Отключаем проверку сертификатов для разработки
Cypress.config('baseUrl', 'http://localhost:3000');

// Глобальные команды для повторного использования
Cypress.Commands.add('login', (email: string, password: string) => {
  cy.visit('/');
  cy.get('[data-testid="login-button"]').click();
  cy.get('[data-testid="email-input"]').type(email);
  cy.get('[data-testid="password-input"]').type(password);
  cy.get('[data-testid="submit-login"]').click();
  cy.url().should('not.include', '/login');
});

Cypress.Commands.add('register', (userData: {
  name: string;
  email: string;
  login: string;
  phone: string;
  password: string;
}) => {
  cy.visit('/');
  cy.get('[data-testid="register-button"]').click();
  cy.get('[data-testid="name-input"]').type(userData.name);
  cy.get('[data-testid="email-input"]').type(userData.email);
  cy.get('[data-testid="login-input"]').type(userData.login);
  cy.get('[data-testid="phone-input"]').type(userData.phone);
  cy.get('[data-testid="password-input"]').type(userData.password);
  cy.get('[data-testid="submit-register"]').click();
  cy.url().should('not.include', '/register');
});

Cypress.Commands.add('logout', () => {
  cy.get('[data-testid="user-menu"]').click();
  cy.get('[data-testid="logout-button"]').click();
  cy.url().should('include', '/');
});

// Ожидание появления элемента
Cypress.Commands.add('waitForElement', (selector: string, timeout = 10000) => {
  cy.get(selector, { timeout }).should('be.visible');
});

// Проверка успешного уведомления
Cypress.Commands.add('shouldSeeSuccess', (message?: string) => {
  cy.get('[data-testid="success-message"]')
    .should('be.visible')
    .and('contain', message || 'Успех');
});

// Очистка перед каждым тестом
beforeEach(() => {
  // Очищаем localStorage и cookies
  cy.clearLocalStorage();
  cy.clearCookies();
  // Переходим на главную страницу
  cy.visit('/');
});
