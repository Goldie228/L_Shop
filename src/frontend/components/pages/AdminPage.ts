/**
 * Страница админ-панели - L_Shop Frontend
 * Управление товарами, заказами и пользователями
 */

import { Component, ComponentProps } from '../base/Component.js';
import { Button } from '../ui/Button.js';
import { Modal } from '../ui/Modal.js';
import { adminService } from '../../services/admin.service.js';
import { store } from '../../store/store.js';
import { Product } from '../../types/product.js';
import { Order } from '../../types/order.js';
import { User } from '../../types/user.js';
import { router } from '../../router/router.js';

/**
 * Типы вкладок админ-панели
 */
export type AdminTab = 'products' | 'orders' | 'users';

/**
 * Интерфейс пропсов страницы админ-панели
 */
export interface AdminPageProps extends ComponentProps {
  // Дополнительные пропсы при необходимости
}

/**
 * Страница админ-панели
 * Управление товарами, заказами и пользователями
 */
export class AdminPage extends Component<AdminPageProps> {
  private tabsContainer: HTMLElement | null = null;
  private contentContainer: HTMLElement | null = null;
  private addProductButton: Button | null = null;
  private productModal: Modal | null = null;

  // Состояние компонента (заменяет this.state)
  private activeTab: AdminTab = 'products';
  private products: Product[] = [];
  private orders: Order[] = [];
  private users: User[] = [];
  private loading = false;
  private error: string | null = null;
  private editingProductId: string | null = null;
  private showProductModal = false;

  constructor(props: Partial<AdminPageProps> = {}) {
    super(props);
  }

  /**
   * Проверка прав доступа при монтировании
   */
  public async mount(parent: HTMLElement): Promise<void> {
    const user = store.getUser();

    // Проверка что пользователь авторизован и имеет роль admin
    if (!user || user.role !== 'admin') {
      console.warn('[AdminPage] Доступ запрещён: пользователь не admin');
      router.navigate('/');
      return;
    }

    await super.mount(parent);
    await this.loadData();
  }

  public render(): HTMLElement {
    const container = this.createElement('div', {
      className: 'admin-page',
    });

    // Заголовок
    const title = this.createElement('h1', {
      className: 'admin-page__title',
    }, ['Админ-панель']);
    container.appendChild(title);

    // Навигация по вкладкам
    this.tabsContainer = this.createElement('div', {
      className: 'admin-page__tabs',
    });
    this.renderTabs();
    container.appendChild(this.tabsContainer);

    // Кнопка добавления товара (только для вкладки товаров)
    const actionsBar = this.createElement('div', {
      className: 'admin-page__actions',
    });

    this.addProductButton = new Button({
      text: 'Добавить товар',
      variant: 'primary',
      size: 'md',
      onClick: () => this.openProductModal(),
    });
    actionsBar.appendChild(this.addProductButton.render());
    container.appendChild(actionsBar);

    // Контент вкладок
    this.contentContainer = this.createElement('div', {
      className: 'admin-page__content',
    });
    this.renderContent();
    container.appendChild(this.contentContainer);

    // Модальное окно товара
    this.productModal = new Modal({
      title: this.editingProductId ? 'Редактирование товара' : 'Добавление товара',
      size: 'lg',
      animation: 'scale',
      closeOnBackdrop: true,
      closeOnEscape: true,
      onClose: () => this.closeProductModal(),
    });
    container.appendChild(this.productModal.render());

    this.element = container;
    return container;
  }

  /**
   * Отрисовка вкладок
   */
  private renderTabs(): void {
    if (!this.tabsContainer) return;

    this.tabsContainer.innerHTML = '';

    const tabs: { id: AdminTab; label: string }[] = [
      { id: 'products', label: 'Товары' },
      { id: 'orders', label: 'Заказы' },
      { id: 'users', label: 'Пользователи' },
    ];

    tabs.forEach(tab => {
      const tabButton = this.createElement('button', {
        className: `admin-page__tab ${this.activeTab === tab.id ? 'active' : ''}`,
        'data-tab': tab.id,
      }, [tab.label]);

      this.addEventListener(tabButton, 'click', () => this.switchTab(tab.id));
      this.tabsContainer!.appendChild(tabButton);
    });
  }

