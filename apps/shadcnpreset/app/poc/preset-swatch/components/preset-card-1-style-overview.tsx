"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import type { CSSProperties } from "react"

import { Button } from "@/components/poc/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/poc/ui/card"
import { PresetFontLoader } from "@/components/preset-font-loader"
import { getFontFamily, resolvePresetFromCode } from "@/lib/preset"
import { generateRandomCompatiblePreset } from "@/lib/random-preset"
import { buildRegistryTheme, DEFAULT_CONFIG } from "@/registry/config"
import { ObservabilityCard } from "@/app/poc/preset-swatch/components/cards/observability-card"
import { TypographySpecimenCard } from "@/app/poc/preset-swatch/components/cards/typography-specimen"
import { PresetSwatchStyleOverviewCard } from "@/app/poc/preset-swatch/components/style-overview-card"
import { cn } from "@/lib/utils"

function cssVarsToStyle(vars?: Record<string, string>): CSSProperties {
  const style: CSSProperties = {}
  for (const [key, value] of Object.entries(vars ?? {})) {
    ;(style as Record<string, string>)[`--${key}`] = value
  }
  return style
}

type PresetCard1StyleOverviewProps = {
  initialCode: string
  className?: string
}

/**
 * Like `PresetCard1`, but the body adds the v4-style overview stack: typography specimen,
 * then Style Overview (token grid) + icon grid. Still decodes a preset, applies
 * `buildRegistryTheme`, and keeps the Random control.
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

  const surfaceStyle = React.useMemo(() => {
    if (!resolved || !theme) {
      return undefined
    }
    const next = cssVarsToStyle(theme.cssVars?.[mode] as Record<string, string>)
    ;(next as Record<string, string>)["--font-sans"] = getFontFamily(
      resolved.font
    )
    ;(next as Record<string, string>)["--font-heading"] = getFontFamily(
      resolved.fontHeading === "inherit" ? resolved.font : resolved.fontHeading
    )
    return next
  }, [resolved, mode, theme])

  const fontValues = React.useMemo(() => {
    if (!resolved) {
      return [] as string[]
    }
    return [
      resolved.font,
      resolved.fontHeading === "inherit" ? resolved.font : resolved.fontHeading,
    ]
  }, [resolved])

  if (!mounted) {
    return null
  }

  if (!resolved || !theme || !surfaceStyle) {
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
      <div
        className={[mode === "dark" ? "dark" : null, `style-${resolved.style}`]
          .filter(Boolean)
          .join(" ")}
        style={surfaceStyle}
      >
        <Card className="overflow-hidden border-border bg-card text-card-foreground shadow-sm">
          <CardHeader className="gap-2">
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
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4 pt-0">
            <PresetSwatchStyleOverviewCard iconLibrary={resolved.iconLibrary} />
            <TypographySpecimenCard
              font={resolved.font}
              fontHeading={resolved.fontHeading}
            />
            <ObservabilityCard iconLibrary={resolved.iconLibrary} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
