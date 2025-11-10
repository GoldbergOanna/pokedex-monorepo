import type { Pokemon, EvolutionMap } from "@pokedex/shared-types";
export const buildEvolutionMap = (pokemons: Pokemon[]): EvolutionMap => {
  const map: EvolutionMap = {};
  for (const p of pokemons) {
    const id = p.id;
    const next = (p.evolution?.next ?? []).map(([nid]) => Number(nid));

    map[id] ??= { next: [], prev: [] };
    map[id].next.push(...next);

    for (const nid of next) {
      map[nid] ??= { next: [], prev: [] };
      map[nid].prev.push(id);
    }
  }
  return map;
};
