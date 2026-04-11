import type { PresetPageItem } from "@/lib/preset-catalog"

const DEFAULT_BUDGET = 512

/**
 * Embedding every preset on each search is slow and expensive. Pre-rank with the
 * caller-supplied heuristic and only embed the top slice. The full pool still
 * participates in final ranking (semantic score 0 outside this slice).
 */
export function limitCandidatesForEmbedding(
  pool: PresetPageItem[],
  query: string,
  heuristicScore: (item: PresetPageItem, query: string) => number
): PresetPageItem[] {
  const parsed = Number(process.env.SEARCH_SEMANTIC_BUDGET)
  const budget = Number.isFinite(parsed)
    ? Math.max(64, Math.min(2000, parsed))
    : DEFAULT_BUDGET

  if (pool.length <= budget) return pool

  return [...pool]
    .map((item) => ({ item, h: heuristicScore(item, query) }))
    .sort(
      (a, b) =>
        b.h - a.h || a.item.code.localeCompare(b.item.code)
    )
    .slice(0, budget)
    .map((x) => x.item)
}
