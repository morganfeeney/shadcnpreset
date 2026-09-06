"use client"

import { PresetBrowseControls } from "@/components/preset-browse-controls"
import type { ResolvedPreset } from "@/lib/preset"

type DnaControlsProps = {
  resolved: ResolvedPreset
  className?: string
}

export function DnaControls({ resolved, className }: DnaControlsProps) {
  return (
    <PresetBrowseControls
      resolved={resolved}
      basePath="/pdp"
      className={className}
    />
  )
}
