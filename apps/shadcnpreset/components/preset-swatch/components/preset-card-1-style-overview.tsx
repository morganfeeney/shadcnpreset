"use client"

import * as React from "react"
import { useTheme } from "next-themes"

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/poc/ui/card"

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

type PresetCard1StyleOverviewProps = {
  initialCode: string
  className?: string
}

/**
 * Like `PresetCard1`, with a v4-style stack: `TypographySpecimenCard`, {@link StyleOverview}
 * (title + token grid), {@link PreviewIconGrid}, and {@link ObservabilityCard}. Still decodes
 * a preset, applies `buildRegistryTheme`, and composes v4-style preview blocks (no iframe).
 */
export function PresetCard1StyleOverview({
  initialCode,
  className,
}: PresetCard1StyleOverviewProps) {
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
    return (
      <Card className={cn("border-dashed", className)}>
        <CardHeader>
          <CardTitle className="text-base">Invalid preset</CardTitle>
          <CardDescription>Could not decode this code.</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <div className={className}>
      <PresetFontLoader fontValues={fontValues} />
      <PresetThemeSurface
        registryTheme={theme}
        surfaceMode={mode}
        bodyFont={resolved.font}
        headingFont={resolved.fontHeading}
        styleName={resolved.style}
      >
        <ShadcnCard className="bg-muted dark:bg-background">
          <ShadcnCardContent className="grid grid-cols-2 items-start gap-4 pt-0">
            <div className="flex flex-col gap-4">
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
            <div className="flex flex-col gap-4">
              <ObservabilityCard iconLibrary={resolved.iconLibrary} />
              <div className="grid grid-cols-2 gap-4">
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
