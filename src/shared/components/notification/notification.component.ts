import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface INotification {
  id: number;
  message: string;
  duration?: number;
}

/**
 * Компонент для отображения всплывающих уведомлений
 */
@Component({
  selector: 'app-notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.scss'],
  imports: [CommonModule],
})
export class NotificationComponent {
  public notifications: INotification[] = [];
  private counter: number = 0;

  /**
   * Отображает всплывающее уведомление с заданным сообщением
   *
   * @param message - текст сообщения для отображения
   * @param duration - длительность показа уведомления в миллисекундах (по умолчанию 3000 мс)
   */
  public showMessage(message: string, duration: number = 3000): void {
    const id: number = this.counter++;
    const newNotification: INotification = {
      id,
      message,
      duration
    };

    this.notifications.push(newNotification);

    if (duration > 0) {
      setTimeout(() => {
        this.removeNotification(id);
      }, duration);
    }
  }

  /**
   * Удаляет уведомление по id
   *
   * @param id - id уведомления для удаления
   */
  public removeNotification(id: number): void {
    this.notifications = this.notifications.filter(n => n.id !== id);
  }
}
