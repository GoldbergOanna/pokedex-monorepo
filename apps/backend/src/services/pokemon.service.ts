import type {
  Pokemon,
  PokemonSummary,
  PokemonDetail,
  EvolutionMap,
} from "@pokedex/shared-types";
import { PokemonRepository } from "../repositories/pokemon.repo";
import { OwnershipRepository } from "../repositories/ownership.repo";

//service handling pokemon data retrieval and composition

export class PokemonService {
  constructor(
    private repo: PokemonRepository,
    private ownership: OwnershipRepository,
    private evoMap: EvolutionMap,
  ) {}

  async getSummaries(userId: string, page = 1, limit = 10, filters = {}) {
    const [pokemons, total] = this.repo.findAll(filters, page, limit);
    const ownedIds = await this.ownership.getUserOwnedIds(userId);

    const data: PokemonSummary[] = pokemons.map((p) => ({
      id: p.id,
      name: p.name.english,
      type: p.type,
      sprite: p.image.sprite,
      owned: ownedIds.includes(p.id),
    }));

    return {
      data,
      meta: {
        page,
        totalPages: Math.ceil(total / limit),
        total,
      },
    };
  }

  async getDetail(userId: string, id: number): Promise<PokemonDetail> {
    const pokemon = this.repo.findById(id);
    if (!pokemon) throw new Error("Not found");

    const ownedIds = await this.ownership.getUserOwnedIds(userId);
    const evolutionChain = this.getEvolutionChain(id).map((p) => ({
      id: p.id,
      name: p.name.english,
      type: p.type,
      sprite: p.image.sprite,
      owned: ownedIds.includes(p.id),
    }));

    return {
      id: pokemon.id,
      name: pokemon.name.english,
      type: pokemon.type,
      sprite: pokemon.image.sprite,
      owned: ownedIds.includes(pokemon.id),
      description: pokemon.description,
      species: pokemon.species,
      base: pokemon.base,
      profile: pokemon.profile,
      image: pokemon.image,
      evolutionChain,
    };
  }

  /**
   * Recursively collects all Pokemon in the evolution chain
   * Returns ordered list with current Pokemon first, then related evolutions
   */
  private getEvolutionChain(id: number): Pokemon[] {
    const chainIds = new Set<number>([id]);

    const collectRelatedIds = (pokemonId: number): void => {
      const relations = this.evoMap[pokemonId];
      if (!relations) return;

      const relatedIds = [...(relations.prev ?? []), ...(relations.next ?? [])];
      for (const relatedId of relatedIds) {
        if (!chainIds.has(relatedId)) {
          chainIds.add(relatedId);
          collectRelatedIds(relatedId);
        }
      }
    };

    collectRelatedIds(id);

    const chain = Array.from(chainIds)
      .map((chainId) => this.repo.findById(chainId))
      .filter((pokemon): pokemon is Pokemon => pokemon !== undefined)
      .sort((a, b) => a.id - b.id);

    return chain;
  }
}
