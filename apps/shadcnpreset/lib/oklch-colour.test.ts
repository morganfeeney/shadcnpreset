import { describe, expect, it } from "vitest"

import {
  areaColour,
  areaPosition,
  formatOklch,
  MAX_CHROMA,
  maxOnScreenChroma,
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

  it("finds the screen's edge where culori does", () => {
    for (const h of [0, 22.2, 90, 150, 265, 330]) {
      for (const l of [0.2, 0.5, 0.72, 0.9]) {
        const c = maxOnScreenChroma(l, h)
        expect(onScreen({ l, c: Math.max(0, c - 0.002), h })).toBe(true)
        expect(onScreen({ l, c: c + 0.002, h })).toBe(false)
      }
    }
  })

  it("leaves each row's edge pixel partly clear, so the edge is smooth", () => {
    const pixels = paintArea(150, 200, 100)
    const row = Array.from(
      { length: 200 },
      (_, x) => pixels[(50 * 200 + x) * 4 + 3]
    )
    const edge = row.findIndex((alpha) => alpha < 255)
    expect(row.slice(0, edge).every((alpha) => alpha === 255)).toBe(true)
    expect(row[edge]).toBeGreaterThan(0)
    expect(row.slice(edge + 1).every((alpha) => alpha === 0)).toBe(true)
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
