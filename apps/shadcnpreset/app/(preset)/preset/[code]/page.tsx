import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { Suspense } from "react"

import { Container } from "@/components/zippystarter/container"
import { Spinner } from "@/components/ui/spinner"
import { siteConfig } from "@/lib/config"
import { isCommunityPresetCode } from "@/lib/community-presets"
import { presetMetaDescription } from "@/lib/data/metadata/preset-meta"
import { buildPageMetadata, getPresetOgImageUrl } from "@/lib/page-metadata"
import { resolvePresetFromCode, type ResolvedPreset } from "@/lib/preset"
import { formatPresetCardDescription } from "@/lib/preset-card-description"
import { getVotedPresetsFeed } from "@/lib/preset-feed"
import { PresetPageLiveProvider } from "@/components/preset-page-live-context"
import {
  parsePresetPreviewPageName,
  parsePresetSidebarTab,
  type PresetPreviewPageName,
  type PresetSidebarTab,
} from "@/lib/preset-preview"
import { toPresetSidebarItem } from "@/lib/preset-sidebar-item"
import { PresetBrowseSurface } from "./browse-surface"
import { PresetLiveHero } from "./components"

const COMMUNITY_SIDEBAR_LIMIT = 100

type PresetPageProps = {
  params: Promise<{
    code: string
  }>
  searchParams: Promise<{
    view?: string
    tab?: string
  }>
}

export async function generateMetadata({
  params,
}: PresetPageProps): Promise<Metadata> {
  const { code } = await params
  const preset = resolvePresetFromCode(code)
  if (!preset) {
    notFound()
  }

  const title = `shadcn preset: ${preset.code}`
  const description = presetMetaDescription(preset)
  const pagePath = `/preset/${preset.code}`
  const useDynamicOg = await isCommunityPresetCode(preset.code, code)

  return buildPageMetadata({
    title,
    description,
    path: pagePath,
    socialTitle: `${title} | ${siteConfig.name}`,
    image: useDynamicOg
      ? {
          url: getPresetOgImageUrl(preset.code),
          alt: "shadcn preset preview",
          width: 1200,
          height: 630,
        }
      : undefined,
  })
}

export default async function PresetCodePage({
  params,
  searchParams,
}: PresetPageProps) {
  const [{ code }, query] = await Promise.all([params, searchParams])
  const preset = resolvePresetFromCode(code)

  if (!preset) {
    notFound()
  }

  const view = parsePresetPreviewPageName(query.view)
  const tab = parsePresetSidebarTab(query.tab)
  const description = formatPresetCardDescription({
    style: preset.style,
    baseColor: preset.baseColor,
    theme: preset.theme,
    chartColor: preset.effectiveChartColor,
    iconLibrary: preset.iconLibrary,
    font: preset.font,
    fontHeading: preset.fontHeading,
  })

  return (
    <PresetPageLiveProvider initialPresetCode={preset.code}>
      <div className="w-full">
        <main className="grid gap-2">
          <Container
            aria-label="Preset details and actions"
            className="max-w-full"
          >
            <PresetLiveHero
              initialCode={preset.code}
              initialDescription={description}
            />
          </Container>
          <Suspense
            fallback={
              <div className="relative flex min-h-[calc(100dvh-14rem)] items-center justify-center">
                <Spinner />
              </div>
            }
          >
            <PresetBrowseWithCommunity
              resolved={preset}
              initialView={view}
              initialTab={tab}
            />
          </Suspense>
        </main>
      </div>
    </PresetPageLiveProvider>
  )
}

async function PresetBrowseWithCommunity({
  resolved,
  initialView,
  initialTab,
}: {
  resolved: ResolvedPreset
  initialView: PresetPreviewPageName
  initialTab: PresetSidebarTab
}) {
  const feedItems = await getVotedPresetsFeed(COMMUNITY_SIDEBAR_LIMIT)
  const communityItems = feedItems.map(toPresetSidebarItem)

  return (
    <PresetBrowseSurface
      resolved={resolved}
      initialView={initialView}
      initialTab={initialTab}
      communityItems={communityItems}
    />
  )
}
