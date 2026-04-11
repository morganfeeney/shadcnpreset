import {
  getPresetPage,
  getPresetTotalCombinations,
  PRESET_FILTER_OPTIONS,
  type PresetFilters,
  type PresetPageItem,
} from "@/lib/preset-catalog"
import { getSemanticRelevanceScores } from "@/lib/search-semantic"
import { FUTURISTIC_FONTS, SAAS_FONTS } from "@/lib/search-font-tags"
import { tokenizeSearchQuery } from "@/lib/search-tokenize"

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
  futuristic: { font: 3, fontHeading: 2, chartColor: 1, theme: 1 },
  saas: { font: 3, fontHeading: 2, radius: 2 },
  professional: { font: 3, fontHeading: 2, radius: 2, menuAccent: 2 },
  formal: { menuAccent: 2, font: 2, style: 1 },
  business: { font: 3, fontHeading: 2, radius: 2 },
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

export { FUTURISTIC_FONTS, SAAS_FONTS } from "@/lib/search-font-tags"
export { TOKEN_ALIASES, tokenizeSearchQuery } from "@/lib/search-tokenize"

function stableHash(input: string) {
  let hash = 2166136261
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i)
    hash = Math.imul(hash, 16777619)
  }
  return hash >>> 0
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

    if (token === "futuristic" && (key === "font" || key === "fontHeading")) {
      if (FUTURISTIC_FONTS.has(value)) score += 2 * weight
      continue
    }

    if (
      token === "futuristic" &&
      (key === "theme" || key === "chartColor") &&
      BRIGHT_THEMES.has(value)
    ) {
      score += 2 * weight
      continue
    }

    if (token === "saas" && (key === "font" || key === "fontHeading")) {
      if (SAAS_FONTS.has(value)) score += 2 * weight
      continue
    }

    if (
      token === "saas" &&
      key === "radius" &&
      (value === "large" || value === "medium")
    ) {
      score += 2 * weight
      continue
    }

    if (token === "saas" && key === "menuAccent" && value === "subtle") {
      score += 2 * weight
      continue
    }

    if (
      (token === "professional" || token === "business") &&
      (key === "font" || key === "fontHeading")
    ) {
      if (SAAS_FONTS.has(value)) score += 2 * weight
      continue
    }

    if (
      (token === "professional" || token === "business") &&
      key === "radius" &&
      (value === "large" || value === "medium")
    ) {
      score += 2 * weight
      continue
    }

    if (
      (token === "professional" || token === "business") &&
      key === "menuAccent" &&
      value === "subtle"
    ) {
      score += 2 * weight
      continue
    }

    if (token === "formal" && key === "menuAccent" && value === "subtle") {
      score += 3 * weight
      continue
    }

    if (
      token === "formal" &&
      (key === "font" || key === "fontHeading") &&
      (SAAS_FONTS.has(value) || SERIF_FONTS.has(value))
    ) {
      score += 2 * weight
      continue
    }

    if (String(value).includes(token)) {
      score += weight
    }
  }

  return score
}

/**
 * Avoid treating heading font as a match for a body-font token when the heading is a
 * hyphenated variant (e.g. token "geist" vs heading "geist-mono"), or relevance
 * collapses to geist-mono headings while body is already pinned to geist.
 */
function isMisleadingHeadingPrefixMatch(
  fontHeadingValue: string,
  token: string
): boolean {
  const v = fontHeadingValue.toLowerCase()
  const t = token.toLowerCase()
  if (v === t) return false
  return v.startsWith(`${t}-`)
}

