/**
 * Страница "404 - Страница не найдена" - L_Shop Frontend
 * Отображается при переходе на несуществующий маршрут
 */

import { Component, ComponentProps } from '../base/Component';
import { Button } from '../ui/Button';
import { router } from '../../router/router';

/**
 * Пропсы для страницы 404
 */
export interface NotFoundPageProps extends ComponentProps {
  /** Дополнительный класс */
  className?: string;
}

/**
 * SVG Иконка для страницы 404 (знак вопроса в круге)
 */
const NOT_FOUND_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>';

/**
 * Страница "404 - Страница не найдена"
 */
export class NotFoundPage extends Component<NotFoundPageProps> {
  /**
   * Получить пропсы по умолчанию
   */
  protected getDefaultProps(): NotFoundPageProps {
    return {
      ...super.getDefaultProps(),
      className: 'not-found-page',
    };
  }

  /**
   * Отрендерить страницу 404
   * @returns Элемент страницы
   */
  public render(): HTMLElement {
    const container = this.createElement('div', {
      className: this.props.className || 'not-found-page',
    });

    // Добавляем общий контейнер для центрирования
    const innerContainer = this.createElement('div', {
      className: 'container',
    });

    // Иконка
    const iconContainer = this.createElement('div', {
      className: 'not-found-page__icon',
    });
    iconContainer.innerHTML = NOT_FOUND_ICON;
    innerContainer.appendChild(iconContainer);

    // Код ошибки
    const errorCode = this.createElement(
      'div',
      {
        className: 'not-found-page__code',
      },
      ['404'],
    );
    innerContainer.appendChild(errorCode);

    // Заголовок
    const title = this.createElement(
      'h1',
      {
        className: 'not-found-page__title',
      },
      ['Страница не найдена'],
    );
    innerContainer.appendChild(title);

    // Описание
    const description = this.createElement(
      'p',
      {
        className: 'not-found-page__description',
      },
      ['К сожалению, запрашиваемая страница не существует или была перемещена.'],
    );
    innerContainer.appendChild(description);

    // Дополнительный текст
    const text = this.createElement(
      'p',
      {
        className: 'not-found-page__text',
      },
      ['Возможно, вы перешли по устаревшей ссылке или ввели неверный адрес.'],
    );
    innerContainer.appendChild(text);

    // Кнопки действий
    const actions = this.createElement('div', {
      className: 'not-found-page__actions',
    });

    const homeButton = new Button({
      text: 'На главную',
      variant: 'primary',
      size: 'lg',
      onClick: () => {
        router.navigate('/');
      },
    });
    actions.appendChild(homeButton.render());

    const backButton = new Button({
      text: 'Вернуться назад',
      variant: 'outline',
      size: 'lg',
      onClick: () => {
        window.history.back();
      },
    });
    actions.appendChild(backButton.render());

    innerContainer.appendChild(actions);

    container.appendChild(innerContainer);
    this.element = container;

    return container;
  }
}
