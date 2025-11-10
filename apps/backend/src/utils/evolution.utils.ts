import type { EvolutionMap } from "@pokedex/shared-types";

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
