import {
  getPresetPage,
  getPresetTotalCombinations,
  PRESET_FILTER_OPTIONS,
  type PresetFilters,
  type PresetPageItem,
} from "@/lib/preset-catalog"

type WeightedTokenMatch = Partial<Record<keyof PresetPageItem["config"], number>>

const BRIGHT_THEMES = new Set([
  "amber",
  "orange",
  "yellow",
  "lime",
  "emerald",
  "green",
  "teal",
  "cyan",
  "sky",
  "blue",
  "indigo",
  "violet",
  "purple",
  "pink",
  "fuchsia",
  "rose",
  "red",
])

const TOKEN_HINTS: Record<string, WeightedTokenMatch> = {
  minimal: { menuAccent: 2, menuColor: 1, style: 1 },
  clean: { menuAccent: 2, menuColor: 1, style: 1 },
  simple: { menuAccent: 2, menuColor: 1, style: 1 },
  bold: { menuAccent: 3, style: 1, chartColor: 1 },
  punchy: { menuAccent: 3, chartColor: 2, theme: 1 },
  vibrant: { theme: 3, chartColor: 2 },
  colorful: { theme: 3, chartColor: 2 },
  mono: { font: 3, fontHeading: 2 },
  monospaced: { font: 3, fontHeading: 2 },
  serif: { font: 3, fontHeading: 2 },
  sans: { font: 2, fontHeading: 1 },
  rounded: { radius: 3 },
  curvy: { radius: 3 },
  square: { radius: 3 },
  sharp: { radius: 3 },
  dark: { menuColor: 3, theme: 1, baseColor: 1 },
  light: { menuColor: 3, theme: 1, baseColor: 1 },
}

export const SANS_FONTS = new Set([
  "inter",
  "noto-sans",
  "nunito-sans",
  "figtree",
  "roboto",
  "raleway",
  "dm-sans",
  "public-sans",
  "outfit",
  "geist",
  "oxanium",
  "manrope",
  "space-grotesk",
  "montserrat",
  "ibm-plex-sans",
  "source-sans-3",
  "instrument-sans",
])

export const SERIF_FONTS = new Set([
  "lora",
  "merriweather",
  "playfair-display",
  "noto-serif",
  "roboto-slab",
])

export const MONO_FONTS = new Set(["jetbrains-mono", "geist-mono"])
export const TOKEN_ALIASES: Record<string, string> = {
  "hero icons": "lucide",
  "hero icon": "lucide",
  heroicons: "lucide",
  "huge icons": "hugeicons",
  "huge icon": "hugeicons",
  "tabler icons": "tabler",
  "tabler icon": "tabler",
  "phosphor icons": "phosphor",
  "phosphor icon": "phosphor",
  "remix icon": "remixicon",
  "remix icons": "remixicon",
}

function stableHash(input: string) {
  let hash = 2166136261
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i)
    hash = Math.imul(hash, 16777619)
  }
  return hash >>> 0
}

export function tokenizeSearchQuery(query: string) {
  const normalizedQuery = Object.entries(TOKEN_ALIASES).reduce(
    (currentQuery, [source, target]) => currentQuery.replaceAll(source, target),
    query.toLowerCase()
  )

  return [...new Set(
    normalizedQuery
      .split(/[^a-z0-9-]+/)
      .map((token) => token.trim())
      .filter(Boolean)
  )]
}

function scoreTokenHint(token: string, item: PresetPageItem) {
  const hints = TOKEN_HINTS[token]
  if (!hints) return 0

  let score = 0
  for (const [key, weight] of Object.entries(hints) as Array<
    [keyof PresetPageItem["config"], number]
  >) {
    const value = item.config[key]
    if (!value) continue

    if (token === "dark" && key === "menuColor" && value.includes("inverted")) {
      score += 3 * weight
      continue
    }

    if (token === "light" && key === "menuColor" && value.includes("default")) {
      score += 3 * weight
      continue
    }

    if (
      (token === "rounded" || token === "curvy") &&
      key === "radius" &&
      (value === "large" || value === "medium")
    ) {
      score += 3 * weight
      continue
    }

    if (
      (token === "square" || token === "sharp") &&
      key === "radius" &&
      value === "none"
    ) {
      score += 3 * weight
      continue
    }

    if (token === "vibrant" || token === "colorful") {
      if ((key === "theme" || key === "chartColor") && BRIGHT_THEMES.has(value)) {
        score += 2 * weight
      }
      continue
    }

    if (token === "sans" && (key === "font" || key === "fontHeading")) {
      if (SANS_FONTS.has(value)) score += 2 * weight
      continue
    }

    if (token === "serif" && (key === "font" || key === "fontHeading")) {
      if (SERIF_FONTS.has(value)) score += 2 * weight
      continue
    }

    if (
      (token === "mono" || token === "monospaced") &&
      (key === "font" || key === "fontHeading")
    ) {
      if (MONO_FONTS.has(value)) score += 2 * weight
      continue
    }

    if (String(value).includes(token)) {
      score += weight
    }
  }

  return score
}

