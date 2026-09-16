"use client"

import type { AnchorHTMLAttributes } from "react"

import { trackEvent } from "@/lib/analytics-events"

/** Every affiliate link we hand out carries this tag. */
const AFFILIATE_TAG = "atp=shadcnpreset"

export function isAffiliateHref(href: string | undefined): boolean {
  return Boolean(href?.includes(AFFILIATE_TAG))
}

/**
 * Partner and placement for an affiliate href, e.g.
 * `https://shadcncraft.com?atp=shadcnpreset&src=changelog` → shadcncraft,
 * changelog. A link without `src` is still worth counting, so it falls back to
 * the page it was written into rather than being dropped.
 */
export function affiliateLinkParams(href: string): {
  partner: string
  placement: string
} {
  try {
    const url = new URL(href)
    return {
      partner: url.hostname.replace(/^www\./, "").split(".")[0],
      placement: url.searchParams.get("src") || "untagged",
    }
  } catch {
    return { partner: "unknown", placement: "untagged" }
  }
}

/**
 * Outbound affiliate link that reports its click. Prose links have no
 * impression of their own — use page views of the page they sit on as the
 * denominator.
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
