import { describe, expect, it } from "vitest"

import { applyPageEdit } from "@/lib/page-builder/edits"

const page = {
  items: ["hero", "pricing", "faqs"],
  layout: { header: "top-navigation-1", sidebar: null, footer: "footer-1" },
}

describe("applyPageEdit", () => {
  it("moves a block up or down one place", () => {
    expect(
      applyPageEdit(page, { action: "move", index: 1, by: -1 }).items
    ).toEqual(["pricing", "hero", "faqs"])
    expect(
      applyPageEdit(page, { action: "move", index: 1, by: 1 }).items
    ).toEqual(["hero", "faqs", "pricing"])
  })

  it("removes a block, and clears a slot", () => {
    expect(applyPageEdit(page, { action: "remove", index: 0 }).items).toEqual([
      "pricing",
      "faqs",
    ])
    expect(
      applyPageEdit(page, { action: "clear", slot: "footer" }).layout
    ).toEqual({ header: "top-navigation-1", sidebar: null, footer: null })
  })

  it("leaves the page alone for an edit that no longer fits it", () => {
    // Off either end, or a stale index from a message that crossed an edit.
    expect(applyPageEdit(page, { action: "move", index: 0, by: -1 })).toBe(page)
    expect(applyPageEdit(page, { action: "move", index: 2, by: 1 })).toBe(page)
    expect(applyPageEdit(page, { action: "remove", index: 3 })).toBe(page)
  })
})
