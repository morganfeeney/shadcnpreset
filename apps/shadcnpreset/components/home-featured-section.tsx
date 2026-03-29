"use client"

import { useEffect, useMemo, useState } from "react"

import { PresetIframeCard } from "@/components/preset-iframe-card"
import type { PresetPageItem } from "@/lib/preset-catalog"

type HomeFeaturedSectionProps = {
  items: PresetPageItem[]
}

export function HomeFeaturedSection({ items }: HomeFeaturedSectionProps) {
  const [votesByCode, setVotesByCode] = useState<Record<string, number>>({})

  useEffect(() => {
    let cancelled = false

    async function refreshVotes() {
      const results = await Promise.all(
        items.map(async (item) => {
          try {
            const response = await fetch(`/api/presets/${item.code}/vote`, {
              method: "GET",
              cache: "no-store",
            })
            if (!response.ok) return { code: item.code, votes: 0 }
            const payload = (await response.json()) as { votes: number }
            return { code: item.code, votes: payload.votes ?? 0 }
          } catch {
            return { code: item.code, votes: 0 }
          }
        })
      )

      if (cancelled) return
      setVotesByCode((previous) => {
        const next = { ...previous }
        for (const result of results) {
          next[result.code] = result.votes
        }
        return next
      })
    }

    function handlePageShow() {
      void refreshVotes()
    }

    function handleVoteUpdated(event: Event) {
      const customEvent = event as CustomEvent<{ code: string; votes: number }>
      const detail = customEvent.detail
      if (!detail?.code) return
      setVotesByCode((previous) => ({
        ...previous,
        [detail.code]: detail.votes ?? 0,
      }))
    }

    void refreshVotes()
    window.addEventListener("pageshow", handlePageShow)
    window.addEventListener("preset-vote-updated", handleVoteUpdated)

    return () => {
      cancelled = true
      window.removeEventListener("pageshow", handlePageShow)
      window.removeEventListener("preset-vote-updated", handleVoteUpdated)
    }
  }, [items])

  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => {
      const votesA = votesByCode[a.code] ?? 0
      const votesB = votesByCode[b.code] ?? 0
      if (votesB !== votesA) return votesB - votesA
      return a.code.localeCompare(b.code)
    })
  }, [items, votesByCode])

  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold tracking-tight md:text-xl">
        Featured presets
      </h2>
      <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-3">
        {sortedItems.map((item) => (
          <li key={item.index}>
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
