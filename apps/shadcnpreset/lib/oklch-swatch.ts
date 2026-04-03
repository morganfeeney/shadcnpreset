import { formatHex, parse } from "culori"

import { THEMES } from "@/registry/themes"
import { BASE_COLORS } from "@/registry/base-colors"
import type { PresetConfig } from "shadcn/preset"
import { buildRegistryTheme, DEFAULT_CONFIG } from "@/registry/config"

type ThemeMode = "light" | "dark"
type ThemeToken =
  | "foreground"
  | "primary"
  | "primary-foreground"
  | "input"
  | "border"
  | "chart-1"
  | "chart-2"
  | "chart-3"
  | "chart-4"
  | "chart-5"
  | "background"
  | "card"
  | "card-foreground"
  | "muted-foreground"

const ROLE_TOKEN_MAP = {
  foreground: "foreground",
  primary: "primary",
  primaryForeground: "primary-foreground",
  input: "input",
  border: "border",
  chart1: "chart-1",
  chart2: "chart-2",
  chart3: "chart-3",
  chart4: "chart-4",
  chart5: "chart-5",
  background: "background",
  card: "card",
  cardForeground: "card-foreground",
  mutedForeground: "muted-foreground",
} as const satisfies Record<string, ThemeToken>

type SwatchRole = keyof typeof ROLE_TOKEN_MAP

type ThemeWithVars = {
  name: string
  cssVars?: {
    light?: Record<string, string>
    dark?: Record<string, string>
  }
}

const FALLBACK_LIGHT = "oklch(0.205 0 0)"
const FALLBACK_DARK = "oklch(0.922 0 0)"
const THEMES_WITH_VARS = THEMES as unknown as ThemeWithVars[]
const THEME_NAME_SET = new Set(THEMES.map((theme) => theme.name))
const BASE_COLOR_NAME_SET = new Set(BASE_COLORS.map((color) => color.name))

function isThemeName(
  name: string | undefined
): name is (typeof THEMES)[number]["name"] {
  return typeof name === "string" && THEME_NAME_SET.has(name)
}

function isBaseColorName(
  name: string | undefined
): name is (typeof BASE_COLORS)[number]["name"] {
  return typeof name === "string" && BASE_COLOR_NAME_SET.has(name)
}

function getThemeFromList(name: string) {
  return (
    THEMES_WITH_VARS.find((theme) => theme.name === name) ??
    THEMES_WITH_VARS.find((theme) => theme.name === "neutral") ??
    null
  )
}

function getThemeToken(
  themeName: string,
  mode: ThemeMode,
  token: ThemeToken
): string | null {
  const theme = getThemeFromList(themeName)
  if (!theme) {
    return null
  }

  const vars = theme.cssVars?.[mode]
  if (!vars) {
    return null
  }

  return vars[token] ?? null
}

function resolveThemeToken(role: SwatchRole): ThemeToken {
  return ROLE_TOKEN_MAP[role]
}

export function getThemeSwatchPair(themeName: string, role: SwatchRole) {
  const token = resolveThemeToken(role)

  const light =
    getThemeToken(themeName, "light", token) ??
    getThemeToken(themeName, "light", "primary") ??
    FALLBACK_LIGHT
  const dark =
    getThemeToken(themeName, "dark", token) ??
    getThemeToken(themeName, "dark", "primary") ??
    FALLBACK_DARK

  return { light, dark }
}

