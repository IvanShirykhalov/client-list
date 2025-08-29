import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services';

/**
 * Гуард для защиты маршрутов, требующих аутентификации
 */
@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) {
  }

  /**
   * Проверяет, может ли маршрут быть активирован
   */
  public canActivate(): boolean {
    if (this.authService.isAuthenticated()) {
      return true;
    } else {
      this.router.navigate(['/login']).then();
      return false;
    }
  }
}
