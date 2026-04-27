"use client"

import * as React from "react"
import { useTheme } from "next-themes"

import { Button } from "@/components/poc/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/poc/ui/card"
import { Input } from "@/components/poc/ui/input"
import { PresetFontLoader } from "@/components/preset-font-loader"
import { PresetThemeSurface } from "@/components/preset-theme-surface"
import { effectiveHeadingFont, resolvePresetFromCode } from "@/lib/preset"
import { buildRegistryTheme, DEFAULT_CONFIG } from "@/registry/config"

type PresetSwatchPocProps = {
  defaultCode: string
}

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

export function PresetSwatchPoc({ defaultCode }: PresetSwatchPocProps) {
  const [codeInput, setCodeInput] = React.useState(defaultCode)
  const [mounted, setMounted] = React.useState(false)
  const code = codeInput.trim()
  const resolved = React.useMemo(() => resolvePresetFromCode(code), [code])

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
    if (!resolved) return []
    return [resolved.font, effectiveHeadingFont(resolved.font, resolved.fontHeading)]
  }, [resolved])

  const { resolvedTheme } = useTheme()
  React.useEffect(() => {
    setMounted(true)
  }, [])

  const isDark = mounted && resolvedTheme === "dark"
  const activeSurface: "light" | "dark" = isDark ? "dark" : "light"
  const alternateSurface: "light" | "dark" = isDark ? "light" : "dark"

  if (!mounted) {
    return null
  }

  return (
    <section className="space-y-6">
      <PresetFontLoader fontValues={fontValues} />
      <label className="block space-y-2">
        <span className="text-sm font-medium">Preset code</span>
        <input
          className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
          value={codeInput}
          onChange={(event) => setCodeInput(event.target.value)}
          spellCheck={false}
        />
      </label>

      {!resolved ? (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          Invalid or non-canonical preset code.
        </div>
      ) : theme ? (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Decoded: style <strong>{resolved.style}</strong>, base color{" "}
            <strong>{resolved.baseColor}</strong>, theme{" "}
            <strong>{resolved.theme}</strong>, font{" "}
            <strong>{resolved.font}</strong>.
          </p>

          <div className="grid gap-4 md:grid-cols-2">
            <PresetThemeSurface
              registryTheme={theme}
              surfaceMode={activeSurface}
              bodyFont={resolved.font}
              headingFont={resolved.fontHeading}
              styleName={resolved.style}
            >
              <Card className="gap-3 p-4 text-card-foreground">
                <CardHeader className="gap-1 px-0 pt-0">
                  <p className="text-xs tracking-wider text-muted-foreground uppercase">
                    Active Theme ({isDark ? "Dark" : "Light"})
                  </p>
                  <CardTitle>Local Preset Swatch</CardTitle>
                  <CardDescription className="text-sm text-muted-foreground">
                    Style comes from decoded preset values and style-*
                    utilities.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 px-0">
                  <Input placeholder="Enter email" />
                </CardContent>
                <div className="mt-3 grid grid-cols-3 gap-2">
                  {COLOR_SWATCHES.map((token) => (
                    <div key={token} className="grid gap-1">
                      <span
                        className="h-8 w-full rounded-md border border-border style-sera:rounded-none"
                        style={{
                          backgroundColor: `var(--${token})`,
                        }}
                      />
                      <span className="text-[11px] text-muted-foreground">
                        {token}
                      </span>
                    </div>
                  ))}
                </div>
                <CardFooter className="mt-4 justify-start gap-2 border-0 bg-transparent p-0">
                  <Button>Primary</Button>
                  <Button variant="outline">Outline</Button>
                </CardFooter>
              </Card>
            </PresetThemeSurface>

            <PresetThemeSurface
              registryTheme={theme}
              surfaceMode={alternateSurface}
              bodyFont={resolved.font}
              headingFont={resolved.fontHeading}
              styleName={resolved.style}
            >
              <Card className="gap-3 p-4 text-card-foreground">
                <CardHeader className="gap-1 px-0 pt-0">
                  <p className="text-xs tracking-wider text-muted-foreground uppercase">
                    Alternate Theme ({isDark ? "Light" : "Dark"})
                  </p>
                  <CardTitle>Same Component Markup</CardTitle>
                  <CardDescription className="text-sm text-muted-foreground">
                    Only preset code changes are needed to restyle this preview.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 px-0">
                  <Input placeholder="Enter email" />
                </CardContent>
                <div className="mt-3 grid grid-cols-3 gap-2">
                  {COLOR_SWATCHES.map((token) => (
                    <div key={token} className="grid gap-1">
                      <span
                        className="h-8 w-full rounded-md border border-border style-sera:rounded-none"
                        style={{
                          backgroundColor: `var(--${token})`,
                        }}
                      />
                      <span className="text-[11px] text-muted-foreground">
                        {token}
                      </span>
                    </div>
                  ))}
                </div>
                <CardFooter className="mt-4 justify-start gap-2 border-0 bg-transparent p-0">
                  <Button>Primary</Button>
                  <Button variant="outline">Outline</Button>
                </CardFooter>
              </Card>
            </PresetThemeSurface>
          </div>
        </div>
      ) : null}
    </section>
  )
}
