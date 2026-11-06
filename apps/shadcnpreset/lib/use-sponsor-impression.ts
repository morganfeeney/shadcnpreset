"use client"

import * as React from "react"

import { trackEvent } from "@/lib/analytics-events"

/**
 * Counts one `affiliate_impression` each time `shown` first turns true for a
 * placement and key, so re-renders and re-showing the same card on the same
 * page are not counted twice.
 */
export function useSponsorImpression(
  shown: boolean,
  partner: string,
  placement: string,
  impressionKey?: string
) {
  const countedFor = React.useRef<string | null>(null)

  React.useEffect(() => {
    const key = [partner, placement, impressionKey ?? ""].join("\u0000")
    if (!shown || countedFor.current === key) return
    countedFor.current = key
    trackEvent("affiliate_impression", { partner, placement })
  }, [shown, partner, placement, impressionKey])
}
