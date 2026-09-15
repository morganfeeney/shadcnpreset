"use client"

import { useEffect } from "react"

import { trackEvent } from "@/lib/analytics-events"
import type { PresetPreviewCredit } from "@/lib/preset-preview"
import { cn } from "@/lib/utils"

const PARTNER = "shadcncraft"

/**
 * Counts an impression each time a credited view is opened.
 *
 * Mount this in the browse layout, not beside the credit: picking a preset
 * navigates to a new `/preset/[code]` page, which remounts everything inside
 * it, and counting each preset would flatter the click-through rate.
 */
export function ShadcncraftCreditImpression({
  credit,
}: {
  credit: PresetPreviewCredit | undefined
}) {
  const source = credit?.source

  useEffect(() => {
    if (!source) return
    trackEvent("affiliate_impression", { partner: PARTNER, placement: source })
  }, [source])

  return null
}

/**
 * Affiliate credit shown above a shadcncraft preview. It lives on the parent
 * page rather than inside the preview frame, where analytics is switched off.
 */
export function ShadcncraftCredit({
  credit,
  presetCode,
  className,
}: {
  credit: PresetPreviewCredit
  presetCode: string
  className?: string
}) {
  const { label, source } = credit

  return (
    <p className={cn("text-xs text-muted-foreground", className)}>
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
