import { resolvePresetFromCode } from "@/lib/preset"
import { getSmartPresetResults } from "@/lib/preset-smart-search"
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

  const results = getSmartPresetResults(query, {}, neededCount)
  return results.map((item) => ({
    code: item.code,
    baseColor: item.config.baseColor,
    iconLibrary: item.config.iconLibrary,
    font: item.config.font,
  }))
}

export async function getSearchPageData(
  mode: SearchMode,
  query: string
): Promise<SearchPageData> {
  const allItems = await getSearchItemsWindow(mode, query, SEARCH_PAGE_SIZE)
  return {
    mode,
    query,
    items: allItems.slice(0, SEARCH_PAGE_SIZE),
  }
}
