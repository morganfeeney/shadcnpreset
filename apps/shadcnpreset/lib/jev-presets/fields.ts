import type { PresetConfig } from "shadcn/preset"

import { PRESET_FILTER_OPTIONS } from "@/lib/preset-catalog"

/**
 * The questions Jev answers about a description, one per preset field.
 *
 * Jev reads option text literally and knows nothing about our catalog, so each
 * option carries a plain-English description of what it looks like. When a
 * field keeps landing on the wrong value, the description is the thing to fix.
 */

export type PresetField = Exclude<keyof PresetConfig, never>

/** Lets Jev say a field was not asked about, so the UI can tell stated from inferred. */
export const UNSPECIFIED = "unspecified"
const UNSPECIFIED_DESCRIPTION =
  "The description says nothing, directly or by implication, that bears on this"

const STYLES: Record<PresetConfig["style"], string> = {
  nova: "Balanced, default product UI",
  vega: "Classic product application shell",
  maia: "Soft, rounded and editorial",
  lyra: "Minimal and airy, square boxy edges",
  mira: "Dense, compact, information-heavy",
  luma: "Bold, big and marketing-led",
  sera: "Sharp and formal, uppercase headings, square edges",
  rhea: "Alternative experimental style",
}

const BASE_COLORS: Record<PresetConfig["baseColor"], string> = {
  neutral: "Pure grey, no tint",
  stone: "Warm grey",
  zinc: "Cool grey",
  gray: "Blue-tinted cool grey",
  mauve: "Purple-tinted grey",
  olive: "Green-tinted grey",
  mist: "Blue-green-tinted grey",
  taupe: "Brown-tinted warm grey",
}

const COLOURS: Record<PresetConfig["theme"], string> = {
  amber: "Amber, golden yellow-orange",
  blue: "Blue",
  cyan: "Cyan, aqua",
  emerald: "Emerald green",
  fuchsia: "Fuchsia, hot magenta",
  green: "Green",
  indigo: "Indigo, deep blue-violet",
  lime: "Lime, acid yellow-green",
  orange: "Orange",
  pink: "Pink",
  purple: "Purple",
  red: "Red",
  rose: "Rose, pinkish red",
  sky: "Sky, light blue",
  teal: "Teal",
  violet: "Violet",
  yellow: "Yellow",
  neutral: "No colour: pure black, white and grey (monochrome)",
  stone: "No colour: warm grey (monochrome)",
  zinc: "No colour: cool grey (monochrome)",
  gray: "No colour: blue-grey (monochrome)",
  mauve: "Muted greyish purple",
  olive: "Muted greyish green",
  mist: "Muted greyish blue-green",
  taupe: "Muted greyish brown",
}

const FONTS: Record<PresetConfig["font"], string> = {
  inter: "Inter: neutral modern sans-serif, the standard for product UI",
  "noto-sans": "Noto Sans: plain, neutral sans-serif",
  "nunito-sans": "Nunito Sans: soft, rounded, friendly sans-serif",
  figtree: "Figtree: friendly geometric sans-serif",
  roboto: "Roboto: familiar Android and Google sans-serif",
  raleway: "Raleway: elegant, thin, stylish sans-serif",
  "dm-sans": "DM Sans: clean low-contrast geometric sans-serif",
  "public-sans": "Public Sans: sober government-style sans-serif",
  outfit: "Outfit: rounded geometric sans-serif, modern marketing feel",
  "jetbrains-mono": "JetBrains Mono: developer monospace",
  geist: "Geist: crisp Vercel-style technical sans-serif",
  "geist-mono": "Geist Mono: crisp technical monospace",
  lora: "Lora: contemporary readable serif",
  merriweather: "Merriweather: sturdy screen-reading serif",
  "playfair-display":
    "Playfair Display: high-contrast fashion and luxury display serif",
  "noto-serif": "Noto Serif: plain traditional serif",
  "roboto-slab": "Roboto Slab: chunky slab serif, typewriter or industrial feel",
  oxanium: "Oxanium: squared futuristic sci-fi and gaming font",
  manrope: "Manrope: modern semi-geometric sans-serif, fintech feel",
  "space-grotesk": "Space Grotesk: quirky techy grotesk, startup or crypto feel",
  montserrat: "Montserrat: bold wide geometric sans-serif, poster or marketing",
  "ibm-plex-sans": "IBM Plex Sans: corporate engineered sans-serif",
  "source-sans-3": "Source Sans 3: humanist sans-serif for documentation",
  "instrument-sans": "Instrument Sans: refined editorial sans-serif",
  "eb-garamond":
    "EB Garamond: classic old-style book serif, old-fashioned or literary",
  "instrument-serif":
    "Instrument Serif: elegant condensed editorial serif, magazine headlines",
}

const FONT_HEADINGS: Record<PresetConfig["fontHeading"], string> = {
  inherit: "The same font as the body text",
  ...FONTS,
}

const ICON_LIBRARIES: Record<PresetConfig["iconLibrary"], string> = {
  lucide: "Lucide: clean thin outline icons, the neutral default",
  hugeicons: "Hugeicons: soft rounded modern icons",
  tabler: "Tabler: consistent geometric stroke icons",
  phosphor: "Phosphor: flexible, slightly playful icons",
  remixicon: "Remix Icon: bold, solid, neutral icons",
}

