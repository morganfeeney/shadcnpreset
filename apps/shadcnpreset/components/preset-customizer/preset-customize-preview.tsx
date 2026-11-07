"use client"

import * as React from "react"

import { BuildWithPresetLink } from "@/components/page-builder/build-with-preset-link"
import { usePresetCustomize } from "@/components/preset-customizer/preset-customize"
import { PresetV4Frame } from "@/components/preset-v4-frame"
import { Spinner } from "@/components/ui/spinner"
import { getPresetPreviewUrl } from "@/lib/preset"
import { getPresetPreviewView } from "@/lib/preset-preview"

/**
 * The preset in its chosen view, with every change shown in place. It loads
 * once per view: another preset, from Customize or a list beside it, is sent
 * into the frame rather than loaded again.
 */
export function PresetCustomizePreview() {
  const { value, css, view, saved, generatedPreview } = usePresetCustomize()

  // The preset the frame loads with, kept until the view changes. A saved
  // preset's colours paint first; any change arrives as a message.
  const [frame, setFrame] = React.useState({
    view,
    code: value.code,
    custom: saved?.id,
  })
  if (frame.view !== view) {
    setFrame({ view, code: value.code, custom: saved?.id })
  }
  const [loadedView, setLoadedView] = React.useState<string | null>(null)
  const loaded = loadedView === view

  const url = getPresetPreviewUrl(frame.code, view)
  const credit = getPresetPreviewView(view)?.credit
  if (!url) return null
  const src = frame.custom
    ? `${url}&${new URLSearchParams({ custom: frame.custom })}`
    : url

  return (
    <div
      data-slot="preset-preview"
      className="relative min-h-0 flex-1 bg-muted p-3 lg:p-5"
    >
      <PresetV4Frame
        className="block size-full rounded-lg border bg-background shadow-lg"
        src={src}
        title={`Preset preview ${value.code} ${view}`}
        generatedPreview={view === "generated" ? generatedPreview : null}
        presetCode={value.code}
        customColoursCss={css}
        onLoad={() => setLoadedView(view)}
      />
      {/* Over the blocks it builds with, once they are there to see. */}
      {credit && loaded ? (
        <BuildWithPresetLink
          presetCode={value.code}
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
