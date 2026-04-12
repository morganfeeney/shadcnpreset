import { resolvePresetFromCode } from "@/lib/preset"
import type { PresetPageItem } from "@/lib/preset-catalog"
import { buildSearchCorpus } from "@/lib/search/corpus"
import {
  wantsDarkShellQuery,
  wantsLightShellQuery,
} from "@/lib/search/query-intent"
import { getSemanticRelevanceScores } from "@/lib/search/semantic"
import {
  applyShellBrightnessIntent,
  rankPresetsByEmbeddingSimilarity,
} from "@/lib/search/semantic-rank"
import { SEARCH_PAGE_SIZE, type SearchMode } from "@/lib/search/route"

export type SearchListItem = {
  code: string
  baseColor: string
  /** Semantic / accent palette (distinct from neutral `baseColor`). */
  theme: string
  /** Chart series accent; may match `theme` or differ. */
  chartColor: string
  iconLibrary: string
  font: string
  fontHeading: string
}

export type SearchPageData = {
  mode: SearchMode
  query: string
  items: SearchListItem[]
}

async function getRankedSmartResults(query: string, neededCount: number) {
  const corpus = await buildSearchCorpus()
  const rawScores = await getSemanticRelevanceScores(corpus, query)
  const scores = applyShellBrightnessIntent(query, rawScores, corpus)
  return rankPresetsByEmbeddingSimilarity(corpus, scores, neededCount)
}

async function getSearchItemsWindow(
  mode: SearchMode,
  query: string,
  neededCount: number
): Promise<SearchPageData["items"]> {
  if (mode === "code") {
    const resolved = resolvePresetFromCode(query)
    return resolved
      ? [
          {
            code: resolved.code,
            baseColor: resolved.baseColor,
            theme: resolved.theme,
            chartColor: resolved.chartColor ?? resolved.theme,
            iconLibrary: resolved.iconLibrary,
            font: resolved.font,
            fontHeading: resolved.fontHeading,
          },
        ]
      : []
  }

  const results = await getRankedSmartResults(query, neededCount)
  return results.map((item) => ({
    code: item.code,
    baseColor: item.config.baseColor,
    theme: item.config.theme,
    chartColor: item.config.chartColor ?? item.config.theme,
    iconLibrary: item.config.iconLibrary,
    font: item.config.font,
    fontHeading: item.config.fontHeading,
  }))
}

export async function getSearchPageData(
  mode: SearchMode,
  query: string,
  /** Legacy pagination arg; search is single-page only — ignored. */
  _requestedPage?: number
): Promise<SearchPageData> {
  void _requestedPage
  const allItems = await getSearchItemsWindow(mode, query, SEARCH_PAGE_SIZE)
  return {
    mode,
    query,
    items: allItems.slice(0, SEARCH_PAGE_SIZE),
  }
}
