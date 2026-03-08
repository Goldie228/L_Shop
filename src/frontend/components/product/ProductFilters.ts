/**
 * Компонент фильтров продуктов - L_Shop Frontend
 * Фильтрация по категории, цене, наличию и рейтингу (Вариант 17)
 */

import { Component, ComponentProps } from '../base/Component.js';
import { Input } from '../ui/Input.js';
import { Button } from '../ui/Button.js';
import {
  ProductFilters as ProductFiltersType,
  PRODUCT_CATEGORIES,
  SORT_OPTIONS,
} from '../../types/product.js';

/**
 * Интерфейс пропсов для ProductFilters
 */
export interface ProductFiltersProps extends ComponentProps {
  /** Текущие значения фильтров */
  filters: ProductFiltersType;
  /** Callback при изменении фильтров */
  onFilterChange: (filters: ProductFiltersType) => void;
}

/**
 * Компонент фильтрации и сортировки продуктов
 *
 * @example
 * ```typescript
 * const filters = new ProductFilters({
 *   filters: { search: '' },
 *   onFilterChange: (newFilters) => console.log(newFilters)
 * });
 * filters.mount(container);
 * ```
 */
export class ProductFilters extends Component<ProductFiltersProps> {
  /** Поле поиска */
  private searchInput: Input | null = null;

  /** Поле минимального рейтинга */
  private ratingInput: Input | null = null;

  /** Select сортировки */
  private sortSelect: HTMLSelectElement | null = null;

  /** Select категории */
  private categorySelect: HTMLSelectElement | null = null;

  /** Чекбокс наличия */
  private inStockCheckbox: HTMLInputElement | null = null;

  /** Таймер debounce для поиска */
  private searchDebounceTimer: ReturnType<typeof setTimeout> | null = null;

  /**
   * Получить пропсы по умолчанию
   */
  protected getDefaultProps(): ProductFiltersProps {
    return {
      ...super.getDefaultProps(),
      filters: {},
      onFilterChange: () => {},
    };
  }

  /**
   * Отрендерить панель фильтров
   */
  public render(): HTMLElement {
    const { className } = this.props;

    // Построить классы
    const classes = ['product-filters'];
    if (className) {
      classes.push(className);
    }

    // Создать корневой элемент
    this.element = this.createElement('div', {
      className: classes.join(' '),
    });

    // Поиск
    const searchGroup = this.renderSearchGroup();
    this.element.appendChild(searchGroup);

    // Панель с фильтрами
    const filtersRow = this.createElement('div', {
      className: 'product-filters__row',
    });

    // Сортировка
    const sortGroup = this.renderSortGroup();
    filtersRow.appendChild(sortGroup);

    // Категория
    const categoryGroup = this.renderCategoryGroup();
    filtersRow.appendChild(categoryGroup);

    // В наличии
    const inStockGroup = this.renderInStockGroup();
    filtersRow.appendChild(inStockGroup);

    // Минимальный рейтинг (Вариант 17)
    const ratingGroup = this.renderRatingGroup();
    filtersRow.appendChild(ratingGroup);

    this.element.appendChild(filtersRow);

    // Кнопка сброса
    const resetButton = this.renderResetButton();
    this.element.appendChild(resetButton);

    return this.element;
  }

  /**
   * Отрендерить поле поиска
   */
  private renderSearchGroup(): HTMLElement {
    const group = this.createElement('div', {
      className: 'product-filters__group product-filters__group--search',
    });

    const label = this.createElement('label', {
      className: 'product-filters__label',
      for: 'product-search',
    });
    label.textContent = 'Поиск';
    group.appendChild(label);

    this.searchInput = new Input({
      type: 'text',
      name: 'product-search',
      placeholder: 'Название или описание...',
      value: this.props.filters.search || '',
      className: 'product-filters__search-input',
      onChange: (value: string) => this.handleSearchInput(value),
    });

    this.searchInput.mount(group);
    this.addChild(this.searchInput);

    return group;
  }

  /**
   * Отрендерить select сортировки
   */
  private renderSortGroup(): HTMLElement {
    const group = this.createElement('div', {
      className: 'product-filters__group',
    });

    const label = this.createElement('label', {
      className: 'product-filters__label',
      for: 'product-sort',
    });
    label.textContent = 'Сортировка';
    group.appendChild(label);

    this.sortSelect = this.createElement('select', {
      className: 'product-filters__select',
      id: 'product-sort',
    });

    SORT_OPTIONS.forEach((option) => {
      const optionElement = this.createElement('option', {
        value: option.value,
      });
      optionElement.textContent = option.label;
      if (option.value === (this.props.filters.sort || '')) {
        optionElement.setAttribute('selected', 'true');
      }
      this.sortSelect?.appendChild(optionElement);
    });

    this.addEventListener(this.sortSelect, 'change', this.handleSortChange);
    group.appendChild(this.sortSelect);

    return group;
  }

  /**
   * Отрендерить select категории
   */
  private renderCategoryGroup(): HTMLElement {
    const group = this.createElement('div', {
      className: 'product-filters__group',
    });

    const label = this.createElement('label', {
      className: 'product-filters__label',
      for: 'product-category',
    });
    label.textContent = 'Категория';
    group.appendChild(label);

    this.categorySelect = this.createElement('select', {
      className: 'product-filters__select',
      id: 'product-category',
    });

    // Опция "Все категории"
    const allOption = this.createElement('option', {
      value: '',
    });
    allOption.textContent = 'Все категории';
    this.categorySelect.appendChild(allOption);

    PRODUCT_CATEGORIES.forEach((option) => {
      const optionElement = this.createElement('option', {
        value: option.value,
      });
      optionElement.textContent = option.label;
      if (option.value === this.props.filters.category) {
        optionElement.setAttribute('selected', 'true');
      }
      this.categorySelect?.appendChild(optionElement);
    });

    this.addEventListener(this.categorySelect, 'change', this.handleCategoryChange);
    group.appendChild(this.categorySelect);

    return group;
  }

