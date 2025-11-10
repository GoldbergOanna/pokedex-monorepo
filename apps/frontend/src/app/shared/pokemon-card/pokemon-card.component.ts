import { Component, inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import type { PokemonSummary } from '@pokedex/shared-types';
import { Router } from '@angular/router';
import { PokemonService } from '@core/services/pokemon.service';
@Component({
  selector: 'app-pokemon-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pokemon-card.component.html',
  styleUrl: './pokemon-card.component.scss',
})
export class PokemonCardComponent {
  @Input({ required: true }) pokemon!: PokemonSummary;

  private router = inject(Router);
  public pokemonService = inject(PokemonService);

  toggleOwnership() {
    this.pokemonService.toggleOwnership(this.pokemon.id).subscribe();
  }

  goToPokemonPage() {
    this.router.navigate(['/pokedex', this.pokemon.id]);
  }
}
