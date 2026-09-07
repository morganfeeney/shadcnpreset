import type { ReactNode } from "react"
import { cacheLife } from "next/cache"

import { PresetPageLiveProvider } from "@/components/preset-page-live-context"
import { getVotedPresetsFeed } from "@/lib/preset-feed"
import { toPresetSidebarItem } from "@/lib/preset-sidebar-item"

import { PresetBrowseSurface } from "./browse-surface"

const COMMUNITY_SIDEBAR_LIMIT = 100

async function getCachedCommunitySidebarItems() {
  "use cache"
  cacheLife({ stale: 300, revalidate: 300, expire: 86400 })

  return (await getVotedPresetsFeed(COMMUNITY_SIDEBAR_LIMIT)).map(
    toPresetSidebarItem
  )
}

export default async function PresetLayout({
  children,
}: {
  children: ReactNode
}) {
  const communityItems = await getCachedCommunitySidebarItems()

  return (
    <PresetPageLiveProvider>
      <PresetBrowseSurface communityItems={communityItems}>
        {children}
      </PresetBrowseSurface>
    </PresetPageLiveProvider>
  )
}
