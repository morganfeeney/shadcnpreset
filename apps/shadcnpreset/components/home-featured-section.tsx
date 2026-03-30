"use client"

import { PresetIframeCard } from "@/components/preset-iframe-card"
import { usePresetFeed } from "@/hooks/use-preset-feed"
import type { PresetPageItem } from "@/lib/preset-catalog"

export type ListViewItem = {
  code: string
  baseColor: string
  iconLibrary: string
  font: string
}

interface ListViewProps {
  items: ListViewItem[]
  safePage: number
  totalPages: number
  pageSize: number
  useLiveFeed?: boolean
  initialFeedItems?: PresetPageItem[]
}

function toListViewItem(item: PresetPageItem): ListViewItem {
  return {
    code: item.code,
    baseColor: item.config.baseColor,
    iconLibrary: item.config.iconLibrary,
    font: item.config.font,
  }
}

export function ListView({
  items,
  safePage,
  totalPages,
  pageSize,
  useLiveFeed = true,
  initialFeedItems = [],
}: ListViewProps) {
  const feedQuery = usePresetFeed(
    safePage,
    pageSize,
    useLiveFeed
      ? {
          items: initialFeedItems,
          safePage,
          totalPages,
        }
      : undefined,
    useLiveFeed
  )
  const feedItems = useLiveFeed
    ? (feedQuery.data?.items ?? initialFeedItems).map(toListViewItem)
    : items

  return (
    <section className="space-y-4">
      <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-3">
        {feedItems.map((item) => (
          <li key={item.code}>
            <PresetIframeCard
              code={item.code}
              title={item.code}
              description={`${item.baseColor} base, ${item.iconLibrary} icons, ${item.font} body`}
            />
          </li>
        ))}
      </ul>
    </section>
  )
}
