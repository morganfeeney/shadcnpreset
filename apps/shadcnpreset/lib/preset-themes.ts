import { encodePreset } from "shadcn/preset"

import type { RegistryThemeSurface } from "@/components/preset-theme-surface"
import { getFontDisplayName, type ResolvedPreset } from "@/lib/preset"
import { getPresetThemeCssBundle } from "@/lib/preset-theme-css"
import { iconLibraries, type IconLibraryName } from "@/registry/config"
import { STYLES } from "@/registry/styles"
import { THEMES } from "@/registry/themes"

export type ThemeCorners = "square" | "small" | "medium" | "large"

/**
 * What tells one theme apart from another. The menu accent also changes the
 * CSS (it swaps `--accent` for the primary color) but is not worth a separate
 * theme, so presets that differ only there share one.
 */
export type PresetThemeFields = {
  baseColor: string
  theme: string
  chartColor: string
  corners: ThemeCorners
}

/** A preset's color layer: the part `shadcn apply --only theme` applies. */
export type PresetTheme = {
  slug: string
  name: string
  /** Name plus what tells it apart from same-named themes, for titles. */
  title: string
  /** What tells it apart from same-named themes, e.g. "indigo charts". */
  qualifiers: string[]
  description: string
  details: string
  chips: { label: string; value: string }[]
  /** Short labels for theme cards, e.g. "0.875rem" or "Square", "Indigo charts". */
  meta: { corners: string; charts: string }
  fields: PresetThemeFields
  /** Preset to apply `--only theme` from. */
  code: string
  /** The theme on the default style and fonts, for the live preview. */
  previewCode: string
  /** The community preset the theme was taken from, when there is one. */
  source: { code: string; style: string; font: string; icons: string } | null
  /** For `PresetThemeSurface`. */
  registryTheme: RegistryThemeSurface
  css: string
}

const CORNERS_BY_RADIUS: Record<string, ThemeCorners> = {
  none: "square",
  small: "small",
  default: "medium",
  medium: "medium",
  large: "large",
}

const RADIUS_BY_CORNERS: Record<ThemeCorners, string> = {
  square: "none",
  small: "small",
  medium: "default",
  large: "large",
}

const BASE_TONE: Record<string, string> = {
  neutral: "pure gray",
  stone: "warm gray",
  zinc: "cool gray",
  gray: "blue-gray",
  mauve: "purple-tinted",
  olive: "green-tinted",
  mist: "blue-tinted",
  taupe: "warm",
}

function titleCase(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1)
}

function colorTitle(name: string): string {
  return THEMES.find((theme) => theme.name === name)?.title ?? titleCase(name)
}

export function presetThemeFields(preset: ResolvedPreset): PresetThemeFields {
  return {
    baseColor: preset.baseColor,
    theme: preset.theme,
    chartColor: preset.effectiveChartColor,
    corners: CORNERS_BY_RADIUS[preset.effectiveRadius] ?? "medium",
  }
}

/**
 * Stable, readable slug derived from the fields alone, e.g.
 * `lime-on-mist-indigo-charts-large-corners`. Parts that match the common
 * case (charts in the theme color, medium corners, subtle menus) are left out.
 */
export function presetThemeSlug(fields: PresetThemeFields): string {
  const parts = [
    fields.theme === fields.baseColor
      ? fields.baseColor
      : `${fields.theme}-on-${fields.baseColor}`,
  ]
  if (fields.chartColor !== fields.theme) {
    parts.push(`${fields.chartColor}-charts`)
  }
  if (fields.corners !== "medium") parts.push(`${fields.corners}-corners`)
  return parts.join("-")
}

const SLUG_PATTERN =
  /^([a-z]+)(?:-on-([a-z]+))?(?:-([a-z]+)-charts)?(?:-(square|small|large)-corners)?$/

/**
 * A preset with just these colors on the default style and fonts. Pass the
 * menu accent to match a theme's CSS exactly (it only changes `--accent`).
 */
function presetCodeForFields(
  fields: PresetThemeFields,
  menuAccent: string = "subtle"
): string {
  return encodePreset({
    baseColor: fields.baseColor,
    theme: fields.theme,
    chartColor: fields.chartColor,
    radius: RADIUS_BY_CORNERS[fields.corners],
    menuAccent,
  } as Parameters<typeof encodePreset>[0])
}

