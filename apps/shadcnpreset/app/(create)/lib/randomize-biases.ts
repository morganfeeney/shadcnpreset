import type {
  BaseColor,
  BaseColorName,
  Radius,
  StyleName,
  Theme,
  ThemeName,
} from "@/registry/config"

import { type FONTS } from "./fonts"

export type RandomizeContext = {
  style?: StyleName
  baseColor?: BaseColorName
  theme?: ThemeName
  chartColor?: string
  iconLibrary?: string
  font?: string
  menuAccent?: string
  menuColor?: string
  radius?: string
}

export type BiasFilter<T> = (
  items: readonly T[],
  context: RandomizeContext
) => readonly T[]

export type RandomizeBiases = {
  baseColors?: BiasFilter<BaseColor>
  chartColors?: BiasFilter<Theme>
  fonts?: BiasFilter<(typeof FONTS)[number]>
  radius?: BiasFilter<Radius>
}

const CHART_COLOR_PAIRINGS: Record<string, string[]> = {
  red: ["teal", "sky"],
  orange: ["teal", "blue"],
  amber: ["cyan", "indigo"],
  yellow: ["sky", "violet"],
  lime: ["indigo", "pink"],
  green: ["purple", "rose"],
  emerald: ["purple", "red"],
  teal: ["fuchsia", "red"],
  cyan: ["rose", "amber"],
  sky: ["red", "yellow"],
  blue: ["orange", "yellow"],
  indigo: ["amber", "yellow"],
  violet: ["yellow", "lime"],
  purple: ["green", "lime"],
  fuchsia: ["lime", "teal"],
  pink: ["green", "cyan"],
  rose: ["emerald", "sky"],
}

export const RANDOMIZE_BIASES: RandomizeBiases = {
  baseColors: (baseColors) => {
    return baseColors.filter((color) => color.name !== "gray")
  },
  fonts: (fonts, context) => {
    if (context.style === "lyra") {
      return fonts.filter((font) => font.value === "jetbrains-mono")
    }

    return fonts
  },
  radius: (radii, context) => {
    if (context.style === "lyra") {
      return radii.filter((radius) => radius.name === "none")
    }

    return radii
  },
  chartColors: (chartColors, context) => {
    const pairing = context.theme ? CHART_COLOR_PAIRINGS[context.theme] : null
    if (pairing) {
      const filtered = chartColors.filter((color) => pairing.includes(color.name))
      if (filtered.length > 0) {
        return filtered
      }
    }

    return chartColors
  },
}

export function applyBias<T>(
  items: readonly T[],
  context: RandomizeContext,
  biasFilter?: BiasFilter<T>
): readonly T[] {
  if (!biasFilter) {
    return items
  }

  return biasFilter(items, context)
}
