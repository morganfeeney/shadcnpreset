"use client"

import { memo, useCallback } from "react"

import {
  PresetStyleOverviewCardDefaultFooter,
  PresetStyleOverviewCardPreview,
  PresetStyleOverviewCardRoot,
} from "@/components/preset-style-overview-card"
import { usePresetVoteMapsForItems } from "@/hooks/use-preset-votes-batch"
import type { PresetSidebarItem } from "@/lib/preset-sidebar-item"
import { cn } from "@/lib/utils"

type PresetRelatedListProps = {
  items: PresetSidebarItem[]
  currentCode: string
  onSelectPreset: (code: string) => void
  className?: string
}

const PresetRelatedListItem = memo(function PresetRelatedListItem({
  item,
  selected,
  voteCount,
  hasVoted,
  onSelectPreset,
}: {
  item: PresetSidebarItem
  selected: boolean
  voteCount: number
  hasVoted: boolean
  onSelectPreset: (code: string) => void
}) {
  const onPreview = useCallback(() => {
    onSelectPreset(item.code)
  }, [item.code, onSelectPreset])

  return (
    <li>
      <PresetStyleOverviewCardRoot
        className={cn(selected && "ring-2 ring-ring")}
      >
        <PresetStyleOverviewCardPreview
          code={item.code}
          title={item.title}
          description={item.description}
          onPreview={onPreview}
          hoverHint={false}
        />
        <PresetStyleOverviewCardDefaultFooter
          code={item.code}
          title={item.title}
          description={item.description}
          initialVoteCount={voteCount}
          initialHasVoted={hasVoted}
        />
      </PresetStyleOverviewCardRoot>
    </li>
  )
})

export const PresetRelatedList = memo(function PresetRelatedList({
  items,
  currentCode,
  onSelectPreset,
  className,
}: PresetRelatedListProps) {
  const { votesByCode, hasVotedByCode } = usePresetVoteMapsForItems(items)

  return (
    <ul className={cn("flex flex-col gap-3 p-2", className)}>
      {items.map((item) => (
        <PresetRelatedListItem
          key={item.code}
          item={item}
          selected={item.code === currentCode}
          voteCount={votesByCode[item.code] ?? 0}
          hasVoted={hasVotedByCode[item.code] ?? false}
          onSelectPreset={onSelectPreset}
        />
      ))}
    </ul>
  )
})
