import type { PokemonSummary } from '@pokedex/shared-types';

export interface PokemonPage {
  data: PokemonSummary[];
  page: number;
  totalPages: number;
  totalCount: number;
}
