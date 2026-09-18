import { describe, expect, it } from "vitest"

import { isLearnArticleVisible, showLearnDrafts } from "@/lib/learn-visibility"

describe("showLearnDrafts", () => {
  it("shows drafts during local development", () => {
    expect(showLearnDrafts({ NODE_ENV: "development" })).toBe(true)
  })

  it("hides drafts in production by default", () => {
    expect(showLearnDrafts({ NODE_ENV: "production" })).toBe(false)
  })

  it("can force drafts on a production build", () => {
    expect(
      showLearnDrafts({ NODE_ENV: "production", SHOW_LEARN_DRAFTS: "true" })
    ).toBe(true)
  })

  it("can hide drafts in development", () => {
    expect(
      showLearnDrafts({ NODE_ENV: "development", SHOW_LEARN_DRAFTS: "0" })
    ).toBe(false)
  })
})

describe("isLearnArticleVisible", () => {
  it("always shows published articles", () => {
    expect(
      isLearnArticleVisible("published", { NODE_ENV: "production" })
    ).toBe(true)
  })

  it("hides drafts when the flag is off", () => {
    expect(isLearnArticleVisible("draft", { NODE_ENV: "production" })).toBe(
      false
    )
  })
})
