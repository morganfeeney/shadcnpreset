import type { ReactNode } from "react"

import { PresetPageLiveProvider } from "@/components/preset-page-live-context"
import { getVotedPresetsFeed } from "@/lib/preset-feed"
import { toPresetSidebarItem } from "@/lib/preset-sidebar-item"

import { PresetBrowseSurface } from "./browse-surface"

const COMMUNITY_SIDEBAR_LIMIT = 100

export default async function PresetLayout({
  children,
}: {
  children: ReactNode
}) {
  const communityItems = (await getVotedPresetsFeed(COMMUNITY_SIDEBAR_LIMIT)).map(
    toPresetSidebarItem
  )

  return (
    <PresetPageLiveProvider>
      <PresetBrowseSurface communityItems={communityItems}>
        {children}
      </PresetBrowseSurface>
    </PresetPageLiveProvider>
  )
}
