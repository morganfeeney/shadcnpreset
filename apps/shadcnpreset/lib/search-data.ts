import { resolvePresetFromCode } from "@/lib/preset"
import {
  PRESET_FILTER_OPTIONS,
  getPresetPage,
  type PresetFilters,
  type PresetPageItem,
} from "@/lib/preset-catalog"
import {
  MONO_FONTS,
  SANS_FONTS,
  SERIF_FONTS,
  getSampledCandidates,
  rankPresetCandidates,
  tokenizeSearchQuery,
  wantsPaletteVariety,
} from "@/lib/preset-smart-search"
import { buildSearchCorpus } from "@/lib/search-corpus"
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

const FOCUSED_PAGE_SEQUENCE = [1, 2, 3, 4, 5, 6, 8, 10]

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
  const themeVariants = themeTokens.length
    ? themeTokens.flatMap((token) => [
        { ...baseFilters, theme: token as PresetFilters["theme"] },
        { ...baseFilters, chartColor: token as PresetFilters["chartColor"] },
      ])
    : [{ ...baseFilters }]

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

function getQueryConstraints(query: string): QueryConstraints {
  const tokens = tokenizeSearchQuery(query)
  const predicates: QueryConstraints["predicates"] = []
  const exactFilters: PresetFilters = {}
  const themeTokens: string[] = []
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
      fontOptions = [token]
      predicates.push((item) => item.config.font === token)
      continue
    }

    if (PRESET_FILTER_OPTIONS.themes.includes(token as never)) {
      themeTokens.push(token)
      predicates.push(
        (item) => item.config.theme === token || item.config.chartColor === token
      )
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

  return {
    predicates,
    focusedFilters: buildFocusedFilters(exactFilters, themeTokens, fontOptions),
    strictFacetMode,
  }
}

async function getRankedSmartResults(query: string, neededCount: number) {
  const corpus = await buildSearchCorpus()
  const constraints = getQueryConstraints(query)
  if (!constraints.predicates.length) {
    return rankPresetCandidates(query, corpus, neededCount)
  }

  const { strictFacetMode } = constraints

  const constrainedCorpus = filterByPredicates(corpus, constraints.predicates)
  const focusedCandidates = new Map<string, PresetPageItem>()

  addUniqueCandidates(focusedCandidates, constrainedCorpus)

  const focusedFilters = constraints.focusedFilters.length
    ? constraints.focusedFilters
    : [{}]

  if (wantsPaletteVariety(query)) {
    for (const filters of focusedFilters.slice(0, 24)) {
      addUniqueCandidates(
        focusedCandidates,
        getSampledCandidates(query, filters, 1600)
      )
    }
  } else {
    for (const filters of focusedFilters.slice(0, 24)) {
      for (const page of FOCUSED_PAGE_SEQUENCE) {
        addUniqueCandidates(focusedCandidates, getPresetPage(page, 24, filters))
        if (focusedCandidates.size >= Math.max(neededCount * 8, 96)) {
          break
        }
      }

      if (focusedCandidates.size >= Math.max(neededCount * 8, 96)) {
        break
      }
    }
  }

  const constrainedCandidates = filterByPredicates(
    [...focusedCandidates.values()],
    constraints.predicates
  )

  if (constrainedCandidates.length) {
    return rankPresetCandidates(query, constrainedCandidates, neededCount)
  }

  if (constrainedCorpus.length) {
    return rankPresetCandidates(query, constrainedCorpus, neededCount)
  }

  if (strictFacetMode) {
    return []
  }

  return rankPresetCandidates(query, corpus, neededCount)
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
