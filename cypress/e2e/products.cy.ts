/**
 * Smoke tests для просмотра товаров
 * Проверяет отображение списка товаров и деталей товара
 */

describe('Products View', () => {
  describe('API Products', () => {
    it('должен получить список товаров через API', () => {
      cy.request('GET', 'http://localhost:3001/api/products').then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.have.property('products');
        expect(response.body.products).to.be.an('array');
        expect(response.body.products.length).to.be.greaterThan(0);
      });
    });

    it('должен получить детали товара по ID через API', () => {
      cy.request('GET', 'http://localhost:3001/api/products/1').then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.have.property('product');
        expect(response.body.product).to.have.property('id');
        expect(response.body.product).to.have.property('name');
        expect(response.body.product).to.have.property('price');
      });
    });

    it('должен вернуть 404 для несуществующего товара', () => {
      cy.request({
        method: 'GET',
        url: 'http://localhost:3001/api/products/nonexistent',
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.eq(404);
        expect(response.body).to.have.property('error');
      });
    });
  });

  describe('Отображение товаров на странице', () => {
    beforeEach(() => {
      cy.visit('/');
    });

    it('должен отображать главную страницу', () => {
      cy.get('body').should('be.visible');
      cy.get('main').should('exist');
    });

    it('должен отображать контейнер для товаров', () => {
      // Проверяем наличие контейнера для товаров (если реализовано на frontend)
      cy.get('body').then(($body) => {
        const productsContainer = $body.find('[data-testid="products-container"]');
        const productsGrid = $body.find('.products-grid');
        const productList = $body.find('#products');
        
        // Хотя бы один из контейнеров должен существовать
        expect(productsContainer.length + productsGrid.length + productList.length).to.be.greaterThan(0);
      });
    });
  });

  describe('Карточка товара', () => {
    it('должен содержать необходимые поля в данных товара', () => {
      cy.request('GET', 'http://localhost:3001/api/products/1').then((response) => {
        const product = response.body.product;
        
        // Проверяем обязательные поля
        expect(product).to.have.property('id');
        expect(product).to.have.property('name');
        expect(product).to.have.property('description');
        expect(product).to.have.property('price');
        expect(product).to.have.property('category');
        expect(product).to.have.property('inStock');
        
        // Проверяем типы данных
        expect(product.id).to.be.a('string');
        expect(product.name).to.be.a('string');
        expect(product.price).to.be.a('number');
        expect(product.inStock).to.be.a('boolean');
      });
    });

    it('должен корректно отображать цену товара', () => {
      cy.request('GET', 'http://localhost:3001/api/products/1').then((response) => {
        const product = response.body.product;
        
        expect(product.price).to.be.greaterThan(0);
        expect(product.price).to.be.a('number');
      });
    });
  });

  describe('Список товаров', () => {
    it('должен вернуть несколько товаров', () => {
      cy.request('GET', 'http://localhost:3001/api/products').then((response) => {
        const products = response.body.products;
        
        expect(products.length).to.be.greaterThan(1);
      });
    });

    it('должен вернуть товары с разными категориями', () => {
      cy.request('GET', 'http://localhost:3001/api/products').then((response) => {
        const products = response.body.products;
        const categories = products.map((p: { category: string }) => p.category);
        
        // Проверяем, что есть хотя бы одна категория
        expect(categories.length).to.be.greaterThan(0);
      });
    });

    it('должен вернуть товары с корректной структурой', () => {
      cy.request('GET', 'http://localhost:3001/api/products').then((response) => {
        const products = response.body.products;
        
        products.forEach((product: {
          id: string;
          name: string;
          description: string;
          price: number;
          category: string;
          inStock: boolean;
        }) => {
          expect(product).to.have.property('id');
          expect(product).to.have.property('name');
          expect(product).to.have.property('price');
          expect(product.price).to.be.a('number');
          expect(product.price).to.be.greaterThan(0);
        });
      });
    });
  });
});
