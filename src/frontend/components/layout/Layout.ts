/**
 * Layout Component - L_Shop Frontend
 * Базовый layout обёртка для всех страниц
 *
 * @see src/frontend/styles/components/layout.css - стили layout
 * @see docs/DESIGN_SYSTEM.md - документация дизайн-системы
 */

import { Component, ComponentProps } from '../base/Component.js';
import { Header } from './Header.js';
import { Footer } from './Footer.js';

/**
 * Props для Layout компонента
 */
export interface LayoutProps extends ComponentProps {
  /** Дополнительные классы для layout контейнера */
  extraClassName?: string;
  /** Дополнительный контент перед основным (например, breadcrumbs) */
  beforeContent?: HTMLElement | string;
  /** Дополнительный контент после основного (например, CTA секция) */
  afterContent?: HTMLElement | string;
}

/**
 * Layout компонент
 * Обеспечивает консистентную структуру всех страниц:
 * - Header (sticky, вверху)
 * - Main content area (с контейнером)
 * - Footer (внизу)
 *
 * @example
 * ```typescript
 * const layout = new Layout({
 *   extraClassName: 'custom-layout',
 * });
 * document.body.appendChild(layout.render());
 * ```
 */
export class Layout extends Component<LayoutProps> {
  /** Header компонент */
  private header: Header | null = null;

  /** Footer компонент */
  private footer: Footer | null = null;

  /** Main content элемент */
  private mainContent: HTMLElement | null = null;

  /**
   * Get default props
   */
  protected getDefaultProps(): LayoutProps {
    return {
      ...super.getDefaultProps(),
      extraClassName: '',
    };
  }

  /**
   * Render layout
   * @returns Layout element
   */
  public render(): HTMLElement {
    const layout = this.createElement('div', {
      className: `layout ${this.props.extraClassName}`.trim(),
      'data-testid': 'layout',
    });

    // Header (sticky)
    this.header = new Header();
    layout.appendChild(this.header.render());

    // Main content area
    const main = this.createElement('main', {
      className: 'layout__main',
      'data-testid': 'layout-main',
    });
    this.mainContent = main;
    layout.appendChild(main);

    // Footer
    this.footer = new Footer();
    layout.appendChild(this.footer.render());

    this.element = layout;
    return layout;
  }

  /**
   * Mount layout to container and render children
   * @param container - Container element
   * @param children - Children elements to render in main content area
   */
  public mountWithChildren(container: HTMLElement, children: HTMLElement | string): void {
    // Mount layout first
    this.mount(container);

    // Render children into main content area
    if (this.mainContent) {
      if (typeof children === 'string') {
        this.mainContent.innerHTML = children;
      } else {
        this.mainContent.appendChild(children);
      }
    }
  }

  /**
   * Set main content directly
   * @param content - Content element or HTML string
   */
  public setContent(content: HTMLElement | string): void {
    if (!this.mainContent) return;

    if (typeof content === 'string') {
      this.mainContent.innerHTML = content;
    } else {
      // Clear existing content
      this.mainContent.innerHTML = '';
      this.mainContent.appendChild(content);
    }
  }

  /**
   * Get main content element
   * @returns Main content element or null
   */
  public getMainContent(): HTMLElement | null {
    return this.mainContent;
  }

  /**
   * Get header component
   * @returns Header component
   */
  public getHeader(): Header | null {
    return this.header;
  }

  /**
   * Get footer component
   * @returns Footer component
   */
  public getFooter(): Footer | null {
    return this.footer;
  }

  /**
   * Called after component is mounted
   */
  protected onMounted(): void {
    // Layout-specific initialization if needed
  }

  /**
   * Called after component is unmounted
   */
  protected onUnmounted(): void {
    // Cleanup if needed
  }
}
