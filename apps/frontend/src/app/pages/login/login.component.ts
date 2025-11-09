import { CommonModule } from '@angular/common';
import { Component, inject, signal, computed } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '@core/auth/service/auth.service';

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

  toggleMode() {
    this.mode.update((currentMode) =>
      currentMode === 'login' ? 'register' : 'login',
    );
    this.error.set(null);
    this.loginForm.reset();
  }

  get name() {
    return this.loginForm.get('name')!;
  }

  get email() {
    return this.loginForm.get('email')!;
  }

  get password() {
    return this.loginForm.get('password')!;
  }

  async onSubmit() {
    if (this.loginForm.invalid) return;
    this.loading.set(true);
    this.error.set(null);

    const { name, email, password } = this.loginForm.getRawValue();

    try {
      if (this.mode() === 'login') {
        this.authService
          .login(email, password)
          .subscribe(() => this.router.navigate(['/pokedex']));
      } else {
        this.authService
          .register(name!, email, password)
          .subscribe(() => this.router.navigate(['/login']));
      }
    } catch {
      this.error.set(
        this.mode() === 'login'
          ? 'Login failed. Please check your credentials.'
          : 'Registration failed. Please try again.',
      );
    } finally {
      this.loading.set(false);
    }
  }
}
