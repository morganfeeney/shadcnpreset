"use client"

import * as React from "react"

import { BuildWithPresetLink } from "@/components/page-builder/build-with-preset-link"
import { usePresetPageLive } from "@/components/preset-page-live-context"
import { PresetV4Frame } from "@/components/preset-v4-frame"
import { Spinner } from "@/components/ui/spinner"
import { getPresetPreviewUrl } from "@/lib/preset"
import { getPresetPreviewView } from "@/lib/preset-preview"

import { resolveEffectiveView } from "./effective-view"
import { usePresetCustomize } from "./preset-customize"

/**
 * The preset in its chosen view, with any change to it shown in place. It
 * lives in the layout and loads once per view: another preset, from
 * Customize or the list, is sent into the frame rather than loaded again.
 */
export function PresetBrowsePreview() {
  const { livePresetCode, view: requestedView, generatedPreview } =
    usePresetPageLive()
  const { value, css } = usePresetCustomize()
  const view = resolveEffectiveView(requestedView, Boolean(generatedPreview))

  // The preset the frame loads with, kept until the view changes.
  const [frame, setFrame] = React.useState({ view, code: livePresetCode })
  if (frame.view !== view) setFrame({ view, code: livePresetCode })
  const [loadedView, setLoadedView] = React.useState<string | null>(null)
  const loaded = loadedView === view

  const previewSrc = getPresetPreviewUrl(frame.code, view)
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
        title={`Preset preview ${livePresetCode} ${view}`}
        generatedPreview={view === "generated" ? generatedPreview : null}
        presetCode={value.code}
        customColoursCss={css}
        onLoad={() => setLoadedView(view)}
      />
      {/* Over the blocks it builds with, once they are there to see. */}
      {credit && loaded ? (
        <BuildWithPresetLink
          presetCode={livePresetCode}
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
