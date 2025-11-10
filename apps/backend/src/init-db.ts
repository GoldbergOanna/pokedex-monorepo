import { dbPool } from "./db.ts";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import type { Pokemon, SeedResult } from "./models/pokemon.types.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const init = async () => {
  console.log("Initializing database...");

  //Create tables if not exists
  await dbPool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL
    );
  `);

  await dbPool.query(`
    CREATE TABLE IF NOT EXISTS pokemon (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      type TEXT,
      image TEXT,
      description TEXT
    );
  `);

  console.log("Tables verified");

  //Check existing seed
  const { rows } = await dbPool.query(
    "SELECT COUNT(*)::int AS count FROM pokemon",
  );
  if (rows[0].count > 0) {
    console.log(
      `Pokemon table already seeded (${rows[0].count} entries). Skipping...`,
    );
    await dbPool.end();
    return;
  }

  //Load pokemon data from JSON file
  const filePath = path.resolve(__dirname, "data", "Pokedex.json");
  const rawJson = JSON.parse(await fs.readFile(filePath, "utf8"));

  // Transform the data to match our schema
  interface RawPokemon {
    name: string | { english: string };
    type: string[] | string;
    image?: string;
    description?: string;
  }

  const json: Pokemon[] = (rawJson as RawPokemon[]).map((p) => ({
    name: typeof p.name === "string" ? p.name : p.name.english,
    type: Array.isArray(p.type) ? p.type.join(", ") : p.type,
    image: p.image,
    description: p.description,
  }));

  const batchSize = 100;
  const batches = Array.from(
    { length: Math.ceil(json.length / batchSize) },
    (_, i) => json.slice(i * batchSize, (i + 1) * batchSize),
  );

  console.log(`Seeding ${json.length} Pokémon in ${batches.length} batches...`);

  const safe = (text?: string) =>
    text ? String(text).replace(/'/g, "''") : "";

  const results: SeedResult[] = [];

  for await (const [index, batch] of batches.entries()) {
    const queryValues = batch
      .map(
        ({ name, type, image, description }) =>
          `('${safe(name)}', '${safe(type)}', '${safe(image)}', '${safe(description)}')`,
      )
      .join(",");

    const query = `INSERT INTO pokemon (name, type, image, description) VALUES ${queryValues}`;

    await dbPool.query(query);

    const result: SeedResult = {
      inserted: (index + 1) * batch.length,
      total: json.length,
      completed: index === batches.length - 1,
    };

    results.push(result);
    console.log(`Inserted ${result.inserted}/${result.total}`);
  }

  console.log("Seeding complete!");
  await dbPool.end();
};

init().catch((error) => {
  console.error("Error during database initialization:", error);
  process.exit(1);
});
