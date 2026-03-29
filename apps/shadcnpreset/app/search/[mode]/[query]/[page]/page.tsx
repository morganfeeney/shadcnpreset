import { headers } from "next/headers"
import { notFound } from "next/navigation"

import { ListView } from "@/components/home-featured-section"
import { HomeHero } from "@/components/home-hero"
import { HomeLayout } from "@/components/home-layout"
import { HomePaginationNav } from "@/components/home-pagination-nav"
import { type PresetPageItem } from "@/lib/preset-catalog"
import { buildSearchHref, isSearchMode, SEARCH_PAGE_SIZE } from "@/lib/search-route"

type SearchPageProps = {
  params: Promise<{
    mode: string
    query: string
    page: string
  }>
}

type SearchPayload = {
  mode: "code" | "smart"
  query: string
  safePage: number
  totalPages: number
  totalResults: number
  items: PresetPageItem[]
}

export default async function SearchPage({ params }: SearchPageProps) {
  const resolvedParams = await params

  if (!isSearchMode(resolvedParams.mode)) {
    notFound()
  }

  const query = resolvedParams.query.trim()
  if (!query) {
    notFound()
  }

  const requestHeaders = await headers()
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host")
  if (!host) {
    notFound()
  }
  const protocol = requestHeaders.get("x-forwarded-proto") ?? "http"
  const url = `${protocol}://${host}/api/search/${resolvedParams.mode}/${encodeURIComponent(query)}/${resolvedParams.page}`

  const response = await fetch(url, { cache: "no-store" })
  if (!response.ok) {
    notFound()
  }
  const payload = (await response.json()) as SearchPayload

  const safePage = payload.safePage
  const totalPages = payload.totalPages
  const hasPrevious = safePage > 1
  const hasNext = safePage < totalPages
  const pagedItems = payload.items

  return (
    <HomeLayout>
      <HomeHero />

      <main className="space-y-8 md:space-y-10">
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
            hasPrevious ? buildSearchHref(payload.mode, payload.query, safePage - 1) : undefined
          }
          nextHref={
            hasNext ? buildSearchHref(payload.mode, payload.query, safePage + 1) : undefined
          }
          safePage={safePage}
          totalPages={totalPages}
        />

        {!pagedItems.length ? (
          <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
            No presets matched this search. Try a different mode or query.
          </div>
        ) : null}

        <ListView
          items={pagedItems}
          safePage={safePage}
          totalPages={totalPages}
          pageSize={SEARCH_PAGE_SIZE}
          useLiveFeed={false}
        />
      </main>
    </HomeLayout>
  )
}
