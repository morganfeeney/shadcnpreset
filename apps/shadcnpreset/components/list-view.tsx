"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { PresetIframeCard } from "@/components/preset-iframe-card"
import { usePresetFeed } from "@/hooks/use-preset-feed"
import type { PresetPageItem } from "@/lib/preset-catalog"

export type ListViewItem = {
  code: string
  baseColor: string
  theme: string
  chartColor: string
  iconLibrary: string
  font: string
  fontHeading: string
}

interface ListViewProps {
  items: ListViewItem[]
  safePage?: number
  totalPages?: number
  pageSize?: number
  useLiveFeed?: boolean
  initialFeedItems?: PresetPageItem[]
  useIncrementalReveal?: boolean
  initialVisibleCount?: number
  visibleStep?: number
  revealDelayMs?: number
}

function toListViewItem(item: PresetPageItem): ListViewItem {
  return {
    code: item.code,
    baseColor: item.config.baseColor,
    theme: item.config.theme,
    chartColor: item.config.chartColor ?? item.config.theme,
    iconLibrary: item.config.iconLibrary,
    font: item.config.font,
    fontHeading: item.config.fontHeading,
  }
}

function formatTypographyLine(fontHeading: string, font: string) {
  if (fontHeading === "inherit" || fontHeading === font) {
    return `${font} body`
  }
  return `${fontHeading} heading, ${font} body`
}

export function ListView({
  items,
  safePage = 1,
  totalPages = 1,
  pageSize = 24,
  useLiveFeed = true,
  initialFeedItems = [],
  useIncrementalReveal = false,
  initialVisibleCount = 12,
  visibleStep = 6,
  revealDelayMs = 250,
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
  const [visibleCount, setVisibleCount] = useState(
    useIncrementalReveal ? initialVisibleCount : feedItems.length
  )
  const sentinelRef = useRef<HTMLDivElement>(null)
  const revealTimeoutRef = useRef<number | null>(null)

  useEffect(() => {
    if (!useIncrementalReveal || visibleCount >= feedItems.length) {
      return
    }

    const node = sentinelRef.current
    if (!node) {
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const isVisible = entries.some((entry) => entry.isIntersecting)
        if (!isVisible) {
          if (revealTimeoutRef.current !== null) {
            window.clearTimeout(revealTimeoutRef.current)
            revealTimeoutRef.current = null
          }
          return
        }

        if (revealTimeoutRef.current !== null) {
          return
        }

        revealTimeoutRef.current = window.setTimeout(() => {
          setVisibleCount((current) =>
            Math.min(feedItems.length, current + visibleStep)
          )
          revealTimeoutRef.current = null
        }, revealDelayMs)
      },
      { rootMargin: "600px 0px" }
    )

    observer.observe(node)
    return () => {
      observer.disconnect()
      if (revealTimeoutRef.current !== null) {
        window.clearTimeout(revealTimeoutRef.current)
        revealTimeoutRef.current = null
      }
    }
  }, [
    feedItems.length,
    revealDelayMs,
    useIncrementalReveal,
    visibleCount,
    visibleStep,
  ])

  const visibleItems = useMemo(
    () => feedItems.slice(0, Math.min(feedItems.length, visibleCount)),
    [feedItems, visibleCount]
  )
  const hasMore = visibleItems.length < feedItems.length
  return (
    <section>
      <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-3">
        {visibleItems.map((item) => (
          <li key={item.code}>
            <PresetIframeCard
              code={item.code}
              title={item.code}
              description={`${item.baseColor} base, ${item.theme} theme, ${item.chartColor} charts, ${item.iconLibrary}, ${formatTypographyLine(item.fontHeading, item.font)}`}
            />
          </li>
        ))}
      </ul>
      {hasMore ? (
        <div
          ref={sentinelRef}
          className="flex justify-center py-4 text-xs text-muted-foreground"
        >
          Loading more presets...
        </div>
      ) : null}
    </section>
  )
}
