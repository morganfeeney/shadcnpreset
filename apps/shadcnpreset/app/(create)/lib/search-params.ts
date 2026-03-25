"use client"

import * as React from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"

import { FONTS } from "@/app/(create)/lib/fonts"
import {
  BASE_COLORS,
  BASES,
  DEFAULT_CONFIG,
  getThemesForBaseColor,
  iconLibraries,
  MENU_ACCENTS,
  MENU_COLORS,
  RADII,
  STYLES,
  type BaseColorName,
  type BaseName,
  type ChartColorName,
  type FontHeadingValue,
  type FontValue,
  type IconLibraryName,
  type MenuAccentValue,
  type MenuColorValue,
  type RadiusValue,
  type StyleName,
  type ThemeName,
} from "@/registry/config"

type Options = {
  history?: "push" | "replace"
}

type UseOptions = {
  shallow?: boolean
  history?: "push" | "replace"
}

export type DesignSystemSearchParams = {
  preset: string
  base: BaseName
  item: string
  iconLibrary: IconLibraryName
  style: StyleName
  theme: ThemeName
  chartColor: ChartColorName
  font: FontValue
  fontHeading: FontHeadingValue
  baseColor: BaseColorName
  menuAccent: MenuAccentValue
  menuColor: MenuColorValue
  radius: RadiusValue
  template:
    | "next"
    | "next-monorepo"
    | "start"
    | "next-monorepo"
    | "react-router"
    | "react-router-monorepo"
    | "vite"
    | "vite-monorepo"
    | "astro"
    | "astro-monorepo"
    | "laravel"
  rtl: boolean
  size: number
  custom: boolean
}

const STYLE_NAMES = new Set(STYLES.map((item) => item.name))
const BASE_COLOR_NAMES = new Set(BASE_COLORS.map((item) => item.name))
const BASE_NAMES = new Set(BASES.map((item) => item.name))
const FONT_VALUES = new Set(FONTS.map((item) => item.value))
const ICON_NAMES = new Set(Object.values(iconLibraries).map((item) => item.name))
const MENU_ACCENT_VALUES = new Set(MENU_ACCENTS.map((item) => item.value))
const MENU_COLOR_VALUES = new Set(MENU_COLORS.map((item) => item.value))
const RADIUS_VALUES = new Set(RADII.map((item) => item.name))

const TEMPLATE_VALUES = new Set([
  "next",
  "next-monorepo",
  "start",
  "start-monorepo",
  "react-router",
  "react-router-monorepo",
  "vite",
  "vite-monorepo",
  "astro",
  "astro-monorepo",
  "laravel",
])

function parseBoolean(value: string | null, fallback: boolean) {
  if (value === null) {
    return fallback
  }

  return value === "true"
}

function parseNumber(value: string | null, fallback: number) {
  const parsed = Number.parseInt(value ?? "", 10)
  return Number.isFinite(parsed) ? parsed : fallback
}

function normalizeFontHeading(
  font: FontValue,
  fontHeading: FontHeadingValue
): FontHeadingValue {
  return fontHeading === font ? "inherit" : fontHeading
}

export function isTranslucentMenuColor(
  menuColor?: MenuColorValue | null
): menuColor is "default-translucent" | "inverted-translucent" {
  return (
    menuColor === "default-translucent" || menuColor === "inverted-translucent"
  )
}

function normalizeParams(
  params: DesignSystemSearchParams
): DesignSystemSearchParams {
  const normalized: DesignSystemSearchParams = {
    ...params,
    fontHeading: normalizeFontHeading(params.font, params.fontHeading),
  }

  const availableThemes = getThemesForBaseColor(normalized.baseColor)
  const availableThemeNames = new Set(availableThemes.map((theme) => theme.name))

  if (!availableThemeNames.has(normalized.theme)) {
    normalized.theme = (availableThemes[0]?.name ??
      normalized.baseColor) as ThemeName
  }

  if (!availableThemeNames.has(normalized.chartColor)) {
    normalized.chartColor = (availableThemes[0]?.name ??
      normalized.baseColor) as ChartColorName
  }

  if (
    normalized.menuAccent === "bold" &&
    isTranslucentMenuColor(normalized.menuColor)
  ) {
    normalized.menuAccent = "subtle"
  }

  return normalized
}

