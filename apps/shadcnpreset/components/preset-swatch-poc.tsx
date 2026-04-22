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
import { getFontFamily, resolvePresetFromCode } from "@/lib/preset"
import { buildRegistryTheme, DEFAULT_CONFIG } from "@/registry/config"

type PresetSwatchPocProps = {
  defaultCode: string
}

const CHART_SWATCH_STEPS = [1, 2, 3, 4, 5] as const
function cssVarsToStyle(vars?: Record<string, string>): React.CSSProperties {
  const style: React.CSSProperties = {}

  for (const [key, value] of Object.entries(vars ?? {})) {
    ;(style as Record<string, string>)[`--${key}`] = value
  }

  return style
}

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

  const lightStyle = React.useMemo(() => {
    const style = cssVarsToStyle(
      theme?.cssVars?.light as Record<string, string>
    )

    if (resolved) {
      ;(style as Record<string, string>)["--font-sans"] = getFontFamily(
        resolved.font
      )
      ;(style as Record<string, string>)["--font-heading"] = getFontFamily(
        resolved.fontHeading === "inherit"
          ? resolved.font
          : resolved.fontHeading
      )
    }

    return style
  }, [theme, resolved])

  const darkStyle = React.useMemo(() => {
    const style = cssVarsToStyle(theme?.cssVars?.dark as Record<string, string>)

    if (resolved) {
      ;(style as Record<string, string>)["--font-sans"] = getFontFamily(
        resolved.font
      )
      ;(style as Record<string, string>)["--font-heading"] = getFontFamily(
        resolved.fontHeading === "inherit"
          ? resolved.font
          : resolved.fontHeading
      )
    }

    return style
  }, [theme, resolved])

  const fontValues = React.useMemo(() => {
    if (!resolved) return []
    return [
      resolved.font,
      resolved.fontHeading === "inherit" ? resolved.font : resolved.fontHeading,
    ]
  }, [resolved])

  const { resolvedTheme } = useTheme()
  React.useEffect(() => {
    setMounted(true)
  }, [])

  const isDark = mounted && resolvedTheme === "dark"
  const activeStyle = isDark ? darkStyle : lightStyle
  const altStyle = isDark ? lightStyle : darkStyle

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
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Decoded: style <strong>{resolved.style}</strong>, base color{" "}
            <strong>{resolved.baseColor}</strong>, theme{" "}
            <strong>{resolved.theme}</strong>, font{" "}
            <strong>{resolved.font}</strong>.
          </p>

          <div className="grid gap-4 md:grid-cols-2">
            <div
              className={[isDark ? "dark" : null, `style-${resolved.style}`]
                .filter(Boolean)
                .join(" ")}
              style={activeStyle}
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
                <div className="mt-3 grid grid-cols-5 gap-2">
                  {CHART_SWATCH_STEPS.map((step) => (
                    <div key={step} className="grid justify-items-center gap-1">
                      <span
                        className="aspect-square w-full max-w-8 rounded-full border border-border style-sera:rounded-none"
                        style={{
                          backgroundColor: `var(--chart-${step})`,
                        }}
                      />
                      <span className="text-[11px] text-muted-foreground">
                        chart-{step}
                      </span>
                    </div>
                  ))}
                </div>
                <CardFooter className="mt-4 justify-start gap-2 border-0 bg-transparent p-0">
                  <Button>Primary</Button>
                  <Button variant="outline">Outline</Button>
                </CardFooter>
              </Card>
            </div>

            <div
              className={[isDark ? null : "dark", `style-${resolved.style}`]
                .filter(Boolean)
                .join(" ")}
              style={altStyle}
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
                <div className="mt-3 grid grid-cols-5 gap-2">
                  {CHART_SWATCH_STEPS.map((step) => (
                    <div key={step} className="grid justify-items-center gap-1">
                      <span
                        className="aspect-square w-full max-w-8 rounded-full border border-border style-sera:rounded-none"
                        style={{
                          backgroundColor: `var(--chart-${step})`,
                        }}
                      />
                      <span className="text-[11px] text-muted-foreground">
                        chart-{step}
                      </span>
                    </div>
                  ))}
                </div>
                <CardFooter className="mt-4 justify-start gap-2 border-0 bg-transparent p-0">
                  <Button>Primary</Button>
                  <Button variant="outline">Outline</Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
