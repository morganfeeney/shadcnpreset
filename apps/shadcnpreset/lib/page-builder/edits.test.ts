import { describe, expect, it } from "vitest"

import { applyPageEdit } from "@/lib/page-builder/edits"

const rows = (...blocks: string[]) => blocks.map((block) => ({ block }))
const blocksOf = (page: { items: { block: string }[] }) =>
  page.items.map((item) => item.block)

const page = {
  items: rows("hero-1", "pricing-4", "faqs-1"),
  layout: { header: "top-navigation-1", sidebar: null, footer: "footer-1" },
}

describe("applyPageEdit", () => {
  it("moves a block up or down one place", () => {
    expect(
      blocksOf(
        applyPageEdit(page, {
          action: "move",
          index: 1,
          block: "pricing-4",
          by: -1,
        })
      )
    ).toEqual(["pricing-4", "hero-1", "faqs-1"])
    expect(
      blocksOf(
        applyPageEdit(page, {
          action: "move",
          index: 1,
          block: "pricing-4",
          by: 1,
        })
      )
    ).toEqual(["hero-1", "faqs-1", "pricing-4"])
  })

  it("removes a block, and clears a slot", () => {
    expect(
      blocksOf(
        applyPageEdit(page, { action: "remove", index: 0, block: "hero-1" })
      )
    ).toEqual(["pricing-4", "faqs-1"])
    expect(
      applyPageEdit(page, { action: "clear", slot: "footer" }).layout
    ).toEqual({ header: "top-navigation-1", sidebar: null, footer: null })
  })

  it("removes one block for a double-clicked remove, not the one after it", () => {
    // Both clicks come from the frame's view before the first took effect.
    const click = { action: "remove", index: 1, block: "pricing-4" } as const
    const once = applyPageEdit(page, click)
    const twice = applyPageEdit(once, click)
    expect(blocksOf(twice)).toEqual(["hero-1", "faqs-1"])
    expect(twice).toBe(once)
  })

  it("moves once for a double-clicked move", () => {
    const click = {
      action: "move",
      index: 2,
      block: "faqs-1",
      by: -1,
    } as const
    const once = applyPageEdit(page, click)
    expect(blocksOf(applyPageEdit(once, click))).toEqual([
      "hero-1",
      "faqs-1",
      "pricing-4",
    ])
  })

  it("leaves the page alone for an edit past either end", () => {
    expect(
      applyPageEdit(page, { action: "move", index: 0, block: "hero-1", by: -1 })
    ).toBe(page)
    expect(
      applyPageEdit(page, { action: "move", index: 2, block: "faqs-1", by: 1 })
    ).toBe(page)
    expect(
      applyPageEdit(page, { action: "remove", index: 3, block: "faqs-1" })
    ).toBe(page)
  })
})
