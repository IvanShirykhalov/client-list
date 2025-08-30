import { Injectable } from '@angular/core';
import { NotificationComponent } from '../components';
import { BehaviorSubject } from 'rxjs';

/**
 * Сервис для отображения всплывающих уведомлений
 */
@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notificationComponent$: BehaviorSubject<NotificationComponent | null> = new BehaviorSubject<NotificationComponent | null>(null);

  public registerComponent(component: NotificationComponent): void {
    this.notificationComponent$.next(component);
  }

  /**
   * Отображает всплывающее уведомление с заданным сообщением
   *
   * @param message - текст сообщения
   * @param duration - длительность показа уведомления в миллисекундах (по умолчанию 3000 мс)
   */
  public showMessage(message: string, duration: number = 3000): void {
    const currentComponent: NotificationComponent | null = this.notificationComponent$.getValue();

    if (currentComponent) {
      currentComponent.showMessage(message, duration);
    } else {
      console.warn('Component not available, message queued');
    }
  }
}
