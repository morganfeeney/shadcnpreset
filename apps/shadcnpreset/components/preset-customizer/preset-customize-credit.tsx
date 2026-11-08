"use client"

import { usePresetCustomize } from "@/components/preset-customizer/preset-customize"
import { ShadcncraftCreditImpression } from "@/components/shadcncraft-examples/credit"
import { getPresetPreviewView } from "@/lib/preset-preview"

/**
 * Counts the view's credit as seen. Placed once, around the preview rather
 * than in it, so moving between presets is not a new impression.
 */
export function PresetCustomizeCreditImpression() {
  const { view } = usePresetCustomize()
  return (
    <ShadcncraftCreditImpression credit={getPresetPreviewView(view)?.credit} />
  )
}
