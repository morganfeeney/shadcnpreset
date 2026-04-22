"use client"

import * as React from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/poc/ui/card"
import { Button } from "@/components/poc/ui/button"
import Link from "next/link"
import type { CSSProperties } from "react"
import { useTheme } from "next-themes"

import { getFontFamily } from "@/lib/preset"
import type { PresetPageItem } from "@/lib/preset-catalog"
import { buildRegistryTheme, DEFAULT_CONFIG } from "@/registry/config"
import { TypographySpecimen } from "@/app/poc/preset-swatch/components/typography-specimen"
import { ColorSpecimen } from "@/app/poc/preset-swatch/components/color-specimen"

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

function cssVarsToStyle(vars?: Record<string, string>): CSSProperties {
  const style: CSSProperties = {}
  for (const [key, value] of Object.entries(vars ?? {})) {
    ;(style as Record<string, string>)[`--${key}`] = value
  }
  return style
}

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

  const style = React.useMemo(() => {
    const nextStyle = cssVarsToStyle(
      theme.cssVars?.[mode] as Record<string, string>
    )
    ;(nextStyle as Record<string, string>)["--font-sans"] = getFontFamily(
      item.config.font
    )
    ;(nextStyle as Record<string, string>)["--font-heading"] = getFontFamily(
      item.config.fontHeading === "inherit"
        ? item.config.font
        : item.config.fontHeading
    )
    return nextStyle
  }, [item, mode, theme])

  if (!mounted) {
    return null
  }

  return (
    <div
      className={[mode === "dark" ? "dark" : null, `style-${item.config.style}`]
        .filter(Boolean)
        .join(" ")}
      style={style}
    >
      <div className="bg-background">
        <div className="grid grid-cols-2 gap-2">
          <div className="grid gap-2">
            <Card>
              <CardContent className="grid gap-4">
                <div className="grid gap-2">
                  <TypographySpecimen
                    type="heading"
                    font={item.config.fontHeading}
                  />
                  <TypographySpecimen type="body" font={item.config.font} />
                </div>
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
            <Card>
              <CardContent></CardContent>
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
    </div>
  )
}
