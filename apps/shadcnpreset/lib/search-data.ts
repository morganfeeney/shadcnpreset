import { unstable_cache } from "next/cache"

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
  safePage: number
  hasNext: boolean
  items: SearchListItem[]
}

const getSearchItemsWindow = unstable_cache(
  async (
    mode: SearchMode,
    query: string,
    neededCount: number
  ): Promise<SearchPageData["items"]> => {
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
  },
  ["search-items"],
  { revalidate: 300 }
)

export async function getSearchPageData(
  mode: SearchMode,
  query: string,
  requestedPage: number
): Promise<SearchPageData> {
  const safePage = Math.max(1, requestedPage)
  const start = (safePage - 1) * SEARCH_PAGE_SIZE
  const neededCount = start + SEARCH_PAGE_SIZE + 1
  const allItems = await getSearchItemsWindow(mode, query, neededCount)
  const pageEnd = start + SEARCH_PAGE_SIZE

  return {
    mode,
    query,
    safePage,
    hasNext: allItems.length > pageEnd,
    items: allItems.slice(start, pageEnd),
  }
}
