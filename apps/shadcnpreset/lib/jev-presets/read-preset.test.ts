import { DEFAULT_PRESET_CONFIG, decodePreset } from "shadcn/preset"
import { describe, expect, it } from "vitest"

import {
  readPresetFromJev,
  type JevChoiceAnswer,
} from "@/lib/jev-presets/read-preset"

/** One answer per field, each confidently stated, overridable per test. */
function answers(
  overrides: Record<string, Record<string, number>> = {}
): Record<string, JevChoiceAnswer> {
  const base: Record<string, Record<string, number>> = {
    style: { mira: 0.8, nova: 0.2 },
    baseColor: { zinc: 0.9, stone: 0.1 },
    theme: { blue: 0.7, green: 0.3 },
    chartColor: { cyan: 0.6, blue: 0.4 },
    font: { manrope: 0.7, inter: 0.3 },
    fontHeading: { inherit: 0.6, manrope: 0.4 },
    iconLibrary: { tabler: 0.6, lucide: 0.4 },
    radius: { small: 0.6, none: 0.4 },
    menuColor: { inverted: 0.9, default: 0.1 },
    menuAccent: { bold: 0.6, subtle: 0.4 },
  }
  return Object.fromEntries(
    Object.entries({ ...base, ...overrides }).map(([field, probabilities]) => [
      field,
      { probabilities: { unspecified: 0.1, ...probabilities } },
    ])
  )
}

describe("readPresetFromJev", () => {
  it("builds one preset from the most likely value of every field", () => {
    const reading = readPresetFromJev(answers())

    expect(reading?.config).toMatchObject({
      style: "mira",
      baseColor: "zinc",
      theme: "blue",
      chartColor: "cyan",
      font: "manrope",
      iconLibrary: "tabler",
      radius: "small",
      menuColor: "inverted",
      menuAccent: "bold",
    })
    expect(decodePreset(reading!.code)).toMatchObject(reading!.config)
  })

  it("falls back to the next accent when the top one cannot pair with the neutrals", () => {
    // A tinted grey accent only pairs with the same neutrals.
    const reading = readPresetFromJev(
      answers({ theme: { mauve: 0.6, green: 0.4 } })
    )

    expect(reading?.config.theme).toBe("green")
  })

  it("keeps a grey accent that matches the neutrals", () => {
    const reading = readPresetFromJev(
      answers({ theme: { zinc: 0.6, green: 0.4 } })
    )

    expect(reading?.config.theme).toBe("zinc")
  })

  it("marks a field inferred when Jev thinks the description did not ask for it", () => {
    const input = answers()
    input.radius = { probabilities: { unspecified: 0.8, none: 0.15, small: 0.05 } }

    const radius = readPresetFromJev(input)?.fields.find(
      (f) => f.field === "radius"
    )

    expect(radius).toMatchObject({ value: "none", stated: false })
    expect(radius?.probability).toBeCloseTo(0.75)
  })

  it("encodes a heading font that matches the body as inherit", () => {
    const reading = readPresetFromJev(
      answers({ fontHeading: { manrope: 0.9, inherit: 0.1 } })
    )

    expect(reading?.config.fontHeading).toBe("inherit")
  })

  it("keeps the default for a field Jev has nothing to say about", () => {
    // "modern newsletter" says nothing about the shell, and Jev answered with
    // every real option at zero. That is not a broken preset.
    const input = answers()
    input.menuColor = { probabilities: { unspecified: 1, default: 0, inverted: 0 } }

    const reading = readPresetFromJev(input)

    expect(reading?.config.menuColor).toBe(DEFAULT_PRESET_CONFIG.menuColor)
    expect(reading?.fields.find((f) => f.field === "menuColor")).toMatchObject({
      stated: false,
      probability: 0,
    })
  })

  it("reads a grey accent as monochrome and matches it to the neutrals", () => {
    const reading = readPresetFromJev(
      answers({ theme: { neutral: 0.8, teal: 0.2 } })
    )

    // Not teal: a grey accent means no colour, and zinc is the neutral chosen.
    expect(reading?.config.theme).toBe("zinc")
  })

  it("gives a style the corners the preview will actually render", () => {
    const sharp = readPresetFromJev(
      answers({ style: { lyra: 1 }, radius: { large: 1 } })
    )
    expect(sharp?.config.radius).toBe("none")
    expect(sharp?.fields.find((f) => f.field === "radius")?.value).toBe("none")

    // Rhea renders large as default, so the next corners Jev offered win.
    const rhea = readPresetFromJev(
      answers({ style: { rhea: 1 }, radius: { large: 0.9, medium: 0.1 } })
    )
    expect(rhea?.config.radius).toBe("medium")
  })

  it("gives up when a field has no answer", () => {
    const input = answers()
    delete (input as Record<string, unknown>).font

    expect(readPresetFromJev(input)).toBeNull()
  })
})
