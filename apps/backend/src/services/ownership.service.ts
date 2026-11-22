import type { EvolutionMap } from "@pokedex/shared-types";
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
    try {
      const alreadyOwned = await this.repo.isOwned(userId, pokemonId);

      if (alreadyOwned) {
        await this.repo.release(userId, pokemonId);
        return { owned: false, updated: [pokemonId] };
      }

      const toInsert = [pokemonId, ...findPreEvolutions(pokemonId, this.evoMap)];
      await this.repo.addMany(userId, toInsert);
      return { owned: true, updated: toInsert };
    } catch (error) {
      console.error(
        `Error in toggleOwned for userId=${userId}, pokemonId=${pokemonId}:`,
        error,
      );
      throw error;
    }
  }

  isKnownPokemon(pokemonId: number): boolean {
    return pokemonId in this.evoMap;
  }

  async getUserOwned(userId: string) {
    return this.repo.getUserOwnedIds(userId);
  }
}
