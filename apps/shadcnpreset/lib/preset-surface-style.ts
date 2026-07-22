import type { CSSProperties } from "react"

import { getFontFamily } from "@/lib/preset"

export function cssVarsToStyle(vars?: Record<string, string>): CSSProperties {
  const style: CSSProperties = {}
  for (const [key, value] of Object.entries(vars ?? {})) {
    ;(style as Record<string, string>)[`--${key}`] = value
  }
  return style
}

export function buildPresetSurfaceStyle(options: {
  themeVars?: Record<string, string> | null
  bodyFont: string
  /**
   * Raw `fontHeading` from the preset (e.g. `"playfair-display"` or `"inherit"`).
   * When `"inherit"`, sets `--font-heading: var(--font-sans)` so the face is not duplicated.
   */
  headingFont: string
}): CSSProperties {
  const next = cssVarsToStyle(options.themeVars ?? undefined)
  const s = next as Record<string, string>
  s["--font-sans"] = getFontFamily(options.bodyFont)
  s["--font-heading"] =
    options.headingFont === "inherit"
      ? "var(--font-sans)"
      : getFontFamily(options.headingFont)
  return next
}
