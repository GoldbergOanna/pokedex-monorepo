export interface Pokemon {
  id?: number;
  name: string;
  type: string;
  image?: string;
  description?: string;
}

export interface SeedResult {
  inserted: number;
  total: number;
  completed: boolean;
}
