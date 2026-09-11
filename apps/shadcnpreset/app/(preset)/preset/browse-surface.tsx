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

/**
 * `generated` only resolves while a preview is in session storage.
 *
 * While one is still being recovered from a linked chat the view is left alone,
 * so the pane can show it loading rather than flashing the default view and
 * snapping back once the preview arrives.
 */
function resolveEffectiveView(
  view: PresetPreviewPageName,
  hasGeneratedPreview: boolean,
  pending: boolean
): PresetPreviewPageName {
  if (view !== "generated" || hasGeneratedPreview || pending) return view
  return "preview"
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
  const {
    livePresetCode,
    view,
    setLiveView,
    generatedPreview,
    generatedPreviewPending,
  } = usePresetPageLive()
  if (!resolvePresetFromCode(livePresetCode)) return null

  const adHocView = generatedPreview
    ? { page: "generated" as const, label: generatedPreview.title }
    : generatedPreviewPending
      ? { page: "generated" as const, label: "", pending: true }
      : undefined

  return (
    <PresetPreviewLayoutPicker
      value={resolveEffectiveView(
        view,
        Boolean(generatedPreview),
        generatedPreviewPending
      )}
      onValueChange={setLiveView}
      presetCode={livePresetCode}
      adHocView={adHocView}
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
        <Container className="grid max-w-full gap-4">
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
  const { generatedPreview, generatedPreviewPending } = usePresetPageLive()
  // `?view=generated` survives reloads and shared links, but the code itself is
  // session-scoped — fall back to the default view when there is nothing to show.
  const effectiveView = resolveEffectiveView(
    view,
    Boolean(generatedPreview),
    generatedPreviewPending
  )
  const frameKey = `${resolved.code}-${effectiveView}`
  const [loadedKey, setLoadedKey] = useState<string | null>(null)
  const loaded = loadedKey === frameKey
  const previewSrc = getPresetPreviewUrl(resolved.code, effectiveView)

  if (!previewSrc) {
    return null
  }

  return (
    <div className="relative min-h-[calc(100dvh-14rem)] min-w-0 flex-1 overflow-hidden rounded-lg">
      {/* Holding the frame back while a linked preview is still being recovered
          leaves `loaded` false, so the overlay below covers the wait. */}
      {generatedPreviewPending ? null : (
        <PresetV4Frame
          className="block h-full min-h-[calc(100dvh-14rem)] w-full border-0"
          src={previewSrc}
          title={`Preset preview ${resolved.code} ${effectiveView}`}
          sandbox="allow-scripts allow-same-origin"
          generatedPreview={
            effectiveView === "generated" ? generatedPreview : null
          }
          onLoad={() => {
            setLoadedKey(frameKey)
          }}
        />
      )}
      {!loaded ? (
        <div className="absolute inset-0 flex items-center justify-center bg-background">
          <Spinner />
        </div>
      ) : null}
    </div>
  )
}
