import { ListView } from "@/components/home-featured-section"
import { HomeHero } from "@/components/home-hero"
import { HomePaginationNav } from "@/components/home-pagination-nav"
import { getPresetFeedPage } from "@/lib/preset-feed"
import { HomeLayout } from "@/components/home-layout"

export const dynamic = "force-dynamic"
export const revalidate = 0

type HomePageProps = {
  searchParams: Promise<{
    page?: string
    size?: string
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
  const feed = await getPresetFeedPage(page, pageSize)

  const totalPages = feed.totalPages
  const safePage = Math.min(Math.max(1, page), totalPages)
  const hasPrevious = safePage > 1
  const hasNext = safePage < totalPages

  function pageHref(nextPage: number) {
    const params = new URLSearchParams()
    params.set("page", String(nextPage))
    params.set("size", String(pageSize))
    return `/?${params.toString()}`
  }

  return (
    <HomeLayout>
      <HomeHero />

      <main className="grid gap-4">
        <HomePaginationNav
          previousHref={hasPrevious ? pageHref(safePage - 1) : undefined}
          nextHref={hasNext ? pageHref(safePage + 1) : undefined}
          safePage={safePage}
          totalPages={totalPages}
        />

        <ListView
          items={feed.items.map((item) => ({
            code: item.code,
            baseColor: item.config.baseColor,
            iconLibrary: item.config.iconLibrary,
            font: item.config.font,
          }))}
          initialFeedItems={feed.items}
          safePage={safePage}
          totalPages={totalPages}
          pageSize={pageSize}
          useLiveFeed={true}
        />
      </main>
    </HomeLayout>
  )
}
