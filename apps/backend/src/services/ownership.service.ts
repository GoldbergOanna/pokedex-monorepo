import type { EvolutionMap } from "../models/pokemon.types";
import { findPreEvolutions } from "../utils/evolution.utils.ts";
import { OwnershipRepository } from "../repositories/ownership.repo.ts";

export class OwnershipService {
  private readonly evoMap: EvolutionMap;
  private readonly repo: OwnershipRepository;

  constructor(evoMap: EvolutionMap, repo?: OwnershipRepository) {
    this.evoMap = evoMap;
    this.repo = repo ?? new OwnershipRepository();
  }

  async toggleOwned(userId: string, pokemonId: number) {
    const alreadyOwned = await this.repo.isOwned(userId, pokemonId);

    if (alreadyOwned) {
      await this.repo.release(userId, pokemonId);
      return { owned: false, updated: [pokemonId] };
    }

    const preEvos = findPreEvolutions(pokemonId, this.evoMap);
    const toInsert = [pokemonId, ...preEvos];
    await this.repo.addMany(userId, toInsert);

    return { owned: true, updated: toInsert };
  }

  async getUserOwned(userId: string) {
    return this.repo.getUserOwnedIds(userId);
  }
}
