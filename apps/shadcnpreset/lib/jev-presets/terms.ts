import {
  PRESET_FONTS,
  PRESET_ICON_LIBRARIES,
  PRESET_STYLES,
  type PresetConfig,
} from "shadcn/preset"

/**
 * Catalog names a description states outright.
 *
 * Naming a style is an instruction, not a mood: "sera tight" asks for Sera, and
 * it used to come back Mira because a judgment weighed "tight" against the
 * name. Exact names belong in code — matching is free, instant and certain —
 * leaving the model the part that is actually a judgment.
 *
 * Colours and corners stay with the model: "warm" or "no corners" carry meaning
 * no list of names can match.
 */
export type NamedTerms = Partial<
  Pick<PresetConfig, "style" | "iconLibrary" | "font" | "fontHeading">
>

/** Font slugs read as ordinary words, so they only count near a typography word. */
const AMBIGUOUS_FONTS = new Set(["inter", "outfit", "lora", "figtree"])

const TYPOGRAPHY_CONTEXT =
  /\b(font|fonts|typeface|typography|type|set in|headings?|body|serif|sans|mono)\b/

/** "jetbrains-mono" is also written "jetbrains mono". */
function slugPattern(slug: string): RegExp {
  return new RegExp(`\\b${slug.split("-").join("[\\s-]")}\\b`, "i")
}

function matchFrom<T extends string>(
  haystack: string,
  values: readonly T[]
): T | undefined {
  return values.find((value) => slugPattern(value).test(haystack))
}

/**
 * Headings and body can be named separately ("lora headings, inter body"), so
 * each font found is tied to the side of the sentence it appears on.
 */
function findFonts(description: string): Pick<NamedTerms, "font" | "fontHeading"> {
  const out: Pick<NamedTerms, "font" | "fontHeading"> = {}
  const hasContext = TYPOGRAPHY_CONTEXT.test(description)

  for (const font of PRESET_FONTS) {
    if (AMBIGUOUS_FONTS.has(font) && !hasContext) continue

    const match = slugPattern(font).exec(description)
    if (!match) continue

    // What the sentence says about this font, up to the next comma or clause.
    const after = description.slice(match.index + match[0].length, match.index + match[0].length + 24)
    const isHeading = /\b(headings?|display|titles?)\b/i.test(after)
    const isBody = /\b(body|text|paragraphs?)\b/i.test(after)

    if (isHeading) out.fontHeading ??= font
    else if (isBody) out.font ??= font
    else {
      // Unqualified: it is the body font, and headings follow unless named.
      out.font ??= font
    }
  }

  return out
}

/** Every catalog name stated in a description, as preset values. */
export function extractNamedTerms(description: string): NamedTerms {
  const text = description.toLowerCase()

  return {
    style: matchFrom(text, PRESET_STYLES),
    iconLibrary: matchFrom(text, PRESET_ICON_LIBRARIES),
    ...findFonts(text),
  }
}
