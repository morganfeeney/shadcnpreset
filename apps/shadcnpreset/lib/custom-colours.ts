import { clampChroma, converter, parse, wcagContrast, type Oklch } from "culori"

import {
  BRAND_TOKENS,
  isUsableColour,
  type BrandColour,
  type BrandToken,
} from "@/lib/brand-theme"
import type { ResolvedPreset } from "@/lib/preset"
import { BASE_COLORS } from "@/registry/base-colors"
import { THEMES } from "@/registry/themes"

type Vars = Record<string, string>
type Mode = "light" | "dark"

/**
 * What makes a preset custom: the three colours shadcn create picks from
 * lists (base colour, theme, chart colour), each optionally one exact colour,
 * plus single tokens someone has set by hand on top.
 */
export type CustomColours = {
  baseColor?: string
  theme?: string
  chartColor?: string
  overrides: Partial<Record<BrandToken, string>>
}

export const CUSTOM_SLOTS = ["baseColor", "theme", "chartColor"] as const
export type CustomSlot = (typeof CUSTOM_SLOTS)[number]

export const NO_CUSTOM_COLOURS: CustomColours = { overrides: {} }

const toOklch = converter("oklch")
const LIGHT_TEXT = "oklch(0.985 0 0)"
const DARK_TEXT = "oklch(0.145 0 0)"
/** WCAG AA for body text. */
const TEXT_CONTRAST = 4.5
/** WCAG AA for large text and UI parts, such as a primary button's fill. */
const UI_CONTRAST = 3

function oklch(colour: string): Oklch | undefined {
  const parsed = parse(colour)
  return parsed ? toOklch(parsed) : undefined
}

function round(value: number | undefined) {
  return Number((value ?? 0).toFixed(3))
}

/** As oklch, with chroma reduced to what an sRGB screen can show. */
function formatOklch(colour: Oklch) {
  const shown = clampChroma(colour, "oklch") as Oklch
  // Rounded down: rounding chroma up can step back out of gamut.
  const c = Math.floor((shown.c ?? 0) * 1000) / 1000
  return `oklch(${round(shown.l)} ${c} ${round(c ? shown.h : 0)})`
}

function contrast(a: string, b: string) {
  const pa = parse(a)
  const pb = parse(b)
  return pa && pb ? wcagContrast(pa, pb) : 0
}

function hueDistance(a = 0, b = 0) {
  const d = Math.abs(a - b) % 360
  return d > 180 ? 360 - d : d
}

/** Text that reads on `fill`: `preferred` when it does, else white or black. */
function textOn(fill: string, preferred?: string) {
  if (preferred && contrast(preferred, fill) >= TEXT_CONTRAST) return preferred
  return contrast(LIGHT_TEXT, fill) >= contrast(DARK_TEXT, fill)
    ? LIGHT_TEXT
    : DARK_TEXT
}

/**
 * `colour` moved away from `against` in lightness, hue and chroma kept, until
 * it reaches `min` contrast with it.
 */
function separate(colour: string, against: string, min: number) {
  const start = oklch(colour)
  if (!start || contrast(colour, against) >= min) return colour
  const direction = (oklch(against)?.l ?? 0) < 0.5 ? 1 : -1
  for (let step = 1; step <= 40; step++) {
    const l = Math.min(1, Math.max(0, start.l + direction * step * 0.0125))
    const candidate = formatOklch({ ...start, l })
    if (contrast(candidate, against) >= min || l === 0 || l === 1) {
      return candidate
    }
  }
  return colour
}

// ---------------------------------------------------------------------------
// Base colour: neutrals tinted with one hue, the way mauve or olive tint grey.

/**
 * How much of the tint each lightness carries, read off shadcn's mauve base:
 * none at white, most in the mid-tones, a little in the darkest greys.
 */
const TINT_BY_LIGHTNESS: [number, number][] = [
  [0, 0],
  [0.145, 0.24],
  [0.212, 0.56],
  [0.263, 0.7],
  [0.364, 0.85],
  [0.435, 0.85],
  [0.542, 1],
  [0.711, 0.56],
  [0.865, 0.35],
  [0.922, 0.15],
  [0.96, 0.09],
  [0.985, 0],
  [1, 0],
]

