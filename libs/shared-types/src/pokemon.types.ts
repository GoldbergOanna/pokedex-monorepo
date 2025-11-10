export interface Pokemon {
  id: number;
  name: { english: string; japanese: string; chinese: string; french: string };
  type: string[];
  base: Record<string, number>;
  species: string;
  description: string;
  evolution?: { next?: [string, string][]; prev?: [string, string][] };
  profile: {
    height: string;
    weight: string;
    egg: string[];
    ability: [string, string][];
    gender: string;
  };
  image: { sprite: string; thumbnail: string; hires: string };
}

export interface PokemonSummary {
  id: number;
  name: string;
  type: string[];
  sprite: string;
  owned: boolean;
  image?: Pokemon["image"];
}

export interface PokemonDetail extends PokemonSummary {
  description: string;
  species: string;
  evolutionChain: PokemonSummary[];
  base: Record<string, number>;
  profile: Pokemon["profile"];
  image: Pokemon["image"];
}

export interface PokemonFilters {
  search?: string;
  type?: string;
  tier?: number | string;
  description?: string;
  sortBy?: "id" | "name" | "tier";
  order?: "asc" | "desc";
}

export interface PokemonPageResponse {
  data: PokemonSummary[];
  page: number;
  totalPages: number;
  totalCount: number;
}

export interface QueryParams {
  search?: string | null;
  type?: string | null;
  tier?: string | null;
  description?: string | null;
  page?: number;
  limit?: number;
}

export type EvolutionMap = Record<number, { next: number[]; prev: number[] }>;

export interface SeedResult {
  inserted: number;
  total: number;
  completed: boolean;
}
