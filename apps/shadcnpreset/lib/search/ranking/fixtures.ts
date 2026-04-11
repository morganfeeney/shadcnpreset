import { decodePreset, encodePreset, type PresetConfig } from "shadcn/preset"
import type { PresetPageItem } from "@/lib/preset-catalog"

/**
 * Minimal `PresetPageItem` for ranking tests — codes are canonical `encodePreset` output.
 */
export function makeSearchPresetItem(
  overrides: Partial<PresetConfig>,
  index: number
): PresetPageItem {
  const code = encodePreset(overrides)
  const decoded = decodePreset(code)
  if (!decoded) {
    throw new Error(`encodePreset produced undecodable code: ${code}`)
  }
  return { index, code, config: decoded }
}

/** Same visible “card” fields, different radius/menu (still one row after fine dedupe). */
export function makeSameLookDifferentMenus(
  index: number
): [PresetPageItem, PresetPageItem] {
  const base: Partial<PresetConfig> = {
    baseColor: "stone",
    theme: "purple",
    chartColor: "purple",
    font: "noto-sans",
    fontHeading: "source-sans-3",
    iconLibrary: "lucide",
  }
  const a = makeSearchPresetItem(
    { ...base, radius: "none", menuAccent: "subtle" },
    index
  )
  const b = makeSearchPresetItem(
    { ...base, radius: "large", menuAccent: "bold" },
    index + 1
  )
  return [a, b]
}

/**
 * Same browse family (`style` + palette + heading); different body font + icon (fine key differs).
 */
export function makeSameBrowseFamilyVariants(count: number): PresetPageItem[] {
  const fonts = [
    "noto-sans",
    "nunito-sans",
    "dm-sans",
    "public-sans",
    "geist",
  ] as const
  const icons = ["lucide", "tabler", "hugeicons"] as const

  const items: PresetPageItem[] = []
  let i = 0
  while (items.length < count) {
    const font = fonts[items.length % fonts.length]
    const icon = icons[items.length % icons.length]
    items.push(
      makeSearchPresetItem(
        {
          baseColor: "stone",
          theme: "purple",
          chartColor: "purple",
          fontHeading: "source-sans-3",
          font,
          iconLibrary: icon,
        },
        i++
      )
    )
  }
  return items
}

/** Distinct browse families for mixing into a candidate pool. */
export function makeDistinctFamilies(count: number): PresetPageItem[] {
  const themes = ["purple", "rose", "cyan", "amber", "green"] as const
  const items: PresetPageItem[] = []
  for (let i = 0; i < count; i++) {
    items.push(
      makeSearchPresetItem(
        {
          baseColor: "stone",
          theme: themes[i % themes.length],
          chartColor: "purple",
          font: "noto-sans",
          fontHeading: i % 2 === 0 ? "source-sans-3" : "inter",
          iconLibrary: "lucide",
        },
        i
      )
    )
  }
  return items
}