/** The most tint any neutral gets: about slate's, so greys stay grey. */
const MAX_NEUTRAL_CHROMA = 0.045

function tintAt(l: number) {
  for (let i = 1; i < TINT_BY_LIGHTNESS.length; i++) {
    const [l1, t1] = TINT_BY_LIGHTNESS[i]
    if (l <= l1) {
      const [l0, t0] = TINT_BY_LIGHTNESS[i - 1]
      return t0 + ((t1 - t0) * (l - l0)) / (l1 - l0)
    }
  }
  return 0
}

const NEUTRAL = BASE_COLORS.find((base) => base.name === "neutral")

/** shadcn's neutral base, every grey tinted with `colour`'s hue. */
function baseLayer(colour: string): { light: Vars; dark: Vars } {
  const tint = oklch(colour)
  const peak = Math.min(tint?.c ?? 0, MAX_NEUTRAL_CHROMA)
  const tinted = (vars: Vars): Vars =>
    Object.fromEntries(
      Object.entries(vars).map(([key, value]) => {
        const grey = /^oklch\(([\d.]+) 0 0\)$/.exec(value)
        if (!grey || !tint) return [key, value]
        const l = Number(grey[1])
        return [
          key,
          formatOklch({ mode: "oklch", l, c: peak * tintAt(l), h: tint.h }),
        ]
      })
    )
  return {
    light: tinted(NEUTRAL?.cssVars?.light as Vars),
    dark: tinted(NEUTRAL?.cssVars?.dark as Vars),
  }
}

// ---------------------------------------------------------------------------
// Theme and chart colour: a palette in one hue, from shadcn's closest theme.

const BASE_NAMES = new Set(BASE_COLORS.map((base) => base.name))
const HUED_THEMES = THEMES.filter((theme) => !BASE_NAMES.has(theme.name))

/** The coloured shadcn theme whose primary is nearest `colour` in hue. */
function closestTheme(colour: Oklch) {
  let best = HUED_THEMES[0]
  let bestDistance = Infinity
  for (const theme of HUED_THEMES) {
    const primary = oklch((theme.cssVars?.light as Vars).primary)
    const distance = hueDistance(primary?.h, colour.h)
    if (distance < bestDistance) {
      best = theme
      bestDistance = distance
    }
  }
  return best
}

/**
 * `template`'s colour moved into `colour`'s hue, at the template's lightness,
 * chroma scaled by how colourful `colour` is next to the template's primary.
 */
function rehue(template: string, colour: Oklch, scale: number) {
  const value = oklch(template)
  if (!value || !value.c) return template
  return formatOklch({
    mode: "oklch",
    l: value.l,
    c: value.c * scale,
    h: colour.h,
  })
}

/**
 * A theme layer from one colour: shadcn's closest theme moved into its hue,
 * the colour itself as the primary.
 */
function themeLayer(colour: string): { light: Vars; dark: Vars } | null {
  const value = oklch(colour)
  if (!value) return null
  const template = closestTheme(value)
  const templatePrimary = oklch((template.cssVars?.light as Vars).primary)
  const scale = templatePrimary?.c ? value.c / templatePrimary.c : 1
  const layer = (vars: Vars): Vars => {
    const out: Vars = {}
    for (const [key, v] of Object.entries(vars))
      out[key] = rehue(v, value, scale)
    out.primary = colour
    out["primary-foreground"] = textOn(colour, out["primary-foreground"])
    out["sidebar-primary-foreground"] = textOn(
      out["sidebar-primary"],
      out["sidebar-primary-foreground"]
    )
    return out
  }
  return {
    light: layer(template.cssVars?.light as Vars),
    dark: layer(template.cssVars?.dark as Vars),
  }
}

