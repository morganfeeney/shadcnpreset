import { describe, expect, it } from "vitest"
import type { PresetConfig } from "shadcn/preset"

import {
  applyExplicitFacetConstraints,
  applyPaletteConstraints,
  applyStagePreservation,
  detectRequestedFacetChanges,
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
})

