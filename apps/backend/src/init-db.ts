import type { PoolClient } from "pg";
import { dbPool } from "./db.ts";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import type { Pokemon } from "@pokedex/shared-types";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SEED_BATCH_SIZE = 200;
const POKEMON_COLUMNS = [
  "id",
  "name",
  "type",
  "base",
  "species",
  "description",
  "evolution",
  "profile",
  "image",
] as const;

// Idempotent: safe to run on every container start without losing data.
const createTables = (client: PoolClient) =>
  client.query(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS pokemon (
      id INT PRIMARY KEY,
      name JSONB NOT NULL,
      type TEXT[] NOT NULL,
      base JSONB,
      species TEXT,
      description TEXT,
      evolution JSONB,
      profile JSONB,
      image JSONB
    );

    CREATE TABLE IF NOT EXISTS owned_pokemon (
      user_id TEXT NOT NULL,
      pokemon_id INT NOT NULL,
      PRIMARY KEY (user_id, pokemon_id),
      FOREIGN KEY (pokemon_id) REFERENCES pokemon(id)
    );
  `);

const isPokemonSeeded = async (client: PoolClient): Promise<boolean> => {
  const { rows } = await client.query<{ seeded: boolean }>(
    "SELECT EXISTS (SELECT 1 FROM pokemon) AS seeded",
  );
  return rows[0].seeded;
};

const loadPokemonData = async (): Promise<Pokemon[]> => {
  const filePath = path.resolve(__dirname, "data", "Pokedex.json");
  return JSON.parse(await fs.readFile(filePath, "utf8")) as Pokemon[];
};

const toRowValues = (pokemon: Pokemon) => [
  pokemon.id,
  JSON.stringify(pokemon.name),
  pokemon.type,
  JSON.stringify(pokemon.base ?? {}),
  pokemon.species ?? "",
  pokemon.description ?? "",
  JSON.stringify(pokemon.evolution ?? {}),
  JSON.stringify(pokemon.profile ?? {}),
  JSON.stringify(pokemon.image ?? {}),
];

const insertPokemonBatch = (client: PoolClient, batch: Pokemon[]) => {
  const columnCount = POKEMON_COLUMNS.length;
  const placeholders = batch
    .map((_, row) => {
      const rowParams = POKEMON_COLUMNS.map(
        (_, col) => `$${row * columnCount + col + 1}`,
      );
      return `(${rowParams.join(", ")})`;
    })
    .join(", ");

  return client.query(
    `INSERT INTO pokemon (${POKEMON_COLUMNS.join(", ")}) VALUES ${placeholders}`,
    batch.flatMap(toRowValues),
  );
};

const seedPokemon = async (client: PoolClient, pokemons: Pokemon[]) => {
  for (let start = 0; start < pokemons.length; start += SEED_BATCH_SIZE) {
    const batch = pokemons.slice(start, start + SEED_BATCH_SIZE);
    await insertPokemonBatch(client, batch);
    console.log(`Inserted ${start + batch.length}/${pokemons.length}`);
  }
};

const init = async () => {
  // A transaction must run on a single connection, not across the pool.
  const client = await dbPool.connect();
  try {
    await client.query("BEGIN");
    await createTables(client);

    if (await isPokemonSeeded(client)) {
      console.log("Database already seeded, skipping.");
    } else {
      const pokemons = await loadPokemonData();
      console.log(`Seeding ${pokemons.length} Pokémon...`);
      await seedPokemon(client, pokemons);
    }

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
    await dbPool.end();
  }
};

init().catch((error) => {
  console.error("Error during database initialization:", error);
  process.exit(1);
});
