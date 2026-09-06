"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useState } from "react"

import { PresetBrowseControls } from "@/components/preset-browse-controls"
import { PresetPreviewLayoutPicker } from "@/components/preset-preview/layout-picker"
import { PresetV4Frame } from "@/components/preset-v4-frame"
import { Spinner } from "@/components/ui/spinner"
import type { ResolvedPreset } from "@/lib/preset"
import { getPresetPreviewUrl } from "@/lib/preset"
import {
  parsePresetPreviewPageName,
  presetBrowsePath,
  type PresetPreviewPageName,
} from "@/lib/preset-preview"

type PresetBrowseSurfaceProps = {
  resolved: ResolvedPreset
  initialView: PresetPreviewPageName
}

export function PresetBrowseSurface({
  resolved,
  initialView,
}: PresetBrowseSurfaceProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const view = parsePresetPreviewPageName(
    searchParams.get("view") ?? initialView
  )
  const frameKey = `${resolved.code}-${view}`
  const [loadedKey, setLoadedKey] = useState<string | null>(null)
  const loaded = loadedKey === frameKey
  const previewSrc = getPresetPreviewUrl(resolved.code, view)
  const search = view === "preview" ? "" : `?view=${view}`

  if (!previewSrc) {
    return null
  }

  function onViewChange(page: PresetPreviewPageName) {
    router.replace(presetBrowsePath(resolved.code, page), { scroll: false })
  }

  return (
    <>
      <div className="relative min-h-[calc(100dvh-100px)] overflow-hidden">
        <PresetV4Frame
          key={frameKey}
          className="block h-[calc(100dvh-100px)] w-full border-0"
          src={previewSrc}
          title={`Preset preview ${resolved.code} ${view}`}
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
      <div className="pb-safe sticky bottom-6 z-40 my-10 grid justify-center">
        <PresetBrowseControls
          resolved={resolved}
          basePath="/preset"
          search={search}
        >
          <PresetPreviewLayoutPicker
            value={view}
            onValueChange={onViewChange}
            presetCode={resolved.code}
          />
        </PresetBrowseControls>
      </div>
    </>
  )
}
