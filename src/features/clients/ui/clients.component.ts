import { Component, OnInit, Signal, WritableSignal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';

import {
  Client,
  EmptyCellDirective,
  PushModalComponent,
  TableSortDirectionType,
  TableSortingComponent,
} from '../../../shared';
import { CreateClientComponent } from './create-client';
import { ClientsFacade } from '../core';

/**
 * Компонент со списком клиентов
 */
@Component({
  selector: 'app-clients',
  templateUrl: './clients.component.html',
  styleUrls: ['./clients.component.scss'],
  imports: [CommonModule, FormsModule, PushModalComponent, RouterModule, CreateClientComponent, EmptyCellDirective, TableSortingComponent, TranslatePipe],
  standalone: true,
})
export class ClientsComponent implements OnInit {
  constructor(
    private route: ActivatedRoute,
    private translate: TranslateService,
    private facade: ClientsFacade
  ) {
  }

  public get clients(): Signal<Client[]> {
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

  public get showCreateModal(): Signal<boolean> {
    return this.facade.showCreateModal.asReadonly();
  }

  public get showPushModal(): Signal<boolean> {
    return this.facade.showPushModal.asReadonly();
  }

  public get selectedClientFio(): Signal<string> {
    return this.facade.selectedClientFio.asReadonly();
  }

  public get filteredClients(): Signal<Client[]> {
    return this.facade.filteredClients;
  }

  /**
   * @inheritDoc
   */
  public ngOnInit(): void {
    this.facade.loadClients().subscribe();

    this.route.params
      .pipe(takeUntilDestroyed())
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
      next: (response) => {
        alert(this.translate.instant('PUSH_MODAL.SUCCESS', { count: response.users_count }));
        this.onClosePushModal();
      },
      error: (error) => {
        console.error('Error sending push:', error);
        alert(error.message || this.translate.instant('ERRORS.SEND_PUSH_ERROR'));
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
   * Обработчик успешного создания клиента
   */
  public onClientCreated(newClient: Client): void {
    this.facade.addClient(newClient);
    alert(this.translate.instant('CREATE_MODAL.SUCCESS', { name: newClient.fio }));
  }

  /**
   * Закрытие модального окна создания клиента
   */
  public onCloseCreateModal(): void {
    this.facade.closeCreateModal();
  }
}
