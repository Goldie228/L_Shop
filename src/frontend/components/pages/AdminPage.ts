/**
 * Страница админ-панели - L_Shop Frontend
 * Управление товарами, заказами и пользователями
 */

import { Component, ComponentProps } from '../base/Component.js';
import { Button } from '../ui/Button.js';
import { Modal } from '../ui/Modal.js';
import { Toast } from '../ui/Toast.js';
import { ConfirmModal } from '../ui/ConfirmModal.js';
import { Icon } from '../ui/Icon.js';
import { adminService } from '../../services/admin.service.js';
import { Product } from '../../types/product.js';
import { Order } from '../../types/order.js';
import { User } from '../../types/user.js';

/**
 * Типы вкладок админ-панели
 */
export type AdminTab = 'products' | 'orders' | 'users';

/**
 * Интерфейс пропсов страницы админ-панели
 */
export type AdminPageProps = ComponentProps;

/**
 * Страница админ-панели
 * Управление товарами, заказами и пользователями
 */
export class AdminPage extends Component<AdminPageProps> {
  private tabsContainer: HTMLElement | null = null;

  private contentContainer: HTMLElement | null = null;

  private addProductButton: Button | null = null;

  private productModal: Modal | null = null;

  private toast: Toast | null = null;

  private confirmModal: ConfirmModal | null = null;

  // Состояние компонента (заменяет this.state)
  private activeTab: AdminTab = 'products';

  private products: Product[] = [];

  private orders: Order[] = [];

  private users: User[] = [];

  private loading = false;

  private error: string | null = null;

  private editingProductId: string | null = null;

  // Конструктор не требуется - используем getDefaultProps()

  /**
   * Вызывается после монтирования компонента
   */
  protected onMount(): void {
    // Проверка прав уже выполнена в app.ts
    // Загружаем данные после монтирования
    this.loadData();
  }

