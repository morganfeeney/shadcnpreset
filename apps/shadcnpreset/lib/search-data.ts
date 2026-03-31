import { resolvePresetFromCode } from "@/lib/preset"
import {
  PRESET_FILTER_OPTIONS,
  type PresetFilters,
  type PresetPageItem,
} from "@/lib/preset-catalog"
import {
  MONO_FONTS,
  SANS_FONTS,
  SERIF_FONTS,
  getSampledCandidates,
  rankPresetCandidates,
  wantsPaletteVariety,
} from "@/lib/preset-smart-search"
import { tokenizeSearchQueryOrdered } from "@/lib/search-tokenize"
import { buildSearchCorpus } from "@/lib/search-corpus"
import { getLexicalScoresForQuery } from "@/lib/search-minisearch"
import { SEARCH_PAGE_SIZE, type SearchMode } from "@/lib/search-route"

export type SearchListItem = {
  code: string
  baseColor: string
  iconLibrary: string
  font: string
}

export type SearchPageData = {
  mode: SearchMode
  query: string
  items: SearchListItem[]
}

type QueryConstraints = {
  predicates: Array<(item: PresetPageItem) => boolean>
  focusedFilters: PresetFilters[]
  /** Serif/sans/mono queries must not fall back to unrelated presets. */
  strictFacetMode: boolean
}

function headingMatchesBodyFontFacet(
  item: PresetPageItem,
  facet: "serif" | "sans" | "mono"
) {
  const h = item.config.fontHeading
  const body = item.config.font
  if (h === "inherit" || h === body) return true
  if (facet === "serif") return SERIF_FONTS.has(h)
  if (facet === "sans") return SANS_FONTS.has(h)
  return MONO_FONTS.has(h)
}

/** Body + heading pair: first font token = heading, second = body (matches Customizer order). */
function matchesBodyHeadingPair(
  item: PresetPageItem,
  body: string,
  heading: string
) {
  if (item.config.font !== body) return false
  if (heading === body) {
    return (
      item.config.fontHeading === "inherit" ||
      item.config.fontHeading === body
    )
  }
  return item.config.fontHeading === heading
}

function addUniqueCandidates(
  byCode: Map<string, PresetPageItem>,
  items: PresetPageItem[]
) {
  for (const item of items) {
    if (!byCode.has(item.code)) {
      byCode.set(item.code, item)
    }
  }
}

function filterByPredicates(
  items: PresetPageItem[],
  predicates: Array<(item: PresetPageItem) => boolean>
) {
  if (!predicates.length) return items
  const out: PresetPageItem[] = []
  for (const item of items) {
    let matches = true
    for (const predicate of predicates) {
      if (!predicate(item)) {
        matches = false
        break
      }
    }
    if (matches) out.push(item)
  }
  return out
}

function buildFocusedFilters(
  baseFilters: PresetFilters,
  themeTokens: string[],
  fontOptions: string[]
) {
  let themeVariants: PresetFilters[]
  if (themeTokens.length >= 2) {
    themeVariants = [
      {
        ...baseFilters,
        theme: themeTokens[0] as PresetFilters["theme"],
        chartColor: themeTokens[1] as PresetFilters["chartColor"],
      },
    ]
  } else if (themeTokens.length === 1) {
    themeVariants = [
      { ...baseFilters, theme: themeTokens[0] as PresetFilters["theme"] },
      {
        ...baseFilters,
        chartColor: themeTokens[0] as PresetFilters["chartColor"],
      },
    ]
  } else {
    themeVariants = [{ ...baseFilters }]
  }

  if (!fontOptions.length) {
    return themeVariants
  }

  return fontOptions.flatMap((font) =>
    themeVariants.map((filters) => ({
      ...filters,
      font: font as PresetFilters["font"],
    }))
  )
}

/** Strips connector words once patterns are resolved (see extractThemeChartFromChartsConnector). */
const SEARCH_INTENT_STOPWORDS = new Set([
  "chart",
  "charts",
  "graphs",
  "graph",
])

/**
 * When a semantic colour is followed by charts/graphs/chart/graph and another colour,
 * the first is theme and the second is chart color (explicit chart intent).
 */
