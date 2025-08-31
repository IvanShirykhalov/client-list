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
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';

import { CustomInputComponent } from '../../../../shared';
import { ClientsRepository } from '../../data';
import { ClientDetailsMode, IClient } from '../../core';

/**
 * Описывает форму клиента
 */
interface ClientFormValue {
  fio: string;
  phone: string;
  email: string;
  city: string;
  birthday: string;
  gender: string;
  carNumber: string;
  template: string;
  discount: string;
  bonus: string;
  loyaltyLevel: string;
  barcode: string;
  key3: string;
  key4: string;
  key5: string;
  key6: string;
}

/**
 * Компонент для создания и редактирования клиента
 */
@Component({
  selector: 'app-client-details',
  templateUrl: './client-details.component.html',
  styleUrls: ['./client-details.component.scss'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    CustomInputComponent,
    TranslateModule
  ],
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

  public clientForm!: FormGroup;
  public loading: WritableSignal<boolean> = signal(false);
  public saving: WritableSignal<boolean> = signal(false);
  public deleting: WritableSignal<boolean> = signal(false);
  public errorMessage: WritableSignal<string> = signal('');
  public successMessage: WritableSignal<string> = signal('');
  public activeTab: WritableSignal<string> = signal('basic');

  private formBuilder: FormBuilder = inject(FormBuilder);
  private clientsRepository: ClientsRepository = inject(ClientsRepository);
  private destroyRef: DestroyRef = inject(DestroyRef);
  private translate: TranslateService = inject(TranslateService);

  /**
   * @inheritDoc
   */
  public ngOnInit(): void {
    this.initForm();
    this.loadClientData();
  }

  /**
   * Сохранение данных клиента
   */
  public saveClient(): void {
    if (this.clientForm.invalid) {
      this.markAllAsTouched();
      this.errorMessage.set(this.translate.instant('CLIENT_DETAILS.VALIDATION_ERROR'));
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
          setTimeout(() => this.close(), 1500);
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

  private markAllAsTouched(): void {
    Object.keys(this.clientForm.controls).forEach(key => {
      this.clientForm.get(key)?.markAsTouched();
    });
  }

  /**
   * Подготовка данных для отправки
   */
  private prepareClientData(): Partial<IClient> {
    const formValue: ClientFormValue = this.clientForm.value;
    return {
      fio: formValue.fio,
      phone: formValue.phone || undefined,
      email: formValue.email || undefined,
      city: formValue.city || undefined,
      birthday: formValue.birthday || undefined,
      gender: formValue.gender || undefined,
      car_number: formValue.carNumber || undefined,
      discount: formValue.discount || undefined,
      bonus: formValue.bonus || undefined,
      loyalty_level: formValue.loyaltyLevel || undefined,
      template: formValue.template,
      barcode: formValue.barcode || undefined,
      key3: formValue.key3 || undefined,
      key4: formValue.key4 || undefined,
      key5: formValue.key5 || undefined,
      key6: formValue.key6 || undefined,
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
      this.resetForm();
    } else {
      this.onClientUpdated.emit(savedClient);
      this.successMessage.set(this.translate.instant('CLIENT_DETAILS.UPDATE_SUCCESS'));
      setTimeout(() => this.close(), 1500);
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
   * Инициализация формы
   */
  private initForm(): void {
    this.clientForm = this.formBuilder.group({
      fio: ['', [Validators.required, Validators.maxLength(100)]],
      phone: ['', [Validators.pattern(/^[+]?[0-9]{10,15}$/)]],
      email: ['', [Validators.email]],
      city: ['', [Validators.maxLength(50)]],
      birthday: [''],
      gender: [''],
      carNumber: ['', [Validators.maxLength(20)]],
      template: [{ value: 'Тестовый', disabled: true }, [Validators.required]],
      discount: ['', [Validators.min(0), Validators.max(100)]],
      bonus: ['', [Validators.min(0)]],
      loyaltyLevel: ['', [Validators.maxLength(50)]],
      barcode: ['', [Validators.maxLength(100)]],
      key3: ['', [Validators.maxLength(100)]],
      key4: ['', [Validators.maxLength(100)]],
      key5: ['', [Validators.maxLength(100)]],
      key6: ['', [Validators.maxLength(100)]]
    });
  }

  /**
   * Сброс формы
   */
  private resetForm(): void {
    this.clientForm.reset({
      template: 'Тестовый'
    });
    this.clientForm.markAsUntouched();
    this.errorMessage.set('');
    this.successMessage.set('');
    this.saving.set(false);
    this.deleting.set(false);
    this.activeTab.set('basic');
  }

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
    this.clientForm.patchValue({
      fio: clientData.fio || '',
      phone: clientData.phone || '',
      email: clientData.email || '',
      city: clientData.city || '',
      birthday: clientData.birthday || '',
      gender: clientData.gender || '',
      carNumber: clientData.car_number || '',
      discount: clientData.discount || '',
      bonus: clientData.bonus || '',
      loyaltyLevel: clientData.loyalty_level || '',
      template: clientData.template || 'Тестовый',
      barcode: clientData.barcode || '',
      key3: clientData.key3 || '',
      key4: clientData.key4 || '',
      key5: clientData.key5 || '',
      key6: clientData.key6 || ''
    });

    this.loading.set(false);
  }
}
