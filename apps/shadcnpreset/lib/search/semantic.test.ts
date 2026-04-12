import { describe, expect, it } from "vitest"

import { queryTextForEmbedding } from "@/lib/search/semantic"

describe("queryTextForEmbedding", () => {
  it("adds dark + data intents for typical dashboard query", () => {
    const t = queryTextForEmbedding("dark fintech dashboard with charts")
    expect(t).toContain("Intent:")
    expect(t).toContain("dark mode")
    expect(t).toContain("charts")
  })

  it("returns trimmed query only when no axis matches", () => {
    const t = queryTextForEmbedding("pink")
    expect(t).toBe("pink")
  })
})
