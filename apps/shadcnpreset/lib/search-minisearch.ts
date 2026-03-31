import MiniSearch from "minisearch"

import type { PresetPageItem } from "@/lib/preset-catalog"
import { tokenizeSearchQuery } from "@/lib/search-tokenize"
import { buildPresetSearchDocument } from "@/lib/preset-search-document"
import { expandQueryForLexicalSearch } from "@/lib/search-query-expansion"

const MAX_RESULTS = 8000

let cachedIndex: MiniSearch | null = null
let cachedCorpusLen = 0
let cachedFirstCode: string | undefined

function getOrBuildIndex(corpus: PresetPageItem[]): MiniSearch {
  const first = corpus[0]?.code
  if (
    cachedIndex &&
    cachedCorpusLen === corpus.length &&
    cachedFirstCode === first
  ) {
    return cachedIndex
  }

  const ms = new MiniSearch({
    fields: ["text"],
    idField: "id",
    searchOptions: {
      fuzzy: 0.12,
    },
  })

  const docs = corpus.map((item) => ({
    id: item.code,
    text: buildPresetSearchDocument(item),
  }))

  ms.addAll(docs)
  cachedIndex = ms
  cachedCorpusLen = corpus.length
  cachedFirstCode = first
  return ms
}

/**
 * Free BM25-style scores (Minisearch, MIT) over preset search documents.
 * Merged in `rankPresetCandidates` with the hand-tuned lexical scorer.
 */
export function getLexicalScoresForQuery(
  corpus: PresetPageItem[],
  query: string
): Map<string, number> {
  const trimmed = query.trim()
  if (!trimmed) return new Map()

  const tokens = tokenizeSearchQuery(query)
  if (!tokens.length) return new Map()

  const ms = getOrBuildIndex(corpus)
  const multi = tokens.length > 1

  let results = ms.search(trimmed, {
    combineWith: multi ? "AND" : "OR",
    fuzzy: multi ? 0.12 : 0.22,
  }).slice(0, MAX_RESULTS)

  if (results.length === 0 && multi) {
    results = ms.search(trimmed, {
      combineWith: "OR",
      fuzzy: 0.2,
    }).slice(0, MAX_RESULTS)
  }

  if (results.length === 0) {
    const expanded = expandQueryForLexicalSearch(query)
    if (expanded !== trimmed) {
      results = ms.search(expanded, {
        combineWith: "OR",
        fuzzy: 0.22,
      }).slice(0, MAX_RESULTS)
    }
  }

  const map = new Map<string, number>()
  for (const r of results) {
    map.set(r.id, r.score)
  }
  return map
}
