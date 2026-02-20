/**
 * Smoke tests для авторизации
 * Проверяет базовые сценарии: открытие страницы, вход, регистрация
 */

describe('Auth Flow', () => {
  beforeEach(() => {
    // Посещаем главную страницу перед каждым тестом
    cy.visit('/');
  });

  describe('Открытие страницы', () => {
    it('должен отображать главную страницу', () => {
      // Проверяем, что страница загрузилась
      cy.get('body').should('be.visible');
      
      // Проверяем наличие заголовка
      cy.get('header').should('exist');
    });

    it('должен отображать кнопки авторизации для гостя', () => {
      // Проверяем наличие кнопок входа и регистрации
      cy.get('button').contains('Войти').should('be.visible');
      cy.get('button').contains('Регистрация').should('be.visible');
    });
  });

  describe('Модальное окно авторизации', () => {
    it('должен открыть модальное окно входа при клике на "Войти"', () => {
      // Кликаем на кнопку входа
      cy.get('button').contains('Войти').click();
      
      // Проверяем, что модальное окно открылось
      cy.get('.modal').should('be.visible');
      
      // Проверяем наличие формы входа
      cy.get('input[type="email"]').should('be.visible');
      cy.get('input[type="password"]').should('be.visible');
    });

    it('должен открыть модальное окно регистрации при клике на "Регистрация"', () => {
      // Кликаем на кнопку регистрации
      cy.get('button').contains('Регистрация').click();
      
      // Проверяем, что модальное окно открылось
      cy.get('.modal').should('be.visible');
      
      // Проверяем наличие полей формы регистрации
      cy.get('input[name="email"]').should('be.visible');
      cy.get('input[name="password"]').should('be.visible');
      cy.get('input[name="confirmPassword"]').should('be.visible');
    });
  });

  describe('Форма входа', () => {
    beforeEach(() => {
      // Открываем модальное окно входа
      cy.get('button').contains('Войти').click();
    });

    it('должен показать ошибку при пустых полях', () => {
      // Пытаемся отправить форму без данных
      cy.get('button[type="submit"]').click();
      
      // Проверяем, что появились сообщения об ошибках
      cy.get('.error-message').should('exist');
    });

    it('должен показать ошибку при неверном формате email', () => {
      // Вводим некорректный email
      cy.get('input[type="email"]').type('invalid-email');
      cy.get('input[type="password"]').type('password123');
      
      // Проверяем валидацию email
      cy.get('input[type="email"]').then(($input) => {
        expect(($input[0] as HTMLInputElement).validity.valid).to.be.false;
      });
    });

    it('должен показать ошибку при слишком коротком пароле', () => {
      // Вводим короткий пароль
      cy.get('input[type="email"]').type('test@example.com');
      cy.get('input[type="password"]').type('123');
      
      // Отправляем форму
      cy.get('button[type="submit"]').click();
      
      // Проверяем наличие ошибки (если есть валидация длины)
      cy.get('.error-message').should('exist');
    });
  });

  describe('Форма регистрации', () => {
    beforeEach(() => {
      // Открываем модальное окно регистрации
      cy.get('button').contains('Регистрация').click();
    });

    it('должен показать ошибку при несовпадающих паролях', () => {
      // Заполняем форму с несовпадающими паролями
      cy.get('input[name="email"]').type('newuser@example.com');
      cy.get('input[name="password"]').type('password123');
      cy.get('input[name="confirmPassword"]').type('differentPassword');
      
      // Отправляем форму
      cy.get('button[type="submit"]').click();
      
      // Проверяем наличие ошибки
      cy.get('.error-message').should('exist');
    });

    it('должен содержать все обязательные поля', () => {
      // Проверяем наличие всех полей регистрации
      cy.get('input[name="email"]').should('exist');
      cy.get('input[name="password"]').should('exist');
      cy.get('input[name="confirmPassword"]').should('exist');
      
      // Кнопка отправки должна быть
      cy.get('button[type="submit"]').should('exist');
    });
  });

  describe('Закрытие модального окна', () => {
    it('должен закрыть модальное окно при клике на крестик', () => {
      // Открываем модальное окно
      cy.get('button').contains('Войти').click();
      cy.get('.modal').should('be.visible');
      
      // Кликаем на кнопку закрытия
      cy.get('.modal-close').click();
      
      // Проверяем, что модальное окно закрылось
      cy.get('.modal').should('not.exist');
    });

    it('должен закрыть модальное окно при клике на overlay', () => {
      // Открываем модальное окно
      cy.get('button').contains('Войти').click();
      cy.get('.modal').should('be.visible');
      
      // Кликаем на overlay (фон модального окна)
      cy.get('.modal-overlay').click({ force: true });
      
      // Проверяем, что модальное окно закрылось
      cy.get('.modal').should('not.exist');
    });
  });
});
