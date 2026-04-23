import {
  type ResolvedPreset,
  getFontFamily,
  resolvePresetFromCode,
} from "@/lib/preset"
import { buildRegistryTheme, DEFAULT_CONFIG } from "@/registry/config"

type ThemeVars = Record<string, string>

export type PresetThemeCssBundle = {
  resolved: ResolvedPreset
  lightVars: ThemeVars
  darkVars: ThemeVars
  lightCss: string
  darkCss: string
  combinedCss: string
}

function getFontVars(resolved: ResolvedPreset): ThemeVars {
  const headingFont =
    resolved.fontHeading === "inherit" ? resolved.font : resolved.fontHeading

  return {
    "font-sans": getFontFamily(resolved.font),
    "font-heading": getFontFamily(headingFont),
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
  const lightVars = {
    ...(registryTheme.cssVars.light as ThemeVars),
    ...fontVars,
  }
  const darkVars = registryTheme.cssVars.dark as ThemeVars
  const lightCss = formatCssBlock(":root", lightVars)
  const darkCss = formatCssBlock(".dark", darkVars)

  return {
    resolved,
    lightVars,
    darkVars,
    lightCss,
    darkCss,
    combinedCss: `${lightCss}\n\n${darkCss}`,
  }
}
