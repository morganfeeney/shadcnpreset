"use client"

import { useMemo, useState, type ReactNode } from "react"

import { usePresetPageLive } from "@/components/preset-page-live-context"
import { PresetBrowseControls } from "@/components/preset-browse-controls"
import { PresetPreviewLayoutPicker } from "@/components/preset-preview/layout-picker"
import { PresetV4Frame } from "@/components/preset-v4-frame"
import { Spinner } from "@/components/ui/spinner"
import { Container } from "@/components/zippystarter/container"
import {
  getPresetPreviewUrl,
  resolvePresetFromCode,
  type ResolvedPreset,
} from "@/lib/preset"
import type { PresetPreviewPageName } from "@/lib/preset-preview"
import type { PresetSidebarItem } from "@/lib/preset-sidebar-item"

import { PresetLiveHero } from "./components"
import {
  PresetBrowseSidebar,
  PresetBrowseSidebarSheet,
} from "./preset-browse-sidebar"

type PresetBrowseSurfaceProps = {
  communityItems: PresetSidebarItem[]
  children: ReactNode
}

function PresetBrowseHero() {
  const { livePresetCode } = usePresetPageLive()
  if (!resolvePresetFromCode(livePresetCode)) return null

  return (
    <Container aria-label="Preset details and actions" className="max-w-full">
      <PresetLiveHero initialCode={livePresetCode} initialDescription="" />
    </Container>
  )
}

function PresetBrowseViewPicker() {
  const { livePresetCode, view, setLiveView } = usePresetPageLive()
  if (!resolvePresetFromCode(livePresetCode)) return null

  return (
    <PresetPreviewLayoutPicker
      value={view}
      onValueChange={setLiveView}
      presetCode={livePresetCode}
    />
  )
}

function PresetBrowseCycleControls() {
  const { livePresetCode, selectLivePreset } = usePresetPageLive()
  const resolved = useMemo(
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

export function PresetBrowseSurface({
  communityItems,
  children,
}: PresetBrowseSurfaceProps) {
  return (
    <div className="w-full">
      <main className="grid gap-2">
        <PresetBrowseHero />
        <Container className="max-w-full grid gap-4">
          <div className="flex items-center justify-between gap-1.5">
            <div className="flex min-w-0 items-center gap-2">
              <PresetBrowseSidebarSheet communityItems={communityItems} />
              <PresetBrowseViewPicker />
            </div>
            <PresetBrowseCycleControls />
          </div>
          <div className="flex min-h-0 items-stretch gap-4">
            <PresetBrowseSidebar communityItems={communityItems} />
            {children}
          </div>
        </Container>
      </main>
    </div>
  )
}

export function PresetBrowsePreview({
  resolved,
  view,
}: {
  resolved: ResolvedPreset
  view: PresetPreviewPageName
}) {
  const frameKey = `${resolved.code}-${view}`
  const [loadedKey, setLoadedKey] = useState<string | null>(null)
  const loaded = loadedKey === frameKey
  const previewSrc = getPresetPreviewUrl(resolved.code, view)

  if (!previewSrc) {
    return null
  }

  return (
    <div className="relative min-h-[calc(100dvh-14rem)] min-w-0 flex-1 overflow-hidden rounded-lg">
      <PresetV4Frame
        className="block h-full min-h-[calc(100dvh-14rem)] w-full border-0"
        src={previewSrc}
        title={`Preset preview ${resolved.code} ${view}`}
        sandbox="allow-scripts allow-same-origin"
        onLoad={() => {
          setLoadedKey(frameKey)
        }}
      />
      {!loaded ? (
        <div className="absolute inset-0 flex items-center justify-center bg-background">
          <Spinner />
        </div>
      ) : null}
    </div>
  )
}
