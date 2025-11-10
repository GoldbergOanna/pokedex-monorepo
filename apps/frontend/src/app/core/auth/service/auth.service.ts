import { Injectable, signal, computed, inject } from '@angular/core';
import { tap, catchError, throwError } from 'rxjs';
import { ApiService } from '@core/api/api.service';
import type { LoginResponse } from '@core/core.types';
import { HttpErrorResponse } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly api = inject(ApiService);

  //auth signals
  private readonly _isAuthenticated = signal<string | null>(
    localStorage.getItem('accessToken'),
  );

  readonly isAuthenticated = computed(() => !!this._isAuthenticated());

  login(email: string, password: string) {
    return this.api.post<LoginResponse>('auth/login', { email, password }).pipe(
      tap(({ accessToken }) => {
        this._isAuthenticated.set(accessToken);
        localStorage.setItem('accessToken', accessToken);
      }),
      catchError((error) => {
        console.error('Login failed', error);
        return throwError(() => error);
      }),
    );
  }

  register(name: string, email: string, password: string) {
    return this.api
      .post<LoginResponse>('auth/register', { name, email, password })
      .pipe(
        tap(({ accessToken }) => {
          if (accessToken) {
            this._isAuthenticated.set(accessToken);
            localStorage.setItem('accessToken', accessToken);
          }
        }),
        catchError((error: HttpErrorResponse) => {
          console.error('Registration failed', error);
          return throwError(() => error);
        }),
      );
  }

  logout() {
    this._isAuthenticated.set(null);
    localStorage.removeItem('accessToken');
  }

  getAccessToken(): string | null {
    return this._isAuthenticated();
  }
}
