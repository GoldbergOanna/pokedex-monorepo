import { z } from "zod";

export const MAX_PAGE_SIZE = 100;
const DEFAULT_PAGE_SIZE = 20;

export const pokemonIdSchema = z.coerce.number().int().positive();

export const pokemonListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(MAX_PAGE_SIZE).default(DEFAULT_PAGE_SIZE),
  search: z.string().optional(),
  type: z.string().optional(),
  tier: z.string().optional(),
  description: z.string().optional(),
});
