/** OpenAI embedding similarity vs preset documents; no MiniSearch. Needs `OPENAI_API_KEY`. */
import { embed, embedMany } from "ai"
import { openai } from "@ai-sdk/openai"

import type { PresetPageItem } from "@/lib/preset-catalog"
import { buildPresetSearchDocument } from "@/lib/preset-search-document"
import { expandQueryForLexicalSearch } from "@/lib/search-query-expansion"

const EMBEDDING_MODEL =
  process.env.OPENAI_EMBEDDING_MODEL ?? "text-embedding-3-small"
const DOC_BATCH = 96

/** In-memory vectors for preset codes (bounded by search corpus size). */
const presetVectorCache = new Map<string, number[]>()

function dotProduct(a: number[], b: number[]): number {
  let s = 0
  for (let i = 0; i < a.length; i++) {
    s += a[i]! * b[i]!
  }
  return s
}

/** Cosine = dot product when embeddings are L2-normalized (OpenAI). */
function cosine(a: number[], b: number[]): number {
  if (a.length !== b.length || !a.length) return 0
  return dotProduct(a, b)
}

/**
 * Semantic relevance scores in [0, 1] (typical cosine range for normalized vectors).
 * Requires `OPENAI_API_KEY`. Returns an empty map when unset so ranking falls back to
 * heuristics only.
 */
export async function getSemanticRelevanceScores(
  candidates: PresetPageItem[],
  query: string
): Promise<Map<string, number>> {
  const out = new Map<string, number>()
  if (!process.env.OPENAI_API_KEY?.trim() || !candidates.length) {
    return out
  }

  const q = query.trim()
  if (!q) return out

  try {
    const model = openai.embedding(EMBEDDING_MODEL)

    const expanded = expandQueryForLexicalSearch(q)
    const queryForEmbedding =
      expanded !== q ? `${q}\n${expanded}` : q

    const { embedding: queryVector } = await embed({
      model,
      value: queryForEmbedding.slice(0, 8000),
      maxRetries: 0,
    })

    const qv = [...queryVector]

    const needDocs: { code: string; text: string }[] = []
    for (const item of candidates) {
      if (!presetVectorCache.has(item.code)) {
        needDocs.push({
          code: item.code,
          text: buildPresetSearchDocument(item),
        })
      }
    }

    for (let i = 0; i < needDocs.length; i += DOC_BATCH) {
      const batch = needDocs.slice(i, i + DOC_BATCH)
      const { embeddings } = await embedMany({
        model,
        values: batch.map((b) => b.text),
        maxRetries: 0,
      })
      for (let j = 0; j < batch.length; j++) {
        const emb = embeddings[j]
        const row = batch[j]!
        if (emb) {
          presetVectorCache.set(row.code, [...emb])
        }
      }
    }

    for (const item of candidates) {
      const v = presetVectorCache.get(item.code)
      if (!v) continue
      const sim = Math.max(0, cosine(qv, v))
      out.set(item.code, sim)
    }

    return out
  } catch (err) {
    console.error("[search-semantic] embedding failed; using heuristics only", err)
    return out
  }
}

/** For tests or if preset corpus definition changes materially. */
export function clearPresetEmbeddingCache(): void {
  presetVectorCache.clear()
}
