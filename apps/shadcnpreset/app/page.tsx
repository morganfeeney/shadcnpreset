import Link from "next/link"

import { ListView } from "@/components/home-featured-section"
import { HomeHero } from "@/components/home-hero"
import { type PresetPageItem } from "@/lib/preset-catalog"
import { getPresetFeedPage } from "@/lib/preset-feed"
import { resolvePresetFromCode } from "@/lib/preset"
import { getSmartPresetResults } from "@/lib/preset-smart-search"
import { HomeLayout } from "@/components/home-layout"

export const dynamic = "force-dynamic"
export const revalidate = 0

type HomePageProps = {
  searchParams: Promise<{
    page?: string
    size?: string
    mode?: string
    query?: string
  }>
}

function parsePositiveInt(value: string | undefined, fallback: number) {
  const parsed = Number.parseInt(value ?? "", 10)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const resolvedSearchParams = await searchParams
  const pageSize = Math.min(60, parsePositiveInt(resolvedSearchParams.size, 24))
  const page = parsePositiveInt(resolvedSearchParams.page, 1)
  const mode = resolvedSearchParams.mode === "smart" ? "smart" : "code"
  const query = (resolvedSearchParams.query ?? "").trim()
  const isSearchMode = Boolean(query)

  let feed: Awaited<ReturnType<typeof getPresetFeedPage>> | null = null
  let items: PresetPageItem[] = []
  let totalResults = 0

  if (isSearchMode) {
    if (mode === "code" && query) {
      const resolved = resolvePresetFromCode(query)
      if (resolved) {
        totalResults = 1
        items = [{ index: 0, code: resolved.code, config: resolved }]
      }
    } else if (mode === "smart" && query) {
      const smartResults = getSmartPresetResults(query, {}, 360)
      totalResults = smartResults.length
      items = smartResults
    }
  } else {
    feed = await getPresetFeedPage(page, pageSize)
  }

  const totalPages = isSearchMode
    ? Math.max(1, Math.ceil(totalResults / pageSize))
    : (feed?.totalPages ?? 1)
  const safePage = Math.min(Math.max(1, page), totalPages)
  const hasPrevious = safePage > 1
  const hasNext = safePage < totalPages

  if (isSearchMode) {
    if (mode === "smart" && query) {
      const start = (safePage - 1) * pageSize
      const end = start + pageSize
      items = items.slice(start, end)
    } else if (safePage > 1) {
      items = []
    }
  }

  function pageHref(nextPage: number) {
    const params = new URLSearchParams()
    params.set("page", String(nextPage))
    params.set("size", String(pageSize))
    if (query) {
      params.set("query", query)
      params.set("mode", mode)
    }
    return `/?${params.toString()}`
  }

  return (
    <HomeLayout>
      <HomeHero />

      <main className="space-y-8 md:space-y-10">
        {isSearchMode ? (
          <header className="space-y-2">
            <h2 className="text-lg font-semibold tracking-tight md:text-xl">
              {mode === "smart" && query
                ? "Smart search results"
                : "Code search result"}
            </h2>
            <p className="text-sm text-muted-foreground">
              {mode === "smart" && query
                ? `Showing diverse results for "${query}".`
                : `Showing exact code match for "${query}".`}
            </p>
          </header>
        ) : null}

        <div className="preset-nav">
          {hasPrevious ? (
            <Link href={pageHref(safePage - 1)}>Previous</Link>
          ) : (
            <span>Previous</span>
          )}
          <span>
            Page <code>{safePage.toLocaleString()}</code> of{" "}
            <code>{totalPages.toLocaleString()}</code>
          </span>
          {hasNext ? (
            <Link href={pageHref(safePage + 1)}>Next</Link>
          ) : (
            <span>Next</span>
          )}
        </div>

        {isSearchMode && !items.length ? (
          <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
            No presets matched this search. Try a different mode or query.
          </div>
        ) : null}

        <ListView
          items={
            isSearchMode ? items : ((feed?.items ?? []) as PresetPageItem[])
          }
          safePage={safePage}
          totalPages={totalPages}
          pageSize={pageSize}
          useLiveFeed={!isSearchMode}
        />
      </main>
    </HomeLayout>
  )
}
