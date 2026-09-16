import { describe, expect, it } from "vitest"

import { affiliateLinkParams, isAffiliateHref } from "@/lib/affiliate-link"

const CHANGELOG_HREF = "https://shadcncraft.com?atp=shadcnpreset&src=changelog"

describe("isAffiliateHref", () => {
  it("recognises our tag, and leaves plain outbound links alone", () => {
    expect(isAffiliateHref(CHANGELOG_HREF)).toBe(true)
    expect(isAffiliateHref("https://shadcncraft.com")).toBe(false)
    expect(isAffiliateHref(undefined)).toBe(false)
  })
})

describe("affiliateLinkParams", () => {
  it("reads the partner from the host and the placement from `src`", () => {
    expect(affiliateLinkParams(CHANGELOG_HREF)).toEqual({
      partner: "shadcncraft",
      placement: "changelog",
    })
  })

  it("still counts a link whose placement was never tagged", () => {
    expect(
      affiliateLinkParams("https://www.shadcncraft.com/blocks?atp=shadcnpreset")
    ).toEqual({ partner: "shadcncraft", placement: "untagged" })
  })
})
