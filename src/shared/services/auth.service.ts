import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { LoginResponse } from '../models';

/**
 * Сервис для управления аутентификацией пользователя
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly authTokenSubject: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);

  constructor(private readonly http: HttpClient) {
    const savedToken: string | null = localStorage.getItem('authToken');
    if (savedToken) {
      this.authTokenSubject.next(savedToken);
    }
  }

  /**
   * Выполняет аутентификацию пользователя
   *
   * @param login - логин пользователя
   * @param password - пароль пользователя
   */
  public login(login: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(
      'https://api.teyca.ru/test-auth-only',
      { login, password }
    ).pipe(
      tap((response: LoginResponse): void => {
        if (response && response.auth_token) {
          this.setAuthToken(response.auth_token);
        }
      })
    );
  }

  /**
   * Выполняет выход пользователя из системы
   */
  public logout(): void {
    this.authTokenSubject.next(null);
    localStorage.removeItem('authToken');
  }

  /**
   * Получает текущий токен аутентификации
   */
  public getToken(): string | null {
    return this.authTokenSubject.value;
  }

  /**
   * Проверяет, аутентифицирован ли пользователь
   */
  public isAuthenticated(): boolean {
    return !!this.authTokenSubject.value;
  }

  /**
   * Устанавливает токен аутентификации
   *
   * @param token - токен аутентификации
   */
  private setAuthToken(token: string): void {
    this.authTokenSubject.next(token);
    localStorage.setItem('authToken', token);
    console.log('Auth token received and saved:', token);
  }
}
