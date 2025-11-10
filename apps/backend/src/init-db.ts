import { dbPool } from "./db.ts";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import type { Pokemon, SeedResult } from "@pokedex/shared-types";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const init = async () => {
  console.log("🔧 Initializing database...");

  // Drop existing tables
  console.log("🗑️  Dropping existing tables...");
  await dbPool.query(`DROP TABLE IF EXISTS owned_pokemon CASCADE;`);
  await dbPool.query(`DROP TABLE IF EXISTS pokemon CASCADE;`);
  await dbPool.query(`DROP TABLE IF EXISTS users CASCADE;`);
  console.log("✅ Tables dropped");
  await dbPool.query(`
    CREATE TABLE users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL
    );
  `);

  await dbPool.query(`
    CREATE TABLE pokemon (
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
  `);

  await dbPool.query(`
    CREATE TABLE owned_pokemon (
      user_id TEXT NOT NULL,
      pokemon_id INT NOT NULL,
      PRIMARY KEY (user_id, pokemon_id),
      FOREIGN KEY (pokemon_id) REFERENCES pokemon(id)
    );
  `);

  console.log("✅ Tables created");
  const filePath = path.resolve(__dirname, "data", "Pokedex.json");
  const raw = await fs.readFile(filePath, "utf8");
  const pokemons = JSON.parse(raw) as Pokemon[];

  const batchSize = 200;
  const batches = Array.from(
    { length: Math.ceil(pokemons.length / batchSize) },
    (_, i) => pokemons.slice(i * batchSize, (i + 1) * batchSize),
  );

  console.log(
    `📦 Seeding ${pokemons.length} Pokémon in ${batches.length} batches...`,
  );

  const safe = (text?: string) =>
    text ? String(text).replace(/'/g, "''") : "";

  const results: SeedResult[] = [];

  // Insert batches
  await dbPool.query("BEGIN");
  for await (const [index, batch] of batches.entries()) {
    const values = batch
      .map((p) => {
        const id = p.id;
        const name = JSON.stringify(p.name).replace(/'/g, "''");
        const typeArray = p.type.map((t) => `'${safe(t)}'`).join(",");
        const base = JSON.stringify(p.base ?? {}).replace(/'/g, "''");
        const species = safe(p.species);
        const description = safe(p.description);
        const evolution = JSON.stringify(p.evolution ?? {}).replace(/'/g, "''");
        const profile = JSON.stringify(p.profile ?? {}).replace(/'/g, "''");
        const image = JSON.stringify(p.image ?? {}).replace(/'/g, "''");

        return `(${id}, '${name}', ARRAY[${typeArray}], '${base}', '${species}', '${description}', '${evolution}', '${profile}', '${image}')`;
      })
      .join(",");

    const query = `
      INSERT INTO pokemon
      (id, name, type, base, species, description, evolution, profile, image)
      VALUES ${values};
    `;

    await dbPool.query(query);

    const result: SeedResult = {
      inserted: (index + 1) * batch.length,
      total: pokemons.length,
      completed: index === batches.length - 1,
    };

    results.push(result);
    console.log(`Inserted ${result.inserted}/${result.total}`);
  }
  await dbPool.query("COMMIT");

  console.log("Seeding complete!");
  await dbPool.end();
};

init().catch((error) => {
  console.error("Error during database initialization:", error);
  process.exit(1);
});
