import { Injectable, signal, WritableSignal, computed, DestroyRef, inject, Signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Observable, tap, catchError, of } from 'rxjs';

import { ApiService, IClient, ClientDetailsMode, IClientsResponse, TableSortDirectionType } from '../../../shared';

/**
 * Фасад таблицы клиентов
 */
@Injectable({
  providedIn: 'root'
})
export class ClientsFacade {
  public clients: WritableSignal<IClient[]> = signal<IClient[]>([]);
  public searchTerm: WritableSignal<string> = signal('');
  public searchError: WritableSignal<string> = signal('');
  public sortField: WritableSignal<string> = signal('user_id');
  public sortDirection: WritableSignal<TableSortDirectionType> = signal<TableSortDirectionType>(0);
  public isLoading: WritableSignal<boolean> = signal(false);
  public showClientModal: WritableSignal<boolean> = signal(false);
  public clientModalMode: WritableSignal<ClientDetailsMode> = signal(ClientDetailsMode.CREATE);
  public selectedClient: WritableSignal<IClient | null> = signal(null);
  public showPushModal: WritableSignal<boolean> = signal(false);
  public selectedClientIds: WritableSignal<number[]> = signal<number[]>([]);
  public selectedClientFio: WritableSignal<string> = signal<string>('');

  public filteredClients: Signal<IClient[]> = computed((): IClient[] => {
    const clientsList: IClient[] = this.clients();
    const field: string = this.sortField();
    const direction: TableSortDirectionType = this.sortDirection();

    if (direction === 0) {
      return clientsList;
    }

    return [...clientsList].sort((a: IClient, b: IClient): number => {
      let valueA: string | number | boolean = a[field as keyof IClient];
      let valueB: string | number | boolean = b[field as keyof IClient];

      if (valueA === undefined || valueA === null) valueA = '';
      if (valueB === undefined || valueB === null) valueB = '';

      if (typeof valueA === 'number' && typeof valueB === 'number') {
        return direction === 1 ? valueA - valueB : valueB - valueA;
      }

      if (typeof valueA === 'string' && typeof valueB === 'string') {
        return direction === 1
          ? valueA.localeCompare(valueB)
          : valueB.localeCompare(valueA);
      }
      return 0;
    });
  });

  private apiService: ApiService = inject(ApiService);
  private router: Router = inject(Router);
  private destroyRef: DestroyRef = inject(DestroyRef);
  private translate: TranslateService = inject(TranslateService);

  /**
   * Загрузка списка клиентов с учетом поискового запроса
   */
  public loadClients(): Observable<IClientsResponse> {
    if (this.isLoading()) {
      return of({
        meta: { size: 0, limit: 0, offset: 0 },
        passes: []
      });
    }

    this.isLoading.set(true);
    this.searchError.set('');

    return this.apiService.getClients(this.searchTerm()).pipe(
      takeUntilDestroyed(this.destroyRef),
      tap({
        next: (response: IClientsResponse) => {
          this.clients.set(response.passes);
          this.isLoading.set(false);

          if (this.searchTerm() && response.passes.length === 0) {
            this.searchError.set(this.translate.instant('APP.NO_CLIENTS'));
          }
        },
        error: (error) => {
          console.error('Error loading clients:', error);
          this.searchError.set(this.translate.instant('ERRORS.SEARCH_ERROR'));
          this.isLoading.set(false);
        }
      }),
      catchError(error => {
        this.isLoading.set(false);
        throw error;
      })
    );
  }

  /**
   * Обработка поискового запроса
   */
  public handleSearch(): void {
    if (this.searchTerm().trim().length === 0) {
      this.searchTerm.set('');
      this.searchError.set('');
      return;
    }

    if (this.searchTerm().trim().length < 1) {
      this.searchError.set(this.translate.instant('ERRORS.SEARCH_MIN_LENGTH'));
      return;
    }

    this.loadClients().subscribe();
  }

  /**
   * Обработка сортировки по полю
   *
   * @param field - поля для сортировки
   * @param direction - тип направления сортировки таблицы
   *
   */
  public handleSort(field: string, direction: TableSortDirectionType): void {
    if (this.sortField() === field) {
      this.sortDirection.set(direction);
    } else {
      this.sortField.set(field);
      this.sortDirection.set(1);
    }
  }

