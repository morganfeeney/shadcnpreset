import { siteConfig } from "@/lib/config"
import {
  buildSitemapIndexXml,
  getPresetSitemapChunkCount,
} from "@/lib/sitemap"

export const revalidate = 60 * 60 * 24

export function GET() {
  const nowIso = new Date().toISOString()
  const presetChunkCount = getPresetSitemapChunkCount()

  const entries = [
    {
      loc: `${siteConfig.url}/sitemaps/static.xml`,
      lastmod: nowIso,
    },
    ...Array.from({ length: presetChunkCount }, (_, chunk) => ({
      loc: `${siteConfig.url}/sitemaps/presets/${chunk}`,
      lastmod: nowIso,
    })),
  ]

  return new Response(buildSitemapIndexXml(entries), {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800",
    },
  })
}
