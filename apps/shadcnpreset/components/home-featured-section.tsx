"use client"

import { PresetIframeCard } from "@/components/preset-iframe-card"
import { usePresetFeed } from "@/hooks/use-preset-feed"
import type { PresetPageItem } from "@/lib/preset-catalog"

interface ListViewProps {
  items: PresetPageItem[]
  safePage: number
  totalPages: number
  pageSize: number
  useLiveFeed?: boolean
}

export function ListView({
  items,
  safePage,
  totalPages,
  pageSize,
  useLiveFeed = true,
}: ListViewProps) {
  const feedQuery = usePresetFeed(
    safePage,
    pageSize,
    {
      items,
      safePage,
      totalPages,
    },
    useLiveFeed
  )
  const feedItems = useLiveFeed ? (feedQuery.data?.items ?? items) : items

  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold tracking-tight md:text-xl">
        Featured presets
      </h2>
      <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-3">
        {feedItems.map((item) => (
          <li key={item.code}>
            <PresetIframeCard
              code={item.code}
              title={item.code}
              description={`${item.config.baseColor} base, ${item.config.iconLibrary} icons, ${item.config.font} body`}
            />
          </li>
        ))}
      </ul>
    </section>
  )
}
