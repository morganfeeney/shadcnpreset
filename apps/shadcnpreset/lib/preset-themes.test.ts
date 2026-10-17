import { describe, expect, it } from "vitest"
import { encodePreset } from "shadcn/preset"

import {
  presetThemeCommand,
  presetThemeFromSlug,
  toPresetThemes,
} from "@/lib/preset-themes"

const blueOnZinc = { baseColor: "zinc", theme: "blue" } as const

describe("toPresetThemes", () => {
  it("keeps one theme per color layer, represented by the first preset", () => {
    const nova = encodePreset({ ...blueOnZinc, style: "nova", font: "inter" })
    const maia = encodePreset({ ...blueOnZinc, style: "maia", font: "geist" })
    const rose = encodePreset({ baseColor: "zinc", theme: "rose" })

    const themes = toPresetThemes([nova, maia, rose])

    expect(themes.map((theme) => theme.code)).toEqual([nova, rose])
    expect(themes[0]!.source).toMatchObject({ code: nova, style: "Nova" })
  })

  it("treats radii with the same css as one theme", () => {
    const fallback = encodePreset({ ...blueOnZinc, radius: "default" })
    const medium = encodePreset({ ...blueOnZinc, radius: "medium" })
    const large = encodePreset({ ...blueOnZinc, radius: "large" })

    expect(toPresetThemes([fallback, medium, large])).toHaveLength(2)
  })

  it("stops once it has enough themes", () => {
    const codes = (["blue", "rose", "green"] as const).map((theme) =>
      encodePreset({ baseColor: "zinc", theme })
    )

    expect(toPresetThemes(codes, 2)).toHaveLength(2)
  })

  it("skips codes that do not decode", () => {
    expect(toPresetThemes(["not-a-preset"])).toEqual([])
  })

  it("leaves fonts out of the theme css", () => {
    const [theme] = toPresetThemes([encodePreset(blueOnZinc)])

    expect(theme!.css).toContain("--primary:")
    expect(theme!.css).toContain(".dark {")
    expect(theme!.css).not.toContain("--font-")
  })
})

describe("theme slugs and names", () => {
  it("names the colors and only adds what differs from the common case", () => {
    const [plain, detailed, mono] = toPresetThemes([
      encodePreset({ ...blueOnZinc, chartColor: "blue" }),
      encodePreset({
        ...blueOnZinc,
        chartColor: "rose",
        radius: "large",
        menuAccent: "bold",
      }),
      encodePreset({ baseColor: "mauve", theme: "mauve" }),
    ])

    expect(plain).toMatchObject({ slug: "blue-on-zinc", name: "Blue on Zinc" })
    expect(detailed).toMatchObject({
      slug: "blue-on-zinc-rose-charts-large-corners-bold-menus",
      name: "Blue on Zinc",
      title: "Blue on Zinc (rose charts, large corners, bold menus)",
    })
    expect(mono).toMatchObject({ slug: "mauve", name: "Mauve" })
  })

  it("turns a slug back into the same theme", () => {
    const [theme] = toPresetThemes([
      encodePreset({ ...blueOnZinc, chartColor: "rose", radius: "none" }),
    ])
    const fromSlug = presetThemeFromSlug(theme!.slug)

    expect(fromSlug?.slug).toBe(theme!.slug)
    expect(fromSlug?.css).toBe(theme!.css)
    expect(fromSlug?.source).toBeNull()
  })

  it("rejects slugs that are not a canonical theme", () => {
    expect(presetThemeFromSlug("blue-on-zinc-blue-charts")).toBeNull()
    expect(presetThemeFromSlug("blue-on-zinc-medium-corners")).toBeNull()
    expect(presetThemeFromSlug("not-a-color")).toBeNull()
    expect(presetThemeFromSlug("Blue-on-Zinc")).toBeNull()
  })
})

describe("presetThemeCommand", () => {
  it("applies only the theme part of the preset", () => {
    expect(presetThemeCommand("b1FQfDVOC")).toBe(
      "npx shadcn@latest apply --preset b1FQfDVOC --only theme"
    )
  })
})
