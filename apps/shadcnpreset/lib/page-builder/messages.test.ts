import { describe, expect, it } from "vitest"

import { defaultLayout, knownLayout } from "@/lib/page-builder/blocks"
import {
  builtPageSrc,
  pageBuilderBlocksMessage,
  readBuiltPageSpec,
  readPageBuilderBlocksMessage,
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

describe("defaultLayout", () => {
  it("frames each kind the way Jev would, with first variants", () => {
    expect(defaultLayout("marketing")).toEqual({
      header: "top-navigation-1",
      sidebar: null,
      footer: "footer-1",
    })
    expect(defaultLayout("dashboard")).toEqual({
      header: "app-shell-header-1",
      sidebar: "app-shell-1",
      footer: null,
    })
  })
})

describe("the frame's spec", () => {
  const spec = {
    kind: "marketing" as const,
    blocks: ["hero-2", "faqs-1", "faqs-1"],
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
        kind: "store",
        blocks: "hero-2,product-list-3,nope",
        header: "hero-2",
      })
    ).toEqual({
      kind: "store",
      blocks: ["product-list-3"],
      layout: { header: null, sidebar: null, footer: null },
    })
    expect(readBuiltPageSpec({ kind: "blog" })).toBeNull()
    expect(
      readPageBuilderBlocksMessage({ type: "other", kind: "store" })
    ).toBeNull()
  })
})
