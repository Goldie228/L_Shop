/**
 * Базовый компонент - L_Shop Frontend
 * Абстрактный базовый класс для всех UI компонентов
 */

/**
 * Интерфейс пропсов компонента
 */
export interface ComponentProps {
  /** CSS классы */
  className?: string;
  /** HTML атрибут id */
  id?: string;
  /** Data атрибуты */
  dataAttrs?: Record<string, string>;
  /** Отключён ли компонент */
  disabled?: boolean;
  /** Видим ли компонент */
  visible?: boolean;
}

/**
 * Интерфейс состояния компонента
 */
export interface ComponentState {
  /** Загружается ли компонент */
  loading?: boolean;
  /** Сообщение об ошибке */
  error?: string | null;
}

/**
 * Тип обработчика событий
 */
export type EventHandler<E = Event> = (event: E) => void;

/**
 * Базовый класс компонента
 * Предоставляет общую функциональность для всех UI компонентов
 */
export abstract class Component<TProps extends ComponentProps = ComponentProps> {
  /** Пропсы компонента */
  protected props: TProps;
  
  /** Корневой элемент */
  protected element: HTMLElement | null = null;
  
  /** Дочерние компоненты */
  protected children: Component[] = [];
  
  /** Слушатели событий для очистки */
  private eventListeners: Map<Element, Map<string, EventHandler>> = new Map();

  /**
   * Создать экземпляр компонента
   * @param props - Пропсы компонента
   */
  constructor(props: Partial<TProps> = {}) {
    this.props = this.getDefaultProps();
    this.setProps(props);
  }

  /**
   * Получить пропсы по умолчанию
   * Переопределите в дочерних классах для установки значений по умолчанию
   */
  protected getDefaultProps(): TProps {
    return {
      className: '',
      visible: true
    } as TProps;
  }

  /**
   * Обновить пропсы компонента
   * @param props - Новые пропсы для слияния
   */
  public setProps(props: Partial<TProps>): void {
    this.props = { ...this.props, ...props };
    
    if (this.element) {
      this.updateElement();
    }
  }

  /**
   * Отрендерить компонент и вернуть элемент
   * Должен быть реализован в дочерних классах
   * @returns Корневой элемент
   */
  public abstract render(): HTMLElement;

  /**
   * Примонтировать компонент к контейнеру
   * @param container - Контейнер
   * @param position - Позиция вставки
   */
  public mount(
    container: Element,
    position: InsertPosition = 'beforeend'
  ): void {
    if (!this.element) {
      this.element = this.render();
    }
    
    container.insertAdjacentElement(position, this.element);
    this.onMounted();
  }

  /**
   * Отмонтировать компонент из DOM
   */
  public unmount(): void {
    // Отмонтировать дочерние элементы сначала
    this.children.forEach(child => child.unmount());
    this.children = [];
    
    // Удалить слушатели событий
    this.removeAllEventListeners();
    
    // Удалить элемент из DOM
    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
    
    this.element = null;
    this.onUnmounted();
  }

  /**
   * Обновить компонент
   * Переопределите в дочерних классах для эффективных обновлений
   */
  public update(): void {
    if (this.element) {
      const newElement = this.render();
      this.element.replaceWith(newElement);
      this.element = newElement;
    }
  }

  /**
   * Получить корневой элемент
   * @returns Корневой элемент или null
   */
  public getElement(): HTMLElement | null {
    return this.element;
  }

  /**
   * Показать компонент
   */
  public show(): void {
    if (this.element) {
      this.element.classList.remove('hidden');
      this.element.removeAttribute('aria-hidden');
    }
    this.props.visible = true;
  }

  /**
   * Скрыть компонент
   */
  public hide(): void {
    if (this.element) {
      this.element.classList.add('hidden');
      this.element.setAttribute('aria-hidden', 'true');
    }
    this.props.visible = false;
  }

  /**
   * Переключить видимость компонента
   */
  public toggle(): void {
    if (this.props.visible) {
      this.hide();
    } else {
      this.show();
    }
  }

  /**
   * Включить компонент
   */
  public enable(): void {
    if (this.element) {
      this.element.removeAttribute('disabled');
      this.element.classList.remove('disabled');
    }
    this.props.disabled = false;
  }

