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

const CHART_SWATCH_STEPS = [1, 2, 3, 4, 5] as const

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
      <Card>
        <CardHeader>
          <p className="text-xs tracking-wider text-muted-foreground uppercase">
            code: {item.code}
          </p>
          <CardTitle>{item.config.style} preview</CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            {item.config.baseColor}/{item.config.theme} • chart{" "}
            {item.config.chartColor ?? item.config.theme} •{" "}
            {item.config.iconLibrary}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-5">
            {CHART_SWATCH_STEPS.map((step) => (
              <div key={step} className="grid">
                <span
                  className="aspect-square w-full border border-border"
                  style={{ backgroundColor: `var(--chart-${step})` }}
                />
              </div>
            ))}
          </div>
        </CardContent>
        <CardFooter className="grid justify-items-start gap-4">
          <div className="flex gap-2">
            <Button>Primary</Button>
            <Button variant="outline">Outline</Button>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">
              font: {item.config.font} • heading: {item.config.fontHeading} •
              radius: {item.config.radius}
            </p>
            <Link
              href={`/preset/${item.code}`}
              className="inline-block text-xs underline"
            >
              Open preset page
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
