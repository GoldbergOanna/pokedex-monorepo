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

const PG_UNIQUE_VIOLATION = "23505";

export const isUniqueViolation = (error: unknown): boolean =>
  typeof error === "object" &&
  error !== null &&
  "code" in error &&
  error.code === PG_UNIQUE_VIOLATION;
