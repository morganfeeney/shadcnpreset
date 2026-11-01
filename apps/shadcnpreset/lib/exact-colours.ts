/**
 * Colours a message names exactly: hex codes, CSS colour functions and
 * Pantone references. A preset code can only hold colours from fixed lists,
 * so these are the ones a preset cannot honour.
 *
 * Words like "blue" or "burgundy" are not exact: a preset can match them.
 */
const EXACT_COLOUR =
  /#(?:[0-9a-f]{8}|[0-9a-f]{6}|[0-9a-f]{3,4})\b|\b(?:rgba?|hsla?|oklch|oklab|lab|lch)\([^)]*\)|\bpantone\s+[\w-]+(?:\s+[cu])?\b/gi

/** At most this many: enough for a brand palette, not a pasted stylesheet. */
const MAX_COLOURS = 6

/**
 * Exact colours in `text` and where each starts, first mention first,
 * without repeats. The position lets a reader look at what labels it.
 */
export function matchExactColours(
  text: string
): { colour: string; index: number }[] {
  const found: { colour: string; index: number }[] = []
  const seen = new Set<string>()
  for (const match of text.matchAll(EXACT_COLOUR)) {
    const key = match[0].toLowerCase().replace(/\s+/g, "")
    if (seen.has(key)) continue
    seen.add(key)
    found.push({ colour: match[0].trim(), index: match.index })
    if (found.length === MAX_COLOURS) break
  }
  return found
}

/** Exact colours in `text`, first mention first, without repeats. */
export function findExactColours(text: string): string[] {
  return matchExactColours(text).map(({ colour }) => colour)
}

/** Whether a colour can be painted as a CSS background (Pantone cannot). */
export function isCssColour(colour: string): boolean {
  return !/^pantone/i.test(colour)
}
