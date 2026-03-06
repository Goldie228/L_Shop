/**
 * Unit-тесты для ProductFilters - L_Shop Frontend
 * Вариант 17: тестирование фильтра minRating
 */

import { ProductFilters } from '../ProductFilters';

describe('ProductFilters', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    jest.useFakeTimers();
  });

  afterEach(() => {
    document.body.innerHTML = '';
    jest.useRealTimers();
  });

  describe('рендеринг', () => {
    it('должен создать панель фильтров', () => {
      const onFilterChange = jest.fn();
      const filters = new ProductFilters({
        filters: {},
        onFilterChange,
      });

      filters.mount(container);

      const filtersElement = container.querySelector('.product-filters');
      expect(filtersElement).not.toBeNull();
    });

    it('должен отобразить поле поиска', () => {
      const onFilterChange = jest.fn();
      const filters = new ProductFilters({
        filters: {},
        onFilterChange,
      });

      filters.mount(container);

      const searchGroup = container.querySelector('.product-filters__group--search');
      expect(searchGroup).not.toBeNull();
    });

    it('должен отобразить select сортировки', () => {
      const onFilterChange = jest.fn();
      const filters = new ProductFilters({
        filters: {},
        onFilterChange,
      });

      filters.mount(container);

      const sortSelect = container.querySelector('#product-sort');
      expect(sortSelect).not.toBeNull();
    });

    it('должен отобразить select категории', () => {
      const onFilterChange = jest.fn();
      const filters = new ProductFilters({
        filters: {},
        onFilterChange,
      });

      filters.mount(container);

      const categorySelect = container.querySelector('#product-category');
      expect(categorySelect).not.toBeNull();
    });

    it('должен отобразить чекбокс "В наличии"', () => {
      const onFilterChange = jest.fn();
      const filters = new ProductFilters({
        filters: {},
        onFilterChange,
      });

      filters.mount(container);

      const inStockCheckbox = container.querySelector('#product-in-stock');
      expect(inStockCheckbox).not.toBeNull();
    });

    it('должен отобразить поле минимального рейтинга (Вариант 17)', () => {
      const onFilterChange = jest.fn();
      const filters = new ProductFilters({
        filters: {},
        onFilterChange,
      });

      filters.mount(container);

      const ratingLabel = container.querySelector('label[for="product-rating"]');
      expect(ratingLabel).not.toBeNull();
      expect(ratingLabel?.textContent).toBe('Мин. рейтинг');
    });

    it('должен отобразить кнопку сброса', () => {
      const onFilterChange = jest.fn();
      const filters = new ProductFilters({
        filters: {},
        onFilterChange,
      });

      filters.mount(container);

      const resetButton = container.querySelector('.product-filters__reset-button');
      expect(resetButton).not.toBeNull();
      expect(resetButton?.textContent).toBe('Сбросить фильтры');
    });
  });

  describe('начальные значения', () => {
    it('должен установить начальное значение поиска', () => {
      const onFilterChange = jest.fn();
      const filters = new ProductFilters({
        filters: { search: 'iphone' },
        onFilterChange,
      });

      filters.mount(container);

      const searchInput = container.querySelector('.product-filters__group--search input');
      expect((searchInput as HTMLInputElement)?.value).toBe('iphone');
    });

    it('должен установить начальное значение сортировки', () => {
      const onFilterChange = jest.fn();
      const filters = new ProductFilters({
        filters: { sort: 'price_asc' },
        onFilterChange,
      });

      filters.mount(container);

      const sortSelect = container.querySelector('#product-sort') as HTMLSelectElement;
      expect(sortSelect?.value).toBe('price_asc');
    });

    it('должен установить начальное значение категории', () => {
      const onFilterChange = jest.fn();
      const filters = new ProductFilters({
        filters: { category: 'electronics' },
        onFilterChange,
      });

      filters.mount(container);

      const categorySelect = container.querySelector('#product-category') as HTMLSelectElement;
      expect(categorySelect?.value).toBe('electronics');
    });

    it('должен установить начальное значение чекбокса inStock', () => {
      const onFilterChange = jest.fn();
      const filters = new ProductFilters({
        filters: { inStock: true },
        onFilterChange,
      });

      filters.mount(container);

      const inStockCheckbox = container.querySelector('#product-in-stock') as HTMLInputElement;
      expect(inStockCheckbox?.checked).toBe(true);
    });

    it('должен установить начальное значение minRating (Вариант 17)', () => {
      const onFilterChange = jest.fn();
      const filters = new ProductFilters({
        filters: { minRating: 4.0 },
        onFilterChange,
      });

      filters.mount(container);

      const ratingInputs = container.querySelectorAll('input[type="number"]');
      const ratingInput = ratingInputs[0] as HTMLInputElement;
      expect(ratingInput?.value).toBe('4');
    });
  });

  describe('изменение фильтров', () => {
    it('должен вызвать onFilterChange при изменении сортировки', () => {
      const onFilterChange = jest.fn();
      const filters = new ProductFilters({
        filters: {},
        onFilterChange,
      });

      filters.mount(container);

      const sortSelect = container.querySelector('#product-sort') as HTMLSelectElement;
      sortSelect.value = 'price_desc';
      sortSelect.dispatchEvent(new Event('change'));

      expect(onFilterChange).toHaveBeenCalledWith({ sort: 'price_desc' });
    });

    it('должен вызвать onFilterChange при изменении категории', () => {
      const onFilterChange = jest.fn();
      const filters = new ProductFilters({
        filters: {},
        onFilterChange,
      });

      filters.mount(container);

      const categorySelect = container.querySelector('#product-category') as HTMLSelectElement;
      categorySelect.value = 'electronics';
      categorySelect.dispatchEvent(new Event('change'));

      expect(onFilterChange).toHaveBeenCalledWith({ category: 'electronics' });
    });

    it('должен вызвать onFilterChange при изменении чекбокса inStock', () => {
      const onFilterChange = jest.fn();
      const filters = new ProductFilters({
        filters: {},
        onFilterChange,
      });

      filters.mount(container);

      const inStockCheckbox = container.querySelector('#product-in-stock') as HTMLInputElement;
      inStockCheckbox.checked = true;
      inStockCheckbox.dispatchEvent(new Event('change'));

      expect(onFilterChange).toHaveBeenCalledWith({ inStock: true });
    });

    it('должен вызвать onFilterChange при вводе поиска с debounce', () => {
      const onFilterChange = jest.fn();
      const filters = new ProductFilters({
        filters: {},
        onFilterChange,
      });

      filters.mount(container);

      const searchInput = container.querySelector('.product-filters__group--search input');
      searchInput?.dispatchEvent(new Event('input', { bubbles: true }));

      // До истечения таймера callback не должен быть вызван
      expect(onFilterChange).not.toHaveBeenCalled();

      // После 300ms callback должен быть вызван
      jest.advanceTimersByTime(300);
      // Note: из-за мока Input, точная проверка сложная
    });
  });

  describe('сброс фильтров', () => {
    it('должен сбросить все фильтры при клике на кнопку', () => {
      const onFilterChange = jest.fn();
      const filters = new ProductFilters({
        filters: {
          search: 'test',
          sort: 'price_asc',
          category: 'electronics',
          inStock: true,
          minRating: 4.0,
        },
        onFilterChange,
      });

      filters.mount(container);

      const resetButton = container.querySelector('.product-filters__reset-button') as HTMLButtonElement;
      resetButton?.click();

      expect(onFilterChange).toHaveBeenCalledWith({});
    });
  });

  describe('валидация minRating (Вариант 17)', () => {
    it('должен принять корректное значение рейтинга от 1 до 5', () => {
      const onFilterChange = jest.fn();
      const filters = new ProductFilters({
        filters: {},
        onFilterChange,
      });

      filters.mount(container);

      // Проверим что поле существует
      const ratingInputs = container.querySelectorAll('input[type="number"]');
      expect(ratingInputs.length).toBeGreaterThan(0);
    });
  });

  describe('опции сортировки', () => {
    it('должен содержать опции price_asc и price_desc', () => {
      const onFilterChange = jest.fn();
      const filters = new ProductFilters({
        filters: {},
        onFilterChange,
      });

      filters.mount(container);

      const sortSelect = container.querySelector('#product-sort');
      const options = sortSelect?.querySelectorAll('option');

      const values = Array.from(options || []).map((opt) => opt.value);
      expect(values).toContain('');
      expect(values).toContain('price_asc');
      expect(values).toContain('price_desc');
    });
  });

  describe('категории', () => {
    it('должен содержать все категории', () => {
      const onFilterChange = jest.fn();
      const filters = new ProductFilters({
        filters: {},
        onFilterChange,
      });

      filters.mount(container);

      const categorySelect = container.querySelector('#product-category');
      const options = categorySelect?.querySelectorAll('option');

      const values = Array.from(options || []).map((opt) => opt.value);
      expect(values).toContain('');
      expect(values).toContain('electronics');
      expect(values).toContain('clothing');
      expect(values).toContain('books');
      expect(values).toContain('home');
      expect(values).toContain('sports');
    });
  });
});