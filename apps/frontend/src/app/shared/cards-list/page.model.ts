import { Pokemon } from '../../core/services/pokemon.model';

export interface PokemonPage {
  data: Pokemon[];
  page: number;
  totalPages: number;
  totalCount: number;
}
