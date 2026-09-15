// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"

import {
  ShadcncraftCredit,
  ShadcncraftCreditImpression,
} from "@/components/shadcncraft-examples/credit"
import { trackEvent } from "@/lib/analytics-events"

vi.mock("@/lib/analytics-events", () => ({ trackEvent: vi.fn() }))

const marketing = { label: "Marketing blocks", source: "marketing-preview" }

afterEach(() => {
  cleanup()
  vi.mocked(trackEvent).mockClear()
})

describe("ShadcncraftCredit", () => {
  it("links to shadcncraft with our affiliate tag and the placement", () => {
    render(<ShadcncraftCredit credit={marketing} presetCode="b5aFUJkSzC" />)

    const link = screen.getByRole("link", { name: "shadcncraft Pro" })
    expect(link.getAttribute("href")).toBe(
      "https://shadcncraft.com?atp=shadcnpreset&src=marketing-preview"
    )
    expect(link.getAttribute("rel")).toContain("sponsored")
  })

  it("records a click with the placement and the preset being viewed", () => {
    render(<ShadcncraftCredit credit={marketing} presetCode="b5aFUJkSzC" />)

    fireEvent.click(screen.getByRole("link", { name: "shadcncraft Pro" }))

    expect(trackEvent).toHaveBeenLastCalledWith("affiliate_click", {
      partner: "shadcncraft",
      placement: "marketing-preview",
      preset_code: "b5aFUJkSzC",
    })
  })
})

describe("ShadcncraftCreditImpression", () => {
  it("counts an impression when a credited view opens, and again when another does", () => {
    const { rerender } = render(
      <ShadcncraftCreditImpression credit={undefined} />
    )
    rerender(<ShadcncraftCreditImpression credit={marketing} />)
    rerender(
      <ShadcncraftCreditImpression
        credit={{ label: "E-commerce blocks", source: "store-preview" }}
      />
    )

    expect(vi.mocked(trackEvent).mock.calls).toEqual([
      [
        "affiliate_impression",
        { partner: "shadcncraft", placement: "marketing-preview" },
      ],
      [
        "affiliate_impression",
        { partner: "shadcncraft", placement: "store-preview" },
      ],
    ])
  })

  it("does not count again while the same view stays open", () => {
    const { rerender } = render(
      <ShadcncraftCreditImpression credit={marketing} />
    )
    rerender(<ShadcncraftCreditImpression credit={{ ...marketing }} />)

    expect(trackEvent).toHaveBeenCalledTimes(1)
  })
})
