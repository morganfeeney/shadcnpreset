import { BRAND_TOKENS, isUsableColour } from "@/lib/brand-theme"
import { PRESET_FILTER_OPTIONS } from "@/lib/preset-catalog"
import {
  editReply,
  type CustomPresetEdit,
} from "@/lib/search/assistant/custom-preset-edit"

/**
 * A theme pasted as CSS custom properties, read as written rather than by the
 * model: each colour a custom preset holds goes in exactly as given, and the
 * rest is named as left out. Nothing is guessed, so it is no generation.
 */
export type PastedTheme = {
  edit: CustomPresetEdit
  /** Properties given that a custom preset has no place for. */
  leftOut: string[]
  /** `.dark` gave its own values for parts the light ones already set. */
  darkLeftOut: boolean
}

/** shadcn's corners, as the rem its `--radius` is for each. */
const RADIUS_REM = { none: 0, small: 0.45, default: 0.625, large: 0.875 }

const TOKENS = new Set<string>(BRAND_TOKENS)

type Declarations = Map<string, string>

/** The pasted theme, or null for a message that isn't one. */
export function readPastedTheme(text: string): PastedTheme | null {
  const { light, dark } = readBlocks(text.replace(/\/\*[\s\S]*?\*\//g, ""))
  const names = new Set([...light.keys(), ...dark.keys()])
  const themed = [...names].some(
    (name) => TOKENS.has(name) || name === "radius" || name.startsWith("font-")
  )
  if (names.size < 2 || !themed) return null

  const used = new Set<string>()
  const resolve = (value: string, scope: Declarations, depth = 0): string =>
    depth > 5
      ? value
      : value.replace(
          /var\(\s*--([\w-]+)\s*(?:,\s*([^)]*))?\)/g,
          (whole, name: string, fallback?: string) => {
            const found = scope.get(name) ?? light.get(name)
            if (found === undefined) return fallback?.trim() || whole
            used.add(name)
            return resolve(found, scope, depth + 1)
          }
        )
  const colourOf = (name: string, scope: Declarations) => {
    const given = scope.get(name)
    if (given === undefined) return null
    const colour = asColour(resolve(given, scope))
    return isUsableColour(colour) ? colour : null
  }

  const edit: CustomPresetEdit = {
    assistantMessage: "",
    style: null,
    font: null,
    fontHeading: null,
    iconLibrary: null,
    radius: null,
    baseColor: null,
    theme: null,
    chartColor: null,
    overrides: [],
    removeOverrides: [],
    notChanged: [],
  }

  let darkLeftOut = false
  for (const token of BRAND_TOKENS) {
    const fromLight = colourOf(token, light)
    const colour = fromLight ?? colourOf(token, dark)
    if (!colour) continue
    edit.overrides.push({ token, colour })
    used.add(token)
    if (fromLight && dark.has(token)) darkLeftOut = true
  }

  const radius = light.get("radius") ?? dark.get("radius")
  const corners = radius ? nearestRadius(resolve(radius, light)) : null
  if (corners) {
    edit.radius = corners as CustomPresetEdit["radius"]
    used.add("radius")
  }

  const font = listedFont(light.get("font-sans"), PRESET_FILTER_OPTIONS.fonts)
  if (font) {
    edit.font = font as CustomPresetEdit["font"]
    used.add("font-sans")
  }
  const heading = listedFont(
    light.get("font-heading"),
    PRESET_FILTER_OPTIONS.fontHeadings
  )
  if (heading) {
    edit.fontHeading = heading as CustomPresetEdit["fontHeading"]
    used.add("font-heading")
  }

  // Tailwind's `--color-primary: var(--primary)` and the like only pass a
  // value on: they are plumbing, not something left out.
  const plumbing = (name: string) =>
    /^(color|font|radius)-/.test(name) &&
    /^var\(--[\w-]+\)$/.test((light.get(name) ?? dark.get(name) ?? "").trim())
  const leftOut = [...names].filter(
    (name) => !used.has(name) && !plumbing(name)
  )

  return { edit, leftOut, darkLeftOut }
}

/**
 * Parts a preset colours from another, as `buildCustomTheme` does: given
 * their own value, it isn't kept, but they aren't missing either.
 */
const FOLLOWS: Record<string, string> = {
  input: "border",
  popover: "card",
  "popover-foreground": "card text",
  sidebar: "background",
  "sidebar-foreground": "foreground",
  "sidebar-primary": "primary",
  "sidebar-primary-foreground": "primary text",
  "sidebar-accent": "accent",
  "sidebar-accent-foreground": "accent text",
  "sidebar-border": "border",
  "sidebar-ring": "ring",
}

/**
 * The reply to a pasted theme: what changed, which parts take their colour
 * from another, and what a preset has no setting for.
 */
export function pastedThemeReply(
  changed: string[],
  pasted: PastedTheme,
  already = false
) {
  if (!changed.length) return editReply(changed, pasted.edit, already)
  const notes: string[] = [editReply(changed, pasted.edit)]
  const following = pasted.leftOut.filter((name) => FOLLOWS[name])
  const unset = pasted.leftOut.filter((name) => !FOLLOWS[name])
  if (following.length) {
    const sources = [...new Set(following.map((name) => FOLLOWS[name]!))]
    notes.push(
      `${capitalise(listed(following.map((name) => `\`--${name}\``)))} ${
        following.length === 1 ? "takes its" : "take their"
      } colour from ${listed(sources)}, so ${
        following.length === 1 ? "its own wasn’t" : "their own weren’t"
      } used.`
    )
  }
  if (unset.length) {
    notes.push(
      `A preset has no setting for ${listed(unset.map((name) => `\`--${name}\``))}.`
    )
  }
  if (pasted.darkLeftOut) {
    notes.push(
      "The .dark values weren’t used: a custom preset holds one colour for each part."
    )
  }
  return notes.join(" ")
}

function listed(names: string[]) {
  if (names.length > 6) {
    return `${names.slice(0, 6).join(", ")} and ${names.length - 6} more`
  }
  return names.length === 1
    ? names[0]!
    : `${names.slice(0, -1).join(", ")} and ${names.at(-1)}`
}

function capitalise(text: string) {
  return /^[`-]/.test(text)
    ? text
    : text.charAt(0).toUpperCase() + text.slice(1)
}

