// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"

import {
  AffiliateLink,
  affiliateLinkParams,
  isAffiliateHref,
} from "@/components/affiliate-link"
import { trackEvent } from "@/lib/analytics-events"

vi.mock("@/lib/analytics-events", () => ({ trackEvent: vi.fn() }))

const CHANGELOG_HREF = "https://shadcncraft.com?atp=shadcnpreset&src=changelog"

afterEach(() => {
  cleanup()
  vi.mocked(trackEvent).mockClear()
})

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

describe("AffiliateLink", () => {
  it("marks the link sponsored and reports the click", () => {
    render(<AffiliateLink href={CHANGELOG_HREF}>shadcncraft</AffiliateLink>)

    const link = screen.getByRole("link", { name: "shadcncraft" })
    expect(link.getAttribute("rel")).toContain("sponsored")

    fireEvent.click(link)

    expect(trackEvent).toHaveBeenCalledWith("affiliate_click", {
      partner: "shadcncraft",
      placement: "changelog",
    })
  })
})
