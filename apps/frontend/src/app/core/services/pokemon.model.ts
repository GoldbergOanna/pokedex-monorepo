export interface Pokemon {
  id: number;
  name: string;
  type: string;
  image: string;
  description: string;
}

export interface PokemonPageResponse {
  data: Pokemon[];
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
