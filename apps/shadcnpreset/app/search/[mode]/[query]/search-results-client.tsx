"use client"

import { useParams } from "next/navigation"
import { useQuery } from "@tanstack/react-query"

import { ListView } from "@/components/home-featured-section"
import { HomeResultsSkeleton } from "@/components/home-results-skeleton"
import { SEARCH_PAGE_SIZE, isSearchMode, type SearchMode } from "@/lib/search-route"
import type { SearchPageData } from "@/lib/search-data"

type SearchResultsClientProps = {
  mode: SearchMode
  query: string
}

function segmentToString(value: string | string[] | undefined, fallback: string) {
  if (typeof value === "string") return value.trim()
  if (Array.isArray(value) && value[0]) return value[0].trim()
  return fallback.trim()
}

export function SearchResultsClient({ mode, query }: SearchResultsClientProps) {
  const params = useParams()

  const routeMode = segmentToString(params.mode as string | string[] | undefined, mode)
  const routeQuery = segmentToString(params.query as string | string[] | undefined, query)

  const effectiveMode: SearchMode = isSearchMode(routeMode) ? routeMode : mode
  const effectiveQuery = routeQuery || query

  const searchQuery = useQuery({
    queryKey: ["searchPage", effectiveMode, effectiveQuery],
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: "always",
    queryFn: async ({ signal }): Promise<SearchPageData> => {
      const response = await fetch(
        `/api/search/${effectiveMode}/${encodeURIComponent(effectiveQuery)}`,
        {
          method: "GET",
          cache: "no-store",
          signal,
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
  const results = payload.items

  return (
    <main className="grid gap-4">
      <header className="space-y-2">
        <h2 className="text-lg font-semibold tracking-tight md:text-xl">
          {payload.mode === "smart" ? "Smart search results" : "Code search result"}
        </h2>
        <p className="text-sm text-muted-foreground">
          {payload.mode === "smart" ? (
            <>
              Showing the best diverse matches for &quot;{payload.query}&quot;.
              <span className="mt-1.5 block text-xs text-muted-foreground">
                Two semantic colours pair as theme then chart (e.g. indigo orange). The
                words chart or charts are optional hints only.
              </span>
            </>
          ) : (
            `Showing exact code match for "${payload.query}".`
          )}
        </p>
      </header>

      {!results.length ? (
        <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
          No presets matched this search. Try a different mode or query.
        </div>
      ) : null}

      <ListView
        key={`${effectiveMode}-${effectiveQuery}`}
        items={results}
        pageSize={SEARCH_PAGE_SIZE}
        useLiveFeed={false}
      />
    </main>
  )
}
