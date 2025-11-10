import type { Pokemon, PokemonFilters } from "@pokedex/shared-types";
export class PokemonRepository {
  private pokemons: Pokemon[];

  constructor(pokemons: Pokemon[]) {
    this.pokemons = pokemons;
  }

  findAll(
    filters: PokemonFilters = {},
    page = 1,
    limit = 10,
  ): [Pokemon[], number] {
    let result = [...this.pokemons];

    if (filters.search) {
      const term = filters.search.toLowerCase();
      result = result.filter((p) =>
        p.name.english.toLowerCase().includes(term),
      );
    }

    if (filters.type) {
      result = result.filter((p) => p.type.includes(filters.type ?? ""));
    }

    const total = result.length;
    const start = (page - 1) * limit;
    const paged = result.slice(start, start + limit);

    return [paged, total];
  }

  findById(id: number): Pokemon | undefined {
    return this.pokemons.find((p) => p.id === id);
  }
}
