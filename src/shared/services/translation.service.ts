import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

/**
 * Сервис для смены языка
 */
@Injectable({
  providedIn: 'root'
})
export class TranslationService {
  constructor(private translate: TranslateService) {
    this.translate.setDefaultLang('ru');
    this.translate.use('ru').subscribe(() => {
      console.log('Russian translations loaded');
    });
  }
}
