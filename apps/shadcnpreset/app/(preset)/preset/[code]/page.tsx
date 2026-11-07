import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { siteConfig } from "@/lib/config"
import { isCommunityPresetCode } from "@/lib/community-presets"
import {
  presetMetaDescription,
  presetPageTitle,
} from "@/lib/data/metadata/preset-meta"
import { buildPageMetadata, getPresetOgImageUrl } from "@/lib/page-metadata"
import { resolvePresetFromCode } from "@/lib/preset"

type PresetPageProps = {
  params: Promise<{
    code: string
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

  const title = presetPageTitle(preset)
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

/**
 * The preset itself shows in the layout, so moving between presets keeps
 * its preview; the page only turns away a code that isn't one.
 */
export default async function PresetCodePage({ params }: PresetPageProps) {
  const { code } = await params
  if (!resolvePresetFromCode(code)) notFound()
  return null
}
