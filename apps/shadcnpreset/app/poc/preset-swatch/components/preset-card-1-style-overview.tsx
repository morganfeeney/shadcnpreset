"use client"

import * as React from "react"
import { useTheme } from "next-themes"

import { Button } from "@/components/poc/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/poc/ui/card"

import {
  Card as ShadcnCard,
  CardContent as ShadcnCardContent,
  CardDescription as ShadcnCardDescription,
  CardHeader as ShadcnCardHeader,
  CardTitle as ShadcnCardTitle,
} from "@/components/ui/card"

import { PresetFontLoader } from "@/components/preset-font-loader"
import { PresetThemeSurface } from "@/components/preset-theme-surface"
import { effectiveHeadingFont, resolvePresetFromCode } from "@/lib/preset"
import { generateRandomCompatiblePreset } from "@/lib/random-preset"
import { buildRegistryTheme, DEFAULT_CONFIG } from "@/registry/config"
import { ObservabilityCard } from "@/app/poc/preset-swatch/components/cards/observability-card"
import { PreviewIconGrid } from "@/app/poc/preset-swatch/components/cards/icon-preview-grid"
import { StyleOverview } from "@/app/poc/preset-swatch/components/cards/style-overview"
import { TypographySpecimenCard } from "@/app/poc/preset-swatch/components/cards/typography-specimen"
import { cn } from "@/lib/utils"
import { TypographySpecimen } from "@/app/poc/preset-swatch/components/typography-specimen"

type PresetCard1StyleOverviewProps = {
  initialCode: string
  className?: string
}

/**
 * Like `PresetCard1`, with a v4-style stack: `TypographySpecimenCard`, {@link StyleOverview}
 * (title + token grid), {@link PreviewIconGrid}, and {@link ObservabilityCard}. Still decodes
 * a preset, applies `buildRegistryTheme`, and keeps the Random control.
 */
export function PresetCard1StyleOverview({
  initialCode,
  className,
}: PresetCard1StyleOverviewProps) {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)
  const [code, setCode] = React.useState(initialCode)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  React.useEffect(() => {
    setCode(initialCode)
  }, [initialCode])

  const resolved = React.useMemo(() => resolvePresetFromCode(code), [code])
  const mode = mounted && resolvedTheme === "dark" ? "dark" : "light"

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

  if (!mounted) {
    return null
  }

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
          <ShadcnCardHeader className="gap-2">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
              <div className="min-w-0">
                <CardTitle className="cn-font-heading text-lg">
                  Preset preview
                </CardTitle>
                <CardDescription className="font-mono text-xs break-all text-muted-foreground">
                  {code}
                </CardDescription>
              </div>
              <Button
                type="button"
                variant="secondary"
                className="w-full shrink-0 sm:w-auto"
                onClick={() => {
                  setCode(generateRandomCompatiblePreset())
                }}
              >
                Random
              </Button>
            </div>
          </ShadcnCardHeader>
          <ShadcnCardContent className="grid grid-cols-2 items-start gap-4 pt-0">
            <div className="flex flex-col gap-4">
              <StyleOverview
                style={resolved.style}
                font={resolved.font}
                fontHeading={resolved.fontHeading}
              />
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
              <TypographySpecimenCard
                font={resolved.font}
                fontHeading={resolved.fontHeading}
              />
            </div>
            <div className="flex flex-col gap-4">
              <PreviewIconGrid iconLibrary={resolved.iconLibrary} />
              <ObservabilityCard iconLibrary={resolved.iconLibrary} />
            </div>
          </ShadcnCardContent>
        </ShadcnCard>
      </PresetThemeSurface>
    </div>
  )
}