export function getPresetSwatchPair(
  config: Pick<
    PresetConfig,
    "baseColor" | "theme" | "chartColor" | "menuAccent" | "radius"
  >,
  role: SwatchRole
) {
  const token = resolveThemeToken(role)

  const safeBaseColor = isBaseColorName(config.baseColor)
    ? config.baseColor
    : DEFAULT_CONFIG.baseColor
  const safeTheme = isThemeName(config.theme)
    ? config.theme
    : DEFAULT_CONFIG.theme
  const safeChartColor = isThemeName(config.chartColor)
    ? config.chartColor
    : DEFAULT_CONFIG.chartColor
  const safeMenuAccent =
    config.menuAccent === "bold" || config.menuAccent === "subtle"
      ? config.menuAccent
      : DEFAULT_CONFIG.menuAccent
  const safeRadius =
    config.radius === "default" ||
    config.radius === "none" ||
    config.radius === "small" ||
    config.radius === "medium" ||
    config.radius === "large"
      ? config.radius
      : DEFAULT_CONFIG.radius

  const cssVars = buildRegistryTheme({
    ...DEFAULT_CONFIG,
    baseColor: safeBaseColor,
    theme: safeTheme,
    chartColor: safeChartColor,
    menuAccent: safeMenuAccent,
    radius: safeRadius,
  }).cssVars
  const lightVars = cssVars.light ?? {}
  const darkVars = cssVars.dark ?? {}
  const light = lightVars[token] ?? lightVars.primary ?? FALLBACK_LIGHT
  const dark = darkVars[token] ?? darkVars.primary ?? FALLBACK_DARK

  return { light, dark }
}

function oklchCssToHex(oklchCss: string): string {
  const color = parse(oklchCss.trim())
  if (!color) return "#737373"
  try {
    return formatHex(color)
  } catch {
    return "#737373"
  }
}

/** Dark-mode token from a theme JSON entry (same source as create pickers). */
function getThemeDarkCssValue(
  themeName: string,
  key: "primary" | "muted-foreground"
): string | null {
  const theme = getThemeFromList(themeName)
  const raw = theme?.cssVars?.dark?.[key]
  return typeof raw === "string" ? raw : null
}

type OgSwatchConfig = Pick<
  PresetConfig,
  "baseColor" | "theme" | "chartColor" | "menuAccent" | "radius"
>

/**
 * Hex colors for Open Graph preset previews — **three** swatches aligned with
 * {@link BaseColorPicker}, {@link ThemePicker}, and {@link ChartColorPicker}
 * (dark `muted-foreground` for base palettes; `primary` vs `muted-foreground`
 * for theme/chart when the name is a base palette vs accent theme). Not merged
 * `background` / chart tokens from {@link buildRegistryTheme}.
 */
export function getPresetOgSwatchHexes(
  config: OgSwatchConfig
): readonly string[] {
  const safeBaseColor = isBaseColorName(config.baseColor)
    ? config.baseColor
    : DEFAULT_CONFIG.baseColor
  const safeTheme = isThemeName(config.theme)
    ? config.theme
    : DEFAULT_CONFIG.theme
  const safeChartColor = isThemeName(config.chartColor)
    ? config.chartColor
    : DEFAULT_CONFIG.chartColor

  // Base Color picker: dark muted-foreground of the base palette theme.
  const baseOklch =
    getThemeDarkCssValue(safeBaseColor, "muted-foreground") ?? FALLBACK_DARK

  // Theme picker: base-palette names → muted-foreground; accent themes → primary.
  const themeOklch = isBaseColorName(safeTheme)
    ? getThemeDarkCssValue(safeTheme, "muted-foreground") ??
      getThemeDarkCssValue(safeTheme, "primary") ??
      FALLBACK_DARK
    : getThemeDarkCssValue(safeTheme, "primary") ??
      getThemeDarkCssValue(safeTheme, "muted-foreground") ??
      FALLBACK_DARK

  // Chart Color picker: same rule as theme.
  const chartOklch = isBaseColorName(safeChartColor)
    ? getThemeDarkCssValue(safeChartColor, "muted-foreground") ??
      getThemeDarkCssValue(safeChartColor, "primary") ??
      FALLBACK_DARK
    : getThemeDarkCssValue(safeChartColor, "primary") ??
      getThemeDarkCssValue(safeChartColor, "muted-foreground") ??
      FALLBACK_DARK

  return [
    oklchCssToHex(baseOklch),
    oklchCssToHex(themeOklch),
    oklchCssToHex(chartOklch),
  ] as const
}
