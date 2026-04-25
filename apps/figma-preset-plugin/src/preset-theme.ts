import { converter, parse } from "culori"
import {
  decodePreset,
  encodePreset,
  V1_CHART_COLOR_MAP,
  type PresetConfig,
} from "shadcn/preset"

import { THEMES } from "../../v4/registry/themes"

type ThemeVars = Record<string, string>

type ThemeDefinition = {
  name: string
  cssVars?: {
    light?: ThemeVars
    dark?: ThemeVars
  }
}

type VariableColorPayload = {
  name: string
  light: RGBA
  dark: RGBA
}

type VariableStringPayload = {
  name: string
  value: string
}

export type GeneratedVariablePayload = {
  collectionName: string
  presetCode: string
  summary: string
  colors: VariableColorPayload[]
  strings: VariableStringPayload[]
}

const DEFAULT_PRESET: Required<
  Pick<
    PresetConfig,
    "baseColor" | "theme" | "chartColor" | "font" | "fontHeading" | "radius"
  >
> = {
  baseColor: "neutral",
  theme: "neutral",
  chartColor: "neutral",
  font: "inter",
  fontHeading: "inherit",
  radius: "default",
}

const RADIUS_VALUES: Record<PresetConfig["radius"], string | undefined> = {
  default: undefined,
  none: "0",
  small: "0.45rem",
  medium: "0.625rem",
  large: "0.875rem",
}

const TOKEN_ORDER = [
  "background",
  "foreground",
  "card",
  "card-foreground",
  "popover",
  "popover-foreground",
  "primary",
  "primary-foreground",
  "secondary",
  "secondary-foreground",
  "muted",
  "muted-foreground",
  "accent",
  "accent-foreground",
  "destructive",
  "border",
  "input",
  "ring",
  "chart-1",
  "chart-2",
  "chart-3",
  "chart-4",
  "chart-5",
  "sidebar",
  "sidebar-foreground",
  "sidebar-primary",
  "sidebar-primary-foreground",
  "sidebar-accent",
  "sidebar-accent-foreground",
  "sidebar-border",
  "sidebar-ring",
]

const toRgb = converter("rgb")
const themeDefinitions = THEMES as ThemeDefinition[]

function getTheme(name: string) {
  return themeDefinitions.find((theme) => theme.name === name) ?? null
}

function resolvePresetFromCode(code: string) {
  const decoded = decodePreset(code)

  if (!decoded || encodePreset(decoded) !== code) {
    return null
  }

  const effectiveChartColor =
    decoded.chartColor ??
    (V1_CHART_COLOR_MAP[decoded.theme] as PresetConfig["theme"] | undefined) ??
    decoded.theme
  const effectiveRadius =
    decoded.style === "lyra"
      ? ("none" as const)
      : (decoded.radius as PresetConfig["radius"])

  return {
    ...decoded,
    code,
    effectiveChartColor,
    effectiveRadius,
  }
}

function ensureThemeName(name: string, fallback: PresetConfig["theme"]) {
  return getTheme(name)?.name ?? fallback
}

function buildThemeVars(config: {
  baseColor: string
  theme: string
  chartColor: string
  menuAccent: PresetConfig["menuAccent"]
  radius: PresetConfig["radius"]
}) {
  const baseTheme = getTheme(config.baseColor)
  const accentTheme = getTheme(config.theme)
  const chartTheme = getTheme(config.chartColor)

  const lightVars: ThemeVars = {
    ...(baseTheme?.cssVars?.light ?? {}),
    ...(accentTheme?.cssVars?.light ?? {}),
  }
  const darkVars: ThemeVars = {
    ...(baseTheme?.cssVars?.dark ?? {}),
    ...(accentTheme?.cssVars?.dark ?? {}),
  }

  for (let index = 1; index <= 5; index++) {
    const key = `chart-${index}`
    const chartLight = chartTheme?.cssVars?.light?.[key]
    const chartDark = chartTheme?.cssVars?.dark?.[key]

    if (chartLight) lightVars[key] = chartLight
    if (chartDark) darkVars[key] = chartDark
  }

  if (config.menuAccent === "bold") {
    lightVars.accent = lightVars.primary
    lightVars["accent-foreground"] = lightVars["primary-foreground"]
    darkVars.accent = darkVars.primary
    darkVars["accent-foreground"] = darkVars["primary-foreground"]
  }

  const resolvedRadius =
    RADIUS_VALUES[config.radius] ?? lightVars.radius ?? darkVars.radius

  if (resolvedRadius) {
    lightVars.radius = resolvedRadius
    darkVars.radius = resolvedRadius
  }

  return { lightVars, darkVars }
}

