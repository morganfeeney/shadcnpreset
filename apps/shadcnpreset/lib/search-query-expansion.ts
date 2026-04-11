import { tokenizeSearchQuery } from "@/lib/search-tokenize"

/**
 * Extra terms for when the primary query returns no Minisearch hits (OR search).
 * Maps natural language to words we inject into preset documents or related facets.
 */
const LEXICAL_EXPANSIONS: Record<string, string[]> = {
  dashboard: ["sidebar", "menu", "panel", "application", "ui", "admin", "saas"],
  admin: ["dashboard", "panel", "application"],
  founder: ["startup", "product", "saas"],
  startup: ["product", "saas", "bold", "application"],
  crypto: ["violet", "indigo", "purple", "bold"],
  web: ["application", "ui", "product"],
  app: ["application", "product", "ui"],
  ui: ["application", "interface", "design"],
  interface: ["ui", "application"],
  design: ["theme", "style", "ui"],
  elegant: ["serif", "minimal", "clean"],
  playful: ["rounded", "colorful", "vibrant"],
  corporate: ["inter", "neutral", "subtle", "saas", "application"],
  glass: ["sky", "cyan", "blue"],
  professional: [
    "inter",
    "saas",
    "subtle",
    "neutral",
    "dashboard",
    "application",
    "corporate",
    "product",
  ],
  formal: ["minimal", "clean", "subtle", "inter", "serif", "saas"],
  business: ["saas", "dashboard", "application", "inter", "corporate", "product"],
}

/** Deduplicated expanded query string for a broader OR search. */
export function expandQueryForLexicalSearch(query: string): string {
  const tokens = tokenizeSearchQuery(query)
  const out = new Set<string>(tokens)
  for (const t of tokens) {
    for (const x of LEXICAL_EXPANSIONS[t] ?? []) {
      out.add(x)
    }
  }
  return [...out].join(" ")
}

/** Single-token queries that benefit from OR expansion before the first Minisearch pass. */
export function shouldPreferExpandedLexicalSearch(query: string): boolean {
  const tokens = tokenizeSearchQuery(query)
  return (
    tokens.length === 1 &&
    Boolean(tokens[0] && LEXICAL_EXPANSIONS[tokens[0]]?.length)
  )
}
