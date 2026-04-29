"use client"

import * as React from "react"
import { useTheme } from "next-themes"

import { Skeleton } from "@/components/ui/skeleton"

import {
  Card as ShadcnCard,
  CardContent as ShadcnCardContent,
} from "@/components/ui/card"

import { PresetFontLoader } from "@/components/preset-font-loader"
import { PresetThemeSurface } from "@/components/preset-theme-surface"
import { effectiveHeadingFont, resolvePresetFromCode } from "@/lib/preset"
import { buildRegistryTheme, DEFAULT_CONFIG } from "@/registry/config"
import { ObservabilityCard } from "@/components/preset-swatch/components/cards/observability-card"
import { PreviewIconGrid } from "@/components/preset-swatch/components/cards/icon-preview-grid"
import { StyleOverview } from "@/components/preset-swatch/components/cards/style-overview"
import { TypographySpecimenCard } from "@/components/preset-swatch/components/cards/typography-specimen"
import { cn } from "@/lib/utils"
import { TypographySpecimen } from "@/components/preset-swatch/components/typography-specimen"

type PresetCard2StyleOverviewProps = {
  initialCode: string
  className?: string
}

/**
 * Like `PresetCard1`, with a v4-style stack: `TypographySpecimenCard`, {@link StyleOverview}
 * (title + token grid), {@link PreviewIconGrid}, and {@link ObservabilityCard}. Still decodes
 * a preset, applies `buildRegistryTheme`, and composes v4-style preview blocks (no iframe).
 *
 * Spacing uses `@container` so gaps track the **preview surface width** (e.g. the fixed
 * layout width under `transform: scale`), not the viewport.
 */
export function PresetCard2StyleOverview({
  initialCode,
  className,
}: PresetCard2StyleOverviewProps) {
  const { resolvedTheme } = useTheme()

  const resolved = React.useMemo(
    () => resolvePresetFromCode(initialCode),
    [initialCode]
  )
  const mode = resolvedTheme === "dark" ? "dark" : "light"

  const theme = React.useMemo(() => {
    if (!resolved) {
      return null
    }
    return buildRegistryTheme({
      ...DEFAULT_CONFIG,
      baseColor: resolved.baseColor,
      theme: resolved.theme,
      chartColor: resolved.effectiveChartColor,
      menuAccent: resolved.menuAccent,
      menuColor: resolved.menuColor,
      radius: resolved.effectiveRadius,
    })
  }, [resolved])

  const fontValues = React.useMemo(() => {
    if (!resolved) {
      return [] as string[]
    }
    return [
      resolved.font,
      effectiveHeadingFont(resolved.font, resolved.fontHeading),
    ]
  }, [resolved])

  if (!resolved || !theme) {
    return <Skeleton className="absolute inset-0" />
  }

  return (
    <div className={cn("@container", className)}>
      <PresetFontLoader fontValues={fontValues} />
      <PresetThemeSurface
        registryTheme={theme}
        surfaceMode={mode}
        bodyFont={resolved.font}
        headingFont={resolved.fontHeading}
        styleName={resolved.style}
      >
        <ShadcnCard className="rounded-none bg-muted pt-0 [--gap:--spacing(4)] @md:[--gap:--spacing(6)] @3xl:[--gap:--spacing(12)] dark:bg-background style-lyra:@md:[--gap:--spacing(3)] style-mira:@md:[--gap:--spacing(3)]">
          <ShadcnCardContent className="grid grid-cols-2 items-start gap-(--gap) bg-muted p-(--gap)">
            <div className="flex flex-col gap-(--gap)">
              <StyleOverview
                style={resolved.style}
                font={resolved.font}
                fontHeading={resolved.fontHeading}
              />
              <PreviewIconGrid iconLibrary={resolved.iconLibrary} />
              <TypographySpecimenCard
                font={resolved.font}
                fontHeading={resolved.fontHeading}
              />
            </div>
            <div className="flex flex-col gap-(--gap)">
              <ObservabilityCard iconLibrary={resolved.iconLibrary} />
              <div className="grid grid-cols-2 gap-2">
                <TypographySpecimen type="body" font={resolved.font} />
                <TypographySpecimen
                  type="heading"
                  font={effectiveHeadingFont(
                    resolved.font,
                    resolved.fontHeading
                  )}
                />
              </div>
            </div>
          </ShadcnCardContent>
        </ShadcnCard>
      </PresetThemeSurface>
    </div>
  )
}
