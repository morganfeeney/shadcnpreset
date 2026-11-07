"use client"

import * as React from "react"

import { usePresetPageLive } from "@/components/preset-page-live-context"
import { PresetRelatedList } from "@/components/preset-related-list"
import { ThemeSwatch } from "@/components/themes/theme-nav"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty"
import {
  useWorkspace,
  WorkspacePanel,
  WorkspacePanelContent,
  WorkspacePanelHeader,
  WorkspacePanelRail,
  WorkspacePanelTitle,
  WorkspacePanelTrigger,
} from "@/components/workspace"
import type { PresetSidebarItem } from "@/lib/preset-sidebar-item"

/** Community presets to browse; collapsed, a swatch for each, as covers. */
export function PresetCommunityPanel({ items }: { items: PresetSidebarItem[] }) {
  const { livePresetCode, selectLivePreset } = usePresetPageLive()
  const { isMobile, open, setOpen } = useWorkspace()

  const select = React.useCallback(
    (code: string) => {
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur()
      }
      selectLivePreset(code)
      if (isMobile) setOpen("start", false)
    },
    [isMobile, selectLivePreset, setOpen]
  )

  return (
    <WorkspacePanel side="start" label="Community">
      <WorkspacePanelHeader>
        <WorkspacePanelTitle>Community</WorkspacePanelTitle>
        <WorkspacePanelTrigger />
      </WorkspacePanelHeader>
      <WorkspacePanelContent>
        {items.length ? (
          <PresetRelatedList
            items={items}
            currentCode={livePresetCode}
            onSelectPreset={select}
          />
        ) : (
          <Empty className="h-full border-0">
            <EmptyHeader>
              <EmptyTitle>No community presets</EmptyTitle>
              <EmptyDescription>Voted presets will appear here.</EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}
      </WorkspacePanelContent>
      <WorkspacePanelRail>
        <WorkspacePanelTrigger />
        {/* Only drawn while collapsed: a swatch per preset, as covers. */}
        {!open.start && !isMobile
          ? items.map((item) => (
              <button
                key={item.code}
                type="button"
                title={item.code}
                aria-label={`Show preset ${item.code}`}
                aria-current={item.code === livePresetCode || undefined}
                className="shrink-0 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring aria-[current]:ring-2 aria-[current]:ring-ring"
                onClick={() => select(item.code)}
              >
                <ThemeSwatch code={item.code} className="size-10" />
              </button>
            ))
          : null}
      </WorkspacePanelRail>
    </WorkspacePanel>
  )
}
