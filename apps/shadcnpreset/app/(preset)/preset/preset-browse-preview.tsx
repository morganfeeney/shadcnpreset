"use client"

import * as React from "react"

import { BuildWithPresetLink } from "@/components/page-builder/build-with-preset-link"
import { usePresetPageLive } from "@/components/preset-page-live-context"
import { PresetV4Frame } from "@/components/preset-v4-frame"
import { Spinner } from "@/components/ui/spinner"
import { getPresetPreviewUrl, type ResolvedPreset } from "@/lib/preset"
import {
  getPresetPreviewView,
  type PresetPreviewPageName,
} from "@/lib/preset-preview"

import { resolveEffectiveView } from "./effective-view"
import { usePresetCustomize } from "./preset-customize"

/** The preset in its chosen view, with any change to it shown in place. */
export function PresetBrowsePreview({
  resolved,
  view: requestedView,
}: {
  resolved: ResolvedPreset
  view: PresetPreviewPageName
}) {
  const { generatedPreview } = usePresetPageLive()
  const { value, css } = usePresetCustomize()
  const view = resolveEffectiveView(requestedView, Boolean(generatedPreview))
  const frameKey = `${resolved.code}-${view}`
  const [loadedKey, setLoadedKey] = React.useState<string | null>(null)
  const loaded = loadedKey === frameKey
  const previewSrc = getPresetPreviewUrl(resolved.code, view)
  const credit = getPresetPreviewView(view)?.credit
  if (!previewSrc) return null

  return (
    <div
      data-slot="preset-preview"
      className="relative min-h-0 flex-1 bg-muted p-3 lg:p-5"
    >
      <PresetV4Frame
        className="block size-full rounded-lg border bg-background shadow-lg"
        src={previewSrc}
        title={`Preset preview ${resolved.code} ${view}`}
        generatedPreview={view === "generated" ? generatedPreview : null}
        presetCode={value.code}
        customColoursCss={css}
        onLoad={() => setLoadedKey(frameKey)}
      />
      {/* Over the blocks it builds with, once they are there to see. */}
      {credit && loaded ? (
        <BuildWithPresetLink
          presetCode={resolved.code}
          placement={credit.source}
          className="absolute inset-x-0 bottom-8 mx-auto w-fit"
        />
      ) : null}
      {loaded ? null : (
        <div className="absolute inset-0 flex items-center justify-center bg-muted">
          <Spinner />
        </div>
      )}
    </div>
  )
}
