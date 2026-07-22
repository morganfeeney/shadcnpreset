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

  it("normalizes incompatible decoded theme combinations", () => {
    const code = encodePreset({
      baseColor: "gray",
      theme: "violet",
    })
    const bundle = getPresetThemeCssBundle(code)

    expect(bundle).not.toBeNull()
    expect(bundle?.resolved.baseColor).toBe("neutral")
    expect(bundle?.resolved.theme).toBe("violet")
    expect(bundle?.resolved.effectiveChartColor).toBe("neutral")
  })

  it("resolves the crashing preset code with normalized fallback values", () => {
    const bundle = getPresetThemeCssBundle("b5aFVCFRxi")

    expect(bundle).not.toBeNull()
    expect(bundle?.resolved.code).toBe("b5aFVCFRxi")
    expect(bundle?.resolved.baseColor).toBe("neutral")
    expect(bundle?.resolved.theme).toBe("green")
    expect(bundle?.resolved.effectiveChartColor).toBe("neutral")
    expect(bundle?.resolved.menuAccent).toBe("subtle")
    expect(bundle?.combinedCss).toContain(":root {")
    expect(bundle?.combinedCss).toContain(".dark {")
  })
})
