import { describe, expect, it } from "vitest"

import {
  areaColour,
  areaPosition,
  formatOklch,
  MAX_CHROMA,
  onScreen,
  paintArea,
  readOklch,
} from "@/lib/oklch-colour"

describe("readOklch", () => {
  it("reads oklch as written, percent lightness included", () => {
    const lch = readOklch("oklch(70.4% .191 22.216)")
    expect(lch?.l).toBeCloseTo(0.704)
    expect(lch?.c).toBeCloseTo(0.191)
    expect(lch?.h).toBeCloseTo(22.216)
  })

  it("reads other CSS colours, and greys with no hue as hue 0", () => {
    expect(readOklch("#ffffff")).toMatchObject({ c: expect.any(Number), h: 0 })
    expect(readOklch("#1E3A8A")?.h).toBeCloseTo(265.5, 0)
  })

  it("is null for what isn't a colour", () => {
    expect(readOklch("pantone 200 C")).toBeNull()
  })
})

describe("formatOklch", () => {
  it("writes lightness as a percent, rounded for reading", () => {
    expect(formatOklch({ l: 0.70412, c: 0.19137, h: 22.2161 })).toBe(
      "oklch(70.4% 0.191 22.2)"
    )
  })
})

describe("the screen's range", () => {
  it("tells colours a screen can show from ones it can't", () => {
    expect(onScreen({ l: 0.6, c: 0.15, h: 22.2 })).toBe(true)
    // Tailwind's red-400: just past sRGB, as much of its palette is.
    expect(onScreen({ l: 0.704, c: 0.191, h: 22.216 })).toBe(false)
  })
})

describe("the area", () => {
  it("paints colours a screen shows and leaves the rest clear", () => {
    const pixels = paintArea(22.2, 20, 10)
    const alpha = (x: number, y: number) => pixels[(y * 20 + x) * 4 + 3]
    // Low chroma, mid lightness: shown. Full chroma: past any screen.
    expect(alpha(0, 5)).toBe(255)
    expect(alpha(19, 5)).toBe(0)
  })

  it("puts a colour where picking that point gives it back", () => {
    const lch = { l: 0.704, c: 0.191, h: 22.2 }
    const { x, y } = areaPosition(lch)
    const picked = areaColour(x, y, lch.h)
    expect(picked.l).toBeCloseTo(0.704)
    expect(picked.c).toBeCloseTo(0.191)
    expect(picked.h).toBe(22.2)
  })

  it("keeps a point dragged past the edge on the area", () => {
    expect(areaColour(1.4, -0.2, 90)).toEqual({ l: 1, c: MAX_CHROMA, h: 90 })
  })
})
