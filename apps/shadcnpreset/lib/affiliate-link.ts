/** Every affiliate link we hand out carries this tag. */
const AFFILIATE_TAG = "atp=shadcnpreset"

/**
 * Affonso's sub-parameter for where the link sat. Its dashboard breaks clicks
 * and sales down by `sub1`, so this is the placement it reports.
 */
const PLACEMENT_PARAM = "sub1"

/** shadcncraft affiliate link for a placement, e.g. `assistant-chat`. */
export function shadcncraftHref(placement: string): string {
  return `https://shadcncraft.com?${AFFILIATE_TAG}&${PLACEMENT_PARAM}=${placement}`
}

export function isAffiliateHref(href: string | undefined): boolean {
  return Boolean(href?.includes(AFFILIATE_TAG))
}

/**
 * Partner and placement for an affiliate href, e.g.
 * `https://shadcncraft.com?atp=shadcnpreset&sub1=changelog` → shadcncraft,
 * changelog. A link without a placement is still worth counting, so it falls back to
 * `untagged` rather than being dropped.
 */
export function affiliateLinkParams(href: string): {
  partner: string
  placement: string
} {
  try {
    const url = new URL(href)
    return {
      partner: url.hostname.replace(/^www\./, "").split(".")[0],
      placement: url.searchParams.get(PLACEMENT_PARAM) || "untagged",
    }
  } catch {
    return { partner: "unknown", placement: "untagged" }
  }
}