  /**
   * Отключить компонент
   */
  public disable(): void {
    if (this.element) {
      this.element.setAttribute('disabled', 'true');
      this.element.classList.add('disabled');
    }
    this.props.disabled = true;
  }

  /**
   * Добавить дочерний компонент
   * @param child - Дочерний компонент
   */
  protected addChild(child: Component): void {
    this.children.push(child);
  }

  /**
   * Удалить дочерний компонент
   * @param child - Дочерний компонент
   */
  protected removeChild(child: Component): void {
    const index = this.children.indexOf(child);
    if (index > -1) {
      this.children.splice(index, 1);
      child.unmount();
    }
  }

  /**
   * Создать элемент с атрибутами
   * @param tag - HTML тег
   * @param attrs - Атрибуты элемента
   * @param children - Дочерние элементы или текст
   * @returns Созданный элемент
   */
  protected createElement<K extends keyof HTMLElementTagNameMap>(
    tag: K,
    attrs: Record<string, string | boolean | number> = {},
    children: (Element | string)[] = []
  ): HTMLElementTagNameMap[K] {
    const element = document.createElement(tag);
    
    // Установить атрибуты
    for (const [key, value] of Object.entries(attrs)) {
      if (key === 'className') {
        element.className = String(value);
      } else if (key === 'style' && typeof value === 'string') {
        element.setAttribute('style', value);
      } else if (typeof value === 'boolean') {
        if (value) {
          element.setAttribute(key, '');
        }
      } else {
        element.setAttribute(key, String(value));
      }
    }
    
    // Добавить дочерние элементы
    children.forEach(child => {
      if (typeof child === 'string') {
        element.appendChild(document.createTextNode(child));
      } else {
        element.appendChild(child);
      }
    });
    
    return element;
  }

  /**
   * Добавить слушатель событий с автоматической очисткой
   * @param element - Целевой элемент
   * @param event - Название события
   * @param handler - Обработчик события
   * @param options - Опции слушателя событий
   */
  protected addEventListener<K extends keyof HTMLElementEventMap>(
    element: Element,
    event: K,
    handler: EventHandler<HTMLElementEventMap[K]>,
    options?: boolean | AddEventListenerOptions
  ): void {
    element.addEventListener(event, handler as EventListener, options);
    
    // Отслеживать для очистки
    if (!this.eventListeners.has(element)) {
      this.eventListeners.set(element, new Map());
    }
    this.eventListeners.get(element)!.set(event, handler as EventHandler);
  }

  /**
   * Удалить слушатель событий
   * @param element - Целевой элемент
   * @param event - Название события
   */
  protected removeEventListener(element: Element, event: string): void {
    const elementListeners = this.eventListeners.get(element);
    if (elementListeners) {
      const handler = elementListeners.get(event);
      if (handler) {
        element.removeEventListener(event, handler as EventListener);
        elementListeners.delete(event);
      }
    }
  }

  /**
   * Удалить все слушатели событий
   */
  private removeAllEventListeners(): void {
    this.eventListeners.forEach((listeners, element) => {
      listeners.forEach((handler, event) => {
        element.removeEventListener(event, handler as EventListener);
      });
    });
    this.eventListeners.clear();
  }

  /**
   * Обновить атрибуты элемента
   */
  protected updateElement(): void {
    if (!this.element) return;
    
    // Обновить классы
    if (this.props.className) {
      this.element.className = this.props.className;
    }
    
    // Обновить id
    if (this.props.id) {
      this.element.id = this.props.id;
    }
    
    // Обновить data атрибуты
    if (this.props.dataAttrs) {
      Object.entries(this.props.dataAttrs).forEach(([key, value]) => {
        this.element!.dataset[key] = value;
      });
    }
    
    // Обновить состояние disabled
    if (this.props.disabled) {
      this.disable();
    } else {
      this.enable();
    }
    
    // Обновить видимость
    if (this.props.visible) {
      this.show();
    } else {
      this.hide();
    }
  }

  /**
   * Вызывается после монтирования компонента
   * Переопределите в дочерних классах
   */
  protected onMounted(): void {
    // Переопределите в дочерних классах
  }

  /**
   * Вызывается после отмонтирования компонента
   * Переопределите в дочерних классах
   */
  protected onUnmounted(): void {
    // Переопределите в дочерних классах
  }

  /**
   * Уничтожить компонент и выполнить очистку
   */
  public destroy(): void {
    this.unmount();
  }
}
