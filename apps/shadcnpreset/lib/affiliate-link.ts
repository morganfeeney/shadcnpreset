/** Every affiliate link we hand out carries this tag. */
const AFFILIATE_TAG = "atp=shadcnpreset"

export function isAffiliateHref(href: string | undefined): boolean {
  return Boolean(href?.includes(AFFILIATE_TAG))
}

/**
 * Partner and placement for an affiliate href, e.g.
 * `https://shadcncraft.com?atp=shadcnpreset&src=changelog` → shadcncraft,
 * changelog. A link without `src` is still worth counting, so it falls back to
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
      placement: url.searchParams.get("src") || "untagged",
    }
  } catch {
    return { partner: "unknown", placement: "untagged" }
  }
}
