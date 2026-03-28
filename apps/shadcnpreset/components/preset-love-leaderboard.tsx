"use client"

import Link from "next/link"
import { Heart } from "lucide-react"
import { useEffect, useMemo, useState } from "react"

type PresetLoveLeaderboardItem = {
  code: string
  label: string
  href: string
}

type PresetLoveLeaderboardProps = {
  items: PresetLoveLeaderboardItem[]
}

type RankedItem = PresetLoveLeaderboardItem & {
  votes: number
  seedOrder: number
}

export function PresetLoveLeaderboard({ items }: PresetLoveLeaderboardProps) {
  const [rankedItems, setRankedItems] = useState<RankedItem[]>([])

  useEffect(() => {
    let cancelled = false

    async function loadLeaderboard() {
      try {
        const response = await fetch("/api/presets/leaderboard?limit=8", {
          method: "GET",
          cache: "no-store",
        })
        if (response.ok) {
          const payload = (await response.json()) as {
            items: Array<{
              code: string
              label: string
              href: string
              votes: number
            }>
          }

          if (!cancelled && payload.items.length > 0) {
            setRankedItems(
              payload.items.map((item, index) => ({
                ...item,
                seedOrder: index,
              }))
            )
            return
          }
        }
      } catch {
        // Fall through to static items.
      }

      if (!cancelled) {
        setRankedItems(
          items.map((item, index) => ({
            ...item,
            votes: 0,
            seedOrder: index,
          }))
        )
      }
    }

    void loadLeaderboard()
    return () => {
      cancelled = true
    }
  }, [items])

  const topItems = useMemo(
    () =>
      [...rankedItems]
        .sort((a, b) => b.votes - a.votes || a.seedOrder - b.seedOrder)
        .slice(0, 8),
    [rankedItems]
  )

  const maxVotes = Math.max(1, ...topItems.map((item) => item.votes))
  const hasAnyVotes = topItems.some((item) => item.votes > 0)

  if (!hasAnyVotes) {
    return (
      <div className="rounded-lg border border-dashed bg-card/40 p-4 text-sm text-muted-foreground">
        No votes yet. Tap the heart on featured presets to start ranking them.
      </div>
    )
  }

  return (
    <ol className="space-y-3">
      {topItems.map((item, index) => {
        const width = `${Math.max(10, Math.round((item.votes / maxVotes) * 100))}%`
        return (
          <li
            key={item.code}
            className="relative overflow-hidden rounded-lg border bg-card/50 p-3"
          >
            <div
              aria-hidden="true"
              className="absolute inset-y-0 left-0 bg-primary/12"
              style={{ width }}
            />
            <div className="relative flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">#{index + 1}</p>
                <Link
                  href={item.href}
                  className="truncate text-sm font-medium hover:underline"
                >
                  {item.label}
                </Link>
              </div>
              <div className="inline-flex items-center gap-1 text-sm text-muted-foreground">
                <Heart className="size-3.5 text-rose-500" />
                <span>{item.votes}</span>
              </div>
            </div>
          </li>
        )
      })}
    </ol>
  )
}
