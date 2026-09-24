import { describe, expect, it } from "vitest"
import { DEFAULT_PRESET_CONFIG, encodePreset } from "shadcn/preset"

import { readSavedPage, savedPageQuery } from "@/lib/page-builder/saved-page"

const PRESET = encodePreset(DEFAULT_PRESET_CONFIG)
const spec = {
  blocks: ["hero-2", "pricing-4", "faqs-1", "faqs-1"],
  layout: { header: "top-navigation-1", sidebar: null, footer: "footer-2" },
}

/** The query string as the builder's page would receive it. */
const received = (query: string) =>
  Object.fromEntries(new URLSearchParams(query))

describe("the builder's saved page", () => {
  it("comes back from its URL as it was", () => {
    expect(readSavedPage(received(savedPageQuery(spec, PRESET)))).toEqual({
      spec,
      preset: PRESET,
    })
  })

  it("keeps an empty slot empty, rather than falling back to a default", () => {
    const bare = {
      ...spec,
      layout: { header: null, sidebar: null, footer: null },
    }
    expect(readSavedPage(received(savedPageQuery(bare, PRESET)))?.spec).toEqual(
      bare
    )
  })

  it("leaves an empty page out of the URL", () => {
    const empty = {
      blocks: [],
      layout: { header: null, sidebar: null, footer: null },
    }
    expect(savedPageQuery(empty, PRESET)).toBe("")
    expect(readSavedPage({})).toBeNull()
    expect(readSavedPage({ blocks: "" })).toBeNull()
  })

  it("keeps a page that is only a header", () => {
    const headerOnly = {
      blocks: [],
      layout: { header: "top-navigation-2", sidebar: null, footer: null },
    }
    expect(
      readSavedPage(received(savedPageQuery(headerOnly, PRESET)))?.spec
    ).toEqual(headerOnly)
  })

  it("drops what it cannot use from a hand-edited link", () => {
    expect(
      readSavedPage({
        blocks: "hero-2,nope",
        header: "footer-1",
        preset: "not-a-preset",
      })
    ).toEqual({
      spec: {
        blocks: ["hero-2"],
        layout: { header: null, sidebar: null, footer: null },
      },
      preset: null,
    })
  })
})
