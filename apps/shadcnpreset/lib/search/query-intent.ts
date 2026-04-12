/** Shared detection for shell brightness intent (maps to `menuColor` on presets). */

export function wantsDarkShellQuery(raw: string): boolean {
  const q = raw.toLowerCase()
  return /\b(dark|darker|night|midnight)\b/.test(q) || q.includes("dark mode")
}

export function wantsLightShellQuery(raw: string): boolean {
  if (wantsDarkShellQuery(raw)) return false
  const q = raw.toLowerCase()
  return (
    /\b(light|bright|airy)\b/.test(q) &&
    !/\b(highlight|lightweight)\b/.test(q)
  )
}

export function wantsDataUiQuery(raw: string): boolean {
  const q = raw.toLowerCase()
  return /\b(charts?|graphs?|analytics|metrics|kpi|dashboard)\b/.test(q)
}
