import { decodePreset, encodePreset } from "shadcn/preset"

/**
 * Preset explicitly named in a message, e.g. "show buttons with preset b0".
 *
 * `isPresetCode` is far too permissive to run over free text — "button",
 * "blue", "banana" and "and" all pass it — so a bare token is never treated as
 * a code. The literal word "preset" must precede it.
 *
 * Returns the canonical encoding, or null when nothing is named.
 */
export function extractNamedPresetCode(message: string): string | null {
  const matches = [...message.matchAll(/\bpresets?\s+([A-Za-z0-9]{2,32})\b/gi)]

  // Last wins: a follow-up naming a different preset supersedes the earlier one.
  for (const match of matches.reverse()) {
    const decoded = decodePreset(match[1]!)
    if (decoded) {
      return encodePreset(decoded)
    }
  }

  return null
}
