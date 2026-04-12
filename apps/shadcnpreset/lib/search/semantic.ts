/** Query embedding + precomputed preset vectors (see `pnpm generate:preset-embeddings`). */
import { embed } from "ai"
import { openai } from "@ai-sdk/openai"

import type { PresetPageItem } from "@/lib/preset-catalog"
import { loadPresetEmbeddingStore } from "@/lib/search/embedding-store"
import {
  wantsDarkShellQuery,
  wantsDataUiQuery,
  wantsLightShellQuery,
} from "@/lib/search/query-intent"

/** Avoid repeat OpenAI round-trips for the same query (React remounts, back/forward). */
const QUERY_EMBED_CACHE_TTL_MS = 120_000
const QUERY_EMBED_CACHE_MAX = 64
const queryEmbedCache = new Map<string, { vec: number[]; at: number }>()

function cacheKeyForQueryEmbedding(model: string, text: string) {
  return `${model}\0${text}`
}

function takeCachedQueryVec(key: string): number[] | null {
  const hit = queryEmbedCache.get(key)
  if (!hit) return null
  if (Date.now() - hit.at > QUERY_EMBED_CACHE_TTL_MS) {
    queryEmbedCache.delete(key)
    return null
  }
  return hit.vec
}

function putCachedQueryVec(key: string, vec: number[]) {
  if (queryEmbedCache.size >= QUERY_EMBED_CACHE_MAX) {
    const first = queryEmbedCache.keys().next().value
    if (first) queryEmbedCache.delete(first)
  }
  queryEmbedCache.set(key, { vec, at: Date.now() })
}

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
 * Short “Intent:” line for product axes (dark/light shell, data UI) so the query vector
 * matches how presets are described — not a general synonym list.
 */
export function queryTextForEmbedding(raw: string): string {
  const q = raw.trim().slice(0, 4000)
  if (!q) return q
  const hints: string[] = []

  if (wantsDarkShellQuery(q)) {
    hints.push(
      "dark mode UI, dark application shell, inverted sidebar and chrome, low-light interface"
    )
  } else if (wantsLightShellQuery(q)) {
    hints.push(
      "light mode UI, bright application shell, default sidebar, airy interface"
    )
  }

  if (wantsDataUiQuery(q)) {
    hints.push(
      "data visualization, metrics, charts and analytics, dashboard-style accents"
    )
  }

  if (!hints.length) return q.slice(0, 8000)
  return `${q}\nIntent: ${hints.join(" — ")}`.slice(0, 8000)
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
    const embedText = queryTextForEmbedding(q)
    const cacheKey = cacheKeyForQueryEmbedding(store.model, embedText)
    let qv = takeCachedQueryVec(cacheKey)
    if (!qv) {
      const { embedding: queryVector } = await embed({
        model,
        value: embedText,
        maxRetries: 0,
      })
      qv = [...queryVector]
      putCachedQueryVec(cacheKey, qv)
    }
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
      "[search-semantic] query embedding failed; no vector results",
      err
    )
    return out
  }
}

export { clearPresetEmbeddingStoreCache as clearPresetEmbeddingCache } from "@/lib/search/embedding-store"
