import { describe, expect, it } from "vitest"

import { decodePreset, encodePreset } from "shadcn/preset"
import type { PresetPageItem } from "@/lib/preset-catalog"
import {
  applyShellBrightnessIntent,
  presetVisibleSignatureKey,
  rankPresetsByEmbeddingSimilarity,
} from "@/lib/search/semantic-rank"

function makeItem(overrides: Partial<import("shadcn/preset").PresetConfig>): PresetPageItem {
  const code = encodePreset({
    baseColor: "stone",
    theme: "purple",
    chartColor: "purple",
    font: "noto-sans",
    fontHeading: "noto-sans",
    iconLibrary: "lucide",
    ...overrides,
  })
  const config = decodePreset(code)
  if (!config) throw new Error("decode failed")
  return { index: 0, code, config }
}

describe("rankPresetsByEmbeddingSimilarity", () => {
  it("returns [] when all scores are zero", () => {
    const a = makeItem({})
    const scores = new Map<string, number>([[a.code, 0]])
    expect(rankPresetsByEmbeddingSimilarity([a], scores, 5)).toEqual([])
  })

  it("orders by score descending", () => {
    const hi = makeItem({ theme: "rose" })
    const lo = makeItem({ theme: "cyan" })
    const scores = new Map<string, number>([
      [hi.code, 0.9],
      [lo.code, 0.1],
    ])
    const out = rankPresetsByEmbeddingSimilarity([lo, hi], scores, 5)
    expect(out.map((p) => p.code)).toEqual([hi.code, lo.code])
  })

  it("keeps one preset per visible signature (highest score wins)", () => {
    const first = makeItem({ theme: "amber" })
    const twin: PresetPageItem = {
      index: 2,
      code: "synthetic-twin",
      config: first.config,
    }
    const scores = new Map<string, number>([
      [first.code, 0.5],
      [twin.code, 0.99],
    ])
    const out = rankPresetsByEmbeddingSimilarity([first, twin], scores, 5)
    expect(out).toHaveLength(1)
    expect(out[0]!.code).toBe(twin.code)
  })

  it("presetVisibleSignatureKey ignores code string", () => {
    const a = makeItem({})
    const b: PresetPageItem = { ...a, code: "other" }
    expect(presetVisibleSignatureKey(a)).toBe(presetVisibleSignatureKey(b))
  })
})

describe("applyShellBrightnessIntent", () => {
  it("boosts inverted shell when query asks for dark", () => {
    const darkShell = makeItem({ menuColor: "inverted", theme: "teal" })
    const lightShell = makeItem({ menuColor: "default", theme: "cyan" })
    const scores = new Map<string, number>([
      [darkShell.code, 0.5],
      [lightShell.code, 0.5],
    ])
    const boosted = applyShellBrightnessIntent(
      "dark fintech dashboard",
      scores,
      [darkShell, lightShell]
    )
    expect(boosted.get(darkShell.code)! > boosted.get(lightShell.code)!).toBe(true)
  })
})
