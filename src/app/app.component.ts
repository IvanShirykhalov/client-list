import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService, LanguageSwitcherComponent } from '../shared';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

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
      </main>
    </div>
  `,
  imports: [
    CommonModule,
    RouterOutlet,
    TranslateModule,
    LanguageSwitcherComponent
  ],
  standalone: true
})
export class AppComponent implements OnInit {
  public authService: AuthService = inject(AuthService);
  private router: Router = inject(Router);
  private translate: TranslateService = inject(TranslateService);
  private destroyRef: DestroyRef = inject(DestroyRef);


  /**
   * @inheritDoc
   */
  public ngOnInit(): void {
    this.translate.use('ru')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        console.log('Translations loaded');
      });
  }

  /**
   * Разлогиниться
   */
  protected logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
