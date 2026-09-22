import {
  PRESET_FONTS,
  PRESET_ICON_LIBRARIES,
  PRESET_STYLES,
  PRESET_THEMES,
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
  Pick<
    PresetConfig,
    | "style"
    | "iconLibrary"
    | "font"
    | "fontHeading"
    | "theme"
    | "chartColor"
    | "radius"
  >
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

/**
 * Corner words with one obvious meaning.
 *
 * These are instructions, not moods: "tight corners" means no rounding, and
 * asking a model to weigh that against the rest of the sentence produced
 * "small" — visibly rounded — for a description that asked for tight.
 * Anything vaguer ("soft", "friendly") is left to Jev.
 */
const RADIUS_TERMS: Array<[RegExp, PresetConfig["radius"]]> = [
  [
    /\b(?:tight|sharp|square|boxy|hard[- ]edged|no|zero|without)\s+(?:corners?|edges?|radius|rounding)\b/,
    "none",
  ],
  [/\b(?:corners?|edges?|radius)\s+(?:are|is)?\s*(?:tight|sharp|square)\b/, "none"],
  [/\b(?:brutalist|no-radius|border-radius\s*0)\b/, "none"],
  [
    /\b(?:pill|fully|very|super|extra)[- ]?(?:shaped|rounded|round)\b/,
    "large",
  ],
  [/\bslightly\s+rounded\b/, "small"],
]

function findRadius(text: string): PresetConfig["radius"] | undefined {
  for (const [pattern, radius] of RADIUS_TERMS) {
    if (pattern.test(text)) return radius
  }
  return undefined
}

/** What a colour is being named for, in the words people actually use. */
const COLOUR_TARGETS = {
  chartColor: "charts?|graphs?|data|data ?vis(?:ualisation|ualization)?",
  theme: "theme|accent|primary|brand|buttons?",
} as const

const COLOURS = PRESET_THEMES.join("|")

/**
 * Colours tied to the part of the preset they were named for.
 *
 * Jev reads these as one sentence, so a word in front can move the colour to
 * the wrong field: "blue charts green theme" landed correctly, and "jetbrains
 * mono blue charts green theme" came back swapped. Both word orders are
 * matched — "blue charts" and "charts are blue".
 */
function findScopedColours(text: string): Pick<NamedTerms, "theme" | "chartColor"> {
  type Candidate = { field: "theme" | "chartColor"; colour: string; at: number; from: number }
  const candidates: Candidate[] = []

  for (const [field, targets] of Object.entries(COLOUR_TARGETS)) {
    const shapes = [
      // "blue charts"
      new RegExp(`\\b(${COLOURS})\\s+(?:${targets})\\b`, "g"),
      // "charts are blue", "brand colour is teal", "theme: green"
      new RegExp(
        `\\b(?:${targets})\\s*(?:colou?rs?)?\\s*(?:are|is|in|of|use|using|should be|=|:)?\\s*(${COLOURS})\\b`,
        "g"
      ),
    ]

    for (const shape of shapes) {
      for (const match of text.matchAll(shape)) {
        candidates.push({
          field: field as Candidate["field"],
          colour: match[1]!,
          at: match.index ?? 0,
          from: (match.index ?? 0) + match[0].indexOf(match[1]!),
        })
      }
    }
  }

  const out: Pick<NamedTerms, "theme" | "chartColor"> = {}
  const claimed = new Set<number>()

  // Earliest phrase first, and one colour word can only belong to one field:
  // without that, "charts are green theme is blue" reads "green theme" as well
  // and the accent takes the colour the charts already had.
  for (const candidate of candidates.sort((a, b) => a.at - b.at)) {
    if (out[candidate.field] || claimed.has(candidate.from)) continue
    out[candidate.field] = candidate.colour as never
    claimed.add(candidate.from)
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
    ...findScopedColours(text),
    radius: findRadius(text),
  }
}
