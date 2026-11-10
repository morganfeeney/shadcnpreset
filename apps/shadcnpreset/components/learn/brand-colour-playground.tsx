"use client"

import * as React from "react"
import { converter, parse, wcagContrast } from "culori"
import { useTheme } from "next-themes"

import { Badge } from "@/components/cn-ui/badge"
import { Button } from "@/components/cn-ui/button"
import { Input } from "@/components/cn-ui/input"
import { PresetThemeSurface } from "@/components/preset-theme-surface"
import { Input as FieldInput } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useMounted } from "@/hooks/use-mounted"
import { buildCustomTheme } from "@/lib/custom-colours"
import { buildRegistryTheme, DEFAULT_CONFIG } from "@/registry/config"

const toOklch = converter("oklch")

/**
 * Example colours across the wheel: orange and yellow need dark text, and the
 * dark indigo gets lightened in dark mode.
 */
const EXAMPLES = [
  "#0f766e",
  "#e11d48",
  "#7c3aed",
  "#ea580c",
  "#facc15",
  "#1e1b4b",
]

/** A plain neutral preset, so the colour given is the only colour. */
const NEUTRAL_PRESET: Parameters<typeof buildCustomTheme>[0] = {
  baseColor: "neutral",
  theme: "neutral",
  effectiveChartColor: "neutral",
  menuAccent: DEFAULT_CONFIG.menuAccent,
  radius: undefined,
}

/** Any CSS colour as a short `oklch(l c h)`, hue to the nearest degree. */
function shortOklch(colour: string) {
  const value = toOklch(parse(colour))
  if (!value) return "?"
  return `oklch(${value.l.toFixed(3)} ${value.c.toFixed(3)} ${Math.round(value.h ?? 0)})`
}

/**
 * Turns one colour into a full theme with the same code the preset page's
 * customizer uses, and shows it on a few components in the site's mode.
 */
export function BrandColourPlayground() {
  const mounted = useMounted()
  const { resolvedTheme } = useTheme()
  const mode = mounted && resolvedTheme === "dark" ? "dark" : "light"

  const [colour, setColour] = React.useState(EXAMPLES[0])
  const [draft, setDraft] = React.useState(EXAMPLES[0])
  const [tintGreys, setTintGreys] = React.useState(false)

  const theme = React.useMemo(() => {
    const built = buildCustomTheme(NEUTRAL_PRESET, {
      theme: colour,
      chartColor: colour,
      baseColor: tintGreys ? colour : undefined,
      overrides: {},
    })
    const surface = buildRegistryTheme(DEFAULT_CONFIG)
    return {
      ...built,
      surface: {
        ...surface,
        cssVars: { light: built.light, dark: built.dark },
      },
    }
  }, [colour, tintGreys])

  const vars = mode === "dark" ? theme.dark : theme.light
  const textContrast = wcagContrast(vars["primary-foreground"], vars.primary)

  function choose(next: string) {
    setDraft(next)
    if (parse(next)) setColour(next)
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex flex-col gap-2">
            <Label htmlFor="brand-colour-value" className="text-xs">
              Your colour
            </Label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                aria-label="Pick a colour"
                value={/^#[0-9a-f]{6}$/i.test(colour) ? colour : "#000000"}
                onChange={(event) => choose(event.target.value)}
                className="size-9 shrink-0 cursor-pointer rounded-md border bg-transparent p-0.5"
              />
              <FieldInput
                id="brand-colour-value"
                value={draft}
                onChange={(event) => choose(event.target.value)}
                spellCheck={false}
                className="w-40 font-mono text-xs"
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5 pb-1.5">
            {EXAMPLES.map((example) => (
              <button
                key={example}
                type="button"
                aria-label={`Try ${example}`}
                onClick={() => choose(example)}
                className="size-6 rounded-full border"
                style={{ background: example }}
              />
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Switch
            id="brand-colour-tint"
            checked={tintGreys}
            onCheckedChange={setTintGreys}
          />
          <Label htmlFor="brand-colour-tint" className="text-xs">
            Tint the greys with it too
          </Label>
        </div>
      </div>

      <PresetThemeSurface
        registryTheme={theme.surface}
        surfaceMode={mode}
        bodyFont={DEFAULT_CONFIG.font}
        headingFont="inherit"
        styleName={DEFAULT_CONFIG.style}
        className="flex flex-col gap-4 rounded-lg border bg-background p-4 text-foreground"
      >
        <div className="flex flex-wrap items-center gap-2">
          <Button>Save changes</Button>
          <Button variant="outline">Cancel</Button>
          <Badge variant="secondary">Draft</Badge>
        </div>
        <Input
          aria-label="Example field"
          defaultValue="Focus me to see the ring"
          className="max-w-xs"
        />
        <p className="text-sm text-muted-foreground">
          Muted text sits on the background, borders around the field.
        </p>
        <div className="flex h-16 items-end gap-2" aria-hidden>
          {[0.55, 0.8, 1, 0.7, 0.45].map((height, i) => (
            <div
              key={i}
              className="flex-1 rounded-t-sm"
              style={{
                height: `${height * 100}%`,
                background: `var(--chart-${i + 1})`,
              }}
            />
          ))}
        </div>
      </PresetThemeSurface>

      <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs sm:grid-cols-4">
        <div>
          <dt className="text-muted-foreground">Your colour</dt>
          <dd className="font-mono">{shortOklch(colour)}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Primary, {mode} mode</dt>
          <dd className="font-mono">{shortOklch(vars.primary)}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Button text</dt>
          <dd className="font-mono">
            {shortOklch(vars["primary-foreground"])}
          </dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Text contrast</dt>
          <dd className="font-mono">{textContrast.toFixed(1)}:1</dd>
        </div>
      </dl>
      {theme.adjustments.length ? (
        <ul className="list-disc pl-5 text-xs text-muted-foreground">
          {theme.adjustments.map((adjustment) => (
            <li key={adjustment}>{adjustment}</li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}
