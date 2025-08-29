import { Component, input, InputSignal, output, OutputEmitterRef, signal, WritableSignal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';

/**
 * Компонент модального окна push уведомлений
 */
@Component({
  selector: 'app-push-modal',
  templateUrl: './push-modal.component.html',
  styleUrls: ['./push-modal.component.scss'],
  imports: [CommonModule, FormsModule, TranslatePipe],
  standalone: true
})
export class PushModalComponent {
  public recipientName: InputSignal<string> = input('Клиент');
  public message: WritableSignal<string> = signal('');

  public onSend: OutputEmitterRef<{ message: string }> = output<{ message: string }>();
  public onClose: OutputEmitterRef<void> = output<void>();

  /**
   * Отправляет сообщение, если оно не пустое
   */
  protected send(): void {
    if (this.message().trim()) {
      this.onSend.emit({ message: this.message().trim() });
      this.message.set('');
    }
  }

  /**
   * Закрыть модальное окно
   */
  protected close(): void {
    this.onClose.emit();
    this.message.set('');
  }
}
