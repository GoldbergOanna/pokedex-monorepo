import { Hono } from "hono";
import { authMiddleware } from "../middleware/auth.middleware.ts";
import type { AppVariables } from "../models/context.types.ts";
import { pokemonIdSchema } from "../validation.ts";

export const collectionRoutes = new Hono<{ Variables: AppVariables }>();

collectionRoutes.use("*", authMiddleware);

/**
 * GET /me/collection
 * Returns the list of Pokémon IDs owned by the current user.
 */
collectionRoutes.get("/", async (c) => {
  const userId = c.get("userId");
  const ownershipService = c.get("ownershipService");
  const owned = await ownershipService.getUserOwned(userId);
  return c.json({ owned });
});

collectionRoutes.post("/:pokemonId/toggle", async (c) => {
  try {
    const userId = c.get("userId");
    const ownershipService = c.get("ownershipService");
    const parsedId = pokemonIdSchema.safeParse(c.req.param("pokemonId"));
    if (!parsedId.success) {
      return c.json({ error: "Invalid Pokémon ID" }, 400);
    }

    const pokemonId = parsedId.data;
    if (!ownershipService.isKnownPokemon(pokemonId)) {
      return c.json({ error: "Pokémon not found" }, 404);
    }

    const result = await ownershipService.toggleOwned(userId, pokemonId);
    return c.json(result);
  } catch (error) {
    console.error("Error toggling ownership:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});