  /**
   * Получение текущего направления сортировки для поля
   *
   * @param  field - поля для сортировки
   */
  public getSortDirection(field: string): TableSortDirectionType {
    return this.sortField() === field ? this.sortDirection() : 0;
  }

  /**
   * Открытие модального окна создания клиента
   */
  public openCreateModal(): void {
    this.clientModalMode.set(ClientDetailsMode.CREATE);
    this.selectedClient.set(null);
    this.showClientModal.set(true);
  }

  /**
   * Открытие модального окна редактирования клиента
   *
   * @param client - Клиент
   */
  public openEditModal(client: IClient): void {
    this.clientModalMode.set(ClientDetailsMode.EDIT);
    this.selectedClient.set(client);
    this.showClientModal.set(true);
  }

  /**
   * Закрытие модального окна клиента
   */
  public closeClientModal(): void {
    this.showClientModal.set(false);
    this.selectedClient.set(null);
  }

  /**
   * Добавление нового клиента в список
   *
   * @param newClient - новый клиент
   */
  public addClient(newClient: IClient): void {
    this.clients.update((clients: IClient[]): IClient[] => [newClient, ...clients]);
    this.closeClientModal();
  }

  /**
   * Обновление данных клиента в списке
   *
   * @param updatedClient - обновленный клиент
  */
  public updateClient(updatedClient: IClient): void {
    this.clients.update((clients: IClient[]): IClient[] =>
      clients.map((client: IClient): IClient =>
        client.user_id === updatedClient.user_id ? updatedClient : client
      )
    );
    this.closeClientModal();
  }

  /**
   * Удаление клиента из списка
   *
   * @param clientId - id клиента
   */
  public removeClient(clientId: number): void {
    this.clients.update((clients: IClient[]): IClient[] =>
      clients.filter(((client: IClient): boolean => client.user_id !== clientId)
      ));
    this.closeClientModal();
  }

  /**
   * Открытие модального окна для отправки PUSH-уведомления
   *
   * @param clientIds - id'шники клиентов
   * @param clients - клиенты
   */
  public openPushModal(clientIds: number[], clients: IClient[]): void {
    const client: IClient | undefined = clients.find(c => c.user_id === clientIds[0]);
    if (client) {
      this.selectedClientIds.set(clientIds);
      this.selectedClientFio.set(client.fio || this.translate.instant('APP.CLIENT'));
      this.showPushModal.set(true);
    }
  }

  /**
   * Открытие модального окна PUSH из параметров роута
   *
   * @param clientId - id клиента
   * @param clients - клиенты
   */
  public openPushModalFromRoute(clientId: string, clients: IClient[]): boolean {
    const id: number = Number(clientId);
    if (!isNaN(id)) {
      const client: IClient | undefined = clients.find(c => c.user_id === id);
      if (client) {
        this.openPushModal([id], clients);
        return true;
      }
    }
    return false;
  }

  /**
   * Отправка PUSH-уведомления выбранным клиентам
   *
   * @param message - сообщение в пуше
   */
  public sendPush(message: string): Observable<any> {
    if (!message.trim()) {
      throw new Error(this.translate.instant('ERRORS.EMPTY_MESSAGE'));
    }

    return this.apiService.sendPush(this.selectedClientIds(), message).pipe(
      takeUntilDestroyed(this.destroyRef)
    );
  }

  /**
   * Закрытие модального окна отправки PUSH-уведомления
   */
  public closePushModal(): void {
    this.showPushModal.set(false);
    this.selectedClientIds.set([]);
    this.selectedClientFio.set('');
  }

  /**
   * Очистка поискового запроса
   */
  public clearSearch(): void {
    this.searchTerm.set('');
    this.searchError.set('');
    this.loadClients().subscribe();
  }

  /**
   * Обновление URL для PUSH-уведомления
   *
   * @param clientId - id клиента
   */
  public updatePushUrl(clientId: number): void {
    this.router.navigate([], {
      queryParams: { push: clientId },
      queryParamsHandling: 'merge',
      replaceUrl: true
    });
  }

  /**
   * Очистка URL от параметров PUSH
   */
  public clearPushUrl(): void {
    this.router.navigate([], {
      queryParams: { push: null },
      queryParamsHandling: 'merge',
      replaceUrl: true
    });
  }
}
