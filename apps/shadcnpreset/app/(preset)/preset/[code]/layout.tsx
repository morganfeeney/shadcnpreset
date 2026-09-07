import { notFound } from "next/navigation"
import { Suspense, type ReactNode } from "react"

import { PresetPageLiveProvider } from "@/components/preset-page-live-context"
import { Spinner } from "@/components/ui/spinner"
import { resolvePresetFromCode } from "@/lib/preset"
import { getVotedPresetsFeed } from "@/lib/preset-feed"
import { toPresetSidebarItem } from "@/lib/preset-sidebar-item"

import { PresetBrowseSurface } from "./browse-surface"

const COMMUNITY_SIDEBAR_LIMIT = 100

export default async function PresetCodeLayout({
  children,
  params,
}: {
  children: ReactNode
  params: Promise<{ code: string }>
}) {
  const { code } = await params
  const preset = resolvePresetFromCode(code)
  if (!preset) {
    notFound()
  }

  const communityItems = (await getVotedPresetsFeed(COMMUNITY_SIDEBAR_LIMIT)).map(
    toPresetSidebarItem
  )

  return (
    <Suspense
      fallback={
        <div className="relative flex min-h-[calc(100dvh-14rem)] items-center justify-center">
          <Spinner />
        </div>
      }
    >
      <PresetPageLiveProvider>
        <PresetBrowseSurface
          resolved={preset}
          communityItems={communityItems}
        >
          {children}
        </PresetBrowseSurface>
      </PresetPageLiveProvider>
    </Suspense>
  )
}
