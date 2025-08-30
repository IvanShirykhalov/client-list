import { AfterViewInit, Component, DestroyRef, inject, OnInit, ViewChild } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService, LanguageSwitcherComponent, NotificationComponent } from '../shared';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NotificationService } from '../shared/services/notification.service';

@Component({
  selector: 'app-root',
  template: `
    <div class="app-container">
      @if (authService.isAuthenticated()) {
        <nav class="navbar">
          <div class="nav-content">
            <h1>{{ 'APP.TITLE' | translate }}</h1>
            <div class="nav-actions">
              <app-language-switcher></app-language-switcher>
              <button (click)="logout()" class="btn btn-primary">
                {{ 'APP.LOGOUT' | translate }}
              </button>
            </div>
          </div>
        </nav>
      }
      <main>
        <router-outlet></router-outlet>
        <app-notification #notificationComponent></app-notification>
      </main>
    </div>
  `,
  imports: [
    CommonModule,
    RouterOutlet,
    TranslateModule,
    LanguageSwitcherComponent,
    NotificationComponent
  ],
  standalone: true
})
export class AppComponent implements OnInit, AfterViewInit {
  @ViewChild('notificationComponent', { static: false })
  public notificationComponent!: NotificationComponent;

  public authService: AuthService = inject(AuthService);
  private router: Router = inject(Router);
  private translate: TranslateService = inject(TranslateService);
  private destroyRef: DestroyRef = inject(DestroyRef);
  private notificationService: NotificationService = inject(NotificationService);

  public ngOnInit(): void {
    this.translate.use('ru')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        console.log('Translations loaded');
      });
  }

  public ngAfterViewInit(): void {
    // Важно: регистрируем компонент после инициализации представления
    if (this.notificationComponent) {
      this.notificationService.registerComponent(this.notificationComponent);
      console.log('Notification component registered');
    } else {
      console.error('Notification component not found');
    }
  }

  protected logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
