import { describe, expect, it } from "vitest"

import { parsePresetCodeFromPathname } from "@/lib/preset-route"

describe("parsePresetCodeFromPathname", () => {
  it("returns null for non-preset paths", () => {
    expect(parsePresetCodeFromPathname("/")).toBeNull()
    expect(parsePresetCodeFromPathname("/search/foo")).toBeNull()
  })

  it("returns the code segment", () => {
    expect(parsePresetCodeFromPathname("/preset/bw4UuDRY")).toBe("bw4UuDRY")
  })

  it("decodes URI-encoded segments", () => {
    expect(parsePresetCodeFromPathname("/preset/foo%2Fbar")).toBe("foo/bar")
  })
})
