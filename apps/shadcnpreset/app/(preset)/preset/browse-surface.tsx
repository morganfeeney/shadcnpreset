"use client"

import { useEffect, useMemo, useState, type ReactNode } from "react"

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

export function PresetBrowseSurface({
  communityItems,
  children,
}: PresetBrowseSurfaceProps) {
  const live = usePresetPageLive()
  const liveResolved = useMemo(
    () => resolvePresetFromCode(live.livePresetCode),
    [live.livePresetCode]
  )
  const [askAiMounted, setAskAiMounted] = useState(live.tab === "ask-ai")

  useEffect(() => {
    if (live.tab === "ask-ai") setAskAiMounted(true)
  }, [live.tab])

  function onSelectPreset(code: string) {
    if (code === live.livePresetCode) return
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur()
    }
    live.selectLivePreset(code)
  }

  if (!liveResolved) {
    return <div className="w-full">{children}</div>
  }

  return (
    <div className="w-full">
      <main className="grid gap-2">
        <Container
          aria-label="Preset details and actions"
          className="max-w-full"
        >
          <PresetLiveHero
            initialCode={liveResolved.code}
            initialDescription=""
          />
        </Container>
        <Container className="max-w-full grid gap-4">
          <div className="flex items-center justify-between gap-1.5">
            <div className="flex min-w-0 items-center gap-2">
              <PresetBrowseSidebarSheet
                resolved={liveResolved}
                communityItems={communityItems}
                tab={live.tab}
                onTabChange={live.setLiveTab}
                askAiMounted={askAiMounted}
                onSelectPreset={onSelectPreset}
              />
              <PresetPreviewLayoutPicker
                value={live.view}
                onValueChange={live.setLiveView}
                presetCode={liveResolved.code}
              />
            </div>
            <PresetBrowseControls
              resolved={liveResolved}
              basePath="/preset"
              cycleOnly
              onSelectPreset={onSelectPreset}
            />
          </div>
          <div className="flex min-h-0 items-stretch gap-4">
            <PresetBrowseSidebar
              resolved={liveResolved}
              communityItems={communityItems}
              tab={live.tab}
              onTabChange={live.setLiveTab}
              askAiMounted={askAiMounted}
              onSelectPreset={onSelectPreset}
            />
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
