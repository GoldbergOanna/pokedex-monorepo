import {
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpErrorResponse,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '@core/auth/service/auth.service';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (
  req,
  next: HttpHandlerFn,
) => {
  const authservice = inject(AuthService);
  const router = inject(Router);
  const accessToken = authservice.getAccessToken();

  const cloned = accessToken
    ? req.clone({ setHeaders: { Authorization: `Bearer ${accessToken}` } })
    : req;

  return next(cloned).pipe(
    catchError((error: unknown) => {
      // Handle expired or invalid token
      if (error instanceof HttpErrorResponse && error.status === 401) {
        authservice.logout();
        router.navigate(['/login']);
      }
      return throwError(() => error);
    }),
  );
};