/** Five chart shades in one hue, the given colour as the nearest of them. */
function chartLayer(colour: string): Vars | null {
  const value = oklch(colour)
  if (!value) return null
  const template = closestTheme(value)
  const templatePrimary = oklch((template.cssVars?.light as Vars).primary)
  const scale = templatePrimary?.c ? value.c / templatePrimary.c : 1
  const charts: Vars = {}
  let nearest = 1
  for (let i = 1; i <= 5; i++) {
    const shade = (template.cssVars?.light as Vars)[`chart-${i}`]
    charts[`chart-${i}`] = rehue(shade, value, scale)
    const distance = (l?: number) => Math.abs((l ?? 0) - value.l)
    if (
      distance(oklch(shade)?.l) <
      distance(oklch((template.cssVars?.light as Vars)[`chart-${nearest}`])?.l)
    ) {
      nearest = i
    }
  }
  charts[`chart-${nearest}`] = colour
  return charts
}

// ---------------------------------------------------------------------------

/** Which tokens a hand-set colour sets. */
const OVERRIDE_TARGETS: Record<BrandToken, string[]> = {
  background: ["background", "sidebar"],
  foreground: [
    "foreground",
    "card-foreground",
    "popover-foreground",
    "sidebar-foreground",
  ],
  card: ["card", "popover"],
  primary: ["primary", "ring", "sidebar-primary"],
  secondary: ["secondary"],
  accent: ["accent", "sidebar-accent"],
  muted: ["muted"],
  border: ["border", "input", "sidebar-border"],
  "primary-foreground": ["primary-foreground", "sidebar-primary-foreground"],
  "secondary-foreground": ["secondary-foreground"],
  "accent-foreground": ["accent-foreground", "sidebar-accent-foreground"],
  "muted-foreground": ["muted-foreground"],
  "card-foreground": ["card-foreground", "popover-foreground"],
  destructive: ["destructive"],
  // After primary, which sets it too, so one set by hand wins.
  ring: ["ring", "sidebar-ring"],
  "chart-1": ["chart-1"],
  "chart-2": ["chart-2"],
  "chart-3": ["chart-3"],
  "chart-4": ["chart-4"],
  "chart-5": ["chart-5"],
}

/** Surfaces and page text belong to one mode: a #141414 background is dark. */
const ONE_MODE = new Set<BrandToken>([
  "background",
  "card",
  "muted",
  "border",
  "foreground",
])

export type CustomTheme = {
  light: Vars
  dark: Vars
  /** What was changed from the colours given, so it can be said plainly. */
  adjustments: string[]
  /** Text below 4.5:1 that hand-set colours put there, kept as set. */
  lowContrast: { mode: Mode; pair: string; ratio: number }[]
}

/**
 * The colour layer of a preset with its custom colours, built the way shadcn
 * builds a preset's: base colour, then theme, then chart colour, then the
 * menu accent and radius. A custom colour stands in for the list choice it
 * replaces; overrides go on last, each to the tokens it names.
 */
