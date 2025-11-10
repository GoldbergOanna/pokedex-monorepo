import { dbPool } from "../db.ts";

/**
 * Handles direct DB operations for owned Pokémon.
 */
export class OwnershipRepository {
  //Check if a user already owns a specific Pokémon
  async isOwned(userId: string, pokemonId: number): Promise<boolean> {
    const { rows } = await dbPool.query(
      "SELECT 1 FROM owned_pokemon WHERE user_id = $1 AND pokemon_id = $2 LIMIT 1",
      [userId, pokemonId],
    );
    return rows.length > 0;
  }

  //Add multiple Pokémon as owned by the user at once
  async addMany(userId: string, pokemonIds: number[]): Promise<void> {
    if (!pokemonIds.length) return;

    // Use parameterized queries to prevent SQL injection
    const values = pokemonIds.map((_, i) => `($1, $${i + 2})`).join(",");
    const params = [userId, ...pokemonIds];

    await dbPool.query(
      `
      INSERT INTO owned_pokemon (user_id, pokemon_id)
      VALUES ${values}
      ON CONFLICT DO NOTHING;
    `,
      params,
    );
  }

  //Remove one Pokémon from the user's ownership
  async release(userId: string, pokemonId: number): Promise<void> {
    await dbPool.query(
      "DELETE FROM owned_pokemon WHERE user_id = $1 AND pokemon_id = $2",
      [userId, pokemonId],
    );
  }

  //Get all Pokémon IDs owned by the user
  async getUserOwnedIds(userId: string): Promise<number[]> {
    const res = await dbPool.query(
      "SELECT pokemon_id FROM owned_pokemon WHERE user_id = $1",
      [userId],
    );
    return res.rows.map((r) => r.pokemon_id as number);
  }
}
