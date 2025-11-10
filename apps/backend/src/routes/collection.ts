import { Hono } from "hono";
import { authMiddleware } from "../middleware/auth.middleware.ts";
import type { AppVariables } from "../models/context.types.ts";

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

/**
 * POST /me/collection/:pokemonId/toggle
 */
collectionRoutes.post("/:pokemonId/toggle", async (c) => {
  try {
    const userId = c.get("userId");
    const ownershipService = c.get("ownershipService");
    const pokemonId = Number(c.req.param("pokemonId"));

    if (Number.isNaN(pokemonId) || pokemonId <= 0) {
      return c.json({ error: "Invalid Pokémon ID" }, 400);
    }

    const result = await ownershipService.toggleOwned(userId, pokemonId);
    return c.json(result);
  } catch (error) {
    console.error("Error toggling ownership:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});
