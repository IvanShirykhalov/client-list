import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter, Routes } from '@angular/router';
import { HttpClient, provideHttpClient, withFetch } from '@angular/common/http';
import { AppComponent } from './app/app.component';
import { LoginComponent } from './app/login';
import { AuthGuard } from './shared';
import { ClientsComponent, ClientDetailsComponent } from './features';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { importProvidersFrom } from '@angular/core';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TRANSLATE_HTTP_LOADER_CONFIG } from '@ngx-translate/http-loader';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: 'clients',
    children: [
      { path: '', component: ClientsComponent, canActivate: [AuthGuard] },
      { path: 'create', component: ClientDetailsComponent, canActivate: [AuthGuard] },
      { path: 'push/:id', component: ClientsComponent, canActivate: [AuthGuard] }
    ]
  },
  { path: '', redirectTo: '/clients', pathMatch: 'full' },
  { path: '**', redirectTo: '/clients' }
];

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    provideHttpClient(withFetch()),
    AuthGuard,
    {
      provide: TRANSLATE_HTTP_LOADER_CONFIG,
      useValue: {
        prefix: './assets/i18n/',
        suffix: '.json'
      }
    },
    importProvidersFrom(
      TranslateModule.forRoot({
        loader: {
          provide: TranslateLoader,
          useClass: TranslateHttpLoader,
          deps: [HttpClient, TRANSLATE_HTTP_LOADER_CONFIG]
        },
        defaultLanguage: 'ru'
      })
    )
  ]
}).catch(err => console.error(err));
