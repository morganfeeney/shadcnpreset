"use client"

import { useEffect, useMemo, useState } from "react"

import { usePresetPageLiveOptional } from "@/components/preset-page-live-context"
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
import {
  parsePresetPreviewPageName,
  parsePresetSidebarTab,
  presetBrowsePath,
  type PresetPreviewPageName,
  type PresetSidebarTab,
} from "@/lib/preset-preview"
import type { PresetSidebarItem } from "@/lib/preset-sidebar-item"

import {
  PresetBrowseSidebar,
  PresetBrowseSidebarSheet,
} from "./preset-browse-sidebar"

type PresetBrowseSurfaceProps = {
  resolved: ResolvedPreset
  initialView: PresetPreviewPageName
  initialTab: PresetSidebarTab
  communityItems: PresetSidebarItem[]
}

export function PresetBrowseSurface({
  resolved,
  initialView,
  initialTab,
  communityItems,
}: PresetBrowseSurfaceProps) {
  const live = usePresetPageLiveOptional()
  const liveCode = live?.livePresetCode ?? resolved.code
  const liveResolved = useMemo(
    () => resolvePresetFromCode(liveCode) ?? resolved,
    [liveCode, resolved]
  )
  const [view, setView] = useState(initialView)
  const [tab, setTab] = useState(initialTab)
  const [askAiMounted, setAskAiMounted] = useState(initialTab === "ask-ai")
  const frameKey = `${liveResolved.code}-${view}`
  const [loadedKey, setLoadedKey] = useState<string | null>(null)
  const loaded = loadedKey === frameKey
  const previewSrc = getPresetPreviewUrl(liveResolved.code, view)

  useEffect(() => {
    function onPopState() {
      const params = new URLSearchParams(window.location.search)
      setView(parsePresetPreviewPageName(params.get("view")))
      const nextTab = parsePresetSidebarTab(params.get("tab"))
      setTab(nextTab)
      if (nextTab === "ask-ai") setAskAiMounted(true)
    }

    window.addEventListener("popstate", onPopState)
    return () => window.removeEventListener("popstate", onPopState)
  }, [])

  function writeBrowseUrl(
    nextView: PresetPreviewPageName,
    nextTab: PresetSidebarTab
  ) {
    window.history.replaceState(
      window.history.state,
      "",
      presetBrowsePath(liveResolved.code, nextView, nextTab)
    )
  }

  function onViewChange(page: PresetPreviewPageName) {
    setView(page)
    writeBrowseUrl(page, tab)
  }

  function onTabChange(next: PresetSidebarTab) {
    setTab(next)
    if (next === "ask-ai") setAskAiMounted(true)
    writeBrowseUrl(view, next)
  }

  function onSelectPreset(code: string) {
    if (code === liveResolved.code) return
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur()
    }
    live?.selectLivePreset(code)
  }

  if (!previewSrc) {
    return null
  }

  return (
    <Container className="max-w-full grid gap-4">
      <div className="flex items-center justify-between gap-1.5">
        <div className="flex min-w-0 items-center gap-2">
          <PresetBrowseSidebarSheet
            resolved={liveResolved}
            communityItems={communityItems}
            tab={tab}
            onTabChange={onTabChange}
            askAiMounted={askAiMounted}
            onSelectPreset={onSelectPreset}
          />
          <PresetPreviewLayoutPicker
            value={view}
            onValueChange={onViewChange}
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
          tab={tab}
          onTabChange={onTabChange}
          askAiMounted={askAiMounted}
          onSelectPreset={onSelectPreset}
        />
        <div className="relative min-h-[calc(100dvh-14rem)] min-w-0 flex-1 overflow-hidden rounded-lg">
          <PresetV4Frame
            className="block h-full min-h-[calc(100dvh-14rem)] w-full border-0"
            src={previewSrc}
            title={`Preset preview ${liveResolved.code} ${view}`}
            sandbox="allow-scripts allow-same-origin"
            onLoad={(event) => {
              const src = event.currentTarget.getAttribute("src")
              if (!src || src === "about:blank") return
              setLoadedKey(frameKey)
            }}
          />
          {!loaded ? (
            <div className="absolute inset-0 flex items-center justify-center bg-background">
              <Spinner />
            </div>
          ) : null}
        </div>
      </div>
    </Container>
  )
}
