import { CommonModule } from '@angular/common';
import { Component, inject, signal, computed, effect } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '@core/auth/service/auth.service';
import { LoginResponse } from '@core/core.types';
import { Observable } from 'rxjs';

type AuthMode = 'login' | 'register';
@Component({
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  private formBuilder = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  mode = signal<AuthMode>('login');
  loading = signal(false);
  error = signal<string | null>(null);

  loginForm = this.formBuilder.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  readonly title = computed(() => {
    return this.mode() === 'login' ? 'Welcome Back' : 'Create an Account';
  });

  constructor() {
    effect(() => {
      const path = this.route.snapshot.routeConfig?.path;
      if (path === 'register') this.mode.set('register');
      else this.mode.set('login');
    });
  }

  toggleMode() {
    const nextMode = this.mode() === 'login' ? 'register' : 'login';
    this.mode.set(nextMode);
    this.error.set(null);
    this.loginForm.reset();

    //navigate without full reload
    this.router.navigate([`/${nextMode}`]);
  }

  get controls() {
    return this.loginForm.controls;
  }

  async onSubmit() {
    if (this.loginForm.invalid) return;
    this.loading.set(true);
    this.error.set(null);

    const { name, email, password } = this.loginForm.getRawValue();
    const isLogin = this.mode() === 'login';

    const action$ = isLogin
      ? this.authService.login(email, password)
      : this.authService.register(name!, email, password);

    const successRedirect = isLogin ? '/pokedex' : '/login';
    const errorMessage = isLogin
      ? 'Login failed. Please check your credentials.'
      : 'Registration failed. Please try again.';

    this.handleAuth(action$, successRedirect, errorMessage);
  }

  private handleAuth(
    action$: Observable<LoginResponse | null>,
    successPath: string,
    errorText: string,
  ) {
    action$.subscribe({
      next: () => this.router.navigate([successPath]),
      error: () => this.error.set(errorText),
      complete: () => this.loading.set(false),
    });
  }
}
