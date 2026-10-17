import { cacheLife } from "next/cache"

import { getCommunityPresetCodesForDisplay } from "@/lib/community-presets"
import {
  presetThemeFromSlug,
  toPresetThemes,
  type PresetTheme,
} from "@/lib/preset-themes"
import { toFontPairings, type CommunityFontPairing } from "@/lib/theme-fonts"

/** Community presets to draw themes from, most voted first. */
const SOURCE_PRESET_LIMIT = 500
const THEME_LIMIT = 60

/** The themes listed on /themes, most voted first. */
export async function getPresetThemesFeed(): Promise<PresetTheme[]> {
  "use cache"
  cacheLife({ stale: 300, revalidate: 300, expire: 86400 })

  const codes = await getCommunityPresetCodesForDisplay(SOURCE_PRESET_LIMIT)
  return toPresetThemes(codes, THEME_LIMIT)
}

/** Font pairings across the same community presets, most used first. */
export async function getFontPairingsFeed(): Promise<CommunityFontPairing[]> {
  "use cache"
  cacheLife({ stale: 300, revalidate: 300, expire: 86400 })

  const codes = await getCommunityPresetCodesForDisplay(SOURCE_PRESET_LIMIT)
  return toFontPairings(codes)
}

/**
 * The theme for a /themes/<slug> page. `listed` is false for a valid theme
 * that is not (or no longer) in the feed; its page stays up but unindexed.
 */
export async function getPresetThemePage(
  slug: string
): Promise<{ theme: PresetTheme; listed: boolean } | null> {
  const feed = await getPresetThemesFeed()
  const listed = feed.find((theme) => theme.slug === slug)
  if (listed) return { theme: listed, listed: true }

  const theme = presetThemeFromSlug(slug)
  return theme ? { theme, listed: false } : null
}