  /**
   * Отрисовка контента вкладки
   */
  private renderContent(): void {
    if (!this.contentContainer) return;

    this.contentContainer.innerHTML = '';

    if (this.loading) {
      const loading = this.createElement('div', {
        className: 'admin-page__loading',
      }, ['Загрузка...']);
      this.contentContainer.appendChild(loading);
      return;
    }

    if (this.error) {
      const error = this.createElement('div', {
        className: 'admin-page__error',
      }, [this.error]);
      this.contentContainer.appendChild(error);
      return;
    }

    switch (this.activeTab) {
      case 'products':
        this.contentContainer.appendChild(this.renderProductsTable());
        break;
      case 'orders':
        this.contentContainer.appendChild(this.renderOrdersTable());
        break;
      case 'users':
        this.contentContainer.appendChild(this.renderUsersTable());
        break;
    }
  }

  /**
   * Отрисовка таблицы товаров
   */
  private renderProductsTable(): HTMLElement {
    const table = this.createElement('table', {
      className: 'admin-table',
    });

    // Заголовок таблицы
    const thead = this.createElement('thead');
    const headerRow = this.createElement('tr');
    ['ID', 'Название', 'Цена', 'Категория', 'Наличие', 'Действия'].forEach(headerText => {
      const th = this.createElement('th', {}, [headerText]);
      headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);

    // Тело таблицы
    const tbody = this.createElement('tbody');

    if (this.products.length === 0) {
      const emptyRow = this.createElement('tr');
      const emptyCell = this.createElement('td', {
        colSpan: 6,
        className: 'admin-table__empty',
      }, ['Нет товаров']);
      emptyRow.appendChild(emptyCell);
      tbody.appendChild(emptyRow);
    } else {
      this.products.forEach((product: Product) => {
        const row = this.createElement('tr');

        // ID
        row.appendChild(this.createElement('td', {}, [product.id.substring(0, 8)]));

        // Название
        row.appendChild(this.createElement('td', {}, [product.name]));

        // Цена
        const price = this.createElement('td', {}, [`${product.price} ₽`]);
        row.appendChild(price);

        // Категория
        row.appendChild(this.createElement('td', {}, [product.category]));

        // Наличие
        const inStock = this.createElement('td', {
          className: product.inStock ? 'status-active' : 'status-inactive',
        }, [product.inStock ? 'В наличии' : 'Нет в наличии']);
        row.appendChild(inStock);

        // Действия
        const actions = this.createElement('td', {
          className: 'admin-table__actions',
        });

        const editBtn = this.createElement('button', {
          className: 'admin-table__action-btn edit',
          'data-action': 'edit',
          'data-id': product.id,
        }, ['✏️']);

        const deleteBtn = this.createElement('button', {
          className: 'admin-table__action-btn delete',
          'data-action': 'delete',
          'data-id': product.id,
        }, ['🗑️']);

        this.addEventListener(editBtn, 'click', () => this.editProduct(product.id));
        this.addEventListener(deleteBtn, 'click', () => this.deleteProduct(product.id));

        actions.appendChild(editBtn);
        actions.appendChild(deleteBtn);
        row.appendChild(actions);

        tbody.appendChild(row);
      });
    }

    table.appendChild(tbody);
    return table;
  }

  /**
   * Отрисовка таблицы заказов
   */
  private renderOrdersTable(): HTMLElement {
    const table = this.createElement('table', {
      className: 'admin-table',
    });

    // Заголовок таблицы
    const thead = this.createElement('thead');
    const headerRow = this.createElement('tr');
    ['ID', 'Пользователь', 'Сумма', 'Статус', 'Дата', 'Действия'].forEach(headerText => {
      const th = this.createElement('th', {}, [headerText]);
      headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);

    // Тело таблицы
    const tbody = this.createElement('tbody');

    if (this.orders.length === 0) {
      const emptyRow = this.createElement('tr');
      const emptyCell = this.createElement('td', {
        colSpan: 6,
        className: 'admin-table__empty',
      }, ['Нет заказов']);
      emptyRow.appendChild(emptyCell);
      tbody.appendChild(emptyRow);
    } else {
      this.orders.forEach((order: Order) => {
        const row = this.createElement('tr');

        // ID
        row.appendChild(this.createElement('td', {}, [order.id.substring(0, 8)]));

        // Пользователь
        row.appendChild(this.createElement('td', {}, [order.userId ? order.userId.substring(0, 8) : 'Гость']));

        // Сумма
        row.appendChild(this.createElement('td', {}, [`${order.totalSum} ₽`]));

        // Статус
        const status = this.createElement('td', {
          className: `status-${order.status}`,
        }, [this.getStatusLabel(order.status)]);
        row.appendChild(status);

        // Дата
        const date = new Date(order.createdAt).toLocaleDateString('ru-RU');
        row.appendChild(this.createElement('td', {}, [date]));

        // Действия
        const actions = this.createElement('td', {
          className: 'admin-table__actions',
        });

        const statusBtn = this.createElement('button', {
          className: 'admin-table__action-btn status',
          'data-action': 'status',
          'data-id': order.id,
        }, ['📋']);

        const deleteBtn = this.createElement('button', {
          className: 'admin-table__action-btn delete',
          'data-action': 'delete',
          'data-id': order.id,
        }, ['🗑️']);

        this.addEventListener(statusBtn, 'click', () => this.changeOrderStatus(order.id));
        this.addEventListener(deleteBtn, 'click', () => this.deleteOrder(order.id));

        actions.appendChild(statusBtn);
        actions.appendChild(deleteBtn);
        row.appendChild(actions);

        tbody.appendChild(row);
      });
    }

    table.appendChild(tbody);
    return table;
  }

  /**
   * Отрисовка таблицы пользователей
   */
  private renderUsersTable(): HTMLElement {
    const table = this.createElement('table', {
      className: 'admin-table',
    });

    // Заголовок таблицы
    const thead = this.createElement('thead');
    const headerRow = this.createElement('tr');
    ['ID', 'Имя', 'Email', 'Роль', 'Статус', 'Действия'].forEach(headerText => {
      const th = this.createElement('th', {}, [headerText]);
      headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);

    // Тело таблицы
    const tbody = this.createElement('tbody');

    if (this.users.length === 0) {
      const emptyRow = this.createElement('tr');
      const emptyCell = this.createElement('td', {
        colSpan: 6,
        className: 'admin-table__empty',
      }, ['Нет пользователей']);
      emptyRow.appendChild(emptyCell);
      tbody.appendChild(emptyRow);
    } else {
      this.users.forEach((user: User) => {
        const row = this.createElement('tr');

        // ID
        row.appendChild(this.createElement('td', {}, [user.id.substring(0, 8)]));

        // Имя
        row.appendChild(this.createElement('td', {}, [user.name || '-']));

        // Email
        row.appendChild(this.createElement('td', {}, [user.email || '-']));

        // Роль
        const role = this.createElement('td', {
          className: user.role === 'admin' ? 'role-admin' : 'role-user',
        }, [user.role === 'admin' ? 'Админ' : 'Пользователь']);
        row.appendChild(role);

        // Статус (блокировка - добавим когда будет поле isBlocked)
        const status = this.createElement('td', {}, ['Активен']);
        row.appendChild(status);

        // Действия
        const actions = this.createElement('td', {
          className: 'admin-table__actions',
        });

        const roleBtn = this.createElement('button', {
          className: 'admin-table__action-btn role',
          'data-action': 'role',
          'data-id': user.id,
        }, ['👤']);

        const blockBtn = this.createElement('button', {
          className: 'admin-table__action-btn block',
          'data-action': 'block',
          'data-id': user.id,
        }, ['🚫']);

        this.addEventListener(roleBtn, 'click', () => this.changeUserRole(user.id));
        this.addEventListener(blockBtn, 'click', () => this.toggleUserBlock(user.id));

        actions.appendChild(roleBtn);
        actions.appendChild(blockBtn);
        row.appendChild(actions);

        tbody.appendChild(row);
      });
    }

    table.appendChild(tbody);
    return table;
  }

  /**
   * Переключение вкладки
   */
  private switchTab(tab: AdminTab): void {
    this.activeTab = tab;
    this.renderTabs();
    this.renderContent();
  }

  /**
   * Загрузка данных
   */
  private async loadData(): Promise<void> {
    this.loading = true;
    this.error = null;

    try {
      await Promise.all([
        this.loadProducts(),
        this.loadOrders(),
        this.loadUsers(),
      ]);
    } catch (error) {
      console.error('[AdminPage] Ошибка загрузки данных:', error);
      this.loading = false;
      this.error = 'Ошибка загрузки данных';
    }
  }

  /**
   * Загрузка товаров
   */
  private async loadProducts(): Promise<void> {
    try {
      this.products = await adminService.getAllProducts();
      this.loading = false;
      this.renderContent();
    } catch (error) {
      console.error('[AdminPage] Ошибка загрузки товаров:', error);
    }
  }

  /**
   * Загрузка заказов
   */
  private async loadOrders(): Promise<void> {
    try {
      this.orders = await adminService.getAllOrders();
      this.loading = false;
      this.renderContent();
    } catch (error) {
      console.error('[AdminPage] Ошибка загрузки заказов:', error);
    }
  }

  /**
   * Загрузка пользователей
   */
  private async loadUsers(): Promise<void> {
    try {
      this.users = await adminService.getAllUsers();
      this.loading = false;
      this.renderContent();
    } catch (error) {
      console.error('[AdminPage] Ошибка загрузки пользователей:', error);
    }
  }

  /**
   * Открыть модальное окно товара
   */
  private openProductModal(): void {
    this.editingProductId = null;
    this.showProductModal = true;
    this.showProductForm();
  }

  /**
   * Редактировать товар
   */
  private editProduct(id: string): void {
    this.editingProductId = id;
    this.showProductModal = true;
    this.showProductForm();
  }

  /**
   * Показать форму товара в модальном окне
   */
  private showProductForm(): void {
    if (!this.productModal) return;

    const product = this.editingProductId
      ? this.products.find(p => p.id === this.editingProductId)
      : null;

    const form = this.createProductForm(product);
    this.productModal.setContent(form);
    this.productModal.open();
  }

  /**
   * Создать форму товара
   */
  private createProductForm(product: Product | null | undefined): HTMLElement {
    const form = this.createElement('form', {
      className: 'admin-form',
    });

    // Поля формы
    const fields = [
      { name: 'name', label: 'Название', type: 'text', required: true, value: product?.name || '' },
      { name: 'description', label: 'Описание', type: 'textarea', required: true, value: product?.description || '' },
      { name: 'price', label: 'Цена', type: 'number', required: true, value: product?.price?.toString() || '' },
      { name: 'category', label: 'Категория', type: 'text', required: true, value: product?.category || '' },
      { name: 'imageUrl', label: 'URL изображения', type: 'text', required: false, value: product?.imageUrl || '' },
      { name: 'discountPercent', label: 'Скидка (%)', type: 'number', required: false, value: product?.discountPercent?.toString() || '0' },
      { name: 'rating', label: 'Рейтинг', type: 'number', required: false, value: product?.rating?.toString() || '0' },
      { name: 'reviewsCount', label: 'Количество отзывов', type: 'number', required: false, value: product?.reviewsCount?.toString() || '0' },
    ];

    fields.forEach(field => {
      const fieldWrapper = this.createElement('div', {
        className: 'admin-form__field',
      });

      const label = this.createElement('label', {
        className: 'admin-form__label',
        for: `product-${field.name}`,
      }, [field.label + (field.required ? ' *' : '')]);
      fieldWrapper.appendChild(label);

      let input: HTMLElement;

      if (field.type === 'textarea') {
        input = this.createElement('textarea', {
          id: `product-${field.name}`,
          name: field.name,
          className: 'admin-form__input',
          required: field.required,
          rows: 4,
        }) as HTMLTextAreaElement;
        input.textContent = field.value;
      } else if (field.type === 'number') {
        input = this.createElement('input', {
          id: `product-${field.name}`,
          name: field.name,
          type: 'number',
          className: 'admin-form__input',
          required: field.required,
          min: field.name === 'price' ? '0' : '0',
          step: '0.01',
          value: field.value,
        });
      } else {
        input = this.createElement('input', {
          id: `product-${field.name}`,
          name: field.name,
          type: 'text',
          className: 'admin-form__input',
          required: field.required,
          value: field.value,
        });
      }

      fieldWrapper.appendChild(input);
      form.appendChild(fieldWrapper);
    });

    // Чекбокс наличия
    const stockWrapper = this.createElement('div', {
      className: 'admin-form__field admin-form__field--checkbox',
    });

    const stockCheckbox = this.createElement('input', {
      id: 'product-inStock',
      name: 'inStock',
      type: 'checkbox',
      className: 'admin-form__checkbox',
      checked: product?.inStock ?? true,
    });

    const stockLabel = this.createElement('label', {
      className: 'admin-form__label',
      for: 'product-inStock',
    }, ['В наличии']);

    stockWrapper.appendChild(stockCheckbox);
    stockWrapper.appendChild(stockLabel);
    form.appendChild(stockWrapper);

    // Кнопки формы
    const buttons = this.createElement('div', {
      className: 'admin-form__buttons',
    });

    const saveButton = new Button({
      text: 'Сохранить',
      variant: 'primary',
      size: 'md',
      onClick: () => this.saveProduct(form),
    });

    const cancelButton = new Button({
      text: 'Отмена',
      variant: 'outline',
      size: 'md',
      onClick: () => this.closeProductModal(),
    });

    buttons.appendChild(saveButton.render());
    buttons.appendChild(cancelButton.render());
    form.appendChild(buttons);

    return form;
  }

  /**
   * Сохранить товар
   */
  private async saveProduct(form: HTMLElement): Promise<void> {
    const formData = new FormData(form as HTMLFormElement);

    const data = {
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      price: parseFloat(formData.get('price') as string),
      category: formData.get('category') as string,
      inStock: formData.get('inStock') === 'on',
      imageUrl: formData.get('imageUrl') as string || undefined,
      discountPercent: parseFloat(formData.get('discountPercent') as string) || 0,
      rating: parseFloat(formData.get('rating') as string) || 0,
      reviewsCount: parseInt(formData.get('reviewsCount') as string, 10) || 0,
    };

    // Валидация
    if (!data.name || !data.description || !data.category) {
      alert('Заполните обязательные поля');
      return;
    }

    if (data.price <= 0) {
      alert('Цена должна быть больше 0');
      return;
    }

    try {
      if (this.editingProductId) {
        await adminService.updateProduct(this.editingProductId, data);
      } else {
        await adminService.createProduct(data);
      }

      this.closeProductModal();
      await this.loadProducts();
    } catch (error) {
      console.error('[AdminPage] Ошибка сохранения товара:', error);
      alert('Ошибка сохранения товара');
    }
  }

  /**
   * Закрыть модальное окно товара
   */
  private closeProductModal(): void {
    this.editingProductId = null;
    this.showProductModal = false;
    this.productModal?.close();
  }

  /**
   * Удалить товар
   */
  private async deleteProduct(id: string): Promise<void> {
    if (!confirm('Вы уверены, что хотите удалить этот товар?')) {
      return;
    }

    try {
      await adminService.deleteProduct(id);
      await this.loadProducts();
    } catch (error) {
      console.error('[AdminPage] Ошибка удаления товара:', error);
      alert('Ошибка удаления товара');
    }
  }

  /**
   * Изменить статус заказа
   */
  private async changeOrderStatus(id: string): Promise<void> {
    const order = this.orders.find(o => o.id === id);
    if (!order) return;

    const statuses: { value: string; label: string }[] = [
      { value: 'pending', label: 'Ожидает' },
      { value: 'confirmed', label: 'Подтверждён' },
      { value: 'shipped', label: 'Отправлен' },
      { value: 'delivered', label: 'Доставлен' },
      { value: 'cancelled', label: 'Отменён' },
    ];

    const currentIndex = statuses.findIndex(s => s.value === order.status);
    const nextIndex = (currentIndex + 1) % statuses.length;
    const newStatus = statuses[nextIndex].value as Order['status'];

    try {
      await adminService.updateOrderStatus(id, newStatus);
      await this.loadOrders();
    } catch (error) {
      console.error('[AdminPage] Ошибка изменения статуса заказа:', error);
      alert('Ошибка изменения статуса заказа');
    }
  }

  /**
   * Удалить заказ
   */
  private async deleteOrder(id: string): Promise<void> {
    if (!confirm('Вы уверены, что хотите удалить этот заказ?')) {
      return;
    }

    try {
      await adminService.deleteOrder(id);
      await this.loadOrders();
    } catch (error) {
      console.error('[AdminPage] Ошибка удаления заказа:', error);
      alert('Ошибка удаления заказа');
    }
  }

  /**
   * Изменить роль пользователя
   */
  private async changeUserRole(id: string): Promise<void> {
    const user = this.users.find(u => u.id === id);
    if (!user) return;

    const newRole = user.role === 'admin' ? 'user' : 'admin';

    try {
      await adminService.updateUserRole(id, newRole);
      await this.loadUsers();
    } catch (error) {
      console.error('[AdminPage] Ошибка изменения роли пользователя:', error);
      alert('Ошибка изменения роли пользователя');
    }
  }

  /**
   * Заблокировать/разблокировать пользователя
   */
  private async toggleUserBlock(id: string): Promise<void> {
    if (!confirm('Вы уверены, что хотите изменить статус блокировки пользователя?')) {
      return;
    }

    try {
      await adminService.toggleUserBlock(id);
      await this.loadUsers();
    } catch (error) {
      console.error('[AdminPage] Ошибка изменения статуса блокировки:', error);
      alert('Ошибка изменения статуса блокировки');
    }
  }

  /**
   * Получить локализованный статус заказа
   */
  private getStatusLabel(status: Order['status']): string {
    const labels: Record<Order['status'], string> = {
      pending: 'Ожидает',
      confirmed: 'Подтверждён',
      shipped: 'Отправлен',
      delivered: 'Доставлен',
      cancelled: 'Отменён',
    };
    return labels[status] || status;
  }

  /**
   * Обновить компонент
   */
  public update(): void {
    if (this.element) {
      const oldElement = this.element;
      const newElement = this.render();
      oldElement.replaceWith(newElement);
      this.element = newElement;
    }
  }
}

/**
 * Экземпляр страницы админ-панели
 */
export const adminPage = new AdminPage();