function scorePreset(item: PresetPageItem, query: string) {
  const queryText = query.toLowerCase()
  const tokens = tokenizeSearchQuery(query)
  if (!tokens.length) return 0

  const featureValues = [
    item.config.style,
    item.config.baseColor,
    item.config.theme,
    item.config.chartColor,
    item.config.fontHeading,
    item.config.font,
    item.config.iconLibrary,
    item.config.radius,
    item.config.menuColor,
    item.config.menuAccent,
  ]

  let score = 0
  for (const token of tokens) {
    if (item.code.toLowerCase().includes(token)) {
      score += 10
    }

    for (const value of featureValues) {
      const valueLower = String(value ?? "").toLowerCase()
      if (!valueLower) continue
      if (valueLower === token) {
        score += 8
      } else if (valueLower.includes(token)) {
        score += 3
      }
    }

    score += scoreTokenHint(token, item)
  }

  if (item.code.toLowerCase() === queryText) {
    score += 20
  }

  return score
}

function similarity(a: PresetPageItem, b: PresetPageItem) {
  const weights: Array<[keyof PresetPageItem["config"], number]> = [
    ["style", 1.4],
    ["baseColor", 1.3],
    ["theme", 1.2],
    ["chartColor", 1.2],
    ["fontHeading", 1],
    ["font", 1.8],
    ["iconLibrary", 0.8],
    ["radius", 0.6],
    ["menuColor", 0.35],
    ["menuAccent", 0.25],
  ]

  let sameWeight = 0
  let totalWeight = 0
  for (const [key, weight] of weights) {
    totalWeight += weight
    if (a.config[key] === b.config[key]) {
      sameWeight += weight
    }
  }

  return totalWeight > 0 ? sameWeight / totalWeight : 0
}

/** How similar two presets are on palette-driving fields (for MMR diversity). */
function paletteSimilarity(a: PresetPageItem, b: PresetPageItem) {
  const keys: Array<[keyof PresetPageItem["config"], number]> = [
    ["baseColor", 1.2],
    ["theme", 1.2],
    ["chartColor", 1.2],
    ["menuColor", 0.45],
  ]

  let sameWeight = 0
  let totalWeight = 0
  for (const [key, weight] of keys) {
    totalWeight += weight
    if (a.config[key] === b.config[key]) {
      sameWeight += weight
    }
  }

  return totalWeight > 0 ? sameWeight / totalWeight : 0
}

/**
 * Vibe tokens that describe mood/lighting but should not collapse results to one palette.
 * When present, MMR weights palette dimensions more so queries like "lyra dark" spread
 * baseColor / theme / chartColor.
 */
const PALETTE_VIBE_TOKENS = new Set([
  "dark",
  "light",
  "minimal",
  "bold",
  "vibrant",
  "colorful",
  "clean",
  "simple",
  "punchy",
])

export function wantsPaletteVariety(query: string) {
  const tokens = tokenizeSearchQuery(query)
  if (!tokens.some((t) => PALETTE_VIBE_TOKENS.has(t))) {
    return false
  }
  const pinnedThemeOrBase = tokens.filter(
    (t) =>
      PRESET_FILTER_OPTIONS.themes.includes(t as never) ||
      PRESET_FILTER_OPTIONS.baseColors.includes(t as never)
  )
  if (pinnedThemeOrBase.length >= 2) {
    return false
  }
  return true
}

function mmrSimilarity(a: PresetPageItem, b: PresetPageItem, paletteMode: boolean) {
  if (!paletteMode) return similarity(a, b)
  const p = paletteSimilarity(a, b)
  const s = similarity(a, b)
  return 0.74 * p + 0.26 * s
}

function paletteTripleKey(item: PresetPageItem) {
  return `${item.config.baseColor}|${item.config.theme}|${item.config.chartColor}`
}