/** Declarations by block: `.dark` ones apart, everything else as light. */
function readBlocks(css: string) {
  const light: Declarations = new Map()
  const dark: Declarations = new Map()
  const blocks = [...css.matchAll(/([^{};]*)\{([^{}]*)\}/g)]
  const bodies = blocks.length
    ? blocks.map(([, selector, body]) => ({
        dark: /\bdark\b/.test(selector ?? ""),
        body: body ?? "",
      }))
    : [{ dark: false, body: css }]
  for (const { dark: isDark, body } of bodies) {
    for (const [, name, value] of body.matchAll(
      /--([\w-]+)\s*:\s*([^;]+?)\s*(?:;|$)/gm
    )) {
      if (name && value) (isDark ? dark : light).set(name, value.trim())
    }
  }
  return { light, dark }
}

/** Older shadcn themes give HSL as bare numbers: `222.2 84% 4.9%`. */
function asColour(value: string) {
  const bare = /^\d+(?:\.\d+)?(?:deg)?\s+\d+(?:\.\d+)?%\s+\d+(?:\.\d+)?%$/
  return bare.test(value.trim()) ? `hsl(${value.trim()})` : value.trim()
}

function nearestRadius(value: string) {
  const match = /^(\d*\.?\d+)(rem|px)?$/.exec(value.trim())
  if (!match) return null
  const rem = Number(match[1]) / (match[2] === "px" ? 16 : 1)
  const listed = new Set<string>(PRESET_FILTER_OPTIONS.radii)
  let nearest: string | null = null
  let distance = Infinity
  for (const [name, size] of Object.entries(RADIUS_REM)) {
    if (!listed.has(name)) continue
    if (Math.abs(size - rem) < distance) {
      distance = Math.abs(size - rem)
      nearest = name
    }
  }
  return nearest
}

/** The first family named, when it is one of the listed fonts. */
function listedFont(value: string | undefined, fonts: readonly string[]) {
  const family = value
    ?.split(",")[0]
    ?.trim()
    .replace(/^["']|["']$/g, "")
  if (!family) return null
  const slug = family.toLowerCase().replace(/\s+/g, "-")
  return fonts.includes(slug) ? slug : null
}
