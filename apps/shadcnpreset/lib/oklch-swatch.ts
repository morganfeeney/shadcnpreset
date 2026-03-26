import { THEMES } from "@/registry/themes"
import type { PresetConfig } from "@/lib/preset-codec"
import { BASE_COLORS } from "@/registry/base-colors"
import {
  buildRegistryTheme,
  DEFAULT_CONFIG,
  type BaseColorName,
  type ThemeName,
} from "@/registry/config"

type ThemeMode = "light" | "dark"
type ThemeToken =
  | "primary"
  | "chart-1"
  | "chart-2"
  | "chart-3"
  | "chart-4"
  | "chart-5"
  | "background"
  | "muted-foreground"

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
const REGISTRY_THEME_NAMES = new Set<string>(THEMES.map((theme) => theme.name))
const REGISTRY_BASE_COLOR_NAMES = new Set<string>(
  BASE_COLORS.map((color) => color.name)
)

function isRegistryThemeName(value: string): value is ThemeName {
  return REGISTRY_THEME_NAMES.has(value)
}

function isRegistryBaseColorName(value: string): value is BaseColorName {
  return REGISTRY_BASE_COLOR_NAMES.has(value)
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

export function getThemeSwatchPair(
  themeName: string,
  role:
    | "primary"
    | "chart1"
    | "chart2"
    | "chart3"
    | "chart4"
    | "chart5"
    | "background"
    | "mutedForeground"
) {
  const token: ThemeToken =
    role === "chart1"
      ? "chart-1"
      : role === "chart2"
        ? "chart-2"
        : role === "chart3"
          ? "chart-3"
          : role === "chart4"
            ? "chart-4"
            : role === "chart5"
              ? "chart-5"
      : role === "background"
        ? "background"
        : role === "mutedForeground"
          ? "muted-foreground"
          : "primary"

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
  config: Pick<PresetConfig, "baseColor" | "theme" | "chartColor" | "menuAccent" | "radius">,
  role:
    | "primary"
    | "chart1"
    | "chart2"
    | "chart3"
    | "chart4"
    | "chart5"
    | "background"
    | "mutedForeground"
) {
  const token: ThemeToken =
    role === "chart1"
      ? "chart-1"
      : role === "chart2"
        ? "chart-2"
        : role === "chart3"
          ? "chart-3"
          : role === "chart4"
            ? "chart-4"
            : role === "chart5"
              ? "chart-5"
      : role === "background"
        ? "background"
        : role === "mutedForeground"
          ? "muted-foreground"
          : "primary"

  const safeBaseColor = isRegistryBaseColorName(config.baseColor)
    ? config.baseColor
    : DEFAULT_CONFIG.baseColor
  const safeTheme = isRegistryThemeName(config.theme)
    ? config.theme
    : DEFAULT_CONFIG.theme
  const safeChartColor =
    typeof config.chartColor === "string" && isRegistryThemeName(config.chartColor)
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

  let registryTheme: ReturnType<typeof buildRegistryTheme>
  try {
    registryTheme = buildRegistryTheme({
      ...DEFAULT_CONFIG,
      baseColor: safeBaseColor,
      theme: safeTheme,
      chartColor: safeChartColor,
      menuAccent: safeMenuAccent,
      radius: safeRadius,
    })
  } catch {
    registryTheme = buildRegistryTheme(DEFAULT_CONFIG)
  }
  const lightVars = registryTheme.cssVars?.light ?? {}
  const darkVars = registryTheme.cssVars?.dark ?? {}
  const light = lightVars[token] ?? lightVars.primary ?? FALLBACK_LIGHT
  const dark = darkVars[token] ?? darkVars.primary ?? FALLBACK_DARK

  return { light, dark }
}