function extractThemeChartFromChartsConnector(rawTokens: string[]): {
  tokens: string[]
  paired?: { theme: string; chart: string }
} {
  const CONNECTORS = new Set(["charts", "graphs", "chart", "graph"])

  for (let i = 0; i < rawTokens.length; i++) {
    if (!CONNECTORS.has(rawTokens[i])) continue

    const before = rawTokens[i - 1]
    const after = rawTokens[i + 1]
    if (
      i === 0 ||
      i >= rawTokens.length - 1 ||
      !before ||
      !after
    ) {
      continue
    }

    if (
      !PRESET_FILTER_OPTIONS.themes.includes(before as never) ||
      !PRESET_FILTER_OPTIONS.themes.includes(after as never)
    ) {
      continue
    }

    const paired = { theme: before, chart: after }
    const tokens = rawTokens.filter(
      (_, j) => j !== i - 1 && j !== i && j !== i + 1
    )
    return { tokens, paired }
  }

  return { tokens: rawTokens }
}

function getQueryConstraints(query: string): QueryConstraints {
  const raw = tokenizeSearchQueryOrdered(query)
  const { tokens: afterChartsPhrase, paired: chartsConnectorPair } =
    extractThemeChartFromChartsConnector(raw)
  const tokens = afterChartsPhrase.filter(
    (t) => !SEARCH_INTENT_STOPWORDS.has(t)
  )
  const predicates: QueryConstraints["predicates"] = []
  const exactFilters: PresetFilters = {}
  const themeTokens: string[] = []
  const fontTokens: string[] = []
  let fontOptions: string[] = []
  let strictFacetMode = false

  for (const token of tokens) {
    if (PRESET_FILTER_OPTIONS.styles.includes(token as never)) {
      exactFilters.style = token as PresetFilters["style"]
      predicates.push((item) => item.config.style === token)
      continue
    }

    if (PRESET_FILTER_OPTIONS.baseColors.includes(token as never)) {
      exactFilters.baseColor = token as PresetFilters["baseColor"]
      predicates.push((item) => item.config.baseColor === token)
      continue
    }

    if (PRESET_FILTER_OPTIONS.iconLibraries.includes(token as never)) {
      exactFilters.iconLibrary = token as PresetFilters["iconLibrary"]
      predicates.push((item) => item.config.iconLibrary === token)
      continue
    }

    if (PRESET_FILTER_OPTIONS.radii.includes(token as never)) {
      exactFilters.radius = token as PresetFilters["radius"]
      predicates.push((item) => item.config.radius === token)
      continue
    }

    if (PRESET_FILTER_OPTIONS.menuColors.includes(token as never)) {
      exactFilters.menuColor = token as PresetFilters["menuColor"]
      predicates.push((item) => item.config.menuColor === token)
      continue
    }

    if (PRESET_FILTER_OPTIONS.menuAccents.includes(token as never)) {
      exactFilters.menuAccent = token as PresetFilters["menuAccent"]
      predicates.push((item) => item.config.menuAccent === token)
      continue
    }

    if (PRESET_FILTER_OPTIONS.fonts.includes(token as never)) {
      fontTokens.push(token)
      continue
    }

    if (PRESET_FILTER_OPTIONS.themes.includes(token as never)) {
      themeTokens.push(token)
      continue
    }

    if (token === "serif") {
      strictFacetMode = true
      exactFilters.fontHeading = "inherit"
      fontOptions = PRESET_FILTER_OPTIONS.fonts.filter((font) => SERIF_FONTS.has(font))
      predicates.push(
        (item) =>
          SERIF_FONTS.has(item.config.font) && headingMatchesBodyFontFacet(item, "serif")
      )
      continue
    }

    if (token === "sans") {
      strictFacetMode = true
      exactFilters.fontHeading = "inherit"
      fontOptions = PRESET_FILTER_OPTIONS.fonts.filter((font) => SANS_FONTS.has(font))
      predicates.push(
        (item) =>
          SANS_FONTS.has(item.config.font) && headingMatchesBodyFontFacet(item, "sans")
      )
      continue
    }

    if (token === "mono" || token === "monospaced") {
      strictFacetMode = true
      exactFilters.fontHeading = "inherit"
      fontOptions = PRESET_FILTER_OPTIONS.fonts.filter((font) => MONO_FONTS.has(font))
      predicates.push(
        (item) =>
          MONO_FONTS.has(item.config.font) && headingMatchesBodyFontFacet(item, "mono")
      )
    }
  }

  if (chartsConnectorPair) {
    themeTokens.length = 0
    themeTokens.push(chartsConnectorPair.theme, chartsConnectorPair.chart)
  }

  if (themeTokens.length >= 2) {
    predicates.push(
      (item) =>
        item.config.theme === themeTokens[0] &&
        item.config.chartColor === themeTokens[1]
    )
  } else if (themeTokens.length === 1) {
    predicates.push(
      (item) =>
        item.config.theme === themeTokens[0] ||
        item.config.chartColor === themeTokens[0]
    )
  }

  if (!strictFacetMode) {
    if (fontTokens.length >= 2) {
      const heading = fontTokens[0]
      const body = fontTokens[1]
      exactFilters.font = body as PresetFilters["font"]
      exactFilters.fontHeading =
        heading === body ? "inherit" : (heading as PresetFilters["fontHeading"])
      predicates.push((item) => matchesBodyHeadingPair(item, body, heading))
      fontOptions = []
    } else if (fontTokens.length === 1) {
      const f = fontTokens[0]
      exactFilters.font = f as PresetFilters["font"]
      predicates.push((item) => item.config.font === f)
      fontOptions = [f]
    }
  } else if (fontTokens.length >= 1) {
    const narrow = fontTokens[fontTokens.length - 1]!
    if (fontOptions.length && fontOptions.includes(narrow as never)) {
      fontOptions = [narrow]
    }
  }

  return {
    predicates,
    focusedFilters: buildFocusedFilters(exactFilters, themeTokens, fontOptions),
    strictFacetMode,
  }
}

