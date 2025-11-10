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
  private readonly _userName = signal<string | null>(
    localStorage.getItem('userName'),
  );

  readonly isAuthenticated = computed(() => !!this._isAuthenticated());

  login(email: string, password: string) {
    return this.api.post<LoginResponse>('auth/login', { email, password }).pipe(
      tap(({ accessToken, name }) => {
        this._isAuthenticated.set(accessToken);
        localStorage.setItem('accessToken', accessToken);
        if (name) {
          this._userName.set(name);
          localStorage.setItem('userName', name);
        }
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
        tap(({ accessToken, name: userName }) => {
          if (accessToken) {
            this._isAuthenticated.set(accessToken);
            localStorage.setItem('accessToken', accessToken);
            if (userName) {
              this._userName.set(userName);
              localStorage.setItem('userName', userName);
            }
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
    this._userName.set(null);
    localStorage.removeItem('accessToken');
    localStorage.removeItem('userName');
  }

  getAccessToken(): string | null {
    return this._isAuthenticated();
  }

  getUserName(): string | null {
    return this._userName();
  }
}
