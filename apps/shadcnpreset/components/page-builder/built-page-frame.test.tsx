// @vitest-environment jsdom
import { act, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"

import { BuiltPage } from "@/components/page-builder/built-page"
import { BuiltPageFrame } from "@/components/page-builder/built-page-frame"
import {
  PAGE_BUILDER_READY_MESSAGE_TYPE,
  pageBuilderBlocksMessage,
  type BuiltPageSpec,
} from "@/lib/page-builder/messages"

vi.mock("@/components/preset-v4-frame", () => ({
  PresetV4Frame: ({ src, title }: { src: string; title: string }) => (
    <iframe src={src} title={title} />
  ),
}))

// Stand-in blocks that print their id, so the test can read the layout.
vi.mock("@/components/page-builder/block-loaders", () => ({
  BLOCK_LOADERS: new Proxy(
    {},
    { get: (_, id: string) => () => <p data-testid="block">{id}</p> }
  ),
}))

vi.mock("@/components/cn-ui/sidebar", () => ({
  SidebarProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="app-shell">{children}</div>
  ),
  SidebarInset: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}))

const NO_LAYOUT = { header: null, sidebar: null, footer: null }

function spec(
  kind: "marketing" | "store" | "dashboard",
  blocks: string[],
  layout: BuiltPageSpec["layout"] = NO_LAYOUT
): BuiltPageSpec {
  return { kind, blocks, layout }
}

/** A message as it would arrive, from this origin unless told otherwise. */
function receive(data: unknown, origin = window.location.origin) {
  act(() => {
    window.dispatchEvent(
      new MessageEvent("message", { data, origin, source: window })
    )
  })
}

afterEach(() => {
  vi.restoreAllMocks()
})

describe("BuiltPageFrame", () => {
  const postMessage = () => vi.spyOn(window, "postMessage")

  it("answers the frame's ready with the latest layout, not the one in its URL", () => {
    const posted = postMessage()
    const { rerender } = render(
      <BuiltPageFrame
        preset="b0"
        spec={spec("dashboard", ["metric-cards-1"])}
        dimmed={false}
      />
    )
    // A new draft lands while the frame is still loading its blocks.
    rerender(
      <BuiltPageFrame
        preset="b0"
        spec={spec("marketing", ["hero-1", "faqs-1"])}
        dimmed={false}
      />
    )
    expect(posted).not.toHaveBeenCalled()

    receive({ type: PAGE_BUILDER_READY_MESSAGE_TYPE })

    expect(posted).toHaveBeenLastCalledWith(
      pageBuilderBlocksMessage(spec("marketing", ["hero-1", "faqs-1"])),
      window.location.origin
    )
  })

  it("posts each edit once the frame is listening", () => {
    const posted = postMessage()
    const { rerender } = render(
      <BuiltPageFrame
        preset="b0"
        spec={spec("marketing", ["hero-1", "faqs-1"])}
        dimmed={false}
      />
    )
    receive({ type: PAGE_BUILDER_READY_MESSAGE_TYPE })

    rerender(
      <BuiltPageFrame
        preset="b0"
        spec={spec("marketing", ["faqs-1", "hero-1"])}
        dimmed={false}
      />
    )

    expect(posted).toHaveBeenLastCalledWith(
      pageBuilderBlocksMessage(spec("marketing", ["faqs-1", "hero-1"])),
      window.location.origin
    )
  })

  it("ignores a ready from another origin", () => {
    const posted = postMessage()
    render(
      <BuiltPageFrame
        preset="b0"
        spec={spec("marketing", ["hero-1"])}
        dimmed={false}
      />
    )
    receive({ type: PAGE_BUILDER_READY_MESSAGE_TYPE }, "https://elsewhere.test")
    expect(posted).not.toHaveBeenCalled()
  })
})

describe("BuiltPage", () => {
  const rendered = () =>
    screen.getAllByTestId("block").map((block) => block.textContent)

  it("says it is listening, then follows the builder's layout", () => {
    const posted = vi.spyOn(window, "postMessage")
    render(
      <BuiltPage
        {...spec("dashboard", ["metric-cards-1"], {
          header: "app-shell-header-1",
          sidebar: "app-shell-1",
          footer: null,
        })}
      />
    )

    expect(posted).toHaveBeenCalledWith(
      { type: PAGE_BUILDER_READY_MESSAGE_TYPE },
      window.location.origin
    )

    receive(
      pageBuilderBlocksMessage(
        spec("marketing", ["hero-1", "pricing-4"], {
          header: "top-navigation-2",
          sidebar: null,
          footer: "footer-3",
        })
      )
    )

    // A website: no app shell, the header above the blocks, the footer below.
    expect(screen.queryByTestId("app-shell")).toBeNull()
    expect(rendered()).toEqual([
      "top-navigation-2",
      "hero-1",
      "pricing-4",
      "footer-3",
    ])
  })

  it("puts a sidebar's page in the app shell, header first", () => {
    render(
      <BuiltPage
        {...spec("marketing", ["hero-1"], {
          header: "top-navigation-1",
          sidebar: "app-shell-2",
          footer: "footer-1",
        })}
      />
    )
    expect(screen.getByTestId("app-shell")).toBeTruthy()
    expect(rendered()).toEqual([
      "app-shell-2",
      "top-navigation-1",
      "hero-1",
      "footer-1",
    ])
  })

  it("keeps an app header in the app shell even without a sidebar", () => {
    render(
      <BuiltPage
        {...spec("dashboard", ["win-rate-1"], {
          header: "app-shell-header-3",
          sidebar: null,
          footer: null,
        })}
      />
    )
    expect(screen.getByTestId("app-shell")).toBeTruthy()
    expect(rendered()).toEqual(["app-shell-header-3", "win-rate-1"])
  })

  it("ignores a layout from another origin", () => {
    render(<BuiltPage {...spec("marketing", ["hero-1"])} />)
    receive(
      pageBuilderBlocksMessage(spec("marketing", ["faqs-1"])),
      "https://elsewhere.test"
    )
    expect(rendered()).toEqual(["hero-1"])
  })
})
