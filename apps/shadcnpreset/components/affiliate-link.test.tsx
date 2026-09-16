// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"

import { AffiliateLink } from "@/components/affiliate-link"
import { trackEvent } from "@/lib/analytics-events"

vi.mock("@/lib/analytics-events", () => ({ trackEvent: vi.fn() }))

const CHANGELOG_HREF = "https://shadcncraft.com?atp=shadcnpreset&src=changelog"

afterEach(() => {
  cleanup()
  vi.mocked(trackEvent).mockClear()
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
