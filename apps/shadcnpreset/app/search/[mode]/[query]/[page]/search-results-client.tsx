"use client"

import { useQuery } from "@tanstack/react-query"

import { ListView } from "@/components/home-featured-section"
import { HomePaginationNav } from "@/components/home-pagination-nav"
import { HomeResultsSkeleton } from "@/components/home-results-skeleton"
import { buildSearchHref, SEARCH_PAGE_SIZE, type SearchMode } from "@/lib/search-route"
import type { SearchPageData } from "@/lib/search-data"

type SearchResultsClientProps = {
  mode: SearchMode
  query: string
  requestedPage: number
}

export function SearchResultsClient({
  mode,
  query,
  requestedPage,
}: SearchResultsClientProps) {
  const searchQuery = useQuery({
    queryKey: ["searchPage", mode, query, requestedPage],
    queryFn: async (): Promise<SearchPageData> => {
      const response = await fetch(
        `/api/search/${mode}/${encodeURIComponent(query)}/${requestedPage}`,
        {
          method: "GET",
          cache: "no-store",
        }
      )

      if (!response.ok) {
        throw new Error("Failed to fetch search results")
      }

      return (await response.json()) as SearchPageData
    },
  })

  if (!searchQuery.data) {
    return <HomeResultsSkeleton />
  }

  const payload = searchQuery.data
  const safePage = payload.safePage
  const hasPrevious = safePage > 1
  const hasNext = payload.hasNext
  const pagedItems = payload.items

  return (
    <main className="grid gap-4">
      <header className="space-y-2">
        <h2 className="text-lg font-semibold tracking-tight md:text-xl">
          {payload.mode === "smart" ? "Smart search results" : "Code search result"}
        </h2>
        <p className="text-sm text-muted-foreground">
          {payload.mode === "smart"
            ? `Showing diverse results for "${payload.query}".`
            : `Showing exact code match for "${payload.query}".`}
        </p>
      </header>

      <HomePaginationNav
        previousHref={
          hasPrevious
            ? buildSearchHref(payload.mode, payload.query, safePage - 1)
            : undefined
        }
        nextHref={
          hasNext ? buildSearchHref(payload.mode, payload.query, safePage + 1) : undefined
        }
        safePage={safePage}
      />

      {!pagedItems.length ? (
        <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
          No presets matched this search. Try a different mode or query.
        </div>
      ) : null}

      <ListView
        items={pagedItems}
        safePage={safePage}
        totalPages={safePage + (hasNext ? 1 : 0)}
        pageSize={SEARCH_PAGE_SIZE}
        useLiveFeed={false}
      />
    </main>
  )
}
