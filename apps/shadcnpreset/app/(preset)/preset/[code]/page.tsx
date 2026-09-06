import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { Suspense } from "react"

import { Container } from "@/components/zippystarter/container"
import { Spinner } from "@/components/ui/spinner"
import { siteConfig } from "@/lib/config"
import { isCommunityPresetCode } from "@/lib/community-presets"
import { presetMetaDescription } from "@/lib/data/metadata/preset-meta"
import { buildPageMetadata, getPresetOgImageUrl } from "@/lib/page-metadata"
import { resolvePresetFromCode } from "@/lib/preset"
import { formatPresetCardDescription } from "@/lib/preset-card-description"
import { parsePresetPreviewPageName } from "@/lib/preset-preview"
import { PresetBrowseSurface } from "./browse-surface"
import { PresetButtons, PresetCodeTitle } from "./components"

type PresetPageProps = {
  params: Promise<{
    code: string
  }>
  searchParams: Promise<{
    view?: string
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
    <div className="w-full">
      <main className="grid gap-2">
        <Container aria-label="Preset details and actions" className="max-w-full">
          <div className="flex flex-wrap items-start justify-between gap-4 py-6">
            <PresetCodeTitle
              presetCode={preset.code}
              description={description}
            />
            <div className="flex flex-wrap items-center justify-end gap-2">
              <PresetButtons preset={preset.code} />
            </div>
          </div>
        </Container>
        <Suspense
          fallback={
            <div className="relative flex min-h-[calc(100dvh-14rem)] items-center justify-center">
              <Spinner />
            </div>
          }
        >
          <PresetBrowseSurface resolved={preset} initialView={view} />
        </Suspense>
      </main>
    </div>
  )
}
