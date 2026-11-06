"use client"

import * as React from "react"

import { Badge } from "@/components/ui/badge"
import { shadcncraftHref } from "@/lib/affiliate-link"
import { trackEvent } from "@/lib/analytics-events"
import { useSponsorImpression } from "@/lib/use-sponsor-impression"

const PARTNER = "shadcncraft"

/** Screenshots shadcncraft serves for its own marketing blocks. */
const PREVIEW_LIGHT =
  "https://assets.shadcncraft.com/registry/dashboard-block-light.webp"
const PREVIEW_DARK =
  "https://assets.shadcncraft.com/registry/dashboard-block-dark.webp"

type ShadcncraftAdCardProps = {
  /** Sent as the link's placement and to analytics, e.g. `assistant-chat`. */
  placement: string
  /**
   * Counts a fresh impression when this changes. Pass the chat id: the card
   * stays mounted when someone opens another conversation from the sidebar,
   * and each conversation it is shown beside is an impression of its own.
   */
  impressionKey?: string
  /**
   * Count the impression when the card first scrolls into view rather than
   * when it mounts. For a card at the end of a page, which many readers never
   * reach, or one hidden at some widths.
   */
  countWhenSeen?: boolean
  className?: string
}

/**
 * Sponsored card for shadcncraft, sized to sit in the run of a conversation
 * the way an ad does: small, labelled, and skippable.
 *
 * It counts its own impression, unlike the prose links in
 * `@/components/affiliate-link` — those are read against page views, while a
 * card appears only after an answer lands and needs its own denominator.
 */
export function ShadcncraftAdCard({
  placement,
  impressionKey,
  countWhenSeen = false,
  className,
}: ShadcncraftAdCardProps) {
  const href = shadcncraftHref(placement)
  const ref = React.useRef<HTMLElement>(null)
  const seen = useSeen(ref, countWhenSeen)

  useSponsorImpression(seen, PARTNER, placement, impressionKey)

  return (
    <aside ref={ref} aria-label="Sponsored" className={className}>
      <a
        href={href}
        target="_blank"
        // Search engines expect paid links marked sponsored.
        rel="sponsored noopener"
        // Capped rather than filling the column: an ad that ran the width of
        // the conversation would read as part of the answer.
        className="flex max-w-sm gap-3 rounded-lg border p-2 transition-colors hover:bg-muted/50"
        onClick={() => {
          trackEvent("affiliate_click", { partner: PARTNER, placement })
        }}
      >
        <div className="hidden w-28 shrink-0 self-stretch overflow-hidden rounded-md border bg-muted sm:block">
          {/* Decorative: the card's text is the link's accessible name. */}
          <img
            src={PREVIEW_LIGHT}
            alt=""
            loading="lazy"
            className="size-full object-cover object-left-top dark:hidden"
          />
          <img
            src={PREVIEW_DARK}
            alt=""
            loading="lazy"
            className="hidden size-full object-cover object-left-top dark:block"
          />
        </div>
        <div className="flex min-w-0 flex-col gap-1 py-1">
          <p className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
            <span className="font-medium text-foreground">shadcncraft</span>
            <Badge variant="outline" className="text-[10px]">
              Ad
            </Badge>
          </p>
          <p className="text-sm font-medium">Pro blocks for shadcn/ui</p>
          <p className="text-xs text-balance text-muted-foreground">
            Dashboards, checkouts and marketing pages your preset drops straight
            into.
          </p>
        </div>
      </a>
    </aside>
  )
}

/** True once the element has been on screen; always true when not watching. */
function useSeen(ref: React.RefObject<HTMLElement | null>, watch: boolean) {
  // Without IntersectionObserver there is no way to tell, so count on mount.
  const [seen, setSeen] = React.useState(
    () => !watch || typeof IntersectionObserver === "undefined"
  )

  React.useEffect(() => {
    const node = ref.current
    if (seen || !node) return
    // An element hidden with display:none never intersects, so a card hidden
    // at this width is never counted.
    const observer = new IntersectionObserver((entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return
      setSeen(true)
      observer.disconnect()
    })
    observer.observe(node)
    return () => observer.disconnect()
  }, [ref, seen])

  return seen
}
