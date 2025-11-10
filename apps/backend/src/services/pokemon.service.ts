import type {
  Pokemon,
  PokemonSummary,
  PokemonDetail,
} from "../models/pokemon.types";
import type { EvolutionMap } from "../models/pokemon.types";
import { PokemonRepository } from "../repositories/pokemon.repo";
import { OwnershipRepository } from "../repositories/ownership.repo";

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

  private getEvolutionChain(id: number): Pokemon[] {
    const chainIds = new Set<number>();
    const collect = (pid: number) => {
      const { prev = [], next = [] } = this.evoMap[pid] ?? {};
      for (const rel of [...prev, ...next]) {
        if (!chainIds.has(rel)) {
          chainIds.add(rel);
          collect(rel);
        }
      }
    };
    collect(id);
    const allIds = [id, ...chainIds];
    return this.repo
      .findAll()
      .flat()[0]
      .filter((p) => allIds.includes(p.id));
  }
}