function buildPresetTheme(
  code: string,
  fromCommunity: boolean
): PresetTheme | null {
  const bundle = getPresetThemeCssBundle(code)
  if (!bundle) return null

  const { resolved } = bundle
  const fields = presetThemeFields(resolved)
  const base = colorTitle(fields.baseColor)
  const accent =
    fields.theme === fields.baseColor ? null : colorTitle(fields.theme)
  const name = accent ? `${accent} on ${base}` : base
  const chart =
    fields.chartColor === fields.theme ? null : colorTitle(fields.chartColor)
  const corners = `${titleCase(fields.corners)} corners`

  const qualifiers = [
    chart && `${chart.toLowerCase()} charts`,
    fields.corners !== "medium" && corners.toLowerCase(),
  ].filter((part): part is string => Boolean(part))

  const highlights = accent
    ? `${accent} buttons and highlights`
    : "Monochrome buttons and highlights"
  const charts = chart
    ? `${chart.toLowerCase()} charts`
    : "charts in the same hue"

  return {
    slug: presetThemeSlug(fields),
    name,
    title: qualifiers.length ? `${name} (${qualifiers.join(", ")})` : name,
    qualifiers,
    description: `${highlights} on the ${BASE_TONE[fields.baseColor] ?? fields.baseColor} ${base} base, with ${charts} and ${corners.toLowerCase()}.`,
    details: [corners, chart && `${chart} charts`].filter(Boolean).join(" · "),
    meta: {
      corners:
        fields.corners === "square"
          ? "Square"
          : (bundle.registryTheme.cssVars.light as Record<string, string>)
              .radius,
      charts: `${chart ?? accent ?? base} charts`,
    },
    chips: [
      { label: "Base", value: base },
      { label: "Corners", value: titleCase(fields.corners) },
      { label: "Charts", value: chart ?? accent ?? base },
    ],
    fields,
    code: resolved.code,
    previewCode: presetCodeForFields(fields, resolved.menuAccent),
    source: fromCommunity
      ? {
          code: resolved.code,
          style:
            STYLES.find((s) => s.name === resolved.style)?.title ??
            titleCase(resolved.style),
          font: getFontDisplayName(resolved.font),
          icons:
            iconLibraries[resolved.iconLibrary as IconLibraryName]?.title ??
            titleCase(resolved.iconLibrary),
        }
      : null,
    registryTheme: bundle.registryTheme,
    css: bundle.themeOnlyCss,
  }
}

/**
 * The theme a slug describes, or null when the slug is not the canonical
 * spelling of a valid theme. Lets a theme URL keep working after the theme
 * drops out of the most voted community presets.
 */
export function presetThemeFromSlug(slug: string): PresetTheme | null {
  const match = SLUG_PATTERN.exec(slug)
  if (!match) return null
  const [, first, base, chart, corners] = match
  const theme = buildPresetTheme(
    presetCodeForFields({
      baseColor: base ?? first!,
      theme: first!,
      chartColor: chart ?? first!,
      corners: (corners as ThemeCorners | undefined) ?? "medium",
    }),
    false
  )
  return theme?.slug === slug ? theme : null
}

/** What theme lists need from a theme; small enough to send to the client. */
export type PresetThemeSummary = Pick<
  PresetTheme,
  "slug" | "name" | "details" | "code" | "meta"
> & {
  baseColor: string
}

export function presetThemeSummary(theme: PresetTheme): PresetThemeSummary {
  return {
    slug: theme.slug,
    name: theme.name,
    details: theme.details,
    code: theme.code,
    meta: theme.meta,
    baseColor: theme.fields.baseColor,
  }
}

export function presetThemeCommand(
  code: string,
  { fonts = false }: { fonts?: boolean } = {}
): string {
  return `npx shadcn@latest apply --preset ${code} --only ${fonts ? "theme,font" : "theme"}`
}

/**
 * One theme per distinct color layer, in the order the codes are given.
 * Presets that differ only in style, fonts or icons share a theme, so the
 * first (e.g. most voted) preset represents it.
 */
export function toPresetThemes(
  codes: readonly string[],
  limit = Infinity
): PresetTheme[] {
  const themes = new Map<string, PresetTheme>()

  for (const code of codes) {
    if (themes.size >= limit) break
    const theme = buildPresetTheme(code, true)
    if (theme && !themes.has(theme.slug)) themes.set(theme.slug, theme)
  }

  return [...themes.values()]
}
