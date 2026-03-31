export const TOKEN_ALIASES: Record<string, string> = {
  fututistic: "futuristic",
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

/**
 * Per-token rewrites after splitting (avoids breaking full ids like `playfair-display`).
 * Keys are lowercase tokens users type; values are catalog ids.
 */
const TOKEN_NORMALIZATION: Record<string, string> = {
  playfair: "playfair-display",
}

function splitSearchTokens(query: string) {
  const normalizedQuery = Object.entries(TOKEN_ALIASES).reduce(
    (currentQuery, [source, target]) => currentQuery.replaceAll(source, target),
    query.toLowerCase()
  )

  return normalizedQuery
    .split(/[^a-z0-9-]+/)
    .map((token) => token.trim())
    .filter(Boolean)
    .map((token) => TOKEN_NORMALIZATION[token] ?? token)
}

export function tokenizeSearchQuery(query: string) {
  return [...new Set(splitSearchTokens(query))]
}

/** Same tokenization as `tokenizeSearchQuery` but preserves order and duplicates (for constraints). */
export function tokenizeSearchQueryOrdered(query: string) {
  return splitSearchTokens(query)
}
