"use client"

import * as React from "react"

import { resolvePresetFromCode, type ResolvedPreset } from "@/lib/preset"

const PreviewPresetContext = React.createContext<ResolvedPreset | null>(null)

/**
 * The frame's preset, for the preview cards that name it (style, fonts) or
 * pass it to a chart. Upstream reads these from the create page's query
 * string; the local frame only has `?preset=`.
 */
export function PreviewPresetProvider({
  code,
  children,
}: {
  code: string
  children: React.ReactNode
}) {
  const preset = React.useMemo(() => resolvePresetFromCode(code), [code])
  return (
    <PreviewPresetContext.Provider value={preset}>
      {children}
    </PreviewPresetContext.Provider>
  )
}

export function usePreviewPreset(): ResolvedPreset {
  const preset = React.useContext(PreviewPresetContext)
  if (!preset) {
    throw new Error("usePreviewPreset needs a PreviewPresetProvider")
  }
  return preset
}
