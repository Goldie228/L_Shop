/**
 * Страница "404 - Страница не найдена" - L_Shop Frontend
 * Отображается при переходе на несуществующий маршрут
 */

import { Component, ComponentProps } from '../base/Component';
import { Button } from '../ui/Button';
import { Icon } from '../ui/Icon';
import { router } from '../../router/router';

/**
 * Пропсы для страницы 404
 */
export interface NotFoundPageProps extends ComponentProps {
  /** Дополнительный класс */
  className?: string;
}

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

    // Иконка (используем компонент Icon)
    const iconContainer = this.createElement('div', {
      className: 'not-found-page__icon',
    });
    const icon = new Icon({
      name: 'question-circle',
      size: 80,
      className: 'not-found-page__icon-svg',
    });
    iconContainer.appendChild(icon.render());
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
