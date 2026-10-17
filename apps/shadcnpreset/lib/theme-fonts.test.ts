import { describe, expect, it } from "vitest"
import { encodePreset } from "shadcn/preset"

import { resolvePresetFromCode } from "@/lib/preset"
import { getPresetThemeCssBundle } from "@/lib/preset-theme-css"
import {
  parseThemeFontsParam,
  suggestedFontPairings,
  themeCodeWithFonts,
  themeFontsParam,
  toFontPairings,
  type CommunityFontPairing,
} from "@/lib/theme-fonts"

const blueOnZinc = {
  baseColor: "zinc",
  theme: "blue",
  chartColor: "blue",
} as const

function pairing(
  heading: CommunityFontPairing["heading"],
  body: CommunityFontPairing["body"],
  presets: number,
  themeSlugs: string[] = []
): CommunityFontPairing {
  return { heading, body, presets, themeSlugs }
}

describe("toFontPairings", () => {
  it("counts each heading and body pair, most used first", () => {
    const codes = [
      encodePreset({ ...blueOnZinc, font: "geist", fontHeading: "inherit" }),
      encodePreset({ ...blueOnZinc, font: "inter", fontHeading: "manrope" }),
      encodePreset({
        baseColor: "zinc",
        theme: "rose",
        chartColor: "rose",
        font: "inter",
        fontHeading: "manrope",
      }),
    ]

    expect(toFontPairings(codes)).toEqual([
      pairing("manrope", "inter", 2, ["blue-on-zinc", "rose-on-zinc"]),
      pairing("geist", "geist", 1, ["blue-on-zinc"]),
    ])
  })

  it("reads an inherited heading as the body font", () => {
    const code = encodePreset({
      ...blueOnZinc,
      font: "figtree",
      fontHeading: "inherit",
    })
    expect(toFontPairings([code])[0]).toMatchObject({
      heading: "figtree",
      body: "figtree",
    })
  })
})

describe("suggestedFontPairings", () => {
  const pairings = [
    pairing("inter", "inter", 14),
    pairing("figtree", "figtree", 7),
    pairing("merriweather", "instrument-sans", 1, ["lime-on-mist"]),
    pairing("roboto", "roboto", 6),
    pairing("manrope", "geist", 2),
  ]

  it("puts pairings used with the theme first and leaves out the default", () => {
    expect(
      suggestedFontPairings(pairings, "lime-on-mist").map((p) => p.heading)
    ).toEqual(["merriweather", "manrope", "figtree", "roboto"])
  })

  it("offers true pairs before single fonts", () => {
    expect(
      suggestedFontPairings(pairings, "teal-on-mist").map((p) => p.heading)
    ).toEqual(["merriweather", "manrope", "figtree", "roboto"])
  })

  it("keeps to the limit", () => {
    expect(suggestedFontPairings(pairings, "lime-on-mist", 2)).toHaveLength(2)
  })
})

describe("themeCodeWithFonts", () => {
  const theme = encodePreset({
    ...blueOnZinc,
    chartColor: "emerald",
    radius: "large",
  })

  it("sets the fonts and keeps the colors", () => {
    const code = themeCodeWithFonts(theme, {
      heading: "merriweather",
      body: "instrument-sans",
    })

    expect(resolvePresetFromCode(code)).toMatchObject({
      font: "instrument-sans",
      fontHeading: "merriweather",
    })
    expect(getPresetThemeCssBundle(code)!.themeOnlyCss).toBe(
      getPresetThemeCssBundle(theme)!.themeOnlyCss
    )
  })

  it("inherits the heading when both fonts match", () => {
    const code = themeCodeWithFonts(theme, { heading: "geist", body: "geist" })
    expect(resolvePresetFromCode(code)?.fontHeading).toBe("inherit")
  })
})

describe("theme fonts param", () => {
  it("round-trips a pairing and a single font", () => {
    for (const fonts of [
      { heading: "merriweather", body: "instrument-sans" },
      { heading: "geist", body: "geist" },
    ] as const) {
      expect(parseThemeFontsParam(themeFontsParam(fonts))).toEqual(fonts)
    }
  })

  it("rejects unknown fonts and extra parts", () => {
    expect(parseThemeFontsParam("comic-sans")).toBeNull()
    expect(parseThemeFontsParam("inter,comic-sans")).toBeNull()
    expect(parseThemeFontsParam("inter,geist,roboto")).toBeNull()
    expect(parseThemeFontsParam("")).toBeNull()
  })
})
