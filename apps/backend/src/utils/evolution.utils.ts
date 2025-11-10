import type { EvolutionMap } from "../models/pokemon.types";

/**
 * Recursively collects all pre-evolution Pokémon IDs
 * for the given Pokémon using the in-memory EvolutionMap.
 */
export const findPreEvolutions = (
  id: number,
  evoMap: EvolutionMap,
  visited = new Set<number>(),
): number[] => {
  const prev = evoMap[id]?.prev ?? [];
  for (const pid of prev) {
    if (!visited.has(pid)) {
      visited.add(pid);
      findPreEvolutions(pid, evoMap, visited);
    }
  }
  return [...visited];
};
