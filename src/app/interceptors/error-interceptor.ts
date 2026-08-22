import { HttpErrorResponse, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, catchError, finalize, shareReplay, switchMap, throwError } from 'rxjs';
import { AuthResponse } from '../Models/Auth';
import { AuthService } from '../services/auth-service';
import { errorMessage } from '../utils/http-error';

// Module-scoped (not per-call) so concurrent 401s from several in-flight requests share one
// refresh call instead of each firing their own — the refresh token is single-use, so a second
// concurrent call would just invalidate the first's result.
let refreshInProgress$: Observable<AuthResponse> | null = null;

// Auth endpoints are excluded from the refresh-and-retry dance: a 401 from login/register is a
// real credentials failure, and a 401 from refresh/revoke means the refresh token itself is
// dead — retrying either through refresh() would only loop.
const AUTH_ENDPOINTS = ['/Auth/login', '/Auth/register', '/Auth/refresh', '/Auth/revoke'];

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      const isAuthEndpoint = AUTH_ENDPOINTS.some((path) => req.url.includes(path));

      if (err.status === 401 && !isAuthEndpoint && authService.token) {
        return refreshAndRetry(req, next, authService, router);
      }

      console.error(errorMessage(err));

      if (err.status === 401) {
        authService.logout();
        router.navigate(['/login']);
      }

      return throwError(() => err);
    }),
  );
};

function refreshAndRetry(
  req: HttpRequest<unknown>,
  next: Parameters<HttpInterceptorFn>[1],
  authService: AuthService,
  router: Router,
) {
  if (!refreshInProgress$) {
    refreshInProgress$ = authService.refresh().pipe(
      shareReplay(1),
      finalize(() => (refreshInProgress$ = null)),
    );
  }

  return refreshInProgress$.pipe(
    switchMap((auth) => {
      const retried = req.clone({ setHeaders: { Authorization: `Bearer ${auth.token}` } });
      return next(retried);
    }),
    catchError((refreshErr: HttpErrorResponse) => {
      console.error(errorMessage(refreshErr));
      authService.logout();
      router.navigate(['/login']);
      return throwError(() => refreshErr);
    }),
  );
}
