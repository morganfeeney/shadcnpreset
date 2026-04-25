import { describe, expect, it } from "vitest"
import { decodePreset } from "shadcn/preset"

import { generateRandomCompatiblePreset } from "@/lib/random-preset"

const BASE_COLOR_NAMES = new Set([
  "neutral",
  "stone",
  "zinc",
  "gray",
  "mauve",
  "olive",
  "mist",
  "taupe",
])

describe("generateRandomCompatiblePreset", () => {
  it("generates presets whose theme choices are compatible with the base color", () => {
    for (let i = 0; i < 100; i++) {
      const decoded = decodePreset(generateRandomCompatiblePreset())

      expect(decoded).not.toBeNull()
      expect(
        decoded!.theme === decoded!.baseColor ||
          !BASE_COLOR_NAMES.has(decoded!.theme)
      ).toBe(true)
      expect(
        decoded!.chartColor === decoded!.baseColor ||
          !BASE_COLOR_NAMES.has(decoded!.chartColor!)
      ).toBe(true)
    }
  })

  it("never combines bold accents with translucent menu colors", () => {
    for (let i = 0; i < 100; i++) {
      const decoded = decodePreset(generateRandomCompatiblePreset())

      expect(decoded).not.toBeNull()
      expect(
        decoded!.menuAccent === "bold" &&
          (decoded!.menuColor === "default-translucent" ||
            decoded!.menuColor === "inverted-translucent")
      ).toBe(false)
    }
  })
})
