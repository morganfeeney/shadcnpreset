"use client"

import Link from "next/link"
import { useParams } from "next/navigation"
import { useQuery } from "@tanstack/react-query"

import { ListView } from "@/components/list-view"
import { CardListSkeleton } from "@/components/card-list-skeleton"
import {
  SEARCH_PAGE_SIZE,
  buildHomeNewSearchHref,
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
    // Same query is fresh briefly so dev Strict Mode / remounts do not fire a
    // second fetch that aborts the first. Changing the URL still uses a new key.
    staleTime: 60_000,
    gcTime: 5 * 60_000,
    refetchOnMount: true,
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
    const exampleQueries = [
      { label: "Vibrant dashboard", q: "vibrant dashboard" },
      { label: "Professional SaaS", q: "professional saas" },
      { label: "Pink minimal", q: "pink minimal" },
    ]

    return (
      <main className="grid max-w-lg gap-4">
        <header className="space-y-2">
          <h2 className="text-lg font-display md:text-xl">No presets found</h2>
          <p className="text-sm text-muted-foreground">
            {payload.mode === "smart" ? (
              <>
                We couldn&apos;t match &quot;{keyword}&quot; to presets. Try
                adding colour, font, or layout words (for example &quot;rounded
                cards&quot; or &quot;serif blog&quot;).
              </>
            ) : (
              <>
                No preset exists with code &quot;{keyword}&quot;. Check the code
                and try again, or open the gallery from the home page.
              </>
            )}
          </p>
        </header>
        {payload.mode === "smart" ? (
          <div className="space-y-2 rounded-lg border border-border bg-muted/30 px-4 py-3 text-sm">
            <p className="font-medium text-foreground">Try one of these</p>
            <ul className="list-inside list-disc space-y-1 text-muted-foreground">
              {exampleQueries.map((ex) => (
                <li key={ex.q}>
                  <Link
                    className="text-foreground underline-offset-4 hover:underline"
                    href={buildSearchHref("smart", ex.q)}
                  >
                    {ex.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
        <p className="text-sm">
          <Link
            className="font-medium text-foreground underline-offset-4 hover:underline"
            href={buildHomeNewSearchHref("smart")}
          >
            New search from home
          </Link>
        </p>
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
