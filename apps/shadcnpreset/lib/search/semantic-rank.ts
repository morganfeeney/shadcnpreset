import type { PresetPageItem } from "@/lib/preset-catalog"
import {
  wantsDarkShellQuery,
  wantsLightShellQuery,
} from "@/lib/search/query-intent"

function isDarkShellMenuColor(menuColor: string): boolean {
  return menuColor === "inverted" || menuColor === "inverted-translucent"
}

function isLightShellMenuColor(menuColor: string): boolean {
  return menuColor === "default" || menuColor === "default-translucent"
}

/**
 * When the user asks for dark or light UI, nudge scores toward inverted vs default shell.
 * Tied to real `menuColor` values, not keyword lists for every adjective.
 */
export function applyShellBrightnessIntent(
  query: string,
  scores: Map<string, number>,
  corpus: PresetPageItem[]
): Map<string, number> {
  const wantsDark = wantsDarkShellQuery(query)
  const wantsLight = wantsLightShellQuery(query)

  if (!wantsDark && !wantsLight) return scores

  const out = new Map(scores)
  for (const item of corpus) {
    const s = out.get(item.code)
    if (s === undefined || s <= 0) continue
    const mc = item.config.menuColor
    let factor = 1
    if (wantsDark && isDarkShellMenuColor(mc)) factor = 1.45
    if (wantsDark && isLightShellMenuColor(mc)) factor = 0.62
    if (wantsLight && isLightShellMenuColor(mc)) factor = 1.28
    if (wantsLight && isDarkShellMenuColor(mc)) factor = 0.78
    out.set(item.code, Math.min(1, s * factor))
  }
  return out
}

/** Same visible “card” dimensions as before — dedupe near-identical looks. */
export function presetVisibleSignatureKey(item: PresetPageItem): string {
  const c = item.config
  return [
    c.style,
    c.baseColor,
    c.theme,
    c.chartColor,
    c.fontHeading,
    c.font,
    c.iconLibrary,
  ].join("\0")
}

/**
 * Order by embedding cosine (higher first), drop zero-similarity, dedupe visible cards.
 */
export function rankPresetsByEmbeddingSimilarity(
  corpus: PresetPageItem[],
  scores: Map<string, number>,
  maxResults: number
): PresetPageItem[] {
  if (!corpus.length || maxResults <= 0) return []

  let maxScore = 0
  for (const s of scores.values()) {
    if (s > maxScore) maxScore = s
  }
  if (maxScore <= 0) return []

  const ranked = corpus
    .map((item) => ({
      item,
      score: scores.get(item.code) ?? 0,
    }))
    .sort(
      (a, b) =>
        b.score - a.score || a.item.code.localeCompare(b.item.code)
    )

  const seen = new Set<string>()
  const out: PresetPageItem[] = []
  for (const { item, score } of ranked) {
    if (score <= 0) continue
    if (out.length >= maxResults) break
    const key = presetVisibleSignatureKey(item)
    if (seen.has(key)) continue
    seen.add(key)
    out.push(item)
  }
  return out
}
