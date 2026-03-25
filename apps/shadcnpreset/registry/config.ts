import { iconLibraries, type IconLibrary, type IconLibraryName } from "shadcn/icons"

import { FONTS } from "@/app/(create)/lib/fonts"
import { BASE_COLORS, type BaseColor } from "@/registry/base-colors"
import { BASES, type Base } from "@/registry/bases"
import { STYLES, type Style } from "@/registry/styles"
import { THEMES, type Theme } from "@/registry/themes"

export { BASES, type Base }
export { STYLES, type Style }
export { THEMES, type Theme }
export { BASE_COLORS, type BaseColor }
export { iconLibraries, type IconLibrary, type IconLibraryName }

export type BaseName = Base["name"]
export type StyleName = Style["name"]
export type ThemeName = Theme["name"]
export type BaseColorName = BaseColor["name"]
export type ChartColorName = Theme["name"]
export type FontValue = (typeof FONTS)[number]["value"]
export type FontHeadingValue = "inherit" | FontValue

export const MENU_ACCENTS = [
  { value: "subtle", label: "Subtle" },
  { value: "bold", label: "Bold" },
] as const

export type MenuAccent = (typeof MENU_ACCENTS)[number]
export type MenuAccentValue = MenuAccent["value"]

export const MENU_COLORS = [
  { value: "default", label: "Default" },
  { value: "inverted", label: "Inverted" },
  { value: "default-translucent", label: "Default Translucent" },
  { value: "inverted-translucent", label: "Inverted Translucent" },
] as const

export type MenuColor = (typeof MENU_COLORS)[number]
export type MenuColorValue = MenuColor["value"]

export const RADII = [
  { name: "default", label: "Default", value: "" },
  { name: "none", label: "None", value: "0" },
  { name: "small", label: "Small", value: "0.45rem" },
  { name: "medium", label: "Medium", value: "0.625rem" },
  { name: "large", label: "Large", value: "0.875rem" },
] as const

export type Radius = (typeof RADII)[number]
export type RadiusValue = Radius["name"]

export type DesignSystemConfig = {
  base: BaseName
  style: StyleName
  baseColor: BaseColorName
  theme: ThemeName
  chartColor: ChartColorName
  iconLibrary: IconLibraryName
  font: FontValue
  fontHeading: FontHeadingValue
  item?: string
  rtl: boolean
  menuAccent: MenuAccentValue
  menuColor: MenuColorValue
  radius: RadiusValue
  template?:
    | "next"
    | "next-monorepo"
    | "start"
    | "react-router"
    | "vite"
    | "vite-monorepo"
    | "react-router-monorepo"
    | "start-monorepo"
    | "astro"
    | "astro-monorepo"
    | "laravel"
}

export const DEFAULT_CONFIG: DesignSystemConfig = {
  base: "radix",
  style: "nova",
  baseColor: "neutral",
  theme: "neutral",
  chartColor: "neutral",
  iconLibrary: "lucide",
  font: "inter",
  fontHeading: "inherit",
  item: "preview",
  rtl: false,
  menuAccent: "subtle",
  menuColor: "default",
  radius: "default",
  template: "next",
}

export type Preset = {
  name: string
  title: string
  description: string
} & DesignSystemConfig

export const PRESETS: Preset[] = STYLES.map((style) => ({
  ...DEFAULT_CONFIG,
  name: `${DEFAULT_CONFIG.base}-${style.name}`,
  title: `${style.title} (${DEFAULT_CONFIG.base})`,
  description: `${style.title} preset`,
  style: style.name,
}))

export function getThemesForBaseColor(baseColorName: string) {
  const baseColorNames = BASE_COLORS.map((bc) => bc.name)

  return THEMES.filter((theme) => {
    if (theme.name === baseColorName) {
      return true
    }

    return !baseColorNames.includes(theme.name)
  })
}

export function getTheme(name: ThemeName) {
  return THEMES.find((theme) => theme.name === name)
}

export function getBaseColor(name: BaseColorName) {
  return BASE_COLORS.find((color) => color.name === name)
}

export function buildRegistryTheme(config: DesignSystemConfig) {
  const baseColor = getBaseColor(config.baseColor)
  const theme = getTheme(config.theme)

  if (!baseColor || !theme) {
    throw new Error(
      `Base color "${config.baseColor}" or theme "${config.theme}" not found`
    )
  }

  const lightVars: Record<string, string> = {
    ...(baseColor.cssVars?.light as Record<string, string>),
    ...(theme.cssVars?.light as Record<string, string>),
  }
  const darkVars: Record<string, string> = {
    ...(baseColor.cssVars?.dark as Record<string, string>),
    ...(theme.cssVars?.dark as Record<string, string>),
  }

  const chartTheme = getTheme(config.chartColor)
  if (chartTheme) {
    const chartLight = chartTheme.cssVars?.light as Record<string, string>
    const chartDark = chartTheme.cssVars?.dark as Record<string, string>

    for (let i = 1; i <= 5; i++) {
      const key = `chart-${i}`
      if (chartLight?.[key]) lightVars[key] = chartLight[key]
      if (chartDark?.[key]) darkVars[key] = chartDark[key]
    }
  }

  if (config.menuAccent === "bold") {
    lightVars.accent = lightVars.primary
    lightVars["accent-foreground"] = lightVars["primary-foreground"]
    darkVars.accent = darkVars.primary
    darkVars["accent-foreground"] = darkVars["primary-foreground"]
  }

  if (config.radius && config.radius !== "default") {
    const radius = RADII.find((item) => item.name === config.radius)
    if (radius && radius.value) {
      lightVars.radius = radius.value
    }
  }

  return {
    name: `${config.baseColor}-${config.theme}`,
    type: "registry:theme" as const,
    cssVars: {
      light: lightVars,
      dark: darkVars,
    },
  }
}
