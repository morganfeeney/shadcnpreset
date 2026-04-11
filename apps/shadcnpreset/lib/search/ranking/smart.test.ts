import { describe, expect, it } from "vitest"

import {
  rankPresetCandidates,
  wantsPaletteVariety,
} from "@/lib/search/ranking/smart"
import {
  makeDistinctFamilies,
  makeSameBrowseFamilyVariants,
  makeSameLookDifferentMenus,
  makeSearchPresetItem,
} from "@/lib/search/ranking/fixtures"

describe("wantsPaletteVariety", () => {
  it("is false when a semantic theme pin and a base colour both appear (e.g. stone + purple)", () => {
    expect(wantsPaletteVariety("stone sans serif purple charts")).toBe(false)
    expect(wantsPaletteVariety("stone purple")).toBe(false)
  })

  it("is true for theme-only pins without a neutral base token (e.g. pink)", () => {
    expect(wantsPaletteVariety("pink")).toBe(true)
  })

  it("is true for vibe tokens without two pinned theme/base tokens (e.g. minimal)", () => {
    expect(wantsPaletteVariety("minimal")).toBe(true)
  })

  it("is true for one style + one base (nova stone)", () => {
    expect(wantsPaletteVariety("nova stone")).toBe(true)
  })
})

describe("rankPresetCandidates", () => {
  it("returns [] for empty input", () => {
    expect(rankPresetCandidates("stone", [], 10)).toEqual([])
  })

  it("returns [] when nothing matches — no filler presets for nonsense queries", () => {
    const item = makeSearchPresetItem(
      { baseColor: "stone", theme: "purple", chartColor: "purple" },
      0
    )
    expect(rankPresetCandidates("zzznonexistenttokenqqq", [item], 5)).toEqual([])
  })

  it("ranks professional intent against SaaS-style presets", () => {
    const pro = makeSearchPresetItem(
      {
        baseColor: "zinc",
        theme: "blue",
        chartColor: "blue",
        font: "inter",
        fontHeading: "inter",
        menuAccent: "subtle",
      },
      0
    )
    const other = makeSearchPresetItem(
      {
        baseColor: "zinc",
        theme: "rose",
        chartColor: "rose",
        font: "jetbrains-mono",
        fontHeading: "jetbrains-mono",
      },
      1
    )
    const out = rankPresetCandidates("professional", [other, pro], 5)
    expect(out.length).toBeGreaterThanOrEqual(1)
    expect(out[0]!.code).toBe(pro.code)
  })

  it("dedupes the same visible card (fine signature) even when radius/menu differ", () => {
    const [a, b] = makeSameLookDifferentMenus(0)
    const out = rankPresetCandidates("stone purple", [a, b], 5)
    expect(out).toHaveLength(1)
    expect([a.code, b.code]).toContain(out[0]!.code)
  })

  it("keeps at most one preset per browse family when palette variety is off", () => {
    const variants = makeSameBrowseFamilyVariants(12)
    const out = rankPresetCandidates("stone purple", variants, 24)
    expect(out).toHaveLength(1)
  })

  it("returns one result per distinct browse family up to maxResults", () => {
    const families = makeDistinctFamilies(8)
    const out = rankPresetCandidates("stone purple", families, 5)
    expect(out).toHaveLength(5)
    const keys = new Set(
      out.map(
        (p) =>
          `${p.config.style}\0${p.config.baseColor}\0${p.config.theme}\0${p.config.chartColor}\0${p.config.fontHeading}`
      )
    )
    expect(keys.size).toBe(out.length)
  })

  it("mixes families: many variants of family A plus family B — B appears in the list", () => {
    const aVariants = makeSameBrowseFamilyVariants(6)
    const bOnly = makeSearchPresetItem(
      {
        baseColor: "stone",
        theme: "rose",
        chartColor: "purple",
        font: "noto-sans",
        fontHeading: "lora",
        iconLibrary: "lucide",
      },
      100
    )
    const out = rankPresetCandidates("stone purple rose", [...aVariants, bOnly], 10)
    const rose = out.filter((p) => p.config.theme === "rose")
    expect(rose.length).toBeGreaterThanOrEqual(1)
  })
})
