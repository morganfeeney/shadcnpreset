"use client"

import { useMemo } from "react"

import { PresetIframeCard } from "@/components/preset-iframe-card"
import { usePresetFeed } from "@/hooks/use-preset-feed"
import { usePresetVotes } from "@/hooks/use-preset-votes"
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

  const codes = useMemo(() => feedItems.map((item) => item.code), [feedItems])
  const votesQuery = usePresetVotes(codes)
  const votesByCode = votesQuery.data?.votesByCode

  const sortedItems = useMemo(() => {
    const voteMap = votesByCode ?? {}
    return [...feedItems].sort((a, b) => {
      const votesA = voteMap[a.code] ?? 0
      const votesB = voteMap[b.code] ?? 0
      if (votesB !== votesA) return votesB - votesA
      return a.code.localeCompare(b.code)
    })
  }, [feedItems, votesByCode])

  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold tracking-tight md:text-xl">
        Featured presets
      </h2>
      <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-3">
        {sortedItems.map((item) => (
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
