import { parse } from "culori"

import { isCssColour, matchExactColours } from "@/lib/exact-colours"

/** Theme tokens a brand colour can be named for. */
export const BRAND_TOKENS = [
  "primary",
  "secondary",
  "accent",
  "background",
  "foreground",
  "card",
  "muted",
  "border",
  "primary-foreground",
  "secondary-foreground",
  "accent-foreground",
  "muted-foreground",
  "card-foreground",
  "destructive",
  "ring",
  "chart-1",
  "chart-2",
  "chart-3",
  "chart-4",
  "chart-5",
] as const

export type BrandToken = (typeof BRAND_TOKENS)[number]

export type BrandColour = {
  /** As the person wrote it, kept so their exact value reaches the CSS. */
  colour: string
  /** The token it was named for, or null when it came with no label. */
  token: BrandToken | null
}

/** Words people use for each token, as in "Background #141414" or "--primary:". */
const TOKEN_WORDS: Record<string, BrandToken> = {
  background: "background",
  bg: "background",
  foreground: "foreground",
  text: "foreground",
  card: "card",
  surface: "card",
  primary: "primary",
  brand: "primary",
  secondary: "secondary",
  accent: "accent",
  muted: "muted",
  border: "border",
}

/** Tokens that take a "<token> foreground" label of their own. */
const HAS_FOREGROUND = new Set<BrandToken>([
  "primary",
  "secondary",
  "accent",
  "muted",
  "card",
])

const TOKEN_WORD = new RegExp(
  `\\b(${Object.keys(TOKEN_WORDS).join("|")})\\b`,
  "gi"
)

/**
 * How far back from a colour its label may sit: "primary color is #DE00CE"
 * is labelled, a word two clauses earlier is not.
 */
const LABEL_REACH = 28

function labelFor(before: string): BrandToken | null {
  // Only the clause the colour is in: "bg #111, primary" labels the next one.
  const clause =
    before
      .slice(-LABEL_REACH)
      .split(/[,;\n]/)
      .pop() ?? ""
  const words = [...clause.matchAll(TOKEN_WORD)]
  const last = words.at(-1)
  if (!last) return null
  const token = TOKEN_WORDS[last[1].toLowerCase()]
  // "Primary Foreground #363636" is the text on primary, not the page text.
  const previous = words.at(-2)
  if (token === "foreground" && previous) {
    const between = clause.slice(
      (previous.index ?? 0) + previous[0].length,
      last.index
    )
    const owner = TOKEN_WORDS[previous[1].toLowerCase()]
    if (/^[\s-]*$/.test(between) && HAS_FOREGROUND.has(owner)) {
      return `${owner}-foreground` as BrandToken
    }
  }
  return token
}

/** Whether a stylesheet can use `colour` as written (Pantone it cannot). */
export function isUsableColour(colour: string): boolean {
  return isCssColour(colour) && Boolean(parse(colour))
}

/**
 * The colours a message gives for a theme, each with the token it was named
 * for. Pantone has no value a stylesheet can use, so it is left out.
 */
export function readBrandColours(text: string): BrandColour[] {
  return matchExactColours(text)
    .filter(({ colour }) => isUsableColour(colour))
    .map(({ colour, index }) => ({
      colour,
      token: labelFor(text.slice(0, index)),
    }))
}
