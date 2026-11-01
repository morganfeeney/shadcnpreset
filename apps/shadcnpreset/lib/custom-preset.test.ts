import { describe, expect, it } from "vitest"

import {
  buildCustomPreset,
  customPresetRegistryItem,
  facetValueLabel,
  installablePresetCode,
  withFacet,
} from "@/lib/custom-preset"
import { getThemesForBaseColor } from "@/registry/config"
import { decodePreset } from "shadcn/preset"

const MAGENTA = { theme: "#DE00CE", overrides: {} }

/** Luma, Figtree, Lucide, mist neutrals with a teal accent. */
const CODE = "b5dyaqxe6"

describe("buildCustomPreset", () => {
  it("keeps the preset's style and fonts, with the brand's colours", () => {
    const preset = buildCustomPreset(CODE, MAGENTA)

    expect(preset?.resolved.style).toBe("luma")
    expect(preset?.resolved.font).toBe("figtree")
    expect(preset?.registryTheme.cssVars.light).toMatchObject({
      primary: "#DE00CE",
    })
    expect(preset?.registryTheme.cssVars.dark).toMatchObject({
      primary: "#DE00CE",
    })
  })

  it("writes the colours as root and dark blocks to paste", () => {
    const preset = buildCustomPreset(CODE, MAGENTA)

    expect(preset?.css).toMatch(/^:root \{[\s\S]*--primary: #DE00CE;/)
    expect(preset?.css).toMatch(/\.dark \{[\s\S]*--primary: #DE00CE;/)
  })

  it("gives nothing for a code that is not a preset", () => {
    expect(buildCustomPreset("not-a-code", MAGENTA)).toBe(null)
  })
})

describe("customPresetRegistryItem", () => {
  it("is a shadcn theme item carrying the exact colours", () => {
    const preset = buildCustomPreset(CODE, MAGENTA)!
    const item = customPresetRegistryItem("abc", preset)

    expect(item.type).toBe("registry:theme")
    expect(item.name).toBe("custom-preset-abc")
    expect(item.cssVars.light.primary).toBe("#DE00CE")
    expect(item.cssVars.dark.primary).toBe("#DE00CE")
  })

  it("leaves the radius to the preset it installs on", () => {
    const item = customPresetRegistryItem(
      "abc",
      buildCustomPreset(CODE, MAGENTA)!
    )

    expect(item.cssVars.light).not.toHaveProperty("radius")
    expect(item.cssVars.dark).not.toHaveProperty("radius")
  })
})

describe("withFacet", () => {
  it("changes one facet and keeps the rest", () => {
    const next = withFacet(CODE, "style", "nova")
    const preset = next ? buildCustomPreset(next, MAGENTA) : null

    expect(preset?.resolved.style).toBe("nova")
    expect(preset?.resolved.font).toBe("figtree")
    expect(preset?.registryTheme.cssVars.light).toMatchObject({
      primary: "#DE00CE",
    })
  })

  it("gives nothing for a value the facet does not have", () => {
    expect(withFacet(CODE, "style", "not-a-style")).toBe(null)
  })
})

describe("facetValueLabel", () => {
  it("names fonts by their title and inherit plainly", () => {
    expect(facetValueLabel("font", "dm-sans")).toBe("DM Sans")
    expect(facetValueLabel("fontHeading", "inherit")).toBe("Same as font")
    expect(facetValueLabel("style", "luma")).toBe("Luma")
  })
})

/** shadcn's own rule: what its install accepts as a theme or chart colour. */
function acceptedByShadcn(code: string) {
  const config = decodePreset(code)!
  const allowed = getThemesForBaseColor(config.baseColor).map((t) => t.name)
  return (
    allowed.includes(config.theme) &&
    (!config.chartColor || allowed.includes(config.chartColor))
  )
}

describe("installable codes", () => {
  it("brings a neutral theme and chart colour along when the base changes", () => {
    for (const base of ["zinc", "stone", "mauve", "olive", "mist", "taupe"]) {
      const next = withFacet("b0", "baseColor", base)!
      const config = decodePreset(next)!
      expect(config.chartColor).toBe(base)
      expect(acceptedByShadcn(next)).toBe(true)
    }
  })

  it("keeps a coloured theme when the base changes", () => {
    const yellow = withFacet("b0", "theme", "yellow")!
    const next = withFacet(yellow, "baseColor", "zinc")!
    expect(decodePreset(next)!.theme).toBe("yellow")
    expect(acceptedByShadcn(next)).toBe(true)
  })

  it("mends a code saved before the rule, the one shadcn refused", () => {
    expect(acceptedByShadcn("bg0dFY")).toBe(false)
    expect(acceptedByShadcn(installablePresetCode("bg0dFY"))).toBe(true)
    expect(decodePreset(installablePresetCode("bg0dFY"))!.theme).toBe("yellow")
  })
})