const RADII: Record<PresetConfig["radius"], string> = {
  none: "Sharp square corners",
  small: "Slightly rounded",
  default: "Moderately rounded",
  medium: "Noticeably rounded",
  large: "Very rounded, pill-like",
}

const MENU_COLORS: Record<PresetConfig["menuColor"], string> = {
  default: "Light shell",
  inverted: "Dark shell",
  "default-translucent": "Light, frosted glass shell",
  "inverted-translucent": "Dark, frosted glass shell",
}

/**
 * Each colour question answers for its own part of the preset only.
 *
 * Without this, one vivid word is read as the whole palette: "pink charts green
 * theme" put pink on both the accent and the charts, and pushed the greys to
 * olive to chase the word green.
 */
const ONE_PART_ONLY =
  "Only the colour it names for this counts. A colour it names for anything else — charts, data, backgrounds, text, the shell — does not count here, however prominent it is."

const MENU_ACCENTS: Record<PresetConfig["menuAccent"], string> = {
  subtle: "Subtle, understated highlight",
  bold: "Bold, strongly coloured highlight",
}

type FieldSpec = {
  field: keyof PresetConfig
  /** Shown in the reading panel. */
  label: string
  instructions: string
  options: Record<string, string>
}

/** Only the values the v4 preview can render are offered. */
function only<T extends string>(
  descriptions: Record<T, string>,
  allowed: readonly string[]
): Record<string, string> {
  return Object.fromEntries(
    allowed.map((value) => [value, descriptions[value as T] ?? value])
  )
}

export const JEV_PRESET_FIELDS: readonly FieldSpec[] = [
  {
    field: "style",
    label: "Style",
    instructions:
      "Which component style best fits the look described in `description`?",
    options: only(STYLES, PRESET_FILTER_OPTIONS.styles),
  },
  {
    field: "baseColor",
    label: "Neutrals",
    instructions:
      `Every option here is a shade of grey for backgrounds, borders and text. Which grey tone best suits the look described in \`description\`? ${ONE_PART_ONLY} A named accent or chart colour does not make the greys match it.`,
    options: only(BASE_COLORS, PRESET_FILTER_OPTIONS.baseColors),
  },
  {
    field: "theme",
    label: "Accent",
    instructions:
      // The closing sentence matters: without it an unnamed accent came back
      // "unspecified" at 0.99 and every look without a named colour went grey.
      `The accent colour is the one \`description\` calls the theme, accent, primary or brand colour, and it is used for buttons and highlights. Which accent colour does \`description\` ask for? ${ONE_PART_ONLY} If it names no accent colour, pick the colour that best suits the look it describes.`,
    options: only(COLOURS, PRESET_FILTER_OPTIONS.themes),
  },
  {
    field: "chartColor",
    label: "Charts",
    instructions:
      // Keep this one phrased as a tie-break rather than in the ONE_PART_ONLY
      // shape: the stricter wording read "pink charts green theme" as green.
      "Which colour should charts and data visualisation use for the look described in `description`? A colour the description names for charts wins over any colour it names for the theme, accents or buttons.",
    options: only(COLOURS, PRESET_FILTER_OPTIONS.themes),
  },
  {
    field: "font",
    label: "Body font",
    instructions:
      "Which body font best fits the look described in `description`?",
    options: only(FONTS, PRESET_FILTER_OPTIONS.fonts),
  },
  {
    field: "fontHeading",
    label: "Heading font",
    instructions:
      "Which font should headings use for the look described in `description`?",
    options: only(FONT_HEADINGS, PRESET_FILTER_OPTIONS.fontHeadings),
  },
  {
    field: "iconLibrary",
    label: "Icons",
    instructions:
      "Which icon set best fits the look described in `description`?",
    options: only(ICON_LIBRARIES, PRESET_FILTER_OPTIONS.iconLibraries),
  },
  {
    field: "radius",
    label: "Corners",
    instructions:
      "How rounded should corners be for the look described in `description`?",
    options: only(RADII, PRESET_FILTER_OPTIONS.radii),
  },
  {
    field: "menuColor",
    label: "Shell",
    instructions:
      "Should the sidebar and app shell be light or dark for the look described in `description`?",
    options: only(MENU_COLORS, PRESET_FILTER_OPTIONS.menuColors),
  },
  {
    field: "menuAccent",
    label: "Menu accent",
    instructions:
      "How strong should the highlighted menu item be for the look described in `description`?",
    options: only(MENU_ACCENTS, PRESET_FILTER_OPTIONS.menuAccents),
  },
]

/** The `questions` map for one TypeSafe System One request. */
export function buildJevQuestions() {
  return Object.fromEntries(
    JEV_PRESET_FIELDS.map((spec) => [
      spec.field,
      {
        type: "choice" as const,
        instructions: spec.instructions,
        criteria: {
          [UNSPECIFIED]: UNSPECIFIED_DESCRIPTION,
          ...spec.options,
        },
      },
    ])
  )
}
