import { PUBLISHED_LEARN_ARTICLES } from "@/app/learn/articles"
import { getLearnArticleHref } from "@/app/learn/learn"
import { siteConfig } from "@/lib/config"
import { getPresetThemesFeed } from "@/lib/preset-themes-feed"
import { buildUrlSetXml } from "@/lib/sitemap"

const STATIC_PATHS = [
  "/",
  "/community",
  "/themes",
  "/describe",
  "/build",
  "/shadcncraft",
  "/high-contrast-presets",
  "/changelog",
  "/assistant",
  "/my-presets",
  "/tools",
  "/tools/preset-theme-generator",
  "/tools/color-contrast-checker",
  "/learn",
  ...PUBLISHED_LEARN_ARTICLES.map((article) =>
    getLearnArticleHref(article.slug)
  ),
]

export async function GET() {
  const nowIso = new Date().toISOString()
  const themes = await getPresetThemesFeed()
  const paths = [
    ...STATIC_PATHS,
    ...themes.map((theme) => `/themes/${theme.slug}`),
  ]

  const entries = paths.map((path) => ({
    loc: `${siteConfig.url}${path}`,
    lastmod: nowIso,
  }))

  return new Response(buildUrlSetXml(entries), {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800",
    },
  })
}
