"use client"

import Link from "next/link"
import { useParams } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { Search } from "lucide-react"

import { ListView } from "@/components/list-view"
import { HomeResultsSkeleton } from "@/components/home-results-skeleton"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { SMART_SEARCH_SUGGESTIONS } from "@/lib/search-suggestions"
import {
  SEARCH_PAGE_SIZE,
  buildSearchHref,
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
    return <HomeResultsSkeleton />
  }

  const payload = searchQuery.data
  const results = payload.items
  const keyword = payload.query

  if (!results.length) {
    const normalizedKeyword = keyword.trim().toLowerCase()
    const suggestionLinks = SMART_SEARCH_SUGGESTIONS.filter(
      (s) => s.query.trim().toLowerCase() !== normalizedKeyword
    )
    const links =
      suggestionLinks.length > 0
        ? suggestionLinks
        : [...SMART_SEARCH_SUGGESTIONS]

    return (
      <main className="grid gap-4">
        <Empty className="min-h-[30vh] border border-border">
          <EmptyMedia variant="icon">
            <Search className="text-muted-foreground" />
          </EmptyMedia>
          <EmptyHeader>
            <EmptyTitle>
              No results were found for &quot;{keyword}&quot;
            </EmptyTitle>
            <EmptyDescription>
              {payload.mode === "code"
                ? "No preset used that exact code. Try smart search with a description, or start from one of these."
                : "Try different words, switch mode in the search bar, or explore one of these example searches."}
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <ul className="flex flex-wrap justify-center gap-2">
              {links.map(({ label, query: suggestionQuery }) => (
                <li key={suggestionQuery}>
                  <Link
                    href={buildSearchHref("smart", suggestionQuery)}
                    className="inline-flex rounded-md border border-border bg-background px-2.5 py-1 text-sm text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </EmptyContent>
        </Empty>
      </main>
    )
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
