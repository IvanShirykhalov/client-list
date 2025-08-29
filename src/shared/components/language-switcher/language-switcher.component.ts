import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

type languageType = 'ru' | 'en';

/**
 * Компонент переключения языка
 */
@Component({
  selector: 'app-language-switcher',
  templateUrl: './language-switcher.component.html',
  styleUrl: './language-switcher.component.scss',
  imports: [CommonModule],
  standalone: true
})
export class LanguageSwitcherComponent implements OnInit {
  protected currentLang: string = 'ru';

  private destroyRef: DestroyRef = inject(DestroyRef);
  private translate: TranslateService = inject(TranslateService);

  /**
   * @inheritDoc
   */
  public ngOnInit(): void {
    this.currentLang = this.translate.currentLang || 'ru';

    this.translate.onLangChange.subscribe(event => {
      this.currentLang = event.lang;
    });
  }

  /**
   * Смена языка
   */
  protected toggleLanguage(): void {
    const newLang: languageType = this.currentLang === 'ru' ? 'en' : 'ru';
    this.translate.use(newLang)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((): void => {
      console.log(`Language changed to ${newLang}`);
    });
  }
}
