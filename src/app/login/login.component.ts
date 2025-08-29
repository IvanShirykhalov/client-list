import { Component, DestroyRef, inject } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService, LanguageSwitcherComponent } from '../../shared';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

/**
 * Компонент для авторизации пользователя
 */
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  imports: [CommonModule, FormsModule, LanguageSwitcherComponent, TranslateModule],
  standalone: true
})
export class LoginComponent {
  public login: string = '';
  public password: string = '';
  public loading: boolean = false;
  public error: string = '';
  public success: boolean = false;

  private destroyRef: DestroyRef = inject(DestroyRef);

  constructor(
    private authService: AuthService,
    private router: Router,
    private translate: TranslateService
  ) {
  }

  /**
   * Обработчик отправки формы авторизации
   */
  public onSubmit(): void {
    this.loading = true;
    this.error = '';
    this.success = false;

    this.authService.login(this.login, this.password)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (apiToken) => {
          console.log('Login successful, API token:', apiToken);
          this.success = true;
          this.router.navigate(['/clients']);
        },
        error: (error) => {
          console.error('Login error:', error);
          this.error = this.translate.instant('ERRORS.LOGIN_ERROR') + ': ' +
            (error.message || this.translate.instant('ERRORS.UNKNOWN_ERROR'));
          this.loading = false;
        },
        complete: () => {
          this.loading = false;
        }
      });
  }
}
