import {
  getPresetPage,
  getPresetTotalCombinations,
  type PresetFilters,
  type PresetPageItem,
} from "@/lib/preset-catalog"

type WeightedTokenMatch = Partial<Record<keyof PresetPageItem["config"], number>>
type QueryContext = {
  queryText: string
  tokens: string[]
}

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

const SANS_FONTS = new Set([
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

const SERIF_FONTS = new Set([
  "lora",
  "merriweather",
  "playfair-display",
  "noto-serif",
  "roboto-slab",
])

const MONO_FONTS = new Set(["jetbrains-mono", "geist-mono"])

function stableHash(input: string) {
  let hash = 2166136261
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i)
    hash = Math.imul(hash, 16777619)
  }
  return hash >>> 0
}

function tokenize(query: string) {
  return query
    .toLowerCase()
    .split(/[^a-z0-9-]+/)
    .map((token) => token.trim())
    .filter(Boolean)
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

    if ((token === "mono" || token === "monospaced") && (key === "font" || key === "fontHeading")) {
      if (MONO_FONTS.has(value)) score += 2 * weight
      continue
    }

    if (String(value).includes(token)) {
      score += weight
    }
  }

  return score
}

function scorePreset(item: PresetPageItem, context: QueryContext) {
  if (!context.tokens.length) return 0

  const featureValuesLower = [
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
  ].map((value) => String(value ?? "").toLowerCase())
  const codeLower = item.code.toLowerCase()

  let score = 0
  for (const token of context.tokens) {
    if (codeLower.includes(token)) {
      score += 10
    }

    for (const valueLower of featureValuesLower) {
      if (!valueLower) continue
      if (valueLower === token) {
        score += 8
      } else if (valueLower.includes(token)) {
        score += 3
      }
    }

    score += scoreTokenHint(token, item)
  }

  if (codeLower === context.queryText) {
    score += 20
  }

  return score
}

function diversityBucket(item: PresetPageItem) {
  return `${item.config.baseColor}|${item.config.theme}|${item.config.iconLibrary}|${item.config.font}|${item.config.radius}`
}

function selectDiverse(
  ranked: Array<{ item: PresetPageItem; relevance: number }>,
  maxResults: number
) {
  const selected: Array<{ item: PresetPageItem; relevance: number }> = []
  let pool = [...ranked]
  const bucketCounts = new Map<string, number>()
  let pass = 0

  while (selected.length < maxResults && pool.length) {
    const maxPerBucket = 1 + Math.floor(pass / 2)
    const nextPool: typeof pool = []
    let pickedInPass = 0

    for (const candidate of pool) {
      if (selected.length >= maxResults) {
        break
      }

      const bucket = diversityBucket(candidate.item)
      const count = bucketCounts.get(bucket) ?? 0
      if (count < maxPerBucket) {
        selected.push(candidate)
        bucketCounts.set(bucket, count + 1)
        pickedInPass += 1
      } else {
        nextPool.push(candidate)
      }
    }

    if (!pickedInPass) {
      selected.push(...nextPool.slice(0, maxResults - selected.length))
      break
    }

    pool = nextPool
    pass += 1
  }

  return selected
}

function getSampledCandidates(
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
  const safeMaxResults = Math.max(1, maxResults)
  const maxCandidates = Math.min(700, Math.max(160, safeMaxResults * 6))
  const candidates = getSampledCandidates(query, filters, maxCandidates)
  if (!candidates.length) return []

  const context: QueryContext = {
    queryText: query.toLowerCase(),
    tokens: tokenize(query),
  }

  const ranked = candidates
    .map((item) => ({ item, relevance: scorePreset(item, context) }))
    .sort((a, b) => b.relevance - a.relevance || a.item.code.localeCompare(b.item.code))

  const shortlistSize = Math.min(
    ranked.length,
    Math.max(Math.ceil(safeMaxResults * 2), Math.min(240, maxCandidates))
  )
  const shortlist = ranked.slice(0, shortlistSize)
  if (!shortlist.length) return []

  const selected = selectDiverse(shortlist, safeMaxResults)

  return selected.map((entry) => entry.item)
}
