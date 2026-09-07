import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { siteConfig } from "@/lib/config"
import { isCommunityPresetCode } from "@/lib/community-presets"
import { presetMetaDescription } from "@/lib/data/metadata/preset-meta"
import { buildPageMetadata, getPresetOgImageUrl } from "@/lib/page-metadata"
import { resolvePresetFromCode } from "@/lib/preset"
import { parsePresetPreviewPageName } from "@/lib/preset-preview"

import { PresetBrowsePreview } from "./browse-surface"

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

  return (
    <PresetBrowsePreview
      resolved={preset}
      view={parsePresetPreviewPageName(query.view)}
    />
  )
}
