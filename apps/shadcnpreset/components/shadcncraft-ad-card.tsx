"use client"

import * as React from "react"

import { Badge } from "@/components/ui/badge"
import { trackEvent } from "@/lib/analytics-events"

const PARTNER = "shadcncraft"

/** Screenshots shadcncraft serves for its own marketing blocks. */
const PREVIEW_LIGHT =
  "https://assets.shadcncraft.com/registry/dashboard-block-light.webp"
const PREVIEW_DARK =
  "https://assets.shadcncraft.com/registry/dashboard-block-dark.webp"

type ShadcncraftAdCardProps = {
  /** Sent as the link's `src` param and to analytics, e.g. `assistant-chat`. */
  placement: string
  /**
   * Counts a fresh impression when this changes. Pass the chat id: the card
   * stays mounted when someone opens another conversation from the sidebar,
   * and each conversation it is shown beside is an impression of its own.
   */
  impressionKey?: string
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
  className,
}: ShadcncraftAdCardProps) {
  const href = `https://shadcncraft.com?atp=shadcnpreset&src=${placement}`

  React.useEffect(() => {
    trackEvent("affiliate_impression", { partner: PARTNER, placement })
  }, [placement, impressionKey])

  return (
    <aside aria-label="Sponsored" className={className}>
      <a
        href={href}
        target="_blank"
        // Search engines expect paid links marked sponsored.
        rel="sponsored noopener noreferrer"
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
          <p className="flex items-center gap-2 text-xs text-muted-foreground">
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
