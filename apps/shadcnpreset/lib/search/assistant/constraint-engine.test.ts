import { describe, expect, it } from "vitest"
import type { PresetConfig } from "shadcn/preset"

import {
  applyStyleDirective,
  applyExplicitFacetConstraints,
  applyPaletteConstraints,
  applyStagePreservation,
  detectRequestedFacetChanges,
  extractStyleDirective,
  extractExplicitFacetConstraints,
  extractPaletteConstraints,
  extractTypographyConstraints,
} from "@/lib/search/assistant/constraint-engine"

const PREV: PresetConfig = {
  style: "nova",
  baseColor: "neutral",
  theme: "blue",
  chartColor: "blue",
  iconLibrary: "lucide",
  font: "inter",
  fontHeading: "inter",
  radius: "default",
  menuAccent: "subtle",
  menuColor: "default",
}

const NEXT: PresetConfig = {
  ...PREV,
  font: "lora",
  fontHeading: "lora",
}

describe("detectRequestedFacetChanges", () => {
  it("marks heading-only typography changes", () => {
    const changes = detectRequestedFacetChanges("make the headings serif")
    expect(changes.typographyHeading).toBe(true)
    expect(changes.typographyBody).toBe(false)
  })

  it("marks body-only typography changes", () => {
    const changes = detectRequestedFacetChanges("make body sans")
    expect(changes.typographyHeading).toBe(false)
    expect(changes.typographyBody).toBe(true)
  })

  it("marks sans headings shorthand as heading-only", () => {
    const changes = detectRequestedFacetChanges("sans headings")
    expect(changes.typographyHeading).toBe(true)
    expect(changes.typographyBody).toBe(false)
  })
})

describe("applyStagePreservation", () => {
  it("preserves body font for heading-only tweaks", () => {
    const changes = detectRequestedFacetChanges("make the headings serif")
    const merged = applyStagePreservation(NEXT, PREV, changes)
    expect(merged.fontHeading).toBe("lora")
    expect(merged.font).toBe("inter")
  })
})

describe("palette/explicit precedence", () => {
  it("allows monochrome to override previously explicit chart color", () => {
    const messages = [
      { role: "user" as const, content: "green charts" },
      { role: "user" as const, content: "keep monochrome and sans headings" },
    ]
    const palette = extractPaletteConstraints(messages)
    const typography = extractTypographyConstraints(messages)
    const explicit = applyExplicitFacetConstraints(PREV, { chartColor: "green" })
    const final = applyPaletteConstraints(explicit, palette)

    expect(final.chartColor).toBe(final.theme)
    expect(typography.headingFamily).toBe("sans")
  })

  it("parses chart-scoped color in mixed requests", () => {
    const explicit = extractExplicitFacetConstraints([
      { role: "user", content: "indigo theme amber charts" },
    ])
    expect(explicit.chartColor).toBe("amber")
  })

  it("parses explicit taupe lock for charts, base and theme", () => {
    const explicit = extractExplicitFacetConstraints([
      { role: "user", content: "i want taupe charts, base and theme" },
    ])
    expect(explicit.baseColor).toBe("taupe")
    expect(explicit.theme).toBe("taupe")
    expect(explicit.chartColor).toBe("taupe")
  })

  it("locks base/theme/chart to one value for monochrome", () => {
    const mono = applyPaletteConstraints(
      {
        ...PREV,
        baseColor: "stone",
        theme: "taupe",
        chartColor: "emerald",
      },
      { wantsMonochrome: true }
    )

    expect(mono.baseColor).toBe("taupe")
    expect(mono.theme).toBe("taupe")
    expect(mono.chartColor).toBe("taupe")
  })
})

describe("style directives", () => {
  it("parses only-one style directive", () => {
    const d = extractStyleDirective([
      { role: "user", content: "only one in Luma" },
    ])
    expect(d).toEqual({ mode: "onlyOne", style: "luma" })
  })

  it("parses 'make one <style>' as atLeastOne", () => {
    const d = extractStyleDirective([
      { role: "user", content: "now make one lyra" },
    ])
    expect(d).toEqual({ mode: "atLeastOne", style: "lyra" })
  })

  it("keeps non-target variants non-Luma for only-one directive", () => {
    const d = { mode: "onlyOne", style: "luma" } as const
    const first = applyStyleDirective(PREV, 0, PREV, d)
    const second = applyStyleDirective({ ...PREV, style: "luma" }, 1, PREV, d)
    expect(first.style).toBe("luma")
    expect(second.style).toBe("nova")
  })
})

