import { Component, DestroyRef, inject, OnInit, Signal, WritableSignal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { HttpErrorResponse } from '@angular/common/http';

import {
  EmptyCellDirective,
  PushModalComponent,
  TableSortDirectionType,
  TableSortingComponent,
} from '../../../shared';
import { ClientDetailsMode, ClientsFacade, IClient } from '../core';
import { ClientDetailsComponent } from './client-details';
import { NotificationService } from '../../../shared/services/notification.service';

/**
 * Компонент со списком клиентов
 */
@Component({
  selector: 'app-clients',
  templateUrl: './clients.component.html',
  styleUrls: ['./clients.component.scss'],
  imports: [
    CommonModule,
    FormsModule,
    PushModalComponent,
    RouterModule,
    ClientDetailsComponent,
    EmptyCellDirective,
    TableSortingComponent,
    TranslatePipe
  ],
  standalone: true,
})
export class ClientsComponent implements OnInit {
  private destroyRef: DestroyRef = inject(DestroyRef);

  constructor(
    private route: ActivatedRoute,
    private translate: TranslateService,
    private facade: ClientsFacade,
    private notificationService: NotificationService,
  ) {
  }

  public get clients(): Signal<IClient[]> {
    return this.facade.clients.asReadonly();
  }

  public get searchTerm(): WritableSignal<string> {
    return this.facade.searchTerm;
  }

  public get searchError(): WritableSignal<string> {
    return this.facade.searchError;
  }

  public get isLoading(): Signal<boolean> {
    return this.facade.isLoading.asReadonly();
  }

  public get showClientModal(): Signal<boolean> {
    return this.facade.showClientModal.asReadonly();
  }

  public get clientModalMode(): Signal<ClientDetailsMode> {
    return this.facade.clientModalMode.asReadonly();
  }

  public get selectedClient(): Signal<IClient | null> {
    return this.facade.selectedClient.asReadonly();
  }

  public get showPushModal(): Signal<boolean> {
    return this.facade.showPushModal.asReadonly();
  }

  public get selectedClientFio(): Signal<string> {
    return this.facade.selectedClientFio.asReadonly();
  }

  public get filteredClients(): Signal<IClient[]> {
    return this.facade.filteredClients;
  }

  /**
   * @inheritDoc
   */
  public ngOnInit(): void {
    this.facade.loadClients().subscribe();

    this.route.params
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(params => {
        const clientId: string | undefined = params['id'];
        if (clientId) {
          const found: boolean = this.facade.openPushModalFromRoute(clientId, this.clients());
          if (!found) {
            console.warn(this.translate.instant('ERRORS.CLIENT_NOT_FOUND', { id: clientId }));
          }
        }
      });
  }

  /**
   * Обработка поискового запроса
   */
  public onSearch(): void {
    this.facade.handleSearch();
  }

  /**
   * Обработка сортировки по полю
   */
  public onSort(field: string, direction: TableSortDirectionType): void {
    this.facade.handleSort(field, direction);
  }

  /**
   * Получение текущего направления сортировки для поля
   */
  public getSortDirection(field: string): TableSortDirectionType {
    return this.facade.getSortDirection(field);
  }

  /**
   * Открытие модального окна для отправки PUSH-уведомления
   */
  public openPushModal(clientIds: number[]): void {
    this.facade.openPushModal(clientIds, this.clients());
    this.facade.updatePushUrl(clientIds[0]);
  }

  /**
   * Отправка PUSH-уведомления выбранным клиентам
   */
  public onSendPush(event: { message: string }): void {
    this.facade.sendPush(event.message).subscribe({
      next: (): void => {
        const message: string = this.translate.instant('PUSH_MODAL.SUCCESS');
        this.notificationService.showMessage(message);
        this.onClosePushModal();
      },
      error: (error: HttpErrorResponse): void => {
        console.error('Error sending push:', error);
        const message: string = this.translate.instant('ERRORS.SEND_PUSH_ERROR');
        this.notificationService.showMessage(error.message || message);
      }
    });
  }

  /**
   * Закрытие модального окна отправки PUSH-уведомления
   */
  public onClosePushModal(): void {
    this.facade.closePushModal();
    this.facade.clearPushUrl();
  }

  /**
   * Очистка поискового запроса
   */
  public clearSearch(): void {
    this.facade.clearSearch();
  }

  /**
   * Открытие модального окна создания клиента
   */
  public openCreateModal(): void {
    this.facade.openCreateModal();
  }

  /**
   * Открытие модального окна редактирования клиента
   */
  public openEditModal(client: IClient): void {
    this.facade.openEditModal(client);
  }

  /**
   * Обработчик успешного создания клиента
   */
  public onClientCreated(newClient: IClient): void {
    this.facade.addClient(newClient);
    this.notificationService.showMessage(this.translate.instant('CLIENT_DETAILS.CREATE_SUCCESS', { name: newClient.fio }));
  }

  /**
   * Обработчик успешного обновления клиента
   */
  public onClientUpdated(updatedClient: IClient): void {
    this.facade.updateClient(updatedClient);
    this.notificationService.showMessage(this.translate.instant('CLIENT_DETAILS.UPDATE_SUCCESS', { name: updatedClient.fio }));
  }

  /**
   * Обработчик успешного удаления клиента
   */
  public onClientDeleted(clientId: number): void {
    this.facade.removeClient(clientId);
    this.notificationService.showMessage(this.translate.instant('CLIENT_DETAILS.DELETE_SUCCESS'));
  }

  /**
   * Закрытие модального окна работы с клиентом
   */
  public onCloseClientModal(): void {
    this.facade.closeClientModal();
  }
}
