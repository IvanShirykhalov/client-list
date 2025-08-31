import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { AuthService } from '../../../shared';
import { IClient, IClientsResponse } from '../core';

/**
 * Репозиторий клиентов
 */
@Injectable({ providedIn: 'root' })
export class ClientsRepository {
  private readonly baseUrl: string = 'https://api.teyca.ru/v1';

  constructor(
    private readonly http: HttpClient,
    private readonly authService: AuthService
  ) {
  }

  /**
   * Получает список клиентов с возможностью поиска и пагинации
   *
   * @param searchTerm - поисковый запрос (телефон или город)
   * @param limit - количество записей на странице (по умолчанию 1000)
   * @param offset - смещение для пагинации (по умолчанию 0)
   */
  public getClients(searchTerm?: string, limit: number = 1000, offset: number = 0): Observable<IClientsResponse> {
    const token: string = this.getToken();

    let params: HttpParams = new HttpParams()
      .set('limit', limit.toString())
      .set('offset', offset.toString());

    if (searchTerm && searchTerm.trim().length > 0) {
      const formattedSearch: string = this.formatSearchQuery(searchTerm.trim());
      params = params.set('search', formattedSearch);
    }

    return this.http.get<IClientsResponse>(
      `${this.baseUrl}/${token}/passes`,
      {
        params,
        headers: this.getHeaders()
      }
    ).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('API Error:', error);
        if (error.status === 400) {
          return of({
            meta: {
              size: 0,
              limit: limit,
              offset: offset
            },
            passes: []
          });
        }
        return throwError(() => error);
      })
    );
  }

  /**
   * Создает нового клиента
   */
  public createClient(clientData: Partial<IClient>): Observable<IClient> {
    const token: string = this.getToken();

    const apiData: Partial<IClient> = this.prepareClientData(clientData);

    return this.http.post<IClient>(
      `${this.baseUrl}/${token}/passes`,
      apiData,
      { headers: this.getHeaders() }
    ).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('Create client failed:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Обновляет данные клиента
   */
  public updateClient(userId: number, clientData: Partial<IClient>): Observable<IClient> {
    const token: string = this.getToken();
    const apiData: Partial<IClient> = this.prepareClientData(clientData);

    return this.http.put<IClient>(
      `${this.baseUrl}/${token}/passes/${userId}`,
      apiData,
      { headers: this.getHeaders() }
    ).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('Update client failed:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Удаляет клиента
   */
  public deleteClient(userId: number): Observable<void> {
    const token: string = this.getToken();

    return this.http.delete<void>(
      `${this.baseUrl}/${token}/passes/${userId}`,
      { headers: this.getHeaders() }
    ).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('Delete client failed:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Получает данные конкретного клиента
   */
  public getClient(userId: number): Observable<IClient> {
    const token: string = this.getToken();

    return this.http.get<IClient>(
      `${this.baseUrl}/${token}/passes/${userId}`,
      { headers: this.getHeaders() }
    ).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('Get client failed:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Отправляет push-уведомление клиентам
   *
   * @param userIds - массив идентификаторов пользователей
   * @param message - текст сообщения для отправки
   */
  public sendPush(userIds: number[], message: string): Observable<{ success: boolean; message?: string }> {
    const token: string = this.getToken();

    return this.http.post<{ success: boolean; message?: string }>(
      `${this.baseUrl}/${token}/message/push`,
      {
        user_id: userIds.join(','),
        push_message: message,
      },
      {
        headers: this.getHeaders()
      }
    ).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('Send push failed:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Подготавливает данные клиента для API
   */
  private prepareClientData(clientData: Partial<IClient>): Partial<IClient> {
    const { fio, first_name, last_name, pat_name, ...rest } = clientData;

    let firstName: string | undefined = first_name;
    let lastName: string | undefined = last_name;
    let patronymic: string | undefined = pat_name;

    if (fio && !first_name) {
      const fioParts: string[] = fio.split(' ');
      if (fioParts.length >= 2) {
        lastName = fioParts[0];
        firstName = fioParts[1];
        patronymic = fioParts.length > 2 ? fioParts[2] : '';
      }
    }

    return {
      template: clientData.template || 'Тестовый',
      first_name: firstName,
      last_name: lastName,
      pat_name: patronymic,
      phone: clientData.phone,
      email: clientData.email,
      birthday: clientData.birthday,
      gender: clientData.gender,
      barcode: clientData.barcode,
      discount: clientData.discount,
      bonus: clientData.bonus,
      loyalty_level: clientData.loyalty_level,
      city: clientData.city,
      car_number: clientData.car_number,
      key3: clientData.key3,
      key4: clientData.key4,
      key5: clientData.key5,
      key6: clientData.key6
    };
  }

  /**
   * Форматирует поисковый запрос в соответствии с API
   */
  private formatSearchQuery(searchTerm: string): string {
    const cleanTerm: string = searchTerm.trim();

    if (/^\d+$/.test(cleanTerm)) {
      return `phone=${cleanTerm}`;
    }

    if (/[a-zA-Zа-яА-Я]/.test(cleanTerm)) {
      return `city=${cleanTerm}`;
    }

    return `phone=${cleanTerm}`;
  }

  /**
   * Получает токен аутентификации
   */
  private getToken(): string {
    const token: string | null = this.authService.getToken();
    if (!token) {
      throw new Error('No auth token');
    }
    return token;
  }

  /**
   * Создает заголовки HTTP запроса с авторизацией
   */
  private getHeaders(): HttpHeaders {
    const token: string = this.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': token
    });
  }
}
