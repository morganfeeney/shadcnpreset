import { describe, expect, it } from "vitest"

import {
  GENERATED_PREVIEW_VIEW,
  PRESET_PREVIEW_VIEWS,
  presetBrowsePath,
} from "@/lib/preset-preview"

describe("presetBrowsePath", () => {
  it("omits params that are already the default", () => {
    expect(presetBrowsePath("b5aFUJkSzC")).toBe("/preset/b5aFUJkSzC")
  })

  it("carries view and tab", () => {
    expect(presetBrowsePath("b5aFUJkSzC", "generated", "ask-ai")).toBe(
      "/preset/b5aFUJkSzC?view=generated&tab=ask-ai"
    )
  })

  it("carries a chat so a linked conversation opens in the sidebar", () => {
    expect(
      presetBrowsePath("b5aFUJkSzC", "generated", "ask-ai", "abc-123")
    ).toBe("/preset/b5aFUJkSzC?view=generated&tab=ask-ai&chat=abc-123")
  })

  it("ignores an empty chat id", () => {
    expect(presetBrowsePath("b5aFUJkSzC", "preview", "community", "")).toBe(
      "/preset/b5aFUJkSzC"
    )
  })
})

describe("preview credits", () => {
  it("credits only the views built from shadcncraft blocks, each with its own placement", () => {
    const credited = PRESET_PREVIEW_VIEWS.filter((view) => view.credit).map(
      (view) => [view.page, view.credit?.source]
    )
    expect(credited).toEqual([
      ["marketing", "marketing-preview"],
      ["application", "application-preview"],
      ["store", "store-preview"],
      ["chat", "chat-preview"],
    ])
    expect(GENERATED_PREVIEW_VIEW.credit).toBeUndefined()
  })
})
