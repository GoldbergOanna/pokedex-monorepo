import { Routes } from '@angular/router';
import { AuthGuard } from '@core/auth/guard/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('@pages/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'register',
    loadComponent: () =>
      import('@pages/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'pokedex',
    canActivate: [AuthGuard],
    loadComponent: () =>
      import('@pages/pokedex/pokedex.component').then(
        (m) => m.PokedexComponent,
      ),
  },
  {
    path: 'pokedex/:id',
    canActivate: [AuthGuard],
    loadComponent: () =>
      import('@pages/pokemon-details/pokemon-details.component').then(
        (m) => m.PokemonDetailsComponent,
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
