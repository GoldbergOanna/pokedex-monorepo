import { Component, inject, effect, untracked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { formToSignal } from '@shared/form.utils';
import { PokemonCardComponent } from '@shared/pokemon-card/pokemon-card.component';
import { PokemonService } from '@core/services/pokemon.service';

@Component({
  selector: 'app-cards-list',
  imports: [CommonModule, ReactiveFormsModule, PokemonCardComponent],
  templateUrl: './cards-list.component.html',
  styleUrl: './cards-list.component.scss',
})
export class CardsListComponent {
  private pokemonService = inject(PokemonService);
  private form = inject(FormBuilder);

  filterForm = this.form.group({
    search: [''],
    type: [''],
    tier: [''],
    description: [''],
  });

  pokemons = this.pokemonService.pokemons;
  loading = this.pokemonService.loading;
  page = this.pokemonService.currentpage;
  totalPages = this.pokemonService.totalPages;

  // Sync filter changes to service query (debounced for better UX)
  private filtersSignal = formToSignal(this.filterForm);

  constructor() {
    // Load initial data immediately, then react to filter changes
    this.pokemonService.updateQuery({
      ...untracked(this.filtersSignal),
      page: 1,
      limit: 20,
    });

    // React to subsequent filter changes
    effect(() => {
      const filters = this.filtersSignal();
      if (filters) {
        this.pokemonService.updateQuery({
          ...filters,
          page: 1,
          limit: 20,
        });
      }
    });
  }

  previousPage() {
    if (this.page() > 1) {
      this.pokemonService.updateQuery({ page: this.page() - 1 });
    }
  }

  nextPage() {
    if (this.page() < this.totalPages()) {
      this.pokemonService.updateQuery({ page: this.page() + 1 });
    }
  }
}
