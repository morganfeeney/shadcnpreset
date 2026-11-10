"use client"

import * as React from "react"
import Link from "next/link"
import { converter, parse, wcagContrast } from "culori"
import { useTheme } from "next-themes"

import { Badge } from "@/components/cn-ui/badge"
import { Button as PreviewButton } from "@/components/cn-ui/button"
import { Input } from "@/components/cn-ui/input"
import { OklchPicker } from "@/components/custom-presets/oklch-picker"
import { PresetThemeSurface } from "@/components/preset-theme-surface"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useMounted } from "@/hooks/use-mounted"
import type { CustomColours } from "@/lib/custom-colours"
import {
  buildCustomPreset,
  DEFAULT_CUSTOM_PRESET_BASE,
} from "@/lib/custom-preset"
import { formatOklch, onScreen, readOklch } from "@/lib/oklch-colour"
import { customColoursPath } from "@/lib/preset-draft"

const toOklch = converter("oklch")

/**
 * Example colours across the wheel, in OKLCH: orange and yellow need dark
 * text, and the dark indigo gets lightened in dark mode.
 */
const EXAMPLES = [
  "#0f766e",
  "#e11d48",
  "#7c3aed",
  "#ea580c",
  "#facc15",
  "#1e1b4b",
].map((hex) => formatOklch(readOklch(hex)!))

/**
 * A short note, explained in a tooltip. Notes sit on a line that's there
 * anyway, or over an edge, so they never push the figure about.
 */
function NoteTag({ label, children }: { label: string; children: string }) {
  return (
    <Tooltip>
      <TooltipTrigger className="inline-flex h-5 shrink-0 items-center rounded-sm border bg-background px-1.5 text-[10px] leading-none font-medium text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring">
        {label}
      </TooltipTrigger>
      <TooltipContent className="max-w-60">{children}</TooltipContent>
    </Tooltip>
  )
}

/** Any CSS colour as a short `oklch(l c h)`, hue to the nearest degree. */
function shortOklch(colour: string) {
  const value = toOklch(parse(colour))
  if (!value) return "?"
  return `oklch(${value.l.toFixed(3)} ${value.c.toFixed(3)} ${Math.round(value.h ?? 0)})`
}

/**
 * One colour turned into a whole preset with the same code as the customise
 * panel on preset pages, shown on a few components in the site's mode, then
 * opened as that preset or copied as CSS.
 */
export function BrandColourPlayground() {
  const mounted = useMounted()
  const { resolvedTheme } = useTheme()
  const mode = mounted && resolvedTheme === "dark" ? "dark" : "light"

  const [colour, setColour] = React.useState(EXAMPLES[0])
  const [tintGreys, setTintGreys] = React.useState(false)
  const [copied, setCopied] = React.useState(false)

  const custom = React.useMemo<CustomColours>(
    () => ({
      theme: colour,
      chartColor: colour,
      baseColor: tintGreys ? colour : undefined,
      overrides: {},
    }),
    [colour, tintGreys]
  )
  const preset = React.useMemo(
    () => buildCustomPreset(DEFAULT_CUSTOM_PRESET_BASE, custom),
    [custom]
  )
  if (!preset) return null

  const vars = preset.colours[mode]
  const textContrast = wcagContrast(vars["primary-foreground"], vars.primary)

  async function copyCss() {
    if (!preset) return
    try {
      await navigator.clipboard.writeText(preset.css)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard blocked: the button just doesn't confirm
    }
  }

  const picked = readOklch(colour)
  const outOfRange = picked ? !onScreen(picked) : false
  const lightened = mode === "dark" && preset.colours.adjustments.length > 0

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-1 items-start gap-5 sm:grid-cols-[15rem_1fr]">
        <div className="flex flex-col gap-3">
          <div className="flex h-5 items-center justify-between gap-2">
            <Label className="text-xs">Your colour</Label>
            {outOfRange ? (
              <NoteTag label="Outside sRGB">
                Past what most screens show. They draw the nearest colour they
                can, and wide-gamut screens show it as it is.
              </NoteTag>
            ) : null}
          </div>
          {/* The picker sizes its canvas to the screen, so it waits for the
              browser; the slot is its height, so nothing moves when it lands */}
          <div className="min-h-[242px]">
            {mounted ? (
              <OklchPicker
                colour={colour}
                onChange={(next) => setColour(next)}
                screenNote={false}
              />
            ) : null}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {EXAMPLES.map((example) => (
              <button
                key={example}
                type="button"
                aria-label={`Try ${example}`}
                onClick={() => setColour(example)}
                className="size-6 rounded-full border"
                style={{ background: example }}
              />
            ))}
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

        <div className="flex min-w-0 flex-col gap-3">
          {/* Notes on the result sit over the preview's top edge, out of the flow */}
          <div className="relative">
            <PresetThemeSurface
              registryTheme={preset.registryTheme}
              surfaceMode={mode}
              bodyFont={preset.resolved.font}
              headingFont="inherit"
              styleName={preset.resolved.style}
              className="flex flex-col gap-4 rounded-lg border bg-background p-4 text-foreground"
            >
              <div className="flex flex-wrap items-center gap-2">
                <PreviewButton>Save changes</PreviewButton>
                <PreviewButton variant="outline">Cancel</PreviewButton>
                <Badge variant="secondary">Draft</Badge>
              </div>
              <Input
                aria-label="Example field"
                defaultValue="Focus to see my ring"
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
            {lightened || textContrast < 4.5 ? (
              <div className="absolute -top-2.5 right-3 flex gap-1.5">
                {lightened ? (
                  <NoteTag label="Lightened in dark mode">
                    Your colour is too dark to stand out from the dark
                    background, so dark mode uses a lighter version of it.
                  </NoteTag>
                ) : null}
                {textContrast < 4.5 ? (
                  <NoteTag label="Text under 4.5:1">
                    Hard to read for some people. Nudge the lightness up or down
                    until it reaches 4.5:1.
                  </NoteTag>
                ) : null}
              </div>
            ) : null}
          </div>

          <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs sm:grid-cols-3">
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
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 border-t pt-4">
        <Button
          nativeButton={false}
          // Not an article link: no underline from the article's link styles
          className="no-underline"
          render={
            <Link
              href={customColoursPath(DEFAULT_CUSTOM_PRESET_BASE, custom)}
            />
          }
        >
          Open as a preset
        </Button>
        <Button variant="outline" onClick={copyCss}>
          {copied ? "Copied" : "Copy CSS"}
        </Button>
        <span className="text-xs text-muted-foreground">
          Every colour token, light and dark, ready to install or paste.
        </span>
      </div>
    </div>
  )
}
