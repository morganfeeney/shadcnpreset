"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import { PRESET_STYLES, type PresetConfig } from "shadcn/preset"

import { Badge } from "@/components/cn-ui/badge"
import { Button } from "@/components/cn-ui/button"
import { Checkbox } from "@/components/cn-ui/checkbox"
import { Input } from "@/components/cn-ui/input"
import { Label } from "@/components/cn-ui/label"
import { Switch } from "@/components/cn-ui/switch"
import { PresetThemeSurface } from "@/components/preset-theme-surface"
import { useMounted } from "@/hooks/use-mounted"
import { cn } from "@/lib/utils"
import {
  buildRegistryTheme,
  DEFAULT_CONFIG,
  STYLES,
  type BaseColorName,
  type RadiusValue,
  type ThemeName,
} from "@/registry/config"

type StyleName = PresetConfig["style"]

const CONTROLS = ["button", "input", "switch", "checkbox", "badge"] as const
export type StyleShowcaseControl = (typeof CONTROLS)[number]

/** Every CLI style, ordered as shadcn's create picker lists them, then the three undocumented ones. */
const ALL_STYLES: readonly StyleName[] = [
  "vega",
  "nova",
  "maia",
  "lyra",
  "mira",
  ...PRESET_STYLES.filter(
    (s) => !["vega", "nova", "maia", "lyra", "mira"].includes(s)
  ),
]

export type StyleShowcaseProps = {
  /** Which styles to render. Defaults to all eight, matching the order in the styles article. */
  styles?: readonly StyleName[]
  /** Which controls to render inside each style. Defaults to the button pair. */
  controls?: readonly StyleShowcaseControl[]
  /** Held constant across every cell so only the style differs. */
  baseColor?: BaseColorName
  theme?: ThemeName
  radius?: RadiusValue
  /** Shown under the grid, e.g. what the reader should look at. */
  caption?: React.ReactNode
  className?: string
}

function styleTitle(name: StyleName): string {
  const known = STYLES.find((s) => s.name === name)
  if (known) return known.title
  return name.charAt(0).toUpperCase() + name.slice(1)
}

/**
 * Renders the real `cn-ui` controls under each `style-*` class so a learn
 * article can show the shapes it describes instead of quoting class names.
 * Colour, radius and font are fixed per instance; the style is the only
 * thing that changes between cells.
 */
export function StyleShowcase({
  styles = ALL_STYLES,
  controls = ["button"],
  baseColor = DEFAULT_CONFIG.baseColor,
  theme = DEFAULT_CONFIG.theme,
  radius = DEFAULT_CONFIG.radius,
  caption,
  className,
}: StyleShowcaseProps) {
  const mounted = useMounted()
  const { resolvedTheme } = useTheme()
  const mode = mounted && resolvedTheme === "dark" ? "dark" : "light"

  const registryTheme = React.useMemo(
    () =>
      buildRegistryTheme({
        ...DEFAULT_CONFIG,
        baseColor,
        theme,
        chartColor: theme,
        radius,
      }),
    [baseColor, theme, radius]
  )

  const showControls = new Set(controls)
  const wide = showControls.has("input")
  const cols =
    styles.length === 1
      ? "grid-cols-1"
      : styles.length === 2 || wide
        ? "grid-cols-1 sm:grid-cols-2"
        : "grid-cols-2 sm:grid-cols-4"

  return (
    <figure className={cn("not-markdown my-6", className)}>
      <div
        className={cn(
          "grid gap-px overflow-hidden rounded-lg border bg-border",
          cols
        )}
      >
        {styles.map((style) => (
          <PresetThemeSurface
            key={style}
            registryTheme={registryTheme}
            surfaceMode={mode}
            bodyFont={DEFAULT_CONFIG.font}
            headingFont="inherit"
            styleName={style}
            className="flex flex-col gap-4 bg-background p-4 text-foreground"
          >
            <div className="font-mono text-xs text-muted-foreground">
              {styleTitle(style)}
            </div>
            {showControls.has("button") ? (
              <div className="flex flex-wrap items-center gap-2">
                <Button>Save</Button>
                <Button variant="outline">Cancel</Button>
              </div>
            ) : null}
            {showControls.has("badge") ? (
              <div className="flex flex-wrap items-center gap-2">
                <Badge>New</Badge>
                <Badge variant="secondary">Beta</Badge>
                <Badge variant="outline">Draft</Badge>
              </div>
            ) : null}
            {showControls.has("input") ? (
              <div className="flex flex-col gap-2">
                <Label htmlFor={`style-showcase-${style}-email`}>Email</Label>
                <Input
                  id={`style-showcase-${style}-email`}
                  type="email"
                  placeholder="you@example.com"
                />
              </div>
            ) : null}
            {showControls.has("switch") || showControls.has("checkbox") ? (
              <div className="flex flex-wrap items-center gap-6">
                {showControls.has("switch") ? (
                  <div className="flex items-center gap-2">
                    <Switch
                      id={`style-showcase-${style}-switch`}
                      defaultChecked
                    />
                    <Label htmlFor={`style-showcase-${style}-switch`}>
                      Notify
                    </Label>
                  </div>
                ) : null}
                {showControls.has("checkbox") ? (
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id={`style-showcase-${style}-check`}
                      defaultChecked
                    />
                    <Label htmlFor={`style-showcase-${style}-check`}>
                      Remember me
                    </Label>
                  </div>
                ) : null}
              </div>
            ) : null}
          </PresetThemeSurface>
        ))}
      </div>
      {caption ? (
        <figcaption className="mt-2 pl-2 text-xs text-muted-foreground">
          {caption}
        </figcaption>
      ) : null}
    </figure>
  )
}