function mergeCorpusWithStratifiedSample(
  corpus: PresetPageItem[],
  query: string
): PresetPageItem[] {
  const byCode = new Map<string, PresetPageItem>()
  for (const item of corpus) {
    byCode.set(item.code, item)
  }
  for (const item of getSampledCandidates(query, {}, 1600)) {
    byCode.set(item.code, item)
  }
  return [...byCode.values()]
}

async function getRankedSmartResults(query: string, neededCount: number) {
  const corpus = await buildSearchCorpus()
  const constraints = getQueryConstraints(query)

  const candidatePool =
    !constraints.predicates.length && wantsPaletteVariety(query)
      ? mergeCorpusWithStratifiedSample(corpus, query)
      : corpus

  const lexicalScores = getLexicalScoresForQuery(candidatePool, query)

  if (!constraints.predicates.length) {
    return rankPresetCandidates(
      query,
      candidatePool,
      neededCount,
      lexicalScores
    )
  }

  const { strictFacetMode } = constraints

  const constrainedCorpus = filterByPredicates(corpus, constraints.predicates)
  const focusedCandidates = new Map<string, PresetPageItem>()

  addUniqueCandidates(focusedCandidates, constrainedCorpus)

  const focusedFilters = constraints.focusedFilters.length
    ? constraints.focusedFilters
    : [{}]

  // Always stratify across the filtered combination space (early catalog pages cluster
  // on one palette; serif/sans/mono + theme pairs often miss the corpus entirely).
  for (const filters of focusedFilters.slice(0, 24)) {
    addUniqueCandidates(
      focusedCandidates,
      getSampledCandidates(query, filters, 1600)
    )
  }

  const constrainedCandidates = filterByPredicates(
    [...focusedCandidates.values()],
    constraints.predicates
  )

  if (constrainedCandidates.length) {
    return rankPresetCandidates(
      query,
      constrainedCandidates,
      neededCount,
      lexicalScores
    )
  }

  if (constrainedCorpus.length) {
    return rankPresetCandidates(
      query,
      constrainedCorpus,
      neededCount,
      lexicalScores
    )
  }

  if (strictFacetMode) {
    return []
  }

  return rankPresetCandidates(query, corpus, neededCount, lexicalScores)
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
            iconLibrary: resolved.iconLibrary,
            font: resolved.font,
          },
        ]
      : []
  }

  const results = await getRankedSmartResults(query, neededCount)
  return results.map((item) => ({
    code: item.code,
    baseColor: item.config.baseColor,
    iconLibrary: item.config.iconLibrary,
    font: item.config.font,
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
