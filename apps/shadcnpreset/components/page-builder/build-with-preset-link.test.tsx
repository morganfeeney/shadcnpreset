// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"

import { BuildWithPresetLink } from "@/components/page-builder/build-with-preset-link"
import { trackEvent } from "@/lib/analytics-events"

vi.mock("@/lib/analytics-events", () => ({ trackEvent: vi.fn() }))

afterEach(() => {
  cleanup()
  vi.mocked(trackEvent).mockClear()
})

describe("BuildWithPresetLink", () => {
  it("opens the builder in the preset, and reports where the link sat", () => {
    render(
      <BuildWithPresetLink presetCode="b0abc" placement="marketing-preview" />
    )

    const link = screen.getByRole("link", {
      name: "Build a page with these blocks",
    })
    expect(link.getAttribute("href")).toBe("/build?preset=b0abc")

    fireEvent.click(link)

    expect(trackEvent).toHaveBeenCalledWith("build_link_click", {
      placement: "marketing-preview",
      preset_code: "b0abc",
    })
  })
})
