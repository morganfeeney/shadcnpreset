import { decodePreset, encodePreset } from "shadcn/preset"

import { getFontDefinition, type FontName } from "@/lib/font-definitions"
import { effectiveHeadingFont, resolvePresetFromCode } from "@/lib/preset"
import { presetThemeFields, presetThemeSlug } from "@/lib/preset-themes"

/** Fonts to add to a theme. A heading equal to the body means one font. */
export type ThemeFonts = { heading: FontName; body: FontName }

/** A pairing community presets use, and the themes they use it with. */
export type CommunityFontPairing = ThemeFonts & {
  presets: number
  themeSlugs: string[]
}

/** What a theme page previews when no fonts are picked. */
export const DEFAULT_THEME_FONTS: ThemeFonts = {
  heading: "inter",
  body: "inter",
}

function fontName(value: string): FontName | null {
  return getFontDefinition(value)?.name ?? null
}

export function sameThemeFonts(a: ThemeFonts, b: ThemeFonts): boolean {
  return a.heading === b.heading && a.body === b.body
}

/** Font pairings across presets, most used first. */
export function toFontPairings(
  codes: readonly string[]
): CommunityFontPairing[] {
  const pairings = new Map<string, CommunityFontPairing>()

  for (const code of codes) {
    const preset = resolvePresetFromCode(code)
    if (!preset) continue
    const body = fontName(preset.font)
    const heading = fontName(
      effectiveHeadingFont(preset.font, preset.fontHeading)
    )
    if (!body || !heading) continue

    const key = `${heading}/${body}`
    const pairing = pairings.get(key) ?? {
      heading,
      body,
      presets: 0,
      themeSlugs: [],
    }
    pairing.presets += 1
    const slug = presetThemeSlug(presetThemeFields(preset))
    if (!pairing.themeSlugs.includes(slug)) pairing.themeSlugs.push(slug)
    pairings.set(key, pairing)
  }

  // Stable sort keeps first-seen (most voted) order between equal counts.
  return [...pairings.values()].sort((a, b) => b.presets - a.presets)
}

/**
 * Pairings to offer on a theme page: ones used with this theme first, then
 * true pairs (a heading font over a different body font), then single fonts,
 * each most used first. The default fonts are offered separately.
 */
export function suggestedFontPairings(
  pairings: readonly CommunityFontPairing[],
  themeSlug: string,
  limit = 5
): CommunityFontPairing[] {
  const offered = pairings.filter(
    (pairing) => !sameThemeFonts(pairing, DEFAULT_THEME_FONTS)
  )
  const withTheme = offered.filter((pairing) =>
    pairing.themeSlugs.includes(themeSlug)
  )
  const rest = offered.filter(
    (pairing) => !pairing.themeSlugs.includes(themeSlug)
  )
  const pairs = rest.filter((pairing) => pairing.heading !== pairing.body)
  const singles = rest.filter((pairing) => pairing.heading === pairing.body)
  return [...withTheme, ...pairs, ...singles].slice(0, limit)
}

/** The theme's preset code with these fonts, for `--only theme,font`. */
export function themeCodeWithFonts(code: string, fonts: ThemeFonts): string {
  return encodePreset({
    ...decodePreset(code),
    font: fonts.body,
    fontHeading: fonts.heading === fonts.body ? "inherit" : fonts.heading,
  } as Parameters<typeof encodePreset>[0])
}

/** `?fonts=` value: `heading,body`, or one font when they match. */
export function themeFontsParam(fonts: ThemeFonts): string {
  return fonts.heading === fonts.body
    ? fonts.body
    : `${fonts.heading},${fonts.body}`
}

export function parseThemeFontsParam(
  value: string | null | undefined
): ThemeFonts | null {
  if (!value) return null
  const parts = value.split(",")
  if (parts.length > 2) return null
  const heading = fontName(parts[0]!)
  const body = fontName(parts.at(-1)!)
  return heading && body ? { heading, body } : null
}
