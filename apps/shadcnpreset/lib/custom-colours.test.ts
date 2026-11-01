import { converter, displayable, parse, wcagContrast } from "culori"
import { describe, expect, it } from "vitest"

import { readBrandColours } from "@/lib/brand-theme"
import {
  buildCustomTheme,
  customColoursFrom,
  NO_CUSTOM_COLOURS,
  readStoredColours,
  type CustomColours,
} from "@/lib/custom-colours"
import { withFacet } from "@/lib/custom-preset"
import { resolvePresetFromCode } from "@/lib/preset"
import { getPresetThemeCssBundle } from "@/lib/preset-theme-css"

const toOklch = converter("oklch")
const hue = (colour: string) => toOklch(parse(colour)!)?.h ?? 0
const chroma = (colour: string) => toOklch(parse(colour)!)?.c ?? 0
const lightness = (colour: string) => toOklch(parse(colour)!)?.l ?? 0
const ratio = (a: string, b: string) => wcagContrast(parse(a)!, parse(b)!)

/** Nova, neutral base and theme, default radius. */
const CODE = "b0"

function build(custom: Partial<CustomColours>, code = CODE) {
  const resolved = resolvePresetFromCode(code)!
  const bundle = getPresetThemeCssBundle(code)!
  return buildCustomTheme(
    {
      ...resolved,
      radius: (bundle.registryTheme.cssVars.light as Record<string, string>)
        .radius,
    },
    { ...NO_CUSTOM_COLOURS, ...custom }
  )
}

describe("buildCustomTheme", () => {
  it("is the preset's own shadcn theme when nothing is custom", () => {
    for (const code of [
      CODE,
      withFacet(CODE, "theme", "blue")!,
      withFacet(withFacet(CODE, "baseColor", "mauve")!, "chartColor", "rose")!,
    ]) {
      const own = getPresetThemeCssBundle(code)!.registryTheme.cssVars
      const theme = build({}, code)
      expect(theme.light).toEqual(own.light)
      expect(theme.dark).toEqual(own.dark)
    }
  })

  describe("a custom theme colour", () => {
    it("is the primary exactly, in both modes", () => {
      const theme = build({ theme: "#DE00CE" })
      expect(theme.light.primary).toBe("#DE00CE")
      expect(theme.dark.primary).toBe("#DE00CE")
    })

    it("spreads its hue the way a shadcn theme does", () => {
      const theme = build({ theme: "#DE00CE" })
      // Charts are Chart Color's to set, as in shadcn create.
      expect(theme.light["chart-1"]).toBe(build({}).light["chart-1"])
      for (const token of ["sidebar-primary"]) {
        expect(Math.abs(hue(theme.light[token]) - hue("#DE00CE"))).toBeLessThan(
          2
        )
      }
    })

    it("puts readable text on itself", () => {
      for (const colour of ["#DE00CE", "#FFE14D", "#0B1F3A"]) {
        const theme = build({ theme: colour })
        expect(
          ratio(theme.light["primary-foreground"], theme.light.primary)
        ).toBeGreaterThanOrEqual(4.5)
      }
    })

    it("is lightened in dark mode only when too faint there, and says so", () => {
      const theme = build({ theme: "#0B1F3A" })
      expect(theme.light.primary).toBe("#0B1F3A")
      expect(
        ratio(theme.dark.primary, theme.dark.background)
      ).toBeGreaterThanOrEqual(3)
      expect(theme.adjustments).toHaveLength(1)
    })
  })

  describe("a custom base colour", () => {
    it("tints every neutral with its hue, lightness kept", () => {
      const plain = build({})
      const theme = build({ baseColor: "#2F6F5E" })

      for (const token of ["muted-foreground", "border", "foreground"]) {
        expect(lightness(theme.light[token])).toBeCloseTo(
          lightness(plain.light[token]),
          2
        )
        expect(Math.abs(hue(theme.light[token]) - hue("#2F6F5E"))).toBeLessThan(
          2
        )
        expect(chroma(theme.light[token])).toBeLessThanOrEqual(0.045)
      }
      expect(theme.light.background).toBe("oklch(1 0 0)")
    })

    it("takes the neutral primary with it when the theme is the base's own", () => {
      const theme = build({ baseColor: "#2F6F5E" })
      expect(chroma(theme.light.primary)).toBeGreaterThan(0)
    })

    it("takes neutral charts with it too, whatever the theme", () => {
      for (const theme of [undefined, "#DE00CE"]) {
        const built = build({ baseColor: "#2F6F5E", theme })
        expect(
          Math.abs(hue(built.light["chart-3"]) - hue("#2F6F5E"))
        ).toBeLessThan(2)
      }
    })

    it("leaves a coloured theme's primary alone", () => {
      const code = withFacet(CODE, "theme", "blue")!
      expect(build({ baseColor: "#2F6F5E" }, code).light.primary).toBe(
        build({}, code).light.primary
      )
    })
  })

  describe("a custom chart colour", () => {
    it("gives five shades in its hue, itself among them, all displayable", () => {
      const theme = build({ chartColor: "#E65A28" })
      const charts = [1, 2, 3, 4, 5].map((i) => theme.light[`chart-${i}`])

      expect(charts).toContain("#E65A28")
      for (const colour of charts) {
        expect(displayable(parse(colour)!)).toBe(true)
        expect(Math.abs(hue(colour) - hue("#E65A28"))).toBeLessThan(2)
      }
    })
  })

  describe("overrides", () => {
    it("set the exact colour over whatever the pickers gave", () => {
      const theme = build({
        theme: "#DE00CE",
        overrides: { primary: "#123456" },
      })
      expect(theme.light.primary).toBe("#123456")
      expect(theme.light.ring).toBe("#123456")
    })

    it("put a dark background in dark mode only", () => {
      const theme = build({ overrides: { background: "#141414" } })
      expect(theme.dark.background).toBe("#141414")
      expect(theme.light.background).toBe(build({}).light.background)
    })

    it("flag text that reads poorly, and keep it", () => {
      const theme = build({ overrides: { foreground: "#DDDDDD" } })
      expect(theme.dark.foreground).toBe("#DDDDDD")
      const flagged = build({
        overrides: { muted: "#CCCCCC", "muted-foreground": "#BBBBBB" },
      })
      expect(flagged.light["muted-foreground"]).toBe("#BBBBBB")
      expect(flagged.lowContrast.length).toBeGreaterThan(0)
    })
  })
})

describe("customColoursFrom", () => {
  it("makes the main colour the theme and a second the chart colour", () => {
    expect(customColoursFrom(readBrandColours("#DE00CE and #254467"))).toEqual({
      theme: "#DE00CE",
      chartColor: "#254467",
      overrides: {},
    })
  })

  it("keeps colours named for a token as overrides", () => {
    expect(
      customColoursFrom(readBrandColours("Primary #D1CFC0, Background #141414"))
    ).toEqual({
      theme: "#D1CFC0",
      chartColor: undefined,
      overrides: { background: "#141414" },
    })
  })
})

describe("readStoredColours", () => {
  it("reads colours saved in the first, list-shaped format", () => {
    expect(
      readStoredColours(JSON.stringify([{ colour: "#DE00CE", token: null }]))
    ).toMatchObject({ theme: "#DE00CE", overrides: {} })
  })
})