export function buildCustomTheme(
  preset: Pick<
    ResolvedPreset,
    "baseColor" | "theme" | "effectiveChartColor" | "menuAccent"
  > & { radius: string | undefined },
  custom: CustomColours
): CustomTheme {
  const byName = (name: string) => THEMES.find((theme) => theme.name === name)
  const adjustments: string[] = []

  const base = custom.baseColor
    ? baseLayer(custom.baseColor)
    : {
        light: byName(preset.baseColor)?.cssVars?.light as Vars,
        dark: byName(preset.baseColor)?.cssVars?.dark as Vars,
      }
  const light: Vars = { ...base.light }
  const dark: Vars = { ...base.dark }

  // A neutral theme is the base's own primary, so a custom base keeps it.
  const neutralTheme = BASE_NAMES.has(preset.theme)
  const theme = custom.theme
    ? themeLayer(custom.theme)
    : custom.baseColor && neutralTheme
      ? null
      : {
          light: byName(preset.theme)?.cssVars?.light as Vars,
          dark: byName(preset.theme)?.cssVars?.dark as Vars,
        }
  Object.assign(light, theme?.light)
  Object.assign(dark, theme?.dark)

  // Neutral charts are the base's own greys too, so a custom base keeps them.
  const charts = custom.chartColor
    ? {
        light: chartLayer(custom.chartColor),
        dark: chartLayer(custom.chartColor),
      }
    : custom.baseColor && BASE_NAMES.has(preset.effectiveChartColor)
      ? base
      : {
          light: byName(preset.effectiveChartColor)?.cssVars?.light as Vars,
          dark: byName(preset.effectiveChartColor)?.cssVars?.dark as Vars,
        }
  for (let i = 1; i <= 5; i++) {
    const key = `chart-${i}`
    if (charts.light?.[key]) light[key] = charts.light[key]
    if (charts.dark?.[key]) dark[key] = charts.dark[key]
  }

  // Not for a primary set by hand, which replaces this one anyway.
  if (
    custom.theme &&
    !custom.overrides.primary &&
    contrast(dark.primary, dark.background) < UI_CONTRAST
  ) {
    dark.primary = separate(dark.primary, dark.background, UI_CONTRAST)
    dark["primary-foreground"] = textOn(
      dark.primary,
      dark["primary-foreground"]
    )
    adjustments.push(
      `Primary is lighter in dark mode (${dark.primary}) so it stands out from the dark background.`
    )
  }

  const given = { light: new Set<string>(), dark: new Set<string>() }
  for (const token of BRAND_TOKENS) {
    const colour = custom.overrides[token]
    if (!colour || !isUsableColour(colour)) continue
    const modes: Mode[] = ONE_MODE.has(token)
      ? [
          (oklch(colour)?.l ?? 0) < 0.5 !== (token === "foreground")
            ? "dark"
            : "light",
        ]
      : ["light", "dark"]
    for (const m of modes) {
      for (const target of OVERRIDE_TARGETS[token]) {
        ;(m === "light" ? light : dark)[target] = colour
        given[m].add(target)
      }
    }
  }

  const lowContrast: CustomTheme["lowContrast"] = []
  for (const [m, vars] of [
    ["light", light],
    ["dark", dark],
  ] as const) {
    // Text on a colour someone changed is picked to read on it.
    for (const fill of ["primary", "secondary", "accent"]) {
      const fg = `${fill}-foreground`
      if (given[m].has(fill) && !given[m].has(fg)) {
        vars[fg] = textOn(vars[fill], vars[fg])
      }
    }
    for (const [fg, bg] of [
      ["foreground", "background"],
      ["primary-foreground", "primary"],
      ["muted-foreground", "background"],
    ]) {
      const ratio = contrast(vars[fg], vars[bg])
      if (ratio < TEXT_CONTRAST && (given[m].has(fg) || given[m].has(bg))) {
        lowContrast.push({
          mode: m,
          pair: `${fg} on ${bg}`,
          ratio: round(ratio),
        })
      }
    }
  }

  if (preset.menuAccent === "bold") {
    for (const vars of [light, dark]) {
      vars.accent = vars.primary
      vars["accent-foreground"] = vars["primary-foreground"]
    }
  }
  if (preset.radius) {
    light.radius = preset.radius
    dark.radius = preset.radius
  }

  return { light, dark, adjustments, lowContrast }
}

/**
 * The colours someone gave in a message, sorted into what a custom preset
 * holds: the main colour as the theme, a second unnamed one as the chart
 * colour, and anything named for a token as an override of it.
 */
export function customColoursFrom(colours: BrandColour[]): CustomColours {
  const custom: CustomColours = { overrides: {} }
  const unnamed: string[] = []
  for (const { colour, token } of colours) {
    if (token === "primary" && !custom.theme) custom.theme = colour
    else if (token && token !== "primary") custom.overrides[token] ??= colour
    else if (!token) unnamed.push(colour)
  }
  if (!custom.theme) custom.theme = unnamed.shift()
  custom.chartColor = unnamed.shift()
  return custom
}

/** Stored colours as they are now, or as the first version kept them. */
export function readStoredColours(json: string): CustomColours {
  const value: unknown = JSON.parse(json)
  if (Array.isArray(value)) return customColoursFrom(value as BrandColour[])
  const stored = value as Partial<CustomColours>
  return { ...stored, overrides: stored.overrides ?? {} }
}
