"use client"

import { usePresetPageLive } from "@/components/preset-page-live-context"
import type { PresetPreviewPageName } from "@/lib/preset-preview"

/** `generated` only resolves while Ask AI's preview is held this session. */
export function resolveEffectiveView(
  view: PresetPreviewPageName,
  hasGeneratedPreview: boolean
): PresetPreviewPageName {
  return view === "generated" && !hasGeneratedPreview ? "preview" : view
}

export function useEffectiveView() {
  const { view, generatedPreview } = usePresetPageLive()
  return resolveEffectiveView(view, Boolean(generatedPreview))
}