  public render(): HTMLElement {
    const container = this.createElement('div', {
      className: 'admin-page',
    });

    // Заголовок
    const title = this.createElement(
      'h1',
      {
        className: 'admin-page__title',
      },
      ['Админ-панель'],
    );
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
      size: 'large',
      animation: 'scale',
      closeOnOverlayClick: true,
      closeOnEscape: true,
      onClose: () => this.closeProductModal(),
    });
    container.appendChild(this.productModal.render());

    // Инициализация Toast
    this.toast = new Toast({
      type: 'info',
      duration: 5000,
      showCloseButton: true,
    });

    // Инициализация ConfirmModal
    this.confirmModal = new ConfirmModal({
      title: 'Подтверждение',
      confirmText: 'Подтвердить',
      cancelText: 'Отмена',
    });

    container.appendChild(this.toast.render());
    container.appendChild(this.confirmModal.render());

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

    tabs.forEach((tab) => {
      const tabButton = this.createElement(
        'button',
        {
          className: `admin-page__tab ${this.activeTab === tab.id ? 'admin-page__tab--active' : ''}`,
          'data-tab': tab.id,
        },
        [tab.label],
      );

      this.addEventListener(tabButton, 'click', () => this.switchTab(tab.id));
      this.tabsContainer?.appendChild(tabButton);
    });
  }

  /**
   * Получить заголовок раздела по вкладке
   */
  private getSectionTitle(tab: AdminTab): string {
    const titles: Record<AdminTab, string> = {
      products: 'Управление товарами',
      orders: 'Управление заказами',
      users: 'Управление пользователями',
    };
    return titles[tab] || '';
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
      });
      
      const spinner = this.createElement('div', {
        className: 'admin-page__loading-spinner',
      });
      
      const loadingText = this.createElement('span', {}, ['Загрузка данных...']);
      
      loading.appendChild(spinner);
      loading.appendChild(loadingText);
      this.contentContainer.appendChild(loading);
      return;
    }

    if (this.error) {
      const error = this.createElement(
        'div',
        {
          className: 'admin-page__error',
        },
        [this.error],
      );
      this.contentContainer.appendChild(error);
      return;
    }

    // Заголовок раздела
    const sectionTitle = this.createElement(
      'h2',
      {
        className: 'admin-page__section-title',
      },
      [this.getSectionTitle(this.activeTab)],
    );
    this.contentContainer.appendChild(sectionTitle);

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
      default: {
        // Неизвестная вкладка
        const error = this.createElement('div', {}, ['Неизвестная вкладка']);
        this.contentContainer?.appendChild(error);
        break;
      }
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
    ['ID', 'Название', 'Цена', 'Категория', 'Наличие', 'Действия'].forEach((headerText) => {
      const th = this.createElement('th', {}, [headerText]);
      headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);

    // Тело таблицы
    const tbody = this.createElement('tbody');

    if (this.products.length === 0) {
      const emptyRow = this.createElement('tr');
      const emptyCell = this.createElement(
        'td',
        {
          colSpan: 6,
          className: 'admin-table__empty',
        },
        ['Нет товаров'],
      );
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
        const price = this.createElement('td', {}, [`${product.price} BYN`]);
        row.appendChild(price);

        // Категория
        row.appendChild(this.createElement('td', {}, [product.category]));

        // Наличие
        const inStock = this.createElement(
          'td',
          {
            className: product.inStock ? 'status-active' : 'status-inactive',
          },
          [product.inStock ? 'В наличии' : 'Нет в наличии'],
        );
        row.appendChild(inStock);

        // Действия
        const actions = this.createElement('td', {
          className: 'admin-table__actions',
        });

        const editIcon = new Icon({ name: 'edit', size: 18, ariaLabel: 'Редактировать' });
        const editBtn = this.createElement(
          'button',
          {
            className: 'admin-table__action-btn edit',
            'data-action': 'edit',
            'data-id': product.id,
          },
          [editIcon.render()],
        );

        const deleteIcon = new Icon({ name: 'trash', size: 18, ariaLabel: 'Удалить' });
        const deleteBtn = this.createElement(
          'button',
          {
            className: 'admin-table__action-btn delete',
            'data-action': 'delete',
            'data-id': product.id,
          },
          [deleteIcon.render()],
        );

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
    ['ID', 'Пользователь', 'Сумма', 'Статус', 'Дата', 'Действия'].forEach((headerText) => {
      const th = this.createElement('th', {}, [headerText]);
      headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);

    // Тело таблицы
    const tbody = this.createElement('tbody');

    if (this.orders.length === 0) {
      const emptyRow = this.createElement('tr');
      const emptyCell = this.createElement(
        'td',
        {
          colSpan: 6,
          className: 'admin-table__empty',
        },
        ['Нет заказов'],
      );
      emptyRow.appendChild(emptyCell);
      tbody.appendChild(emptyRow);
    } else {
      this.orders.forEach((order: Order) => {
        const row = this.createElement('tr');

        // ID
        row.appendChild(this.createElement('td', {}, [order.id.substring(0, 8)]));

        // Пользователь
        row.appendChild(
          this.createElement('td', {}, [order.userId ? order.userId.substring(0, 8) : 'Гость']),
        );

        // Сумма
        row.appendChild(this.createElement('td', {}, [`${order.totalSum} BYN`]));

        // Статус
        const status = this.createElement(
          'td',
          {
            className: `status-${order.status}`,
          },
          [this.getStatusLabel(order.status)],
        );
        row.appendChild(status);

        // Дата
        const date = new Date(order.createdAt).toLocaleDateString('ru-RU');
        row.appendChild(this.createElement('td', {}, [date]));

        // Действия
        const actions = this.createElement('td', {
          className: 'admin-table__actions',
        });

        const statusIcon = new Icon({ name: 'clipboard', size: 18, ariaLabel: 'Изменить статус' });
        const statusBtn = this.createElement(
          'button',
          {
            className: 'admin-table__action-btn status',
            'data-action': 'status',
            'data-id': order.id,
          },
          [statusIcon.render()],
        );

        const deleteIcon = new Icon({ name: 'trash', size: 18, ariaLabel: 'Удалить' });
        const deleteBtn = this.createElement(
          'button',
          {
            className: 'admin-table__action-btn delete',
            'data-action': 'delete',
            'data-id': order.id,
          },
          [deleteIcon.render()],
        );

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
    ['ID', 'Имя', 'Email', 'Роль', 'Статус', 'Действия'].forEach((headerText) => {
      const th = this.createElement('th', {}, [headerText]);
      headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);

    // Тело таблицы
    const tbody = this.createElement('tbody');

    if (this.users.length === 0) {
      const emptyRow = this.createElement('tr');
      const emptyCell = this.createElement(
        'td',
        {
          colSpan: 6,
          className: 'admin-table__empty',
        },
        ['Нет пользователей'],
      );
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
        const role = this.createElement(
          'td',
          {
            className: user.role === 'admin' ? 'role-admin' : 'role-user',
          },
          [user.role === 'admin' ? 'Админ' : 'Пользователь'],
        );
        row.appendChild(role);

        // Статус (блокировка - добавим когда будет поле isBlocked)
        const status = this.createElement('td', {}, ['Активен']);
        row.appendChild(status);

        // Действия
        const actions = this.createElement('td', {
          className: 'admin-table__actions',
        });

        const roleIcon = new Icon({ name: 'user-circle', size: 18, ariaLabel: 'Изменить роль' });
        const roleBtn = this.createElement(
          'button',
          {
            className: 'admin-table__action-btn role',
            'data-action': 'role',
            'data-id': user.id,
          },
          [roleIcon.render()],
        );

        const blockIcon = new Icon({ name: 'ban', size: 18, ariaLabel: 'Заблокировать' });
        const blockBtn = this.createElement(
          'button',
          {
            className: 'admin-table__action-btn block',
            'data-action': 'block',
            'data-id': user.id,
          },
          [blockIcon.render()],
        );

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
    this.renderContent();

    try {
      // Загружаем все данные параллельно
      const [products, orders, users] = await Promise.all([
        adminService.getAllProducts(),
        adminService.getAllOrders(),
        adminService.getAllUsers(),
      ]);

      this.products = products;
      this.orders = orders;
      this.users = users;
      this.loading = false;
      this.renderContent();
    } catch (error) {
      console.error('[AdminPage] Ошибка загрузки данных:', error);
      this.loading = false;
      this.error = 'Ошибка загрузки данных';
      this.showToast('Ошибка загрузки данных', 'error');
      this.renderContent();
    }
  }

  /**
   * Загрузка товаров
   */
  private async loadProducts(): Promise<void> {
    try {
      this.products = await adminService.getAllProducts();
      this.renderContent();
    } catch (error) {
      console.error('[AdminPage] Ошибка загрузки товаров:', error);
      this.showToast('Ошибка загрузки товаров', 'error');
    }
  }

  /**
   * Загрузка заказов
   */
  private async loadOrders(): Promise<void> {
    try {
      this.orders = await adminService.getAllOrders();
      this.renderContent();
    } catch (error) {
      console.error('[AdminPage] Ошибка загрузки заказов:', error);
      this.showToast('Ошибка загрузки заказов', 'error');
    }
  }

  /**
   * Загрузка пользователей
   */
  private async loadUsers(): Promise<void> {
    try {
      this.users = await adminService.getAllUsers();
      this.renderContent();
    } catch (error) {
      console.error('[AdminPage] Ошибка загрузки пользователей:', error);
      this.showToast('Ошибка загрузки пользователей', 'error');
    }
  }

  /**
   * Открыть модальное окно товара
   */
  private openProductModal(): void {
    this.editingProductId = null;
    this.showProductForm();
  }

  /**
   * Редактировать товар
   */
  private editProduct(id: string): void {
    this.editingProductId = id;
    this.showProductForm();
  }

  /**
   * Показать форму товара в модальном окне
   */
  private showProductForm(): void {
    if (!this.productModal) return;

    const product = this.editingProductId
      ? this.products.find((p) => p.id === this.editingProductId)
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
      {
        name: 'name', label: 'Название', type: 'text', required: true, value: product?.name || '',
      },
      {
        name: 'description',
        label: 'Описание',
        type: 'textarea',
        required: true,
        value: product?.description || '',
      },
      {
        name: 'price',
        label: 'Цена',
        type: 'number',
        required: true,
        value: product?.price?.toString() || '',
      },
      {
        name: 'category',
        label: 'Категория',
        type: 'text',
        required: true,
        value: product?.category || '',
      },
      {
        name: 'imageUrl',
        label: 'URL изображения',
        type: 'text',
        required: false,
        value: product?.imageUrl || '',
      },
      {
        name: 'discountPercent',
        label: 'Скидка (%)',
        type: 'number',
        required: false,
        value: product?.discountPercent?.toString() || '0',
      },
      {
        name: 'rating',
        label: 'Рейтинг',
        type: 'number',
        required: false,
        value: product?.rating?.toString() || '0',
      },
      {
        name: 'reviewsCount',
        label: 'Количество отзывов',
        type: 'number',
        required: false,
        value: product?.reviewsCount?.toString() || '0',
      },
    ];

    fields.forEach((field) => {
      const fieldWrapper = this.createElement('div', {
        className: 'admin-form__field',
      });

      const label = this.createElement(
        'label',
        {
          className: 'admin-form__label',
          for: `product-${field.name}`,
        },
        [field.label + (field.required ? ' *' : '')],
      );
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

    const stockLabel = this.createElement(
      'label',
      {
        className: 'admin-form__label',
        for: 'product-inStock',
      },
      ['В наличии'],
    );

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
      imageUrl: (formData.get('imageUrl') as string) || undefined,
      discountPercent: parseFloat(formData.get('discountPercent') as string) || 0,
      rating: parseFloat(formData.get('rating') as string) || 0,
      reviewsCount: parseInt(formData.get('reviewsCount') as string, 10) || 0,
    };

    // Валидация
    if (!data.name || !data.description || !data.category) {
      this.showToast('Заполните обязательные поля', 'warning');
      return;
    }

    if (data.price <= 0) {
      this.showToast('Цена должна быть больше 0', 'warning');
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
      this.showToast(this.editingProductId ? 'Товар обновлён' : 'Товар создан', 'success');
    } catch (error) {
      this.showToast('Ошибка сохранения товара', 'error');
    }
  }

  /**
   * Закрыть модальное окно товара
   */
  private closeProductModal(): void {
    this.editingProductId = null;
    this.productModal?.close();
  }

  /**
   * Удалить товар
   */
  private async deleteProduct(id: string): Promise<void> {
    if (!await this.showConfirm('Вы уверены, что хотите удалить этот товар?')) {
      return;
    }

    try {
      await adminService.deleteProduct(id);
      await this.loadProducts();
      this.showToast('Товар удалён', 'success');
    } catch (error) {
      this.showToast('Ошибка удаления товара', 'error');
    }
  }

  /**
   * Изменить статус заказа
   */
  private async changeOrderStatus(id: string): Promise<void> {
    const order = this.orders.find((o) => o.id === id);
    if (!order) return;

    const statuses: { value: string; label: string }[] = [
      { value: 'pending', label: 'Ожидает' },
      { value: 'processing', label: 'В обработке' },
      { value: 'shipped', label: 'Отправлен' },
      { value: 'delivered', label: 'Доставлен' },
      { value: 'cancelled', label: 'Отменён' },
    ];

    const currentIndex = statuses.findIndex((s) => s.value === order.status);
    const nextIndex = (currentIndex + 1) % statuses.length;
    const newStatus = statuses[nextIndex].value as Order['status'];

    try {
      await adminService.updateOrderStatus(id, newStatus);
      await this.loadOrders();
      this.showToast('Статус заказа обновлён', 'success');
    } catch (error) {
      this.showToast('Ошибка изменения статуса заказа', 'error');
    }
  }

  /**
   * Удалить заказ
   */
  private async deleteOrder(id: string): Promise<void> {
    if (!await this.showConfirm('Вы уверены, что хотите удалить этот заказ?')) {
      return;
    }

    try {
      await adminService.deleteOrder(id);
      await this.loadOrders();
      this.showToast('Заказ удалён', 'success');
    } catch (error) {
      this.showToast('Ошибка удаления заказа', 'error');
    }
  }

  /**
   * Изменить роль пользователя
   */
  private async changeUserRole(id: string): Promise<void> {
    const user = this.users.find((u) => u.id === id);
    if (!user) return;

    const newRole = user.role === 'admin' ? 'user' : 'admin';

    try {
      await adminService.updateUserRole(id, newRole);
      await this.loadUsers();
      this.showToast(
        `Роль изменена на ${newRole === 'admin' ? 'Админ' : 'Пользователь'}`,
        'success',
      );
    } catch (error) {
      this.showToast('Ошибка изменения роли пользователя', 'error');
    }
  }

  /**
   * Заблокировать/разблокировать пользователя
   */
  private async toggleUserBlock(id: string): Promise<void> {
    if (
      !await this.showConfirm(
        'Вы уверены, что хотите изменить статус блокировки пользователя?',
      )
    ) {
      return;
    }

    try {
      await adminService.toggleUserBlock(id);
      await this.loadUsers();
      this.showToast('Статус блокировки изменён', 'success');
    } catch (error) {
      this.showToast('Ошибка изменения статуса блокировки', 'error');
    }
  }

  /**
   * Получить локализованный статус заказа
   */
  private getStatusLabel(status: Order['status']): string {
    const labels: Record<Order['status'], string> = {
      pending: 'Ожидает',
      processing: 'В обработке',
      shipped: 'Отправлен',
      delivered: 'Доставлен',
      cancelled: 'Отменён',
    };
    return labels[status] || status;
  }

  /**
   * Показать toast уведомление
   * @param message - сообщение
   * @param type - тип уведомления
   */
  private showToast(
    message: string,
    type: 'success' | 'error' | 'warning' | 'info' = 'info',
  ): void {
    if (this.toast) {
      this.toast.setProps({ message, type });
      this.toast.open();
    }
  }

  /**
   * Показать модальное окно подтверждения
   * @param message - сообщение для подтверждения
   * @returns Promise<boolean> - true если подтверждено
   */
  private async showConfirm(message: string): Promise<boolean> {
    if (!this.confirmModal) {
      return false;
    }

    this.confirmModal.setProps({ message });
    return this.confirmModal.show();
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
