const TYPOGRAPHY_RE = /\b(serif|sans|sans-serif|font|typography)\b/i
const PALETTE_RE =
  /\b(palette|muted|vibrant|contrast|warm|cool|neutral|mono|color|colour|saturated)\b/i
const COMPOSITE_RE = /·/

function dedupe(values: string[]): string[] {
  const seen = new Set<string>()
  const out: string[] = []
  for (const value of values) {
    const key = value.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    out.push(value)
  }
  return out
}

function inferTypographyLabel(input: string): string {
  const value = input.toLowerCase()
  if (value.includes("sans")) return "Sans-forward"
  if (value.includes("serif")) return "Serif-forward"
  return "Balanced typography"
}

function inferPaletteLabel(input: string): string {
  const value = input.toLowerCase()

  if (value.includes("warm") && value.includes("muted")) {
    return "Warm muted palette"
  }
  if (value.includes("vibrant") && value.includes("contrast")) {
    return "Vibrant contrasting palette"
  }
  if (value.includes("muted")) return "Muted palette"
  if (value.includes("vibrant")) return "Vibrant palette"
  if (value.includes("mono") || value.includes("neutral")) {
    return "Monochrome-leaning palette"
  }
  if (value.includes("palette")) return input.trim()
  return "Balanced palette"
}

/**
 * Ensures quick-reply chips are comparable options.
 * If the model mixes single-axis typography chips with single-axis palette chips,
 * convert them into composite chips so each option represents a coherent direction.
 */
export function normalizeQuickReplies(questions: string[]): string[] {
  const cleaned = questions.map((q) => q.trim()).filter((q) => q.length > 0)
  if (!cleaned.length) return []

  const typographyOnly = cleaned.filter(
    (q) => TYPOGRAPHY_RE.test(q) && !PALETTE_RE.test(q) && !COMPOSITE_RE.test(q)
  )
  const paletteOnly = cleaned.filter(
    (q) => PALETTE_RE.test(q) && !TYPOGRAPHY_RE.test(q) && !COMPOSITE_RE.test(q)
  )

  const hasMixedSingleAxis = typographyOnly.length > 0 && paletteOnly.length > 0
  if (!hasMixedSingleAxis) {
    return cleaned.slice(0, 4)
  }

  const typographyChoices = dedupe(typographyOnly.map(inferTypographyLabel)).slice(
    0,
    2
  )
  const paletteChoices = dedupe(paletteOnly.map(inferPaletteLabel)).slice(0, 2)

  const composed: string[] = []
  for (const typography of typographyChoices) {
    for (const palette of paletteChoices) {
      composed.push(`${typography} · ${palette}`)
      if (composed.length >= 4) break
    }
    if (composed.length >= 4) break
  }

  return composed.length
    ? composed
    : ["Serif-forward · muted palette", "Sans-forward · vibrant palette"]
}
