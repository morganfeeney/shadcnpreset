"use client"

import * as React from "react"
import { useRouter, useSearchParams } from "next/navigation"

import { PresetBrowseControls } from "@/components/preset-browse-controls"
import { PresetCustomizeProvider } from "@/components/preset-customizer/preset-customize"
import { PresetCustomizeBar } from "@/components/preset-customizer/preset-customize-bar"
import { PresetCustomizeCreditImpression } from "@/components/preset-customizer/preset-customize-credit"
import { PresetCustomizePanel } from "@/components/preset-customizer/preset-customize-panel"
import { PresetCustomizePreview } from "@/components/preset-customizer/preset-customize-preview"
import { PresetCustomizeToolbar } from "@/components/preset-customizer/preset-customize-toolbar"
import { usePresetPageLive } from "@/components/preset-page-live-context"
import {
  WorkspaceBody,
  WorkspaceMain,
  WorkspacePanelTrigger,
  WorkspaceProvider,
} from "@/components/workspace"
import { resolvePresetFromCode } from "@/lib/preset"
import { replaceQuery } from "@/lib/preset-draft"
import type { PresetSidebarItem } from "@/lib/preset-sidebar-item"

import { PresetCommunityPanel } from "./preset-community-panel"
import { usePresetWorkspace } from "./use-preset-workspace"

/**
 * The preset page: community presets on the left, the preset in the middle,
 * everything to change about it on the right, and a bar along the bottom
 * naming it, with its views. Either panel collapses, and the page remembers.
 * The preset, its preview and Customize are the shared customizer, which
 * Ask AI shows too; this page adds Community and previous and next.
 */
export function PresetBrowseSurface({
  communityItems,
  children,
}: {
  communityItems: PresetSidebarItem[]
  children: React.ReactNode
}) {
  const router = useRouter()
  const { livePresetCode } = usePresetPageLive()
  const query = useSearchParams()
  const workspace = usePresetWorkspace()

  // The code is in the path here: another one is another page.
  const goTo = React.useCallback(
    (code: string, next: URLSearchParams) => {
      if (code === livePresetCode) {
        replaceQuery(next)
        return
      }
      const search = next.toString()
      router.replace(`/preset/${code}${search ? `?${search}` : ""}`, {
        scroll: false,
      })
    },
    [livePresetCode, router]
  )

  return (
    <main className="min-h-0 min-w-0 px-2 pb-2">
      <PresetCustomizeProvider
        code={livePresetCode}
        query={query}
        goTo={goTo}
      >
        <PresetCustomizeCreditImpression />
        <WorkspaceProvider
          {...workspace}
          className="overflow-hidden rounded-lg border"
        >
          <WorkspaceBody>
            <PresetCommunityPanel items={communityItems} />
            <WorkspaceMain>
              <PresetCustomizeToolbar />
              <PresetCustomizePreview />
              {children}
            </WorkspaceMain>
            <PresetCustomizePanel />
          </WorkspaceBody>
          <PresetCustomizeBar
            titleAs="h1"
            start={
              <WorkspacePanelTrigger
                side="start"
                label="Community"
                className="md:hidden"
              />
            }
            controls={<PresetCycleControls />}
          />
        </WorkspaceProvider>
      </PresetCustomizeProvider>
    </main>
  )
}

/** Previous, shuffle and next through the community presets. */
function PresetCycleControls() {
  const { livePresetCode, selectLivePreset } = usePresetPageLive()
  const resolved = React.useMemo(
    () => resolvePresetFromCode(livePresetCode),
    [livePresetCode]
  )
  if (!resolved) return null

  return (
    <PresetBrowseControls
      resolved={resolved}
      basePath="/preset"
      cycleOnly
      onSelectPreset={(code) => {
        if (document.activeElement instanceof HTMLElement) {
          document.activeElement.blur()
        }
        selectLivePreset(code)
      }}
    />
  )
}
