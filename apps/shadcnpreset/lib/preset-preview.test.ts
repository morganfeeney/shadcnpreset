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

  it("carries the view", () => {
    expect(presetBrowsePath("b5aFUJkSzC", "generated")).toBe(
      "/preset/b5aFUJkSzC?view=generated"
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
