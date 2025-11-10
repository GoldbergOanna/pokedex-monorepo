export interface SeedResult {
  inserted: number;
  total: number;
  completed: boolean;
}

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
}

export interface PokemonDetail extends PokemonSummary {
  description: string;
  species: string;
  evolutionChain: PokemonSummary[];
  base: Record<string, number>;
  profile: Pokemon["profile"];
  image: Pokemon["image"];
}
