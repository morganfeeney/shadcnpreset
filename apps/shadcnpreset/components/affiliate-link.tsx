"use client"

import type { AnchorHTMLAttributes } from "react"

import { affiliateLinkParams } from "@/lib/affiliate-link"
import { trackEvent } from "@/lib/analytics-events"

/**
 * Outbound affiliate link that reports its click. Prose links have no
 * impression of their own — use page views of the page they sit on as the
 * denominator.
 *
 * The href checks live in `@/lib/affiliate-link`, not here: this module is
 * client-only, and the MDX component map that picks the link renders on the
 * server.
 */
export function AffiliateLink({
  href,
  children,
  ...props
}: { href: string } & AnchorHTMLAttributes<HTMLAnchorElement>) {
  return (
    <a
      href={href}
      target="_blank"
      // Search engines expect paid links marked sponsored.
      rel="sponsored noopener noreferrer"
      onClick={() => {
        trackEvent("affiliate_click", affiliateLinkParams(href))
      }}
      {...props}
    >
      {children}
    </a>
  )
}
