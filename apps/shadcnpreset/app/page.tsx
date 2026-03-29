import Link from "next/link"

import { HomeFeaturedSection } from "@/components/home-featured-section"
import { HomeHero } from "@/components/home-hero"
import { PresetLoveLeaderboard } from "@/components/preset-love-leaderboard"
import {
  getPresetPage,
  type PresetPageItem,
} from "@/lib/preset-catalog"
import { getPresetFeedPage } from "@/lib/preset-feed"

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

  const featuredItems: PresetPageItem[] = feed.items
  const leaderboardItems = getPresetPage(1, 30).map((item) => ({
    code: item.code,
    href: `/preset/${item.code}`,
    label: `${item.config.style} / ${item.config.theme}`,
  }))
  const hasPrevious = feed.safePage > 1
  const hasNext = feed.safePage < feed.totalPages

  function pageHref(nextPage: number) {
    const params = new URLSearchParams()
    params.set("page", String(nextPage))
    params.set("size", String(pageSize))
    return `/?${params.toString()}`
  }

  return (
    <div
      data-slot="layout"
      className="group/layout section-soft relative z-10 mx-auto grid w-full max-w-[1800px] gap-(--gap) p-(--gap) [--gap:--spacing(4)] md:[--gap:--spacing(6)] 2xl:[--customizer-width:--spacing(56)]"
    >
      <HomeHero />

      <main className="space-y-8 md:space-y-10">
        <div className="preset-nav">
          {hasPrevious ? (
            <Link href={pageHref(feed.safePage - 1)}>Previous</Link>
          ) : (
            <span>Previous</span>
          )}
          <span>
            Page <code>{feed.safePage.toLocaleString()}</code> of{" "}
            <code>{feed.totalPages.toLocaleString()}</code>
          </span>
          {hasNext ? (
            <Link href={pageHref(feed.safePage + 1)}>Next</Link>
          ) : (
            <span>Next</span>
          )}
        </div>

        <HomeFeaturedSection items={featuredItems} />
      </main>
    </div>
  )
}
