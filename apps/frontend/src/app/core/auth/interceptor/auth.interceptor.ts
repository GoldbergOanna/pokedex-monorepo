import { HttpHandlerFn, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '@core/auth/service/auth.service';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (
  req,
  next: HttpHandlerFn,
) => {
  const authservice = inject(AuthService);
  const accessToken = authservice.getAccessToken();

  const cloned = accessToken
    ? req.clone({ setHeaders: { Authorization: `Bearer ${accessToken}` } })
    : req;

  return next(cloned).pipe(
    catchError((error: unknown) => {
      if (error instanceof Response && error.status === 401) {
        authservice.logout();
      }
      return throwError(() => error);
    }),
  );
};
