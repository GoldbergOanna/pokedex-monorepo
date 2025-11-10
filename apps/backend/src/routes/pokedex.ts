import { Hono } from "hono";
import { dbPool } from "../db.ts";
import { z } from "zod";
import { authMiddleware } from "../middleware/auth.middleware.ts";
import type { AppVariables } from "../models/context.types.ts";

export const pokedexRoutes = new Hono<{ Variables: AppVariables }>();

//require authentication for all pokedex routes
pokedexRoutes.use("*", authMiddleware);

const PokemonQuerySchema = z.object({
  page: z
    .string()
    .regex(/^\d+$/, "Page must be a number")
    .transform((val) => parseInt(val, 10))
    .default(1),
  limit: z
    .string()
    .regex(/^\d+$/, "Limit must be a number")
    .transform((val) => parseInt(val, 10))
    .default(20),
});

// GET /pokedex - Pokémons list with pagination
pokedexRoutes.get("/", async (c) => {
  try {
    const parsed = PokemonQuerySchema.safeParse(c.req.query());
    if (!parsed.success) {
      return c.json(
        { error: "Invalid quesry params", details: parsed.error.flatten() },
        400,
      );
    }
    const { page, limit } = parsed.data;
    const offset = (page - 1) * limit;
    const userId = c.get("userId");

    const [pokemonRes, countRes] = await Promise.all([
      dbPool.query(
        `
        SELECT
          p.id,
          p.name ->> 'english' AS name,
          p.type,
          p.image ->> 'hires' AS image,
          (op.user_id IS NOT NULL) AS owned
        FROM pokemon p
        LEFT JOIN owned_pokemon op
          ON op.pokemon_id = p.id AND op.user_id = $3
        ORDER BY p.id
        LIMIT $1 OFFSET $2
        `,
        [limit, offset, userId],
      ),
      dbPool.query("SELECT COUNT(*) FROM pokemon"),
    ]);

    const total = Number(countRes.rows[0].count);
    const totalPages = Math.ceil(total / limit);

    // Transform data to array type
    const transformedData = pokemonRes.rows.map((p) => ({
      id: p.id,
      name: p.name,
      type: Array.isArray(p.type) ? p.type : [p.type],
      image: p.image,
      owned: p.owned,
    }));

    return c.json({
      data: transformedData,
      page,
      totalPages,
      totalCount: total,
    });
  } catch (error) {
    console.error("Error fetching Pokémon:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// GET /pokedex/:id - Get Pokémon by ID
pokedexRoutes.get("/:id", async (c) => {
  try {
    const { id } = c.req.param();
    const pokemonRes = await dbPool.query(
      "SELECT * FROM pokemon WHERE id = $1",
      [id],
    );

    if (pokemonRes.rows.length === 0) {
      return c.json({ error: "Pokémon not found" }, 404);
    }

    const pokemon = pokemonRes.rows[0];

    // Transform data to extract hires image from image object
    const transformedPokemon = {
      ...pokemon,
      image: pokemon.image?.hires || null,
      name: pokemon.name?.english || pokemon.name,
      type: Array.isArray(pokemon.type)
        ? pokemon.type.join(", ")
        : pokemon.type,
    };

    return c.json(transformedPokemon);
  } catch (error) {
    console.error("Error fetching Pokémon by ID:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});
