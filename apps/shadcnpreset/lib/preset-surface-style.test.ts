import { describe, expect, it } from "vitest"

import { buildPresetSurfaceStyle } from "@/lib/preset-surface-style"

describe("buildPresetSurfaceStyle", () => {
  it("aliases heading to sans when headingFont is inherit", () => {
    const style = buildPresetSurfaceStyle({
      themeVars: {},
      bodyFont: "inter",
      headingFont: "inherit",
    })
    const rec = style as Record<string, string>
    expect(rec["--font-heading"]).toBe("var(--font-sans)")
    expect(rec["--font-sans"]).toContain("Inter")
  })

  it("resolves a concrete heading font", () => {
    const style = buildPresetSurfaceStyle({
      themeVars: {},
      bodyFont: "inter",
      headingFont: "playfair-display",
    })
    const rec = style as Record<string, string>
    expect(rec["--font-heading"]).toContain("Playfair")
  })
})
