// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"

import { ShadcncraftPitch } from "@/components/shadcncraft-pitch/pitch"
import { trackEvent } from "@/lib/analytics-events"

vi.mock("@/lib/analytics-events", () => ({ trackEvent: vi.fn() }))

const PRESET = "b5aFUJkSzC"

afterEach(() => {
  cleanup()
  vi.mocked(trackEvent).mockClear()
})

function renderPitch() {
  render(<ShadcncraftPitch presetCode={PRESET} placement="pitch-dialog" />)
}

describe("ShadcncraftPitch", () => {
  it("counts one impression for where it is shown", () => {
    renderPitch()
    expect(vi.mocked(trackEvent).mock.calls).toEqual([
      [
        "affiliate_impression",
        { partner: "shadcncraft", placement: "pitch-dialog" },
      ],
    ])
  })

  it("tags its buy links with the placement, and reports the click with the preset", () => {
    renderPitch()
    const [buy] = screen.getAllByRole("link", { name: /Buy now/ })
    expect(buy.getAttribute("href")).toBe(
      "https://shadcncraft.com?atp=shadcnpreset&sub1=pitch-dialog"
    )
    expect(buy.getAttribute("rel")).toContain("sponsored")

    fireEvent.click(buy)

    expect(trackEvent).toHaveBeenCalledWith("affiliate_click", {
      partner: "shadcncraft",
      placement: "pitch-dialog",
      preset_code: PRESET,
    })
  })

  it("offers the builder in the same preset", () => {
    renderPitch()
    expect(
      screen
        .getByRole("link", { name: "Build a page with them" })
        .getAttribute("href")
    ).toBe(`/build?preset=${PRESET}`)
  })
})
