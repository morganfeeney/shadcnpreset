// @vitest-environment jsdom
import { act, fireEvent, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"

import { BuiltPage } from "@/components/page-builder/built-page"
import { BuiltPageFrame } from "@/components/page-builder/built-page-frame"
import {
  PAGE_BUILDER_READY_MESSAGE_TYPE,
  pageBuilderBlocksMessage,
  pageBuilderEditMessage,
  type BuiltPageSpec,
} from "@/lib/page-builder/messages"
import type { PageLayout } from "@/lib/page-builder/sections"

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

function spec(blocks: string[], layout: PageLayout = NO_LAYOUT): BuiltPageSpec {
  return { blocks, layout }
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
  function renderFrame(initial: BuiltPageSpec) {
    const onEdit = vi.fn()
    const view = render(
      <BuiltPageFrame
        preset="b0"
        spec={initial}
        dimmed={false}
        onEdit={onEdit}
      />
    )
    const rerender = (next: BuiltPageSpec) =>
      view.rerender(
        <BuiltPageFrame
          preset="b0"
          spec={next}
          dimmed={false}
          onEdit={onEdit}
        />
      )
    return { onEdit, rerender }
  }

  it("answers the frame's ready with the latest layout, not the one in its URL", () => {
    const posted = vi.spyOn(window, "postMessage")
    const { rerender } = renderFrame(spec(["metric-cards-1"]))
    // A new draft lands while the frame is still loading its blocks.
    rerender(spec(["hero-1", "faqs-1"]))
    expect(posted).not.toHaveBeenCalled()

    receive({ type: PAGE_BUILDER_READY_MESSAGE_TYPE })

    expect(posted).toHaveBeenLastCalledWith(
      pageBuilderBlocksMessage(spec(["hero-1", "faqs-1"])),
      window.location.origin
    )
  })

  it("posts each change once the frame is listening", () => {
    const posted = vi.spyOn(window, "postMessage")
    const { rerender } = renderFrame(spec(["hero-1", "faqs-1"]))
    receive({ type: PAGE_BUILDER_READY_MESSAGE_TYPE })

    rerender(spec(["faqs-1", "hero-1"]))

    expect(posted).toHaveBeenLastCalledWith(
      pageBuilderBlocksMessage(spec(["faqs-1", "hero-1"])),
      window.location.origin
    )
  })

  it("takes edits only from the frame that said it was ready", () => {
    vi.spyOn(window, "postMessage")
    const { onEdit } = renderFrame(spec(["hero-1", "faqs-1"]))
    const edit = { action: "remove", index: 1, block: "faqs-1" } as const

    receive(pageBuilderEditMessage(edit))
    expect(onEdit).not.toHaveBeenCalled()

    receive({ type: PAGE_BUILDER_READY_MESSAGE_TYPE })
    receive(pageBuilderEditMessage(edit))
    expect(onEdit).toHaveBeenCalledWith(edit)

    receive(pageBuilderEditMessage(edit), "https://elsewhere.test")
    expect(onEdit).toHaveBeenCalledTimes(1)
  })

  it("ignores a ready from another origin", () => {
    const posted = vi.spyOn(window, "postMessage")
    renderFrame(spec(["hero-1"]))
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
        {...spec(["metric-cards-1"], {
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
        spec(["hero-1", "pricing-4"], {
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

  it("asks the builder to move and remove blocks from their toolbars", () => {
    const posted = vi.spyOn(window, "postMessage")
    render(<BuiltPage {...spec(["hero-1", "pricing-4", "faqs-1"])} />)

    fireEvent.click(screen.getByRole("button", { name: "Move Pricing up" }))
    expect(posted).toHaveBeenLastCalledWith(
      pageBuilderEditMessage({
        action: "move",
        index: 1,
        block: "pricing-4",
        by: -1,
      }),
      window.location.origin
    )

    fireEvent.click(screen.getByRole("button", { name: "Remove FAQs" }))
    expect(posted).toHaveBeenLastCalledWith(
      pageBuilderEditMessage({ action: "remove", index: 2, block: "faqs-1" }),
      window.location.origin
    )

    // Nowhere to go past either end.
    expect(screen.getByRole("button", { name: "Move Hero up" })).toHaveProperty(
      "disabled",
      true
    )
    expect(
      screen.getByRole("button", { name: "Move FAQs down" })
    ).toHaveProperty("disabled", true)
  })

  it("takes a header or footer off its slot", () => {
    const posted = vi.spyOn(window, "postMessage")
    render(
      <BuiltPage
        {...spec(["hero-1"], {
          header: "top-navigation-1",
          sidebar: null,
          footer: "footer-1",
        })}
      />
    )
    fireEvent.click(screen.getByRole("button", { name: "Remove header" }))
    expect(posted).toHaveBeenLastCalledWith(
      pageBuilderEditMessage({ action: "clear", slot: "header" }),
      window.location.origin
    )
  })

  it("takes the sidebar off from its own toolbar", () => {
    const posted = vi.spyOn(window, "postMessage")
    render(
      <BuiltPage
        {...spec(["win-rate-1"], {
          header: "app-shell-header-1",
          sidebar: "app-shell-1",
          footer: null,
        })}
      />
    )
    fireEvent.click(screen.getByRole("button", { name: "Remove sidebar" }))
    expect(posted).toHaveBeenLastCalledWith(
      pageBuilderEditMessage({ action: "clear", slot: "sidebar" }),
      window.location.origin
    )
  })

  it("puts neighbouring dashboard widgets in one grid", () => {
    render(
      <BuiltPage
        {...spec(["hero-1", "win-rate-1", "goal-progress-1", "faqs-1"])}
      />
    )
    const grid = (id: string) =>
      document.querySelector(`[data-block="${id}"]`)?.parentElement
    expect(grid("win-rate-1")).toBe(grid("goal-progress-1"))
    expect(grid("win-rate-1")?.className).toContain("grid-cols-2")
    expect(grid("hero-1")).not.toBe(grid("win-rate-1"))
  })

  it("puts a sidebar's page in the app shell, header first", () => {
    render(
      <BuiltPage
        {...spec(["hero-1"], {
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
        {...spec(["win-rate-1"], {
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
    render(<BuiltPage {...spec(["hero-1"])} />)
    receive(
      pageBuilderBlocksMessage(spec(["faqs-1"])),
      "https://elsewhere.test"
    )
    expect(rendered()).toEqual(["hero-1"])
  })
})
