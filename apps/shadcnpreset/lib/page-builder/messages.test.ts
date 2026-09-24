import { describe, expect, it } from "vitest"

import { knownLayout } from "@/lib/page-builder/blocks"
import {
  PAGE_BUILDER_EDIT_MESSAGE_TYPE,
  builtPageSrc,
  pageBuilderBlocksMessage,
  pageBuilderEditMessage,
  readBuiltPageSpec,
  readPageBuilderBlocksMessage,
  readPageBuilderEditMessage,
} from "@/lib/page-builder/messages"

describe("knownLayout", () => {
  it("keeps a block only in a slot it can fill", () => {
    expect(
      knownLayout({
        header: "app-shell-header-2",
        sidebar: "footer-1",
        footer: "footer-9",
      })
    ).toEqual({ header: "app-shell-header-2", sidebar: null, footer: null })
  })
})

describe("the frame's spec", () => {
  const spec = {
    blocks: ["hero-2", "win-rate-1", "faqs-1", "faqs-1"],
    layout: {
      header: "top-navigation-5",
      sidebar: "app-shell-2",
      footer: null,
    },
  }

  it("survives the frame's URL", () => {
    const url = new URL(builtPageSrc("b0", spec), "http://localhost")
    expect(url.pathname).toBe("/preset-preview/builder")
    expect(url.searchParams.get("preset")).toBe("b0")
    expect(readBuiltPageSpec(Object.fromEntries(url.searchParams))).toEqual(
      spec
    )
  })

  it("survives a message", () => {
    expect(
      readPageBuilderBlocksMessage(pageBuilderBlocksMessage(spec))
    ).toEqual(spec)
  })

  it("drops what it cannot render", () => {
    expect(
      readBuiltPageSpec({
        blocks: "hero-2,footer-1,nope",
        header: "hero-2",
      })
    ).toEqual({
      // Any kind's blocks can share a page, but a footer is a slot.
      blocks: ["hero-2"],
      layout: { header: null, sidebar: null, footer: null },
    })
    expect(
      readPageBuilderBlocksMessage({ type: "other", blocks: ["hero-2"] })
    ).toBeNull()
  })
})

describe("edit messages", () => {
  it("carry the edits the frame's toolbars make", () => {
    for (const edit of [
      { action: "move", index: 2, block: "faqs-1", by: -1 },
      { action: "remove", index: 0, block: "hero-2" },
      { action: "clear", slot: "header" },
    ] as const) {
      expect(readPageBuilderEditMessage(pageBuilderEditMessage(edit))).toEqual(
        edit
      )
    }
  })

  it("refuse anything malformed", () => {
    const type = PAGE_BUILDER_EDIT_MESSAGE_TYPE
    expect(
      readPageBuilderEditMessage({
        type,
        action: "move",
        index: 1,
        block: "faqs-1",
        by: 3,
      })
    ).toBeNull()
    expect(
      readPageBuilderEditMessage({
        type,
        action: "remove",
        index: "1",
        block: "faqs-1",
      })
    ).toBeNull()
    // A move or removal that does not say which block it means.
    expect(
      readPageBuilderEditMessage({ type, action: "remove", index: 1 })
    ).toBeNull()
    expect(
      readPageBuilderEditMessage({ type, action: "clear", slot: "hero" })
    ).toBeNull()
    expect(
      readPageBuilderEditMessage({ type: "other", action: "remove", index: 0 })
    ).toBeNull()
  })
})
