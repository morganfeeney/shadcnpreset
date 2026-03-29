"use client"

import { PresetIframeCard } from "@/components/preset-iframe-card"
import { usePresetFeed } from "@/hooks/use-preset-feed"
import type { PresetPageItem } from "@/lib/preset-catalog"

type HomeFeaturedSectionProps = {
  items: PresetPageItem[]
  safePage: number
  totalPages: number
  pageSize: number
}

export function HomeFeaturedSection({
  items,
  safePage,
  totalPages,
  pageSize,
}: HomeFeaturedSectionProps) {
  const feedQuery = usePresetFeed(safePage, pageSize, {
    items,
    safePage,
    totalPages,
  })
  const feedItems = feedQuery.data?.items ?? items

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
