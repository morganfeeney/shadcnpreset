"use client"

import * as React from "react"

import { ShadcncraftCreditImpression } from "@/components/shadcncraft-examples/credit"
import {
  WorkspaceBody,
  WorkspaceMain,
  WorkspaceProvider,
} from "@/components/workspace"
import { getPresetPreviewView } from "@/lib/preset-preview"
import type { PresetSidebarItem } from "@/lib/preset-sidebar-item"

import { useEffectiveView } from "./effective-view"
import { PresetBrowseBar } from "./preset-browse-bar"
import { PresetBrowseToolbar } from "./preset-browse-toolbar"
import { PresetCommunityPanel } from "./preset-community-panel"
import { PresetCustomizePanel } from "./preset-customize-panel"
import { PresetCustomizeProvider } from "./preset-customize"
import { usePresetWorkspace } from "./use-preset-workspace"

/**
 * The preset page: community presets on the left, the preset in the middle,
 * everything to change about it on the right, and a bar along the bottom
 * naming it, with its views. Either panel collapses, and the page remembers.
 */
export function PresetBrowseSurface({
  communityItems,
  children,
}: {
  communityItems: PresetSidebarItem[]
  children: React.ReactNode
}) {
  const workspace = usePresetWorkspace()

  return (
    <main className="min-h-0 min-w-0 px-2 pb-2">
      <PresetCustomizeProvider>
        <PresetBrowseCreditImpression />
        <WorkspaceProvider
          {...workspace}
          className="overflow-hidden rounded-lg border"
        >
          <WorkspaceBody>
            <PresetCommunityPanel items={communityItems} />
            <WorkspaceMain>
              <PresetBrowseToolbar />
              {children}
            </WorkspaceMain>
            <PresetCustomizePanel />
          </WorkspaceBody>
          <PresetBrowseBar />
        </WorkspaceProvider>
      </PresetCustomizeProvider>
    </main>
  )
}

/** Lives in the layout so switching presets does not count a new impression. */
function PresetBrowseCreditImpression() {
  const view = useEffectiveView()
  return (
    <ShadcncraftCreditImpression credit={getPresetPreviewView(view)?.credit} />
  )
}
