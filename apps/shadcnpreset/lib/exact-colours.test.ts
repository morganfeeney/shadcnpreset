import { describe, expect, it } from "vitest"

import { findExactColours, isCssColour } from "@/lib/exact-colours"

describe("findExactColours", () => {
  it("finds hex codes of every length", () => {
    expect(
      findExactColours("primary #DE00CE, text #fff, overlay #00000080")
    ).toEqual(["#DE00CE", "#fff", "#00000080"])
  })

  it("finds CSS colour functions", () => {
    expect(
      findExactColours(
        "rgb(0, 174, 255) as accent, --chart-1: oklch(0.84 0.13 178); hsl(220 30% 20%)"
      )
    ).toEqual(["rgb(0, 174, 255)", "oklch(0.84 0.13 178)", "hsl(220 30% 20%)"])
  })

  it("finds Pantone references", () => {
    expect(
      findExactColours("the logo uses pantone 200 C and process black")
    ).toEqual(["pantone 200 C"])
  })

  it("ignores colour words a preset can match", () => {
    expect(
      findExactColours("a deeper burgundy with soft blue accents")
    ).toEqual([])
  })

  it("ignores preset codes and longer hex-like runs", () => {
    expect(findExactColours("tweak b5dyaqxe6 and commit #a1b2c3d4e5")).toEqual(
      []
    )
  })

  it("lists each colour once, however it is written", () => {
    expect(findExactColours("#DE00CE, not #de00ce")).toEqual(["#DE00CE"])
  })

  it("stops at six, the size of a brand palette", () => {
    const stylesheet = Array.from(
      { length: 10 },
      (_, i) => `--c${i}: #00000${i};`
    ).join(" ")
    expect(findExactColours(stylesheet)).toHaveLength(6)
  })
})

describe("isCssColour", () => {
  it("paints hex and CSS functions but not Pantone", () => {
    expect(isCssColour("#DE00CE")).toBe(true)
    expect(isCssColour("oklch(0.84 0.13 178)")).toBe(true)
    expect(isCssColour("pantone 200 C")).toBe(false)
  })
})
