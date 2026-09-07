"use client"

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

export function PresetRelatedList({
  items,
  currentCode,
  onSelectPreset,
  className,
}: PresetRelatedListProps) {
  const { votesByCode, hasVotedByCode } = usePresetVoteMapsForItems(items)

  function navigateToPreset(code: string) {
    if (code === currentCode) return
    onSelectPreset(code)
  }

  return (
    <ul className={cn("flex flex-col gap-3 p-2", className)}>
      {items.map((item) => {
        const selected = item.code === currentCode

        return (
          <li key={item.code}>
            <PresetStyleOverviewCardRoot
              className={cn(selected && "ring-2 ring-ring")}
            >
              <PresetStyleOverviewCardPreview
                code={item.code}
                title={item.title}
                description={item.description}
                onPreview={() => navigateToPreset(item.code)}
                hoverHint={false}
              />
              <PresetStyleOverviewCardDefaultFooter
                code={item.code}
                title={item.title}
                description={item.description}
                initialVoteCount={votesByCode[item.code] ?? 0}
                initialHasVoted={hasVotedByCode[item.code] ?? false}
              />
            </PresetStyleOverviewCardRoot>
          </li>
        )
      })}
    </ul>
  )
}
