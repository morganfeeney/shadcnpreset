import { describe, expect, it } from "vitest"

import { extractNamedPresetCode } from "@/lib/search/assistant/named-preset"

describe("extractNamedPresetCode", () => {
  it("reads a preset named in the request", () => {
    expect(
      extractNamedPresetCode(
        "show a set of buttons in every variant and size with preset b0"
      )
    ).toBe("b0")
  })

  it("does not mistake ordinary words for codes", () => {
    // All of these satisfy isPresetCode on their own.
    expect(
      extractNamedPresetCode("show me blue buttons and a bold banana")
    ).toBeNull()
  })

  it("requires the word preset immediately before the code", () => {
    expect(extractNamedPresetCode("show buttons b0")).toBeNull()
  })

  it("takes the last preset named", () => {
    expect(
      extractNamedPresetCode("preset b0 — actually use preset b5aFUJkSzC")
    ).toBe("b5aFUJkSzC")
  })

  it("ignores a token that does not decode", () => {
    expect(extractNamedPresetCode("use preset ???")).toBeNull()
  })
})
