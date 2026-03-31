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
