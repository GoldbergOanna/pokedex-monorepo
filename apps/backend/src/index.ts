import "dotenv/config";
import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { logger } from "hono/logger";
import { cors } from "hono/cors";

import { authRoutes } from "./routes/auth.ts";
import { pokedexRoutes } from "./routes/pokedex.ts";
import { collectionRoutes } from "./routes/collection.ts";

import { buildEvolutionMap } from "./utils/evolution.map.ts";
import { OwnershipService } from "./services/ownership.service.ts";

import type { AppVariables } from "./models/context.types.ts";

import pokemonsJson from "./data/Pokedex.json" with { type: "json" };

const app = new Hono<{ Variables: AppVariables }>();

//Middlewares
app.use("*", logger());
app.use("*", cors({ origin: "http://localhost:4200" }));

//build evolution map at startup
const evoMap = buildEvolutionMap(pokemonsJson);
const ownershipService = new OwnershipService(evoMap);

//ownership service for all routes
app.use("*", async (c, next) => {
  c.set("ownershipService", ownershipService);
  await next();
});

// route registrations
app.route("/auth", authRoutes);
app.route("/pokedex", pokedexRoutes);
app.route("/me/collection", collectionRoutes);

const port = Number(process.env.PORT ?? 3000);
console.log(`Server is running on http://localhost:${port}`);

serve({ fetch: app.fetch, port });
