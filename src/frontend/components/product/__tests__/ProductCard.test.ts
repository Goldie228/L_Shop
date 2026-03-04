/**
 * Unit-тесты для ProductCard - L_Shop Frontend
 * Вариант 17: тестирование отображения рейтинга
 */

import { ProductCard } from '../ProductCard';
import { Product } from '../../../types/product';

describe('ProductCard', () => {
  let container: HTMLElement;

  const mockProduct: Product = {
    id: '1',
    name: 'iPhone 15 Pro',
    description: 'Флагманский смартфон Apple',
    price: 129990,
    category: 'electronics',
    inStock: true,
    rating: 4.5,
    reviewsCount: 128,
    createdAt: '2024-01-01T00:00:00.000Z',
  };

  const mockProductWithoutRating: Product = {
    id: '2',
    name: 'Basic Phone',
    description: 'Простой телефон',
    price: 9990,
    category: 'electronics',
    inStock: true,
    createdAt: '2024-01-02T00:00:00.000Z',
  };

  const mockProductOutOfStock: Product = {
    id: '3',
    name: 'Out of Stock Item',
    description: 'Нет в наличии',
    price: 5000,
    category: 'other',
    inStock: false,
    rating: 3.8,
    reviewsCount: 10,
    createdAt: '2024-01-03T00:00:00.000Z',
  };

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  describe('рендеринг', () => {
    it('должен создать карточку продукта', () => {
      const card = new ProductCard({
        product: mockProduct,
        isAuthenticated: false,
      });

      card.mount(container);

      const cardElement = container.querySelector('.product-card');
      expect(cardElement).not.toBeNull();
    });

    it('должен отображать название продукта с data-title атрибутом', () => {
      const card = new ProductCard({
        product: mockProduct,
        isAuthenticated: false,
      });

      card.mount(container);

      const title = container.querySelector('[data-title]');
      expect(title).not.toBeNull();
      expect(title?.textContent).toBe('iPhone 15 Pro');
    });

    it('должен отображать цену продукта с data-price атрибутом', () => {
      const card = new ProductCard({
        product: mockProduct,
        isAuthenticated: false,
      });

      card.mount(container);

      const price = container.querySelector('[data-price]');
      expect(price).not.toBeNull();
      expect(price?.textContent).toContain('129');
    });

    it('должен отображать рейтинг (Вариант 17)', () => {
      const card = new ProductCard({
        product: mockProduct,
        isAuthenticated: false,
      });

      card.mount(container);

      const rating = container.querySelector('.product-card__rating');
      expect(rating).not.toBeNull();
      expect(rating?.textContent).toContain('4.5');
    });

    it('должен отображать количество отзывов (Вариант 17)', () => {
      const card = new ProductCard({
        product: mockProduct,
        isAuthenticated: false,
      });

      card.mount(container);

      const reviewsCount = container.querySelector('.product-card__reviews-count');
      expect(reviewsCount).not.toBeNull();
      expect(reviewsCount?.textContent).toContain('128');
    });

    it('не должен отображать рейтинг если он не задан', () => {
      const card = new ProductCard({
        product: mockProductWithoutRating,
        isAuthenticated: false,
      });

      card.mount(container);

      const rating = container.querySelector('.product-card__rating');
      expect(rating).toBeNull();
    });
  });

  describe('состояние наличия', () => {
    it('должен добавить класс product-card--out-of-stock для отсутствующего товара', () => {
      const card = new ProductCard({
        product: mockProductOutOfStock,
        isAuthenticated: false,
      });

      card.mount(container);

      const cardElement = container.querySelector('.product-card');
      expect(cardElement?.classList.contains('product-card--out-of-stock')).toBe(true);
    });

    it('должен отображать статус "Нет в наличии"', () => {
      const card = new ProductCard({
        product: mockProductOutOfStock,
        isAuthenticated: false,
      });

      card.mount(container);

      const status = container.querySelector('.product-card__stock-status--out');
      expect(status).not.toBeNull();
      expect(status?.textContent).toBe('Нет в наличии');
    });
  });

  describe('кнопка "В корзину"', () => {
    it('должна отображаться для авторизованного пользователя если товар в наличии', () => {
      const card = new ProductCard({
        product: mockProduct,
        isAuthenticated: true,
      });

      card.mount(container);

      const button = container.querySelector('.product-card__add-button button');
      expect(button).not.toBeNull();
      expect(button?.textContent).toBe('В корзину');
    });

    it('не должна отображаться для неавторизованного пользователя', () => {
      const card = new ProductCard({
        product: mockProduct,
        isAuthenticated: false,
      });

      card.mount(container);

      const button = container.querySelector('.product-card__add-button');
      expect(button).toBeNull();
    });

    it('не должна отображаться если товара нет в наличии', () => {
      const card = new ProductCard({
        product: mockProductOutOfStock,
        isAuthenticated: true,
      });

      card.mount(container);

      const button = container.querySelector('.product-card__add-button');
      expect(button).toBeNull();
    });

    it('должна вызывать onAddToCart при клике', () => {
      const onAddToCart = jest.fn();
      const card = new ProductCard({
        product: mockProduct,
        isAuthenticated: true,
        onAddToCart,
      });

      card.mount(container);

      const button = container.querySelector('button');
      button?.click();

      expect(onAddToCart).toHaveBeenCalledWith('1');
    });
  });

  describe('изображение', () => {
    it('должен отображать изображение если imageUrl задан', () => {
      const card = new ProductCard({
        product: { ...mockProduct, imageUrl: '/images/test.jpg' },
        isAuthenticated: false,
      });

      card.mount(container);

      const img = container.querySelector('.product-card__img') as HTMLImageElement;
      expect(img).not.toBeNull();
      expect(img?.src).toContain('/images/test.jpg');
      expect(img?.alt).toBe('iPhone 15 Pro');
    });

    it('должен отображать заглушку если imageUrl не задан', () => {
      const card = new ProductCard({
        product: mockProduct,
        isAuthenticated: false,
      });

      card.mount(container);

      const placeholder = container.querySelector('.product-card__placeholder');
      expect(placeholder).not.toBeNull();
      expect(placeholder?.textContent).toBe('📷');
    });
  });

  describe('скидка', () => {
    it('должен отображать бейдж скидки', () => {
      const card = new ProductCard({
        product: { ...mockProduct, discountPercent: 15 },
        isAuthenticated: false,
      });

      card.mount(container);

      const badge = container.querySelector('.product-card__discount-badge');
      expect(badge).not.toBeNull();
      expect(badge?.textContent).toBe('-15%');
    });

    it('должен отображать перечёркнутую оригинальную цену', () => {
      const productWithDiscount = {
        ...mockProduct,
        price: 100000,
        discountPercent: 20,
      };
      const card = new ProductCard({
        product: productWithDiscount,
        isAuthenticated: false,
      });

      card.mount(container);

      const originalPrice = container.querySelector('.product-card__original-price');
      expect(originalPrice).not.toBeNull();
    });
  });

  describe('категория', () => {
    it('должен отображать название категории на русском', () => {
      const card = new ProductCard({
        product: mockProduct,
        isAuthenticated: false,
      });

      card.mount(container);

      const category = container.querySelector('.product-card__category');
      expect(category?.textContent).toBe('Электроника');
    });

    it('должен отображать оригинальное название для неизвестной категории', () => {
      const card = new ProductCard({
        product: { ...mockProduct, category: 'unknown_category' },
        isAuthenticated: false,
      });

      card.mount(container);

      const category = container.querySelector('.product-card__category');
      expect(category?.textContent).toBe('unknown_category');
    });
  });
});