import {
  Component,
  DestroyRef,
  inject,
  input,
  InputSignal,
  OnInit,
  output,
  OutputEmitterRef,
  signal,
  WritableSignal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';

import { ClientDetailsMode, CustomInputComponent, IClient } from '../../../../shared';
import { ClientsRepository } from '../../data';
import { HttpErrorResponse } from '@angular/common/http';

/**
 * Компонент для создания и редактирования клиента
 */
@Component({
  selector: 'app-client-details',
  templateUrl: './client-details.component.html',
  styleUrls: ['./client-details.component.scss'],
  imports: [CommonModule, FormsModule, CustomInputComponent, TranslateModule],
  standalone: true
})
export class ClientDetailsComponent implements OnInit {
  public mode: InputSignal<ClientDetailsMode> = input<ClientDetailsMode>(ClientDetailsMode.CREATE);
  public clientId: InputSignal<number | null> = input<number | null>(null);
  public initialData: InputSignal<Partial<IClient> | null> = input<Partial<IClient> | null>(null);

  public onClientCreated: OutputEmitterRef<IClient> = output<IClient>();
  public onClientUpdated: OutputEmitterRef<IClient> = output<IClient>();
  public onClientDeleted: OutputEmitterRef<number> = output<number>();
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

  public loading: WritableSignal<boolean> = signal(false);
  public saving: WritableSignal<boolean> = signal(false);
  public deleting: WritableSignal<boolean> = signal(false);
  public errorMessage: WritableSignal<string> = signal('');
  public successMessage: WritableSignal<string> = signal('');
  public activeTab: WritableSignal<string> = signal('basic');

  private clientsRepository: ClientsRepository = inject(ClientsRepository);
  private destroyRef: DestroyRef = inject(DestroyRef);
  private translate: TranslateService = inject(TranslateService);
  private router: Router = inject(Router);

  /**
   * Инициализация компонента
   */
  public ngOnInit(): void {
    this.loadClientData();
  }

  /**
   * Сохранение данных клиента
   */
  public saveClient(): void {
    if (!this.validateForm()) {
      return;
    }

    this.saving.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    const clientData: Partial<IClient> = this.prepareClientData();

    const operation: Observable<IClient> = this.mode() === ClientDetailsMode.CREATE
      ? this.clientsRepository.createClient(clientData)
      : this.clientsRepository.updateClient(this.clientId()!, clientData);

    operation
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (savedClient) => {
          this.handleSaveSuccess(savedClient);
        },
        error: (error) => {
          this.handleSaveError(error);
        }
      });
  }

  /**
   * Удаление клиента
   */
  public deleteClient(): void {
    if (!confirm(this.translate.instant('CLIENT_DETAILS.DELETE_CONFIRM'))) {
      return;
    }

    this.deleting.set(true);
    this.errorMessage.set('');

    this.clientsRepository.deleteClient(this.clientId()!)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.onClientDeleted.emit(this.clientId()!);
          this.successMessage.set(this.translate.instant('CLIENT_DETAILS.DELETE_SUCCESS'));
        },
        error: (error) => {
          this.errorMessage.set(this.translate.instant('ERRORS.DELETE_ERROR'));
          console.error('Error deleting client:', error);
          this.deleting.set(false);
        }
      });
  }


  /**
   * Закрытие формы
   */
  public close(): void {
    this.onClose.emit();
    this.resetForm();
  }

  /**
   * Установка активной вкладки
   */
  public setActiveTab(tab: string): void {
    this.activeTab.set(tab);
  }


  /**
   * Получение заголовка модального окна
   */
  public getTitle(): string {
    switch (this.mode()) {
      case ClientDetailsMode.CREATE:
        return 'CLIENT_DETAILS.TITLE_CREATE';
      case ClientDetailsMode.EDIT:
        return 'CLIENT_DETAILS.TITLE_EDIT';
      default:
        return 'CLIENT_DETAILS.TITLE_CREATE';
    }
  }


  /**
   * Сброс формы
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
    this.template = 'Тестовый';
    this.barcode = '';
    this.key3 = '';
    this.key4 = '';
    this.key5 = '';
    this.key6 = '';

    this.errorMessage.set('');
    this.successMessage.set('');
    this.saving.set(false);
    this.deleting.set(false);
    this.activeTab.set('basic');
  }

  /**
   * Валидация формы
   */
  private validateForm(): boolean {
    if (!this.fio.trim()) {
      this.errorMessage.set(this.translate.instant('CLIENT_DETAILS.REQUIRED_FIO_ERROR'));
      return false;
    }

    if (this.phone && !this.isValidPhone(this.phone)) {
      this.errorMessage.set(this.translate.instant('CLIENT_DETAILS.INVALID_PHONE_ERROR'));
      return false;
    }

    if (this.email && !this.isValidEmail(this.email)) {
      this.errorMessage.set(this.translate.instant('CLIENT_DETAILS.INVALID_EMAIL_ERROR'));
      return false;
    }

    return true;
  }

  /**
   * Проверка валидности телефона
   */
  private isValidPhone(phone: string): boolean {
    const phoneRegex: RegExp = /^[+]?[0-9]{10,15}$/;
    return phoneRegex.test(phone.replace(/[\s()-]/g, ''));
  }

  /**
   * Проверка валидности email
   */
  private isValidEmail(email: string): boolean {
    const emailRegex: RegExp = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Подготовка данных для отправки
   */
  private prepareClientData(): Partial<IClient> {
    return {
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
  }

  /**
   * Обработка успешного сохранения
   */
  private handleSaveSuccess(savedClient: IClient): void {
    this.saving.set(false);

    if (this.mode() === ClientDetailsMode.CREATE) {
      this.onClientCreated.emit(savedClient);
      this.successMessage.set(this.translate.instant('CLIENT_DETAILS.CREATE_SUCCESS'));
    } else {
      this.onClientUpdated.emit(savedClient);
      this.successMessage.set(this.translate.instant('CLIENT_DETAILS.UPDATE_SUCCESS'));
    }

    if (this.mode() === ClientDetailsMode.CREATE) {
      this.resetForm();
    } else {
      this.close();
    }
  }

  /**
   * Обработка ошибки сохранения
   */
  private handleSaveError(error: HttpErrorResponse): void {
    this.saving.set(false);

    let errorMessage: string = this.translate.instant('ERRORS.SAVE_ERROR');

    if (error.status === 400) {
      errorMessage = this.translate.instant('ERRORS.VALIDATION_ERROR');
    } else if (error.status === 401 || error.status === 403) {
      errorMessage = this.translate.instant('ERRORS.AUTH_ERROR');
    }

    this.errorMessage.set(errorMessage);
    console.error('Error saving client:', error);
  }

  /**
   * Загрузка данных клиента для редактирования/просмотра
   */
  private loadClientData(): void {
    const initialData: Partial<IClient> | null = this.initialData();

    if (this.mode() === ClientDetailsMode.EDIT && initialData) {
      this.populateForm(initialData);
    }
  }

  /**
   * Заполнение формы данными клиента
   */
  private populateForm(clientData: Partial<IClient>): void {
    this.fio = clientData.fio || '';
    this.phone = clientData.phone || '';
    this.email = clientData.email || '';
    this.city = clientData.city || '';
    this.birthday = clientData.birthday || '';
    this.gender = clientData.gender || '';
    this.carNumber = clientData.car_number || '';
    this.discount = clientData.discount || '';
    this.bonus = clientData.bonus || '';
    this.loyaltyLevel = clientData.loyalty_level || '';
    this.template = clientData.template || 'Тестовый';
    this.barcode = clientData.barcode || '';
    this.key3 = clientData.key3 || '';
    this.key4 = clientData.key4 || '';
    this.key5 = clientData.key5 || '';
    this.key6 = clientData.key6 || '';

    this.loading.set(false);
  }
}
