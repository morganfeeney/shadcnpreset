import { ListView } from "@/components/list-view"
import { getHomepageFeed } from "@/lib/preset-feed"
import { ListLayout } from "@/components/list-layout"
import {
  PageHeader,
  PageHeaderDescription,
  PageHeaderHeading,
} from "@/components/page-header"

export const dynamic = "force-dynamic"
export const revalidate = 0

const HOMEPAGE_FEED_LIMIT = 100
const HOMEPAGE_INITIAL_VISIBLE = 12
const HOMEPAGE_VISIBLE_STEP = 6

export default async function CommunityPage() {
  const feedItems = await getHomepageFeed(HOMEPAGE_FEED_LIMIT)
  const feedKey = feedItems.map((item) => item.code).join(":")

  return (
    <ListLayout>
      <PageHeader>
        <PageHeaderHeading className="max-w-4xl">
          Community presets
        </PageHeaderHeading>
        <PageHeaderDescription className="text-muted-foreground">
          Explore presets voted for by the community. Find inspiration, remix
          presets, and share your own.
        </PageHeaderDescription>
      </PageHeader>
      <main className="grid gap-4">
        <ListView
          key={feedKey}
          items={feedItems.map((item) => ({
            code: item.code,
            baseColor: item.config.baseColor,
            theme: item.config.theme,
            chartColor: item.config.chartColor ?? item.config.theme,
            iconLibrary: item.config.iconLibrary,
            font: item.config.font,
            fontHeading: item.config.fontHeading,
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
