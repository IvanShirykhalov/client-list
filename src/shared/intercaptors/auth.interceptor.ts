import { HttpRequest, HttpHandlerFn, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { inject } from '@angular/core';
import { AuthService } from '../services';

/**
 *
 * @param req
 * @param next
 */
export function authInterceptor(
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> {
  const authService: AuthService = inject(AuthService);
  const token: string | null = authService.getToken();

  if (req.url.includes('test-auth-only')) {
    return next(req);
  }

  if (token) {
    const authReq: HttpRequest<unknown> = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`)
    });
    return next(authReq);
  }

  return next(req);
}
