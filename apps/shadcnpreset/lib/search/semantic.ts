/** Query embedding + precomputed preset vectors (see `pnpm generate:preset-embeddings`). */
import { embed } from "ai"
import { openai } from "@ai-sdk/openai"

import type { PresetPageItem } from "@/lib/preset-catalog"
import { loadPresetEmbeddingStore } from "@/lib/search/embedding-store"
import { expandQueryForLexicalSearch } from "@/lib/search/query-expansion"

function dotProduct(a: number[], b: number[]): number {
  let s = 0
  for (let i = 0; i < a.length; i++) {
    s += a[i]! * b[i]!
  }
  return s
}

function cosine(a: number[], b: number[]): number {
  if (a.length !== b.length || !a.length) return 0
  return dotProduct(a, b)
}

/**
 * Cosine similarity vs **precomputed** preset embeddings. One `embed()` call per
 * search (query only). Fast: no per-request embedding of the corpus.
 */
export async function getSemanticRelevanceScores(
  candidates: PresetPageItem[],
  query: string
): Promise<Map<string, number>> {
  const out = new Map<string, number>()
  if (!process.env.OPENAI_API_KEY?.trim() || !candidates.length) {
    return out
  }

  const store = loadPresetEmbeddingStore()
  if (!store) {
    return out
  }

  const envModel =
    process.env.OPENAI_EMBEDDING_MODEL ?? "text-embedding-3-small"
  if (store.model !== envModel) {
    console.warn(
      `[search-semantic] preset-embeddings.json model "${store.model}" != OPENAI_EMBEDDING_MODEL "${envModel}" — skipping semantic scores`
    )
    return out
  }

  const q = query.trim()
  if (!q) return out

  try {
    const model = openai.embedding(store.model)
    const expanded = expandQueryForLexicalSearch(q)
    const queryForEmbedding =
      expanded !== q ? `${q}\n${expanded}` : q

    const { embedding: queryVector } = await embed({
      model,
      value: queryForEmbedding.slice(0, 8000),
      maxRetries: 0,
    })

    const qv = [...queryVector]
    if (qv.length !== store.dim) {
      console.error(
        `[search-semantic] query embedding dim ${qv.length} != store dim ${store.dim}`
      )
      return out
    }

    for (const item of candidates) {
      const v = store.vectors.get(item.code)
      if (!v) continue
      const sim = Math.max(0, cosine(qv, v))
      out.set(item.code, sim)
    }

    return out
  } catch (err) {
    console.error(
      "[search-semantic] query embedding failed; using heuristics only",
      err
    )
    return out
  }
}

export { clearPresetEmbeddingStoreCache as clearPresetEmbeddingCache } from "@/lib/search/embedding-store"
