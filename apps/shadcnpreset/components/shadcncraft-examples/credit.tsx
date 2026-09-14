"use client"

import { useEffect } from "react"

import { trackEvent } from "@/lib/analytics-events"
import type { PresetPreviewCredit } from "@/lib/preset-preview"

const PARTNER = "shadcncraft"

/**
 * Affiliate credit shown above a shadcncraft preview. It lives on the parent
 * page rather than inside the preview frame, where analytics is switched off.
 */
export function ShadcncraftCredit({
  credit,
  presetCode,
}: {
  credit: PresetPreviewCredit
  presetCode: string
}) {
  const { label, source } = credit

  // Once per placement, not per preset: cycling presets keeps the same credit
  // on screen, and counting each would flatter the click-through rate.
  useEffect(() => {
    trackEvent("affiliate_impression", { partner: PARTNER, placement: source })
  }, [source])

  return (
    <p className="text-xs text-muted-foreground">
      {label} from{" "}
      <a
        href={`https://shadcncraft.com?atp=shadcnpreset&src=${source}`}
        target="_blank"
        rel="sponsored noopener noreferrer"
        className="underline underline-offset-4 hover:text-foreground"
        onClick={() => {
          trackEvent("affiliate_click", {
            partner: PARTNER,
            placement: source,
            preset_code: presetCode,
          })
        }}
      >
        shadcncraft Pro
      </a>
    </p>
  )
}
