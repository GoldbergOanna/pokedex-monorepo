import { Hono } from "hono";
import { dbPool } from "../db.ts";
import { z } from "zod";
import { authMiddleware } from "../middleware/auth.middleware.ts";

export const pokedexRoutes = new Hono();

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

    const [pokemonRes, countRes] = await Promise.all([
      dbPool.query("SELECT * FROM pokemon ORDER BY id LIMIT $1 OFFSET $2", [
        limit,
        offset,
      ]),
      dbPool.query("SELECT COUNT(*) FROM pokemon"),
    ]);

    const total = Number(countRes.rows[0].count);
    const totalPages = Math.ceil(total / limit);

    // Transform data to extract hires image from image object
    const transformedData = pokemonRes.rows.map((pokemon) => ({
      ...pokemon,
      image: pokemon.image?.hires || null,
      name: pokemon.name?.english || pokemon.name,
      type: Array.isArray(pokemon.type)
        ? pokemon.type.join(", ")
        : pokemon.type,
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
