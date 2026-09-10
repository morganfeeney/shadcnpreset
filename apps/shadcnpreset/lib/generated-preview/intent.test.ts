import { describe, expect, it } from "vitest"

import { looksLikePreviewRequest } from "@/lib/generated-preview/intent"

describe("looksLikePreviewRequest", () => {
  it("detects show-component prompts", () => {
    expect(
      looksLikePreviewRequest("show a date picker with this preset applied")
    ).toBe(true)
  })

  it("detects render/display phrasings", () => {
    expect(looksLikePreviewRequest("render a login form")).toBe(true)
    expect(looksLikePreviewRequest("Display the DASHBOARD block")).toBe(true)
  })

  it("ignores preset-only prompts", () => {
    expect(looksLikePreviewRequest("make it more professional")).toBe(false)
    expect(looksLikePreviewRequest("show me something warmer")).toBe(false)
  })
})
