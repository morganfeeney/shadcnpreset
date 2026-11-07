// @vitest-environment jsdom
import { fireEvent, render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

vi.mock("@/lib/analytics-events", () => ({ trackEvent: vi.fn() }))
// The card's own drawing loads fonts through Next, which a test can't build.
vi.mock(
  "@/components/preset-swatch/components/preset-card-1-style-overview",
  () => ({ PresetCard1StyleOverview: () => null })
)
// The dialog loads a live preview, which none of this is about.
vi.mock("@/components/preset-preview/dialog", () => ({
  PresetPreviewDialog: ({ open }: { open: boolean }) =>
    open ? <div role="dialog">Preview</div> : null,
}))

const { PresetCardCustomizeProvider } = await import(
  "@/components/preset-card-customize"
)
const { PresetStyleOverviewCardPreview } = await import(
  "@/components/preset-style-overview-card"
)

const CODE = "b5dyaqxe6"

beforeEach(() => {
  vi.stubGlobal(
    "IntersectionObserver",
    class {
      observe() {}
      disconnect() {}
    }
  )
  vi.stubGlobal("matchMedia", () => ({
    matches: false,
    addEventListener: () => {},
    removeEventListener: () => {},
  }))
})

function card() {
  return (
    <PresetStyleOverviewCardPreview
      code={CODE}
      title={CODE}
      description="A preset"
    />
  )
}

describe("PresetStyleOverviewCardPreview", () => {
  it("opens its preview when clicked", () => {
    render(card())

    fireEvent.click(screen.getByRole("button", { name: `Open preview for ${CODE}` }))

    expect(screen.getByRole("dialog")).toBeTruthy()
  })

  it("customizes the preset instead while a custom preset is open beside it", () => {
    const customize = vi.fn()
    render(
      <PresetCardCustomizeProvider
        customize={customize}
        customizeOnClick
      >
        {card()}
      </PresetCardCustomizeProvider>
    )

    fireEvent.click(screen.getByRole("button", { name: `Customize preset ${CODE}` }))

    expect(customize).toHaveBeenCalledWith(CODE)
    expect(screen.queryByRole("dialog")).toBeNull()
  })
})
