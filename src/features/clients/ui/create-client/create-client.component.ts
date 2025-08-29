import { Component, DestroyRef, inject, output, OutputEmitterRef, signal, WritableSignal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { Client, ApiService, CustomInputComponent } from '../../../../shared';

/**
 * Компонент для создания нового клиента
 */
@Component({
  selector: 'app-create-client',
  templateUrl: './create-client.component.html',
  styleUrls: ['./create-client.component.scss'],
  imports: [CommonModule, FormsModule, CustomInputComponent, TranslateModule],
  standalone: true
})
export class CreateClientComponent {
  public onClientCreated: OutputEmitterRef<Client> = output<Client>();
  public onClose: OutputEmitterRef<void> = output<void>();

  public fio: string = '';
  public phone: string = '';
  public email: string = '';
  public city: string = '';
  public birthday: string = '';
  public gender: string = '';
  public carNumber: string = '';
  public discount: string = '';
  public bonus: string = '';
  public loyaltyLevel: string = '';
  public template: string = 'Тестовый';
  public barcode: string = '';
  public key3: string = '';
  public key4: string = '';
  public key5: string = '';
  public key6: string = '';

  public creating: WritableSignal<boolean> = signal(false);
  public errorMessage: WritableSignal<string> = signal('');
  public activeTab: WritableSignal<string> = signal('basic');

  private apiService: ApiService = inject(ApiService);
  private destroyRef: DestroyRef = inject(DestroyRef);
  private translate: TranslateService = inject(TranslateService);

  /**
   * Создание нового клиента
   */
  public onCreateClient(): void {
    if (!this.fio || !this.template) {
      this.errorMessage.set(this.translate.instant('CREATE_MODAL.REQUIRED_FIELDS_ERROR'));
      return;
    }

    const clientData: Partial<Client> = {
      fio: this.fio,
      phone: this.phone || undefined,
      email: this.email || undefined,
      city: this.city || undefined,
      birthday: this.birthday || undefined,
      gender: this.gender || undefined,
      car_number: this.carNumber || undefined,
      discount: this.discount || undefined,
      bonus: this.bonus || undefined,
      loyalty_level: this.loyaltyLevel || undefined,
      template: this.template,
      barcode: this.barcode || undefined,
      key3: this.key3 || undefined,
      key4: this.key4 || undefined,
      key5: this.key5 || undefined,
      key6: this.key6 || undefined,
    };

    this.creating.set(true);
    this.errorMessage.set('');

    this.apiService.createClient(clientData)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (newClient) => {
          this.onClientCreated.emit(newClient);
          this.resetForm();
        },
        error: (error) => {
          this.errorMessage.set(this.translate.instant('ERRORS.CREATE_ERROR'));
          console.error('Error creating client:', error);
          this.creating.set(false);
        }
      });
  }

  /**
   * Закрытие формы создания
   */
  public close(): void {
    this.onClose.emit();
    this.resetForm();
  }

  /**
   * Установка активной вкладки формы
   *
   * @param tab - идентификатор вкладки
   */
  public setActiveTab(tab: string): void {
    this.activeTab.set(tab);
  }

  /**
   * Сброс формы к исходному состоянию
   */
  private resetForm(): void {
    this.fio = '';
    this.phone = '';
    this.email = '';
    this.city = '';
    this.birthday = '';
    this.gender = '';
    this.carNumber = '';
    this.discount = '';
    this.bonus = '';
    this.loyaltyLevel = '';
    this.template = this.translate.instant('CREATE_MODAL.TEMPLATE_DEFAULT');
    this.barcode = '';
    this.key3 = '';
    this.key4 = '';
    this.key5 = '';
    this.key6 = '';

    this.errorMessage.set('');
    this.creating.set(false);
    this.activeTab.set('basic');
  }
}