  /**
   * Отрендерить чекбокс "В наличии"
   */
  private renderInStockGroup(): HTMLElement {
    const group = this.createElement('div', {
      className: 'product-filters__group product-filters__group--checkbox',
    });

    const checkboxWrapper = this.createElement('label', {
      className: 'product-filters__checkbox-wrapper',
    });

    this.inStockCheckbox = this.createElement('input', {
      type: 'checkbox',
      className: 'product-filters__checkbox',
      id: 'product-in-stock',
    });

    if (this.props.filters.inStock) {
      this.inStockCheckbox.setAttribute('checked', 'true');
    }

    this.addEventListener(this.inStockCheckbox, 'change', this.handleInStockChange);
    checkboxWrapper.appendChild(this.inStockCheckbox);

    const labelText = this.createElement('span', {
      className: 'product-filters__checkbox-label',
    });
    labelText.textContent = 'В наличии';
    checkboxWrapper.appendChild(labelText);

    group.appendChild(checkboxWrapper);

    return group;
  }

  /**
   * Отрендерить поле минимального рейтинга (Вариант 17)
   */
  private renderRatingGroup(): HTMLElement {
    const group = this.createElement('div', {
      className: 'product-filters__group',
    });

    const label = this.createElement('label', {
      className: 'product-filters__label',
      for: 'product-rating',
    });
    label.textContent = 'Мин. рейтинг';
    group.appendChild(label);

    this.ratingInput = new Input({
      type: 'number',
      name: 'product-rating',
      placeholder: '1-5',
      value: this.props.filters.minRating?.toString() || '',
      className: 'product-filters__rating-input',
      onChange: (value: string) => this.handleRatingInput(value),
    });

    this.ratingInput.mount(group);
    this.addChild(this.ratingInput);

    return group;
  }

  /**
   * Отрендерить кнопку сброса фильтров
   */
  private renderResetButton(): HTMLElement {
    const buttonWrapper = this.createElement('div', {
      className: 'product-filters__reset-wrapper',
    });

    const resetButton = new Button({
      text: 'Сбросить фильтры',
      variant: 'ghost',
      size: 'sm',
      className: 'product-filters__reset-button',
      onClick: () => this.handleReset(),
    });

    resetButton.mount(buttonWrapper);
    this.addChild(resetButton);

    return buttonWrapper;
  }

  /**
   * Обработать ввод в поле поиска с debounce
   */
  private handleSearchInput(value: string): void {
    // Очистить предыдущий таймер
    if (this.searchDebounceTimer) {
      clearTimeout(this.searchDebounceTimer);
    }

    // Установить новый таймер
    this.searchDebounceTimer = setTimeout(() => {
      this.emitChange({ search: value || undefined });
    }, 300);
  }

  /**
   * Обработать изменение сортировки
   */
  private handleSortChange = (): void => {
    const value = this.sortSelect?.value || '';
    this.emitChange({ sort: value || undefined });
  };

  /**
   * Обработать изменение категории
   */
  private handleCategoryChange = (): void => {
    const value = this.categorySelect?.value || '';
    this.emitChange({ category: value || undefined });
  };

  /**
   * Обработать изменение чекбокса "В наличии"
   */
  private handleInStockChange = (): void => {
    const checked = this.inStockCheckbox?.checked || false;
    this.emitChange({ inStock: checked ? true : undefined });
  };

  /**
   * Обработать ввод минимального рейтинга
   */
  private handleRatingInput(value: string): void {
    const numValue = parseFloat(value);
    if (value && !Number.isNaN(numValue) && numValue >= 1 && numValue <= 5) {
      this.emitChange({ minRating: numValue });
    } else if (!value) {
      this.emitChange({ minRating: undefined });
    }
  }

  /**
   * Сбросить все фильтры
   */
  private handleReset(): void {
    // Сбросить поля ввода
    this.searchInput?.setProps({ value: '' });
    this.ratingInput?.setProps({ value: '' });

    // Сбросить select
    if (this.sortSelect) {
      this.sortSelect.value = '';
    }
    if (this.categorySelect) {
      this.categorySelect.value = '';
    }

    // Сбросить чекбокс
    if (this.inStockCheckbox) {
      this.inStockCheckbox.checked = false;
    }

    // Очистить таймер debounce
    if (this.searchDebounceTimer) {
      clearTimeout(this.searchDebounceTimer);
      this.searchDebounceTimer = null;
    }

    // Эмитить пустые фильтры
    this.props.onFilterChange({});
  }

  /**
   * Эмитить изменение фильтров
   */
  private emitChange(updates: Partial<ProductFiltersType>): void {
    const newFilters: ProductFiltersType = {
      ...this.props.filters,
      ...updates,
    };

    // Удалить undefined значения
    Object.keys(newFilters).forEach((key) => {
      if (newFilters[key as keyof ProductFiltersType] === undefined) {
        delete newFilters[key as keyof ProductFiltersType];
      }
    });

    this.props.onFilterChange(newFilters);
  }
}