function cssColorToRgba(input: string): RGBA {
  const color = toRgb(parse(input))

  if (!color || color.r == null || color.g == null || color.b == null) {
    throw new Error(`Could not convert color "${input}" to RGB.`)
  }

  return {
    r: Math.max(0, Math.min(1, color.r)),
    g: Math.max(0, Math.min(1, color.g)),
    b: Math.max(0, Math.min(1, color.b)),
    a: Math.max(0, Math.min(1, color.alpha ?? 1)),
  }
}

function titleCase(value: string) {
  return value
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ")
}

function sortTokens(tokens: string[]) {
  const ordered = TOKEN_ORDER.filter((token) => tokens.includes(token))
  const extras = tokens
    .filter((token) => !TOKEN_ORDER.includes(token))
    .sort((left, right) => left.localeCompare(right))

  return [...ordered, ...extras]
}

export function generateVariablePayload(
  presetCode: string,
  requestedCollectionName?: string
): GeneratedVariablePayload {
  const resolved = resolvePresetFromCode(presetCode.trim())

  if (!resolved) {
    throw new Error("Invalid or non-canonical preset code.")
  }

  const baseColor = ensureThemeName(
    resolved.baseColor,
    DEFAULT_PRESET.baseColor
  )
  const theme = ensureThemeName(resolved.theme, DEFAULT_PRESET.theme)
  const chartColor = ensureThemeName(
    resolved.effectiveChartColor,
    DEFAULT_PRESET.chartColor
  )
  const { lightVars, darkVars } = buildThemeVars({
    baseColor,
    theme,
    chartColor,
    menuAccent: resolved.menuAccent,
    radius: resolved.effectiveRadius,
  })

  const colorTokens = sortTokens(
    Array.from(
      new Set([...Object.keys(lightVars), ...Object.keys(darkVars)])
    ).filter((token) => token !== "radius")
  )

  const colors = colorTokens.map((token) => {
    const light = lightVars[token]
    const dark = darkVars[token] ?? light

    if (!light) {
      throw new Error(
        `Missing light token "${token}" for preset ${presetCode}.`
      )
    }

    return {
      name: `color/${token}`,
      light: cssColorToRgba(light),
      dark: cssColorToRgba(dark),
    }
  })

  const strings: VariableStringPayload[] = [
    { name: "meta/preset-code", value: resolved.code },
    { name: "meta/style", value: resolved.style },
    { name: "meta/base-color", value: resolved.baseColor },
    { name: "meta/theme", value: resolved.theme },
    { name: "meta/chart-color", value: resolved.effectiveChartColor },
    { name: "meta/icon-library", value: resolved.iconLibrary },
    { name: "meta/menu-accent", value: resolved.menuAccent },
    { name: "meta/menu-color", value: resolved.menuColor },
    { name: "font/body", value: titleCase(resolved.font) },
    {
      name: "font/heading",
      value:
        resolved.fontHeading === "inherit"
          ? titleCase(resolved.font)
          : titleCase(resolved.fontHeading),
    },
    {
      name: "radius/css",
      value: lightVars.radius ?? darkVars.radius ?? "0.625rem",
    },
  ]

  return {
    collectionName:
      requestedCollectionName?.trim() || `Shadcn Preset/${resolved.code}`,
    presetCode: resolved.code,
    summary: `${resolved.style} • ${resolved.baseColor}/${resolved.theme} • ${resolved.effectiveChartColor}`,
    colors,
    strings,
  }
}
