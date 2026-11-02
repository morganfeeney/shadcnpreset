import { notFound } from "next/navigation"

import { buildCustomPreset } from "@/lib/custom-preset"
import {
  CUSTOM_COLOURS_STYLE_ID,
  PRESET_THEME_STYLE_ID,
} from "@/lib/custom-preset-frame"
import { getCustomPreset } from "@/lib/custom-preset-store"
import { getPresetThemeCssBundle } from "@/lib/preset-theme-css"
import { getPresetGoogleFontStylesheetHrefs } from "@/lib/preset-google-fonts"
import { isLocalPresetPreviewExample } from "@/lib/preset-preview"
import { effectiveHeadingFont } from "@/lib/preset"
import { readBuiltPageSpec } from "@/lib/page-builder/messages"
import { cn } from "@/lib/utils"

import { PresetPreviewExampleShell } from "./preview-example-shell"

export default async function PresetPreviewExamplePage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<Record<string, string | undefined>>
}) {
  const [{ slug }, query] = await Promise.all([params, searchParams])
  const raw = query.preset
  if (!isLocalPresetPreviewExample(slug)) {
    notFound()
  }

  const trimmed = raw?.trim() ?? ""
  const bundle = getPresetThemeCssBundle(trimmed)
  if (!bundle) {
    notFound()
  }

  const { combinedCss } = bundle
  const { code, style, baseColor, font, fontHeading } = bundle.resolved
  // A custom preset's colours over the preset's own: saved ones for the first
  // paint, then whatever its editor sends while it is open.
  const custom = query.custom ? await getCustomPreset(query.custom) : null
  const customCss = custom
    ? (buildCustomPreset(code, custom.colours)?.css ?? "")
    : ""
  const styleClass = `style-${style}`
  const baseColorClass = `base-color-${baseColor}`
  const presetPreviewFontValues = [
    font,
    effectiveHeadingFont(font, fontHeading),
  ]
  const presetGoogleFontHrefs = getPresetGoogleFontStylesheetHrefs(
    presetPreviewFontValues
  )
  const fontReadyGateKey = presetGoogleFontHrefs.join("|")

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link
        rel="preconnect"
        href="https://fonts.gstatic.com"
        crossOrigin="anonymous"
      />
      {presetGoogleFontHrefs.map((href) => (
        <link key={href} rel="stylesheet" href={href} />
      ))}
      <div
        className={cn(
          "preset-preview-root min-h-svh",
          styleClass,
          baseColorClass
        )}
      >
        <style
          id={PRESET_THEME_STYLE_ID}
          dangerouslySetInnerHTML={{ __html: combinedCss }}
        />
        <style
          id={CUSTOM_COLOURS_STYLE_ID}
          dangerouslySetInnerHTML={{ __html: customCss }}
        />
        <PresetPreviewExampleShell
          slug={slug}
          presetCode={code}
          builtPage={readBuiltPageSpec(query) ?? undefined}
          fontReadyGateKey={fontReadyGateKey}
          bodyStyleClass={styleClass}
          bodyBaseColorClass={baseColorClass}
        />
      </div>
    </>
  )
}