function readParams(searchParams: URLSearchParams): DesignSystemSearchParams {
  const base = searchParams.get("base")
  const style = searchParams.get("style")
  const baseColor = searchParams.get("baseColor")
  const font = searchParams.get("font")
  const fontHeading = searchParams.get("fontHeading")
  const iconLibrary = searchParams.get("iconLibrary")
  const menuAccent = searchParams.get("menuAccent")
  const menuColor = searchParams.get("menuColor")
  const radius = searchParams.get("radius")
  const template = searchParams.get("template")

  const parsedBase = (
    base && BASE_NAMES.has(base as BaseName) ? base : DEFAULT_CONFIG.base
  ) as BaseName
  const parsedStyle = (
    style && STYLE_NAMES.has(style as StyleName) ? style : DEFAULT_CONFIG.style
  ) as StyleName
  const parsedBaseColor = (
    baseColor && BASE_COLOR_NAMES.has(baseColor as BaseColorName)
      ? baseColor
      : DEFAULT_CONFIG.baseColor
  ) as BaseColorName
  const availableThemes = getThemesForBaseColor(parsedBaseColor)
  const availableThemeNames = new Set(availableThemes.map((theme) => theme.name))

  const parsedTheme = (
    searchParams.get("theme") && availableThemeNames.has(searchParams.get("theme") as ThemeName)
      ? searchParams.get("theme")
      : DEFAULT_CONFIG.theme
  ) as ThemeName

  const parsedChartColor = (
    searchParams.get("chartColor") &&
    availableThemeNames.has(searchParams.get("chartColor") as ChartColorName)
      ? searchParams.get("chartColor")
      : DEFAULT_CONFIG.chartColor
  ) as ChartColorName

  const parsedFont = (
    font && FONT_VALUES.has(font as FontValue) ? font : DEFAULT_CONFIG.font
  ) as FontValue

  const parsedFontHeading = (
    fontHeading &&
    (fontHeading === "inherit" || FONT_VALUES.has(fontHeading as FontValue))
      ? fontHeading
      : DEFAULT_CONFIG.fontHeading
  ) as FontHeadingValue

  const parsedIconLibrary = (
    iconLibrary && ICON_NAMES.has(iconLibrary as IconLibraryName)
      ? iconLibrary
      : DEFAULT_CONFIG.iconLibrary
  ) as IconLibraryName

  const parsedMenuAccent = (
    menuAccent && MENU_ACCENT_VALUES.has(menuAccent as MenuAccentValue)
      ? menuAccent
      : DEFAULT_CONFIG.menuAccent
  ) as MenuAccentValue

  const parsedMenuColor = (
    menuColor && MENU_COLOR_VALUES.has(menuColor as MenuColorValue)
      ? menuColor
      : DEFAULT_CONFIG.menuColor
  ) as MenuColorValue

  const parsedRadius = (
    radius && RADIUS_VALUES.has(radius as RadiusValue)
      ? radius
      : DEFAULT_CONFIG.radius
  ) as RadiusValue

  const parsedTemplate = (
    template && TEMPLATE_VALUES.has(template) ? template : DEFAULT_CONFIG.template
  ) as DesignSystemSearchParams["template"]

  return normalizeParams({
    preset: searchParams.get("preset") ?? "b0",
    base: parsedBase,
    item: searchParams.get("item") ?? "preview",
    iconLibrary: parsedIconLibrary,
    style: parsedStyle,
    theme: parsedTheme,
    chartColor: parsedChartColor,
    font: parsedFont,
    fontHeading: parsedFontHeading,
    baseColor: parsedBaseColor,
    menuAccent: parsedMenuAccent,
    menuColor: parsedMenuColor,
    radius: parsedRadius,
    template: parsedTemplate,
    rtl: parseBoolean(searchParams.get("rtl"), false),
    size: parseNumber(searchParams.get("size"), 100),
    custom: parseBoolean(searchParams.get("custom"), false),
  })
}

function writeParams(searchParams: URLSearchParams, params: DesignSystemSearchParams) {
  searchParams.set("preset", params.preset)
  searchParams.set("base", params.base)
  searchParams.set("item", params.item)
  searchParams.set("iconLibrary", params.iconLibrary)
  searchParams.set("style", params.style)
  searchParams.set("theme", params.theme)
  searchParams.set("chartColor", params.chartColor)
  searchParams.set("font", params.font)
  searchParams.set("fontHeading", params.fontHeading)
  searchParams.set("baseColor", params.baseColor)
  searchParams.set("menuAccent", params.menuAccent)
  searchParams.set("menuColor", params.menuColor)
  searchParams.set("radius", params.radius)
  searchParams.set("template", params.template)
  searchParams.set("rtl", String(params.rtl))
  searchParams.set("size", String(params.size))
  searchParams.set("custom", String(params.custom))
}

export function useDesignSystemSearchParams(options: UseOptions = {}) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const params = React.useMemo(
    () => readParams(new URLSearchParams(searchParams.toString())),
    [searchParams]
  )

  const setParams = React.useCallback(
    (
      updates:
        | Partial<DesignSystemSearchParams>
        | ((old: DesignSystemSearchParams) => Partial<DesignSystemSearchParams>),
      setOptions?: Options
    ) => {
      const resolvedUpdates =
        typeof updates === "function" ? updates(params) : updates
      const nextParams = normalizeParams({
        ...params,
        ...resolvedUpdates,
      })

      const nextSearchParams = new URLSearchParams(searchParams.toString())
      writeParams(nextSearchParams, nextParams)

      const href = `${pathname}?${nextSearchParams.toString()}`
      const method =
        setOptions?.history === "replace" || options.history === "replace"
          ? router.replace
          : router.push
      method(href)
    },
    [options.history, params, pathname, router, searchParams]
  )

  return [params, setParams] as const
}
