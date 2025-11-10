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
    try {
      const alreadyOwned = await this.repo.isOwned(userId, pokemonId);

      if (alreadyOwned) {
        await this.repo.release(userId, pokemonId);
        return { owned: false, updated: [pokemonId] };
      }

      const preEvos = findPreEvolutions(pokemonId, this.evoMap);
      const toInsert = [pokemonId, ...preEvos];

      // Validate that all Pokemon IDs exist in the evolution map
      const invalidIds = toInsert.filter((id) => !this.evoMap[id]);
      if (invalidIds.length > 0) {
        console.warn(`Invalid Pokemon IDs found: ${invalidIds.join(", ")}`);
        // Filter out invalid IDs before inserting
        const validIds = toInsert.filter((id) => this.evoMap[id]);
        if (validIds.length === 0) {
          throw new Error(
            `No valid Pokemon IDs to insert for Pokemon #${pokemonId}`,
          );
        }
        await this.repo.addMany(userId, validIds);
        return { owned: true, updated: validIds };
      }

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

  async getUserOwned(userId: string) {
    return this.repo.getUserOwnedIds(userId);
  }
}
