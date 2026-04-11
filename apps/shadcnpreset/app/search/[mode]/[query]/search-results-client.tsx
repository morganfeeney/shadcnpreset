"use client"

import { notFound, useParams } from "next/navigation"
import { useQuery } from "@tanstack/react-query"

import { ListView } from "@/components/list-view"
import { CardListSkeleton } from "@/components/card-list-skeleton"
import {
  SEARCH_PAGE_SIZE,
  isSearchMode,
  type SearchMode,
} from "@/lib/search-route"
import type { SearchPageData } from "@/lib/search-data"

type SearchResultsClientProps = {
  mode: SearchMode
  query: string
}

function segmentToString(
  value: string | string[] | undefined,
  fallback: string
) {
  if (typeof value === "string") return value.trim()
  if (Array.isArray(value) && value[0]) return value[0].trim()
  return fallback.trim()
}

export function SearchResultsClient({ mode, query }: SearchResultsClientProps) {
  const params = useParams()

  const routeMode = segmentToString(
    params.mode as string | string[] | undefined,
    mode
  )
  const routeQuery = segmentToString(
    params.query as string | string[] | undefined,
    query
  )

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
    return <CardListSkeleton />
  }

  const payload = searchQuery.data
  const results = payload.items
  const keyword = payload.query

  if (!results.length) {
    notFound()
  }

  return (
    <main className="grid gap-4">
      <header className="space-y-2">
        <h2 className="text-lg font-display md:text-xl">
          {payload.mode === "smart"
            ? "Your search results"
            : "Code search result"}
        </h2>
        <p className="text-sm text-muted-foreground">
          {payload.mode === "smart" ? (
            <>Showing the best matches for &quot;{keyword}&quot;.</>
          ) : (
            `Showing exact code match for "${keyword}".`
          )}
        </p>
      </header>

      <ListView
        key={`${effectiveMode}-${effectiveQuery}`}
        items={results}
        pageSize={SEARCH_PAGE_SIZE}
        useLiveFeed={false}
      />
    </main>
  )
}
