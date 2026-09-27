// @vitest-environment jsdom
import { act, fireEvent, render, screen } from "@testing-library/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { afterEach, describe, expect, it, vi } from "vitest"

import { PageBuilder } from "@/components/page-builder/page-builder"
import { Toaster } from "@/components/ui/sonner"
import { trackEvent } from "@/lib/analytics-events"
import type { SavedPage } from "@/lib/page-builder/saved-page"

// The preview prints what it was asked to show.
vi.mock("@/components/page-builder/built-page-frame", () => ({
  BuiltPageFrame: ({
    spec,
  }: {
    spec: { blocks: string[]; layout: Record<string, string | null> }
  }) => (
    <p data-testid="preview">
      {[...spec.blocks, ...Object.values(spec.layout).filter(Boolean)].join(
        ","
      )}
    </p>
  ),
}))

// The preset menu needs the session and saved presets; it is not what is
// under test here.
vi.mock("@/components/page-builder/preset-menu", () => ({
  DEFAULT_PRESET: "b0",
  PresetMenu: () => null,
}))

vi.mock("@/lib/analytics-events", () => ({ trackEvent: vi.fn() }))

vi.mock("next-themes", () => ({
  useTheme: () => ({ theme: "light", resolvedTheme: "light" }),
}))

const SAVED: SavedPage = {
  spec: {
    blocks: ["hero-2", "pricing-4"],
    layout: { header: "top-navigation-1", sidebar: null, footer: null },
  },
  preset: null,
}

function renderBuilder(saved: SavedPage | null = SAVED) {
  render(
    <QueryClientProvider client={new QueryClient()}>
      <PageBuilder saved={saved} />
      <Toaster />
    </QueryClientProvider>
  )
}

afterEach(() => {
  vi.mocked(trackEvent).mockClear()
})

function impressions() {
  return vi
    .mocked(trackEvent)
    .mock.calls.filter(([name]) => name === "affiliate_impression")
    .map(([, params]) => params)
}

describe("PageBuilder", () => {
  it("opens a saved page as it was", () => {
    renderBuilder()
    expect(screen.getByTestId("preview").textContent).toBe(
      "hero-2,pricing-4,top-navigation-1"
    )
  })

  it("clears the page, and puts it back on undo", async () => {
    renderBuilder()
    fireEvent.click(screen.getByRole("button", { name: "Clear page" }))

    expect(screen.queryByTestId("preview")).toBeNull()
    expect(
      screen.getByRole("heading", { name: "Describe a page" })
    ).toBeTruthy()
    expect(screen.getByRole("button", { name: "Clear page" })).toHaveProperty(
      "disabled",
      true
    )

    const undo = await screen.findByRole("button", { name: "Undo" })
    act(() => undo.click())

    expect(screen.getByTestId("preview").textContent).toBe(
      "hero-2,pricing-4,top-navigation-1"
    )
  })

  it("keeps a cleared Jev draft cleared, though Jev's reading is cached", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          page: {
            kind: "marketing",
            kindProbability: 1,
            sections: [],
            chosen: ["hero-2", "faqs-1"],
            layout: { header: null, sidebar: null, footer: "footer-1" },
          },
          preset: { code: "b0", config: {}, fields: [] },
          model: "jev-test",
          ms: 1,
        })
      )
    )
    renderBuilder(null)
    fireEvent.click(screen.getByRole("button", { name: "Coffee shop" }))
    expect((await screen.findByTestId("preview")).textContent).toBe(
      "hero-2,faqs-1,footer-1"
    )

    fireEvent.click(screen.getByRole("button", { name: "Clear page" }))
    await act(async () => {})
    expect(screen.queryByTestId("preview")).toBeNull()
    vi.restoreAllMocks()
  })

  it("has nothing to clear on a new page", () => {
    renderBuilder(null)
    expect(screen.getByRole("button", { name: "Clear page" })).toHaveProperty(
      "disabled",
      true
    )
  })

  it("counts the blocks credit once on a new page, and no get-code button yet", () => {
    renderBuilder(null)
    expect(impressions()).toEqual([
      { partner: "shadcncraft", placement: "page-builder" },
    ])
  })

  it("counts the get-code button once a visit, though clearing and undoing brings it back", async () => {
    renderBuilder()
    fireEvent.click(screen.getByRole("button", { name: "Clear page" }))
    const undo = await screen.findByRole("button", { name: "Undo" })
    act(() => undo.click())

    expect(screen.getByRole("link", { name: "Get the code" })).toBeTruthy()
    expect(impressions()).toEqual([
      { partner: "shadcncraft", placement: "page-builder" },
      { partner: "shadcncraft", placement: "page-builder-get-code" },
    ])
  })
})
