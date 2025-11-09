import { Routes } from '@angular/router';
import { inject } from '@angular/core';
import { AuthGuard } from '@core/auth/guard/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('@features/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'pokedex',
    canActivate: [() => inject(AuthGuard).canActivate()],
    loadComponent: () =>
      import('@features/pokedex/pokedex.component').then(
        (m) => m.PokedexComponent,
      ),
  },
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'pokedex',
  },
  {
    path: '**',
    redirectTo: 'pokedex',
  },
];
