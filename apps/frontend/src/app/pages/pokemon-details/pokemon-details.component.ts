import { Component, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { PokemonService } from '@core/services/pokemon.service';
import type { Pokemon } from '@core/services/pokemon.model';

@Component({
  selector: 'app-pokemon-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pokemon-details.component.html',
  styleUrl: './pokemon-details.component.scss',
})
export class PokemonDetailsComponent {
  private route = inject(ActivatedRoute);
  public service = inject(PokemonService);
  private router = inject(Router);

  loading = signal(true);
  pokemon = signal<Pokemon | null>(null);
  owned = signal(false);

  constructor() {
    effect(() => {
      const id = Number(this.route.snapshot.paramMap.get('id'));
      if (id) this.load(id);
    });
  }

  private load(id: number) {
    this.loading.set(true);
    this.service.getById(id).subscribe({
      next: (data) => {
        this.pokemon.set(data);
        // Check if owned from the service cache
        const cachedPokemon = this.service.pokemons().find((p) => p.id === id);
        if (cachedPokemon) {
          this.owned.set(cachedPokemon.owned);
        }
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Failed to load Pokémon', err);
        this.loading.set(false);
      },
    });
  }

  toggleOwnership() {
    const id = this.pokemon()?.id;
    if (!id) return;

    this.service.toggleOwnership(id).subscribe({
      next: (response) => {
        this.owned.set(response.owned);
      },
    });
  }

  goBack() {
    this.router.navigate(['/pokedex']);
  }
}
