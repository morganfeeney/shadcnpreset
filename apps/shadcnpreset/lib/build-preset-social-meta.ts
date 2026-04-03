import type { ResolvedPreset } from "@/lib/preset"
import { presetMetaDescription } from "@/lib/preset-meta"

export type PresetSocialMetaPayload = {
  documentTitle: string
  description: string
  pageUrl: string
  ogTitle: string
  ogImageUrl: string
}

/**
 * Pure values written by {@link syncPresetPageSocialMeta} — testable without a DOM.
 */
export function buildPresetSocialMetaPayload(
  resolved: ResolvedPreset,
  origin: string,
  siteName: string
): PresetSocialMetaPayload {
  const title = `shadcn preset: ${resolved.code}`
  const description = presetMetaDescription(resolved)
  const path = `/preset/${encodeURIComponent(resolved.code)}`
  const pageUrl = `${origin}${path}`
  const ogImageUrl = `${pageUrl}/opengraph-image?v=${encodeURIComponent(resolved.code)}`
  const branded = `${title} | ${siteName}`

  return {
    documentTitle: branded,
    description,
    pageUrl,
    ogTitle: branded,
    ogImageUrl,
  }
}
