export type SearchMode = "code" | "smart"

export const SEARCH_PAGE_SIZE = 24

export function isSearchMode(value: string): value is SearchMode {
  return value === "code" || value === "smart"
}

export function buildSearchHref(
  mode: SearchMode,
  query: string
) {
  return `/search/${mode}/${encodeURIComponent(query)}`
}

/** Decode a path segment that may still contain %20 or + from the URL. */
export function decodeSearchQuerySegment(raw: string) {
  const trimmed = raw.trim()
  try {
    return decodeURIComponent(trimmed.replace(/\+/g, "%20")).trim()
  } catch {
    return trimmed
  }
}

function segmentParam(value: string | string[] | undefined) {
  if (typeof value === "string") return value
  if (Array.isArray(value) && value[0]) return value[0]
  return ""
}

/**
 * When the app is on `/search/[mode]/[query]`, returns mode + decoded query for form sync.
 */
export function parseSearchRouteFromLocation(
  pathname: string | null | undefined,
  params: { mode?: string | string[]; query?: string | string[] }
): { mode: SearchMode; query: string } | null {
  if (!pathname?.startsWith("/search/")) return null

  const modeRaw = segmentParam(params.mode)
  const queryRaw = segmentParam(params.query)

  if (!isSearchMode(modeRaw)) return null

  const query = decodeSearchQuerySegment(queryRaw)
  return { mode: modeRaw, query }
}
