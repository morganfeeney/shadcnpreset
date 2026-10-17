import {
  type ResolvedPreset,
  getFontFamily,
  resolvePresetFromCode,
} from "@/lib/preset"
import type { RegistryThemeSurface } from "@/components/preset-theme-surface"
import { buildRegistryTheme, DEFAULT_CONFIG } from "@/registry/config"

type ThemeVars = Record<string, string>

export type PresetThemeCssBundle = {
  resolved: ResolvedPreset
  /** For `PresetThemeSurface`. */
  registryTheme: RegistryThemeSurface
  lightVars: ThemeVars
  darkVars: ThemeVars
  lightCss: string
  darkCss: string
  combinedCss: string
  /** Color layer only (what `shadcn apply --only theme` applies): no font variables. */
  themeOnlyCss: string
}

function getFontVars(resolved: ResolvedPreset): ThemeVars {
  return {
    "font-sans": getFontFamily(resolved.font),
    "font-heading":
      resolved.fontHeading === "inherit"
        ? "var(--font-sans)"
        : getFontFamily(resolved.fontHeading),
  }
}

function formatCssBlock(selector: string, vars: ThemeVars) {
  const lines = Object.entries(vars).map(
    ([key, value]) => `  --${key}: ${value};`
  )
  return `${selector} {\n${lines.join("\n")}\n}`
}

export function getPresetThemeCssBundle(
  code: string
): PresetThemeCssBundle | null {
  const resolved = resolvePresetFromCode(code.trim())
  if (!resolved) {
    return null
  }

  const registryTheme = buildRegistryTheme({
    ...DEFAULT_CONFIG,
    baseColor: resolved.baseColor,
    theme: resolved.theme,
    chartColor: resolved.effectiveChartColor,
    menuAccent: resolved.menuAccent,
    menuColor: resolved.menuColor,
    radius: resolved.effectiveRadius,
  })

  const fontVars = getFontVars(resolved)
  const themeVars = (
    registryTheme.cssVars as {
      theme?: ThemeVars
    }
  ).theme
  const colorLightVars = {
    ...(themeVars ?? {}),
    ...(registryTheme.cssVars.light as ThemeVars),
  }
  const lightVars = { ...colorLightVars, ...fontVars }
  const darkVars = registryTheme.cssVars.dark as ThemeVars
  const lightCss = formatCssBlock(":root", lightVars)
  const darkCss = formatCssBlock(".dark", darkVars)

  return {
    resolved,
    registryTheme,
    lightVars,
    darkVars,
    lightCss,
    darkCss,
    combinedCss: `${lightCss}\n\n${darkCss}`,
    themeOnlyCss: `${formatCssBlock(":root", colorLightVars)}\n\n${darkCss}`,
  }
}
