// @vitest-environment jsdom
import { fireEvent, render, screen, within } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { BlockBrowser } from "@/components/page-builder/block-browser"
import type { PageKind } from "@/lib/page-builder/sections"

const LAYOUT = {
  header: "top-navigation-1",
  sidebar: null,
  footer: "footer-1",
}

function renderBrowser(suggestedGroup?: PageKind) {
  const onAdd = vi.fn()
  const onToggleLayout = vi.fn()
  render(
    <BlockBrowser
      suggestedGroup={suggestedGroup}
      layout={LAYOUT}
      onAdd={onAdd}
      onToggleLayout={onToggleLayout}
    />
  )
  const cards = () =>
    screen
      .getAllByRole("button", { name: /^(Add to page|Use as|Remove)/ })
      .map((card) => card.getAttribute("aria-label") ?? "")
  return { onAdd, onToggleLayout, cards }
}

function chip(name: string) {
  return within(screen.getByRole("list", { name: "Kinds of block" })).getByRole(
    "button",
    { name }
  )
}

describe("BlockBrowser", () => {
  it("opens on the kind Jev drafted, until another is picked", () => {
    const { cards } = renderBrowser("store")
    expect(chip("Store").getAttribute("aria-pressed")).toBe("true")
    expect(cards().some((l) => l.includes("Product grid"))).toBe(true)
    expect(cards().some((l) => l.includes("Pricing"))).toBe(false)

    fireEvent.click(chip("Layout"))
    expect(cards().every((l) => /(Header|Sidebar|Footer) ·/.test(l))).toBe(true)
  })

  it("narrows by search", () => {
    const { cards } = renderBrowser()
    fireEvent.change(screen.getByRole("textbox", { name: "Search blocks" }), {
      target: { value: "newsletter footer" },
    })
    expect(cards()).toEqual([
      expect.stringContaining("Footer · Sitemap footer with newsletter"),
    ])
  })

  it("adds a block to the page, and puts a header in its slot", () => {
    const { onAdd, onToggleLayout } = renderBrowser("store")
    fireEvent.click(
      screen.getAllByRole("button", { name: /^Add to page: Checkout/ })[0]
    )
    expect(onAdd).toHaveBeenCalledWith("checkout-1")

    fireEvent.click(chip("Layout"))
    // top-navigation-1 is in use, so the first header on offer is the second.
    fireEvent.click(
      screen.getAllByRole("button", { name: /^Use as header/ })[0]
    )
    expect(onToggleLayout).toHaveBeenCalledWith("header", "top-navigation-2")
  })

  it("takes the header in use off when its card is clicked", () => {
    const { onToggleLayout } = renderBrowser()
    fireEvent.click(chip("Layout"))
    const inUse = screen.getAllByRole("button", { name: /^Remove / })
    expect(inUse).toHaveLength(2)
    fireEvent.click(screen.getByRole("button", { name: /^Remove header/ }))
    expect(onToggleLayout).toHaveBeenCalledWith("header", "top-navigation-1")
  })
})
