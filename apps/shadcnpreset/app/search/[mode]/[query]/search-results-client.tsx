"use client"

import { useQuery } from "@tanstack/react-query"

import { ListView } from "@/components/home-featured-section"
import { HomeResultsSkeleton } from "@/components/home-results-skeleton"
import { SEARCH_PAGE_SIZE, type SearchMode } from "@/lib/search-route"
import type { SearchPageData } from "@/lib/search-data"

type SearchResultsClientProps = {
  mode: SearchMode
  query: string
}

export function SearchResultsClient({ mode, query }: SearchResultsClientProps) {
  const searchQuery = useQuery({
    queryKey: ["searchPage", mode, query],
    queryFn: async ({ signal }): Promise<SearchPageData> => {
      const response = await fetch(`/api/search/${mode}/${encodeURIComponent(query)}`, {
        method: "GET",
        cache: "no-store",
        signal,
      })

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
  const results = payload.items

  return (
    <main className="grid gap-4">
      <header className="space-y-2">
        <h2 className="text-lg font-semibold tracking-tight md:text-xl">
          {payload.mode === "smart" ? "Smart search results" : "Code search result"}
        </h2>
        <p className="text-sm text-muted-foreground">
          {payload.mode === "smart"
            ? `Showing the best diverse matches for "${payload.query}".`
            : `Showing exact code match for "${payload.query}".`}
        </p>
      </header>

      {!results.length ? (
        <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
          No presets matched this search. Try a different mode or query.
        </div>
      ) : null}

      <ListView items={results} pageSize={SEARCH_PAGE_SIZE} useLiveFeed={false} />
    </main>
  )
}
