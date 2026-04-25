import { describe, expect, it } from "vitest"
import { encodePreset } from "shadcn/preset"

import { getPresetThemeCssBundle } from "@/lib/preset-theme-css"

describe("getPresetThemeCssBundle", () => {
  it("formats theme css for a valid preset code", () => {
    const bundle = getPresetThemeCssBundle("bw4UuDRY")

    expect(bundle).not.toBeNull()
    expect(bundle?.resolved.code).toBe("bw4UuDRY")
    expect(bundle?.lightCss).toContain(":root {")
    expect(bundle?.lightCss).toContain("--font-sans:")
    expect(bundle?.combinedCss).toContain(".dark {")
    expect(bundle?.combinedCss).toContain("--background:")
  })

  it("returns null for invalid codes", () => {
    expect(getPresetThemeCssBundle("not-a-preset")).toBeNull()
  })

  it("returns null for incompatible decoded theme combinations", () => {
    const code = encodePreset({
      baseColor: "gray",
      theme: "violet",
    })

    expect(getPresetThemeCssBundle(code)).toBeNull()
  })
})
