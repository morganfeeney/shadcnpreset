export type SearchMode = "code" | "smart"

export const SEARCH_PAGE_SIZE = 24

export function isSearchMode(value: string): value is SearchMode {
  return value === "code" || value === "smart"
}

export function buildSearchHref(
  mode: SearchMode,
  query: string,
  page = 1
) {
  const safePage = Number.isFinite(page) && page > 0 ? Math.floor(page) : 1
  return `/search/${mode}/${encodeURIComponent(query)}/${safePage}`
}
