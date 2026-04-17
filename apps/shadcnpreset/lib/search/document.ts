import type { PresetPageItem } from "@/lib/preset-catalog"
import { FUTURISTIC_FONTS, SAAS_FONTS } from "@/lib/search/font-tags"

function radiusPhrase(radius: string | undefined): string {
  if (radius === "large" || radius === "medium") return "rounded corners"
  if (radius === "none") return "sharp square corners"
  return ""
}

/** Human language for menuColor so embeddings align with “dark / light UI” queries. */
function applicationShellDescription(menuColor: string): string {
  switch (menuColor) {
    case "inverted":
      return "Dark application chrome: dark sidebar and shell, dark-mode style layout (inverted shell)."
    case "inverted-translucent":
      return "Dark translucent application chrome: dark sidebar and shell, dark-mode style (inverted translucent)."
    case "default":
      return "Light application chrome: bright sidebar and shell, light-mode style layout (default shell)."
    case "default-translucent":
      return "Light translucent application chrome: bright sidebar and shell (default translucent)."
    default:
      return `Application shell mode ${menuColor}.`
  }
}

/**
 * Natural-language text embedded offline for vector search.
 * Spell out dark vs light shell explicitly — raw facet ids (“default”, “inverted”) do not read as dark/light to the model.
 */
export function buildPresetSearchDocument(item: PresetPageItem): string {
  const c = item.config
  const headingDesc =
    c.fontHeading === "inherit" || c.fontHeading === c.font
      ? `${c.font} for headings and body`
      : `${c.fontHeading} headings with ${c.font} body`

  const fontVibe =
    c.font && FUTURISTIC_FONTS.has(c.font)
      ? "tech and futuristic feel"
      : c.font && SAAS_FONTS.has(c.font)
        ? "product and dashboard UI feel"
        : ""

  const radius = radiusPhrase(c.radius)
  const shell = applicationShellDescription(c.menuColor)

  const sentences = [
    `Shadcn theme preset ${item.code}: ${c.style} layout.`,
    `Neutral ${c.baseColor} base, ${c.theme} theme accents.`,
    `${c.chartColor} for charts, metrics, and data visualization accents.`,
    `${headingDesc}. ${c.iconLibrary} icon set.`,
    radius ? `${radius}.` : "",
    `${shell} ${c.menuAccent} sidebar accent weight.`,
    fontVibe ? `Overall ${fontVibe}.` : "",
  ]

  return sentences.filter(Boolean).join(" ").toLowerCase()
}
