import "dotenv/config";
import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { logger } from "hono/logger";
import { cors } from "hono/cors";

import { authRoutes } from "./routes/auth";
import { pokedexRoutes } from "./routes/pokedex";

const app = new Hono();

app.use("*", logger());
app.use("*", cors({ origin: "http://localhost:4200" }));

app.route("/auth", authRoutes);
app.route("/pokedex", pokedexRoutes);

const port = Number(process.env.PORT ?? 3000);

console.log(`Server is running on http://localhost:${port}`);

serve({ fetch: app.fetch, port });
