/** Decodes `/preset/[code]` segment from a pathname (no query or hash). */
export function parsePresetCodeFromPathname(pathname: string): string | null {
  const match = /^\/preset\/([^/]+)/.exec(pathname)
  if (!match?.[1]) {
    return null
  }

  try {
    return decodeURIComponent(match[1])
  } catch {
    return match[1]
  }
}
