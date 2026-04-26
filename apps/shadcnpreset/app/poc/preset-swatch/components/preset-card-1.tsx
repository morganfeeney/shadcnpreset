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
import { TypographySpecimenCard } from "@/app/poc/preset-swatch/components/cards/typography-specimen"
import { ColorSpecimen } from "@/app/poc/preset-swatch/components/color-specimen"
import { cn } from "@/lib/utils"

const SWATCH_TOKENS = [
  "background",
  "foreground",
  "card",
  "primary",
  "secondary",
  "accent",
  "sidebar",
  "chart-1",
  "chart-2",
  "chart-3",
  "chart-4",
  "chart-5",
] as const

function cssVarsToStyle(vars?: Record<string, string>): CSSProperties {
  const style: CSSProperties = {}
  for (const [key, value] of Object.entries(vars ?? {})) {
    ;(style as Record<string, string>)[`--${key}`] = value
  }
  return style
}

type PresetCard1Props = {
  initialCode: string
  className?: string
}

/**
 * A single card whose styles come from a preset code: registry theme variables,
 * style/base-color classes, and heading/body fonts — same building blocks as
 * `PresetCard` / `PresetSwatchPoc` (no iframe).
 */
export function PresetCard1({ initialCode, className }: PresetCard1Props) {
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
      resolved.fontHeading === "inherit"
        ? resolved.font
        : resolved.fontHeading,
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
                <CardTitle className="text-lg cn-font-heading">
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
          <CardContent className="grid gap-4">
            <TypographySpecimenCard
              font={resolved.font}
              fontHeading={resolved.fontHeading}
            />
            <div
              className="grid grid-cols-6 gap-1.5 sm:grid-cols-12"
              aria-label="Token swatches"
            >
              {SWATCH_TOKENS.map((token) => (
                <span
                  key={token}
                  title={token}
                  className="aspect-square rounded-md border border-border style-sera:rounded-none"
                  style={{ backgroundColor: `var(--${token})` }}
                />
              ))}
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <ColorSpecimen name="primary" value="var(--primary)" />
              <ColorSpecimen name="card" value="var(--card)" />
            </div>
            <div className="flex flex-wrap gap-2">
              <Button type="button">Primary</Button>
              <Button type="button" variant="outline">
                Outline
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
