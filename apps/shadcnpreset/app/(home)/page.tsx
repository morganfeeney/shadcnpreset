import { Suspense } from "react"

import { HomeHero } from "@/components/home-hero"
import { PresetForm } from "@/components/preset-form"
import { PresetFormSkeleton } from "@/components/preset-form-skeleton"
import { ListView } from "@/components/list-view"
import { getHomepageFeed } from "@/lib/preset-feed"
import { ListLayout } from "@/components/list-layout"

export const dynamic = "force-dynamic"
export const revalidate = 0

const HOMEPAGE_FEED_LIMIT = 100
const HOMEPAGE_INITIAL_VISIBLE = 12
const HOMEPAGE_VISIBLE_STEP = 6

export default async function HomePage() {
  const feedItems = await getHomepageFeed(HOMEPAGE_FEED_LIMIT)
  const feedKey = feedItems.map((item) => item.code).join(":")

  return (
    <ListLayout>
      <HomeHero>
        <Suspense fallback={<PresetFormSkeleton />}>
          <PresetForm className="pt-2" />
        </Suspense>
      </HomeHero>
      <main className="grid gap-4">
        <ListView
          key={feedKey}
          items={feedItems.map((item) => ({
            code: item.code,
            baseColor: item.config.baseColor,
            iconLibrary: item.config.iconLibrary,
            font: item.config.font,
          }))}
          useLiveFeed
          safePage={1}
          totalPages={1}
          pageSize={HOMEPAGE_FEED_LIMIT}
          initialFeedItems={feedItems}
          useIncrementalReveal
          initialVisibleCount={HOMEPAGE_INITIAL_VISIBLE}
          visibleStep={HOMEPAGE_VISIBLE_STEP}
        />
      </main>
    </ListLayout>
  )
}
