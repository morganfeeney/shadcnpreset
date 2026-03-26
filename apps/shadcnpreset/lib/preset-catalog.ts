import {
  PRESET_FONT_HEADINGS,
  PRESET_FONTS,
  PRESET_ICON_LIBRARIES,
  PRESET_MENU_ACCENTS,
  PRESET_MENU_COLORS,
  PRESET_RADII,
  PRESET_STYLES,
  PRESET_THEMES,
  encodePreset,
  type PresetConfig,
} from "@/lib/preset-codec"
import { THEMES } from "@/registry/themes"

const V4_BASE_COLORS = [
  "neutral",
  "stone",
  "zinc",
  "mauve",
  "olive",
  "mist",
  "taupe",
] as const

const APP_THEME_NAMES = THEMES.map((theme) => theme.name)
const V4_THEME_NAMES = APP_THEME_NAMES
const V4_THEME_NAME_SET = new Set<string>(V4_THEME_NAMES)
const V4_BASE_COLOR_SET = new Set<string>(V4_BASE_COLORS)

const NON_BASE_THEMES = PRESET_THEMES.filter(
  (theme) =>
    V4_THEME_NAME_SET.has(theme) &&
    !V4_BASE_COLOR_SET.has(theme)
)

function getV4ThemesForBaseColor(baseColor: (typeof V4_BASE_COLORS)[number]) {
  return V4_THEME_NAMES.filter((theme) => {
    if (theme === baseColor) {
      return true
    }
    return !V4_BASE_COLOR_SET.has(theme)
  })
}

export type PresetFilters = Partial<{
  style: PresetConfig["style"]
  baseColor: PresetConfig["baseColor"]
  theme: PresetConfig["theme"]
  chartColor: PresetConfig["chartColor"]
  fontHeading: PresetConfig["fontHeading"]
  font: PresetConfig["font"]
  iconLibrary: PresetConfig["iconLibrary"]
  radius: PresetConfig["radius"]
  menuColor: PresetConfig["menuColor"]
  menuAccent: PresetConfig["menuAccent"]
}>

export const PRESET_FILTER_OPTIONS = {
  styles: PRESET_STYLES,
  baseColors: V4_BASE_COLORS,
  themes: V4_THEME_NAMES,
  chartColors: NON_BASE_THEMES,
  fontHeadings: PRESET_FONT_HEADINGS,
  fonts: PRESET_FONTS,
  iconLibraries: PRESET_ICON_LIBRARIES,
  radii: PRESET_RADII,
  menuColors: PRESET_MENU_COLORS,
  menuAccents: PRESET_MENU_ACCENTS,
} as const

export type PresetPageItem = {
  index: number
  code: string
  config: PresetConfig
}

function pickValues<T extends string>(all: readonly T[], selected?: string) {
  if (selected && all.includes(selected as T)) {
    return [selected as T]
  }
  return [...all]
}

function getThemeChoicesForBase(
  baseColor: (typeof V4_BASE_COLORS)[number],
  filters: PresetFilters
) {
  const availableThemes = getV4ThemesForBaseColor(baseColor)
  const themes = pickValues(availableThemes, filters.theme)
  const chartColors = pickValues(NON_BASE_THEMES, filters.chartColor)
  return { themes, chartColors }
}

export function getPresetTotalCombinations(filters: PresetFilters = {}) {
  const styles = pickValues(PRESET_STYLES, filters.style)
  const baseColors = pickValues(V4_BASE_COLORS, filters.baseColor)
  const fontHeadings = pickValues(PRESET_FONT_HEADINGS, filters.fontHeading)
  const fonts = pickValues(PRESET_FONTS, filters.font)
  const iconLibraries = pickValues(PRESET_ICON_LIBRARIES, filters.iconLibrary)
  const radii = pickValues(PRESET_RADII, filters.radius)
  const menuColors = pickValues(PRESET_MENU_COLORS, filters.menuColor)
  const menuAccents = pickValues(PRESET_MENU_ACCENTS, filters.menuAccent)
  const commonCombinationFactor =
    fontHeadings.length *
    fonts.length *
    iconLibraries.length *
    radii.length *
    menuColors.length *
    menuAccents.length
  let total = 0
  for (const baseColor of baseColors) {
    const { themes, chartColors } = getThemeChoicesForBase(baseColor, filters)
    total += styles.length * themes.length * chartColors.length * commonCombinationFactor
  }
  return total
}

export const PRESET_TOTAL_COMBINATIONS = getPresetTotalCombinations()

export function getPresetPage(
  page: number,
  pageSize: number,
  filters: PresetFilters = {}
): PresetPageItem[] {
  const safePage = Math.max(1, page)
  const safePageSize = Math.min(100, Math.max(1, pageSize))
  const styles = pickValues(PRESET_STYLES, filters.style)
  const baseColors = pickValues(V4_BASE_COLORS, filters.baseColor)
  const fontHeadings = pickValues(PRESET_FONT_HEADINGS, filters.fontHeading)
  const fonts = pickValues(PRESET_FONTS, filters.font)
  const iconLibraries = pickValues(PRESET_ICON_LIBRARIES, filters.iconLibrary)
  const radii = pickValues(PRESET_RADII, filters.radius)
  const menuColors = pickValues(PRESET_MENU_COLORS, filters.menuColor)
  const menuAccents = pickValues(PRESET_MENU_ACCENTS, filters.menuAccent)
  const commonCombinationFactor =
    fontHeadings.length *
    fonts.length *
    iconLibraries.length *
    radii.length *
    menuColors.length *
    menuAccents.length

  const filteredTotal = getPresetTotalCombinations(filters)
  const start = (safePage - 1) * safePageSize
  const end = Math.min(start + safePageSize, filteredTotal)
  const items: PresetPageItem[] = []

  if (start >= filteredTotal) {
    return items
  }

  let cursor = 0

  for (const baseColor of baseColors) {
    const { themes, chartColors } = getThemeChoicesForBase(baseColor, filters)
    const segmentCount =
      styles.length *
      themes.length *
      chartColors.length *
      commonCombinationFactor

    if (cursor + segmentCount <= start) {
      cursor += segmentCount
      continue
    }

    for (const style of styles) {
      for (const theme of themes) {
        for (const chartColor of chartColors) {
          for (const fontHeading of fontHeadings) {
            for (const font of fonts) {
              for (const iconLibrary of iconLibraries) {
                for (const radius of radii) {
                  for (const menuColor of menuColors) {
                    for (const menuAccent of menuAccents) {
                      if (cursor >= end) {
                        return items
                      }
                      if (cursor >= start) {
                        const config: PresetConfig = {
                          style,
                          baseColor,
                          theme,
                          chartColor,
                          fontHeading,
                          font,
                          iconLibrary,
                          radius,
                          menuColor,
                          menuAccent,
                        }
                        items.push({
                          index: cursor,
                          code: encodePreset(config),
                          config,
                        })
                      }
                      cursor++
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }

  return items
}