/** Heuristic score; exported for embedding budget / pre-sort only. */
export function scorePreset(item: PresetPageItem, query: string) {
  const queryText = query.toLowerCase()
  const tokens = tokenizeSearchQuery(query)
  if (!tokens.length) return 0

  const featureEntries: Array<[keyof PresetPageItem["config"], string | undefined]> =
    [
      ["style", item.config.style],
      ["baseColor", item.config.baseColor],
      ["theme", item.config.theme],
      ["chartColor", item.config.chartColor],
      ["fontHeading", item.config.fontHeading],
      ["font", item.config.font],
      ["iconLibrary", item.config.iconLibrary],
      ["radius", item.config.radius],
      ["menuColor", item.config.menuColor],
      ["menuAccent", item.config.menuAccent],
    ]

  let score = 0
  for (const token of tokens) {
    if (item.code.toLowerCase().includes(token)) {
      score += 10
    }

    for (const [key, value] of featureEntries) {
      const valueLower = String(value ?? "").toLowerCase()
      if (!valueLower) continue
      if (valueLower === token) {
        score += 8
      } else if (valueLower.includes(token)) {
        if (
          key === "fontHeading" &&
          isMisleadingHeadingPrefixMatch(valueLower, token)
        ) {
          continue
        }
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

/** How similar two presets are on palette + icon (for MMR diversity). */
function paletteSimilarity(a: PresetPageItem, b: PresetPageItem) {
  const keys: Array<[keyof PresetPageItem["config"], number]> = [
    ["baseColor", 1.2],
    ["theme", 1.2],
    ["chartColor", 1.2],
    ["iconLibrary", 1.05],
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

/** Open-vocabulary / intent terms where BM25 + hints should still show varied palettes & icons. */
const LEXICAL_VARIETY_TOKENS = new Set([
  "futuristic",
  "saas",
  "dashboard",
  "startup",
  "product",
  "founder",
  "ui",
  "app",
  "web",
  "elegant",
  "playful",
  "crypto",
  "corporate",
  "glass",
  "admin",
  "interface",
  "design",
  "application",
  "professional",
  "formal",
  "business",
])

const RESULT_VARIETY_TOKENS = new Set([
  ...PALETTE_VIBE_TOKENS,
  ...LEXICAL_VARIETY_TOKENS,
])

export function wantsPaletteVariety(query: string) {
  const tokens = tokenizeSearchQuery(query)

  const styleTokens = tokens.filter((t) =>
    PRESET_FILTER_OPTIONS.styles.includes(t as never)
  )
  const baseColors = tokens.filter((t) =>
    PRESET_FILTER_OPTIONS.baseColors.includes(t as never)
  )
  // Names like "stone" / "neutral" exist in both theme and base lists; search matches
  // base first. Do not treat those as an explicit theme pin for variety heuristics.
  const themePins = tokens.filter((t) => {
    if (!PRESET_FILTER_OPTIONS.themes.includes(t as never)) return false
    if (PRESET_FILTER_OPTIONS.baseColors.includes(t as never)) return false
    return true
  })

  const pinnedThemeOrBase = tokens.filter(
    (t) =>
      PRESET_FILTER_OPTIONS.themes.includes(t as never) ||
      PRESET_FILTER_OPTIONS.baseColors.includes(t as never)
  )

  // Semantic theme pin (e.g. "pink", "lime") without a neutral base token: still
  // spread across baseColor (zinc, stone, …). Pink/lime are theme/chart — not bases.
  if (themePins.length >= 1) {
    return baseColors.length === 0
  }

  // One style + one base (e.g. "nova stone"): theme & chart still vary — show variety
  if (styleTokens.length === 1 && baseColors.length === 1) {
    return true
  }

  if (!tokens.some((t) => RESULT_VARIETY_TOKENS.has(t))) {
    return false
  }
  if (pinnedThemeOrBase.length >= 2) {
    return false
  }
  return true
}

function mmrSimilarity(a: PresetPageItem, b: PresetPageItem, paletteMode: boolean) {
  if (!paletteMode) return similarity(a, b)
  const p = paletteSimilarity(a, b)
  const s = similarity(a, b)
  return 0.78 * p + 0.22 * s
}

/** Bucket key for shortlist round-robin: palette + icon set. */
function diversityBucketKey(item: PresetPageItem) {
  return `${item.config.baseColor}|${item.config.theme}|${item.config.chartColor}|${item.config.iconLibrary}`
}

type RankedEntry = { item: PresetPageItem; relevance: number }

/**
 * Browsing “family”: layout + neutrals/accents + heading face. Body font and icon swaps
 * are minor; cap how many entries per family so one match does not fill the MMR pool.
 */
function browseBucketKey(item: PresetPageItem) {
  const c = item.config
  return [c.style, c.baseColor, c.theme, c.chartColor, c.fontHeading].join("\0")
}

function interleaveRankedByBucket(
  ranked: RankedEntry[],
  limit: number,
  bucketKey: (item: PresetPageItem) => string
): RankedEntry[] {
  const buckets = new Map<string, RankedEntry[]>()
  for (const entry of ranked) {
    const key = bucketKey(entry.item)
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

/**
 * When users browse by natural-language query, at most one preset per browse family
 * (layout + palette + heading). Relaxing that cap refills the pool from the same top
 * matches and undoes diversity — MMR only needs a wide pool, not 500 near-duplicates.
 */
function buildBrowseCappedShortlist(ranked: RankedEntry[], limit: number): RankedEntry[] {
  const out: RankedEntry[] = []
  const seenFamily = new Set<string>()
  for (const entry of ranked) {
    if (out.length >= limit) break
    const key = browseBucketKey(entry.item)
    if (seenFamily.has(key)) continue
    seenFamily.add(key)
    out.push(entry)
  }
  return out
}

/**
 * Dedupe key for search cards: palette + typography + icon set + style — the dimensions
 * users see in the grid. Omit radius / menuColor / menuAccent: many codes share the same
 * visible preset but differ only there, which looked like duplicate rows.
 */
function configSignatureKey(item: PresetPageItem) {
  const c = item.config
  return [
    c.style,
    c.baseColor,
    c.theme,
    c.chartColor,
    c.fontHeading,
    c.font,
    c.iconLibrary,
  ].join("\0")
}

function dedupeRankedByConfigSignature(ranked: RankedEntry[]): RankedEntry[] {
  const seen = new Set<string>()
  const out: RankedEntry[] = []
  for (const entry of ranked) {
    const key = configSignatureKey(entry.item)
    if (seen.has(key)) continue
    seen.add(key)
    out.push(entry)
  }
  return out
}

/**
 * When vibe queries should show many colourways and icon sets, the top-N by relevance
 * alone can be almost one palette + one icon library. Round-robin across buckets so
 * MMR sees a mixed pool.
 *
 * When `paletteMode` is false, cap entries per browse family (layout + palette + heading)
 * so the grid explores more distinct looks for the same query.
 */
function buildPaletteAwareShortlist(
  ranked: RankedEntry[],
  limit: number,
  paletteMode: boolean
): RankedEntry[] {
  if (!paletteMode) {
    return buildBrowseCappedShortlist(ranked, limit)
  }

  if (ranked.length <= limit) {
    return ranked.slice(0, limit)
  }

  return interleaveRankedByBucket(ranked, limit, diversityBucketKey)
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

export async function getSmartPresetResults(
  query: string,
  filters: PresetFilters,
  maxResults: number
) {
  const candidates = getSampledCandidates(query, filters, 1600)
  const semanticScores = await getSemanticRelevanceScores(candidates, query)
  return rankPresetCandidates(query, candidates, maxResults, semanticScores)
}

export function rankPresetCandidates(
  query: string,
  candidates: PresetPageItem[],
  maxResults: number,
  /** OpenAI embedding cosine scores (`getSemanticRelevanceScores` in search-semantic). */
  semanticScores?: Map<string, number>
) {
  if (!candidates.length) return []

  const scored = candidates.map((item) => {
    let relevance = scorePreset(item, query)
    const sem = semanticScores?.get(item.code) ?? 0
    if (sem > 0) {
      relevance += 15 + sem * 48
    }
    return { item, relevance }
  })

  const ranked = scored
    .filter((entry) => entry.relevance > 0)
    .sort((a, b) => b.relevance - a.relevance || a.item.code.localeCompare(b.item.code))

  if (!ranked.length) return []

  const dedupedByLook = dedupeRankedByConfigSignature(ranked)

  const paletteMode = wantsPaletteVariety(query)
  const shortlist = buildPaletteAwareShortlist(dedupedByLook, 500, paletteMode)
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
