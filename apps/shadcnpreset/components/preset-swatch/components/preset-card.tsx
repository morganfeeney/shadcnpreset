"use client"

import * as React from "react"
import { Card, CardContent } from "@/components/poc/ui/card"
import { Button } from "@/components/poc/ui/button"
import Link from "next/link"
import { useTheme } from "next-themes"

import { PresetThemeSurface } from "@/components/preset-theme-surface"
import { effectiveHeadingFont } from "@/lib/preset"
import type { PresetPageItem } from "@/lib/preset-catalog"
import { buildRegistryTheme, DEFAULT_CONFIG } from "@/registry/config"
import { TypographySpecimenCard } from "@/components/preset-swatch/components/cards/typography-specimen"
import { TypographySpecimen } from "@/components/preset-swatch/components/typography-specimen"

import { ColorSpecimen } from "@/components/preset-swatch/components/color-specimen"

const COLOR_SWATCHES = [
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

export function PresetCard({ item }: { item: PresetPageItem }) {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const mode = mounted && resolvedTheme === "dark" ? "dark" : "light"

  const theme = React.useMemo(
    () =>
      buildRegistryTheme({
        ...DEFAULT_CONFIG,
        baseColor: item.config.baseColor,
        theme: item.config.theme,
        chartColor: item.config.chartColor ?? item.config.theme,
        menuAccent: item.config.menuAccent,
        menuColor: item.config.menuColor,
        radius: item.config.style === "lyra" ? "none" : item.config.radius,
      }),
    [item]
  )

  if (!mounted) {
    return null
  }

  return (
    <PresetThemeSurface
      registryTheme={theme}
      surfaceMode={mode}
      bodyFont={item.config.font}
      headingFont={item.config.fontHeading}
      styleName={item.config.style}
    >
      <div className="bg-background">
        <div className="grid grid-cols-2 gap-2">
          <div className="grid gap-2">
            <Card>
              <CardContent className="grid gap-4">
                <TypographySpecimen type="body" font={item.config.font} />
                <TypographySpecimen
                  type="heading"
                  font={effectiveHeadingFont(
                    item.config.font,
                    item.config.fontHeading
                  )}
                />
                <div className="grid grid-cols-6 gap-2">
                  {COLOR_SWATCHES.map((token) => (
                    <div key={token} className="grid">
                      <span
                        className="size-6 rounded-md border border-border style-sera:rounded-none"
                        style={{ backgroundColor: `var(--${token})` }}
                      />
                    </div>
                  ))}
                </div>
                <div className="grid gap-2 lg:grid-cols-2">
                  {COLOR_SWATCHES.map((token) => (
                    <ColorSpecimen
                      key={token}
                      name={token}
                      value={`var(--${token})`}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
          <Card>
            <div className="grid justify-items-start gap-4">
              <div className="flex gap-2">
                <Button>Primary</Button>
                <Button variant="outline">Outline</Button>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">
                  font: {item.config.font} • heading: {item.config.fontHeading}{" "}
                  • radius: {item.config.radius}
                </p>
                <Link
                  href={`/preset/${item.code}`}
                  className="inline-block text-xs underline"
                >
                  Open preset page
                </Link>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </PresetThemeSurface>
  )
}
