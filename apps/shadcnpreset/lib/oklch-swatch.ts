import { THEMES } from "@/registry/themes"
import { buildThemeCssVars } from "@/lib/theme"
import type { PresetConfig } from "@/lib/preset-codec"

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

function getTheme(name: string) {
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
  const theme = getTheme(themeName)
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

  const cssVars = buildThemeCssVars({
    baseColor: config.baseColor,
    theme: config.theme,
    chartColor: config.chartColor,
    menuAccent: config.menuAccent,
    radius: config.radius,
  })

  const light = cssVars.light[token] ?? cssVars.light.primary ?? FALLBACK_LIGHT
  const dark = cssVars.dark[token] ?? cssVars.dark.primary ?? FALLBACK_DARK

  return { light, dark }
}
