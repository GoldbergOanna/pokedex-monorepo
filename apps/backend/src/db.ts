import pkg from "pg";
const { Pool } = pkg;
import "dotenv/config";

export const dbPool = new Pool({
  host: process.env.DB_HOST ?? "localhost",
  port: Number(process.env.DB_PORT ?? 5432),
  user: process.env.DB_USER ?? "pokedex",
  password: process.env.DB_PASSWORD ?? "pokedex",
  database: process.env.DB_NAME ?? "pokedex",
  max: 10,
});
