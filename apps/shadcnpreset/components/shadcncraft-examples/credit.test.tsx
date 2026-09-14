// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"

import { ShadcncraftCredit } from "@/components/shadcncraft-examples/credit"
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

  it("counts an impression per placement, not per preset cycled through", () => {
    const { rerender } = render(
      <ShadcncraftCredit credit={marketing} presetCode="b5aFUJkSzC" />
    )
    rerender(<ShadcncraftCredit credit={marketing} presetCode="aXyZ123" />)
    rerender(
      <ShadcncraftCredit
        credit={{ label: "E-commerce blocks", source: "store-preview" }}
        presetCode="aXyZ123"
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
