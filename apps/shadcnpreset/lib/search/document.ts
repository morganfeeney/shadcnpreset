import type { PresetPageItem } from "@/lib/preset-catalog"
import { FUTURISTIC_FONTS, SAAS_FONTS } from "@/lib/search/font-tags"

function radiusVocabulary(radius: string | undefined): string {
  if (radius === "large" || radius === "medium") {
    return "rounded soft curve curves"
  }
  if (radius === "none") {
    return "sharp square angular"
  }
  return ""
}

/**
 * Text used for semantic embedding and heuristic hints (dashboard, saas, …).
 */
export function buildPresetSearchDocument(item: PresetPageItem): string {
  const c = item.config
  const parts: string[] = [
    item.code,
    c.style,
    c.baseColor,
    c.theme,
    c.chartColor,
    c.font,
    c.fontHeading,
    c.iconLibrary,
    c.radius,
    c.menuColor,
    c.menuAccent,
  ]
    .filter(Boolean)
    .map(String)

  parts.push(radiusVocabulary(c.radius))

  const body = c.font
  if (body && FUTURISTIC_FONTS.has(body)) {
    parts.push(
      "futuristic",
      "sci-fi",
      "scifi",
      "tech",
      "modern",
      "future"
    )
  }
  if (body && SAAS_FONTS.has(body)) {
    parts.push(
      "saas",
      "product",
      "dashboard",
      "application",
      "app",
      "b2b",
      "startup",
      "founder",
      "professional",
      "formal",
      "business",
      "corporate"
    )
  }

  if (c.menuAccent === "subtle") {
    parts.push("professional", "formal", "corporate")
  }

  return parts.join(" ").toLowerCase()
}