type RankedEntry = { item: PresetPageItem; relevance: number }

/**
 * When vibe queries should show many colourways, the top-N by relevance alone can be
 * almost one palette. Round-robin across palette triples so MMR sees a mixed pool.
 */
function buildPaletteAwareShortlist(
  ranked: RankedEntry[],
  limit: number,
  paletteMode: boolean
): RankedEntry[] {
  if (!paletteMode || ranked.length <= limit) {
    return ranked.slice(0, limit)
  }

  const buckets = new Map<string, RankedEntry[]>()
  for (const entry of ranked) {
    const key = paletteTripleKey(entry.item)
    const list = buckets.get(key)
    if (list) list.push(entry)
    else buckets.set(key, [entry])
  }

  const bucketOrder = [...buckets.entries()].sort(
    (a, b) =>
      b[1][0].relevance - a[1][0].relevance ||
      a[0].localeCompare(b[0])
  )

  const out: RankedEntry[] = []
  let round = 0
  while (out.length < limit) {
    let added = false
    for (const [, bucket] of bucketOrder) {
      if (round < bucket.length && out.length < limit) {
        out.push(bucket[round])
        added = true
      }
    }
    if (!added) break
    round++
  }

  return out
}

export function getSampledCandidates(
  query: string,
  filters: PresetFilters,
  maxCandidates: number
) {
  const total = getPresetTotalCombinations(filters)
  if (total <= 0) return []

  const chunkSize = 100
  const totalPages = Math.max(1, Math.ceil(total / chunkSize))
  const pagesToSample = Math.min(totalPages, Math.max(16, Math.ceil(maxCandidates / chunkSize)))
  const seed = stableHash(query)

  const sampledPages = new Set<number>([
    1,
    Math.max(1, Math.floor(totalPages / 2)),
    totalPages,
  ])

  let stride = (seed % totalPages) + 1
  if (stride % 2 === 0) {
    stride += 1
  }
  if (stride > totalPages) {
    stride = Math.max(1, totalPages - 1)
  }

  for (let i = 0; sampledPages.size < pagesToSample && i < pagesToSample * 4; i++) {
    const page = ((seed + i * stride) % totalPages) + 1
    sampledPages.add(page)
  }

  const byCode = new Map<string, PresetPageItem>()
  for (const page of sampledPages) {
    for (const item of getPresetPage(page, chunkSize, filters)) {
      if (!byCode.has(item.code)) {
        byCode.set(item.code, item)
      }
      if (byCode.size >= maxCandidates) {
        break
      }
    }
    if (byCode.size >= maxCandidates) {
      break
    }
  }

  return [...byCode.values()]
}

export function getSmartPresetResults(
  query: string,
  filters: PresetFilters,
  maxResults: number
) {
  const candidates = getSampledCandidates(query, filters, 1600)
  return rankPresetCandidates(query, candidates, maxResults)
}

export function rankPresetCandidates(
  query: string,
  candidates: PresetPageItem[],
  maxResults: number
) {
  if (!candidates.length) return []

  const ranked = candidates
    .map((item) => ({ item, relevance: scorePreset(item, query) }))
    .filter((entry) => entry.relevance > 0)
    .sort((a, b) => b.relevance - a.relevance || a.item.code.localeCompare(b.item.code))

  const paletteMode = wantsPaletteVariety(query)
  const shortlist = buildPaletteAwareShortlist(ranked, 500, paletteMode)
  if (!shortlist.length) return []

  const lambda = paletteMode ? 0.42 : 0.6
  const diversityScale = paletteMode ? 16 : 12

  const selected: Array<(typeof shortlist)[number]> = []
  const remaining = [...shortlist]

  while (selected.length < maxResults && remaining.length) {
    let bestIndex = 0
    let bestScore = -Infinity

    for (let i = 0; i < remaining.length; i++) {
      const candidate = remaining[i]
      const maxSimilarity = selected.length
        ? Math.max(
            ...selected.map((chosen) =>
              mmrSimilarity(candidate.item, chosen.item, paletteMode)
            )
          )
        : 0
      const mmrScore =
        lambda * candidate.relevance - (1 - lambda) * maxSimilarity * diversityScale
      if (mmrScore > bestScore) {
        bestScore = mmrScore
        bestIndex = i
      }
    }

    selected.push(remaining.splice(bestIndex, 1)[0])
  }

  return selected.map((entry) => entry.item)
}
