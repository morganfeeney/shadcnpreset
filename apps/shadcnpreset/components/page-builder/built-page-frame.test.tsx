// @vitest-environment jsdom
import { act, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"

import { BuiltPage } from "@/components/page-builder/built-page"
import { BuiltPageFrame } from "@/components/page-builder/built-page-frame"
import {
  PAGE_BUILDER_BLOCKS_MESSAGE_TYPE,
  PAGE_BUILDER_READY_MESSAGE_TYPE,
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

vi.mock("@/components/shadcncraft-examples/blocks/app-shell-1", () => ({
  AppShell1: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="app-shell">{children}</div>
  ),
}))

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
        kind="dashboard"
        blocks={["metric-cards-1"]}
        dimmed={false}
      />
    )
    // A new draft lands while the frame is still loading its blocks.
    rerender(
      <BuiltPageFrame
        preset="b0"
        kind="marketing"
        blocks={["hero-1", "footer-1"]}
        dimmed={false}
      />
    )
    expect(posted).not.toHaveBeenCalled()

    receive({ type: PAGE_BUILDER_READY_MESSAGE_TYPE })

    expect(posted).toHaveBeenLastCalledWith(
      {
        type: PAGE_BUILDER_BLOCKS_MESSAGE_TYPE,
        kind: "marketing",
        blocks: ["hero-1", "footer-1"],
      },
      window.location.origin
    )
  })

  it("posts each edit once the frame is listening", () => {
    const posted = postMessage()
    const { rerender } = render(
      <BuiltPageFrame
        preset="b0"
        kind="marketing"
        blocks={["hero-1", "footer-1"]}
        dimmed={false}
      />
    )
    receive({ type: PAGE_BUILDER_READY_MESSAGE_TYPE })

    rerender(
      <BuiltPageFrame
        preset="b0"
        kind="marketing"
        blocks={["footer-1", "hero-1"]}
        dimmed={false}
      />
    )

    expect(posted).toHaveBeenLastCalledWith(
      {
        type: PAGE_BUILDER_BLOCKS_MESSAGE_TYPE,
        kind: "marketing",
        blocks: ["footer-1", "hero-1"],
      },
      window.location.origin
    )
  })

  it("ignores a ready from another origin", () => {
    const posted = postMessage()
    render(
      <BuiltPageFrame
        preset="b0"
        kind="marketing"
        blocks={["hero-1"]}
        dimmed={false}
      />
    )
    receive({ type: PAGE_BUILDER_READY_MESSAGE_TYPE }, "https://elsewhere.test")
    expect(posted).not.toHaveBeenCalled()
  })
})

describe("BuiltPage", () => {
  it("says it is listening, then follows the builder's layout", () => {
    const posted = vi.spyOn(window, "postMessage")
    render(<BuiltPage kind="dashboard" blocks={["metric-cards-1"]} />)

    expect(posted).toHaveBeenCalledWith(
      { type: PAGE_BUILDER_READY_MESSAGE_TYPE },
      window.location.origin
    )

    receive({
      type: PAGE_BUILDER_BLOCKS_MESSAGE_TYPE,
      kind: "marketing",
      blocks: ["hero-1", "pricing-4", "footer-1"],
    })

    expect(screen.queryByTestId("app-shell")).toBeNull()
    expect(screen.getAllByTestId("block").map((b) => b.textContent)).toEqual([
      "hero-1",
      "pricing-4",
      "footer-1",
    ])
  })

  it("ignores a layout from another origin", () => {
    render(<BuiltPage kind="marketing" blocks={["hero-1"]} />)
    receive(
      {
        type: PAGE_BUILDER_BLOCKS_MESSAGE_TYPE,
        kind: "marketing",
        blocks: ["footer-1"],
      },
      "https://elsewhere.test"
    )
    expect(screen.getAllByTestId("block").map((b) => b.textContent)).toEqual([
      "hero-1",
    ])
  })
})
