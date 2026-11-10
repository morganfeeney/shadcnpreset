"use client"

import * as React from "react"
import { clampChroma, converter, parse, wcagContrast, type Oklch } from "culori"

import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"

const toOklch = converter("oklch")

/** Named hues at full HSL saturation and their nearest OKLCH hue. */
const HUES = [
  { name: "Red", hsl: 0, oklch: 25 },
  { name: "Orange", hsl: 30, oklch: 55 },
  { name: "Yellow", hsl: 55, oklch: 95 },
  { name: "Green", hsl: 120, oklch: 145 },
  { name: "Teal", hsl: 175, oklch: 185 },
  { name: "Blue", hsl: 220, oklch: 255 },
  { name: "Violet", hsl: 270, oklch: 295 },
  { name: "Pink", hsl: 330, oklch: 350 },
] as const

const round = (n: number, digits = 2) => n.toFixed(digits)

function oklchCss(c: Pick<Oklch, "l" | "c" | "h">) {
  return `oklch(${round(c.l, 3)} ${round(c.c, 3)} ${round(c.h ?? 0, 1)})`
}

type Gamut = "rgb" | "p3"

const P3_QUERY = "(color-gamut: p3)"

function subscribeToGamut(onChange: () => void) {
  const query = window.matchMedia(P3_QUERY)
  query.addEventListener("change", onChange)
  return () => query.removeEventListener("change", onChange)
}

/**
 * The colour range this screen can show: Display P3 on most recent Macs and
 * phones, sRGB otherwise (and on the server).
 */
function useScreenGamut(): Gamut {
  return React.useSyncExternalStore(
    subscribeToGamut,
    () => (window.matchMedia(P3_QUERY).matches ? "p3" : "rgb"),
    () => "rgb"
  )
}

/** The most chroma `h` can have at lightness `l` on a screen showing `gamut`. */
function maxChroma(l: number, h: number, gamut: Gamut) {
  const most: Oklch = { mode: "oklch", l, c: 0.4, h }
  return (clampChroma(most, "oklch", gamut) as Oklch).c
}

function measuredLightness(css: string) {
  const colour = toOklch(parse(css))
  return colour ? round(colour.l) : "?"
}

function SliderField({
  id,
  label,
  value,
  min,
  max,
  step,
  display,
  onChange,
}: {
  id: string
  label: string
  value: number
  min: number
  max: number
  step: number
  display: string
  onChange: (value: number) => void
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <Label id={`${id}-label`} className="text-xs">
          {label}
        </Label>
        <span className="font-mono text-xs text-muted-foreground">
          {display}
        </span>
      </div>
      <Slider
        aria-labelledby={`${id}-label`}
        min={min}
        max={max}
        step={step}
        value={[value]}
        onValueChange={(next) => onChange(Array.isArray(next) ? next[0] : next)}
      />
    </div>
  )
}

function Swatch({
  colour,
  label,
  detail,
}: {
  colour: string
  label: string
  detail: string
}) {
  return (
    <div className="flex min-w-0 flex-col gap-1">
      <div className="h-10 rounded-md border" style={{ background: colour }} />
      <span className="text-xs font-medium">{label}</span>
      <span className="font-mono text-[11px] text-muted-foreground">
        {detail}
      </span>
    </div>
  )
}

/**
 * One lightness slider drives both rows: HSL at that lightness percentage,
 * OKLCH at that lightness. Under each swatch is its measured OKLCH lightness.
 */
export function LightnessPlayground() {
  const gamut = useScreenGamut()
  const [lightness, setLightness] = React.useState(0.68)
  const [chroma, setChroma] = React.useState(0.15)

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <SliderField
          id="oklch-lightness"
          label="Lightness"
          value={lightness}
          min={0.3}
          max={0.9}
          step={0.01}
          display={`OKLCH ${round(lightness)} · HSL ${Math.round(lightness * 100)}%`}
          onChange={setLightness}
        />
        <SliderField
          id="oklch-chroma"
          label="Chroma (OKLCH only)"
          value={chroma}
          min={0}
          max={0.3}
          step={0.005}
          display={round(chroma, 3)}
          onChange={setChroma}
        />
      </div>
      <div className="flex flex-col gap-2">
        <span className="font-mono text-xs text-muted-foreground">
          hsl(h 85% {Math.round(lightness * 100)}%)
        </span>
        <div className="grid grid-cols-4 gap-3 sm:grid-cols-8">
          {HUES.map((hue) => {
            const css = `hsl(${hue.hsl} 85% ${Math.round(lightness * 100)}%)`
            return (
              <Swatch
                key={hue.name}
                colour={css}
                label={hue.name}
                detail={`L ${measuredLightness(css)}`}
              />
            )
          })}
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <span className="font-mono text-xs text-muted-foreground">
          oklch({round(lightness)} {round(chroma, 3)} h)
        </span>
        <div className="grid grid-cols-4 gap-3 sm:grid-cols-8">
          {HUES.map((hue) => {
            const colour: Oklch = {
              mode: "oklch",
              l: lightness,
              c: chroma,
              h: hue.oklch,
            }
            const most = maxChroma(lightness, hue.oklch, gamut)
            return (
              <Swatch
                key={hue.name}
                colour={oklchCss(colour)}
                label={hue.name}
                detail={
                  chroma <= most + 0.0005
                    ? `L ${round(lightness)}`
                    : `max C ${round(most)}`
                }
              />
            )
          })}
        </div>
      </div>
    </div>
  )
}

/**
 * A real --primary taken apart into lightness, chroma and hue, with the hue
 * on a slider: lightness holds, chroma holds until the hue can't reach it on
 * this screen, and the text contrast moves a little.
 */
export function HueSwapPlayground({
  primary,
  foreground,
}: {
  primary: string
  foreground: string
}) {
  const gamut = useScreenGamut()
  const base = toOklch(parse(primary))
  const [hue, setHue] = React.useState(Math.round(base?.h ?? 264))
  if (!base) return null

  const asked: Oklch = { mode: "oklch", l: base.l, c: base.c, h: hue }
  const shown = clampChroma(asked, "oklch", gamut) as Oklch
  const fits = asked.c <= shown.c + 0.0005
  const contrast = wcagContrast(shown, foreground)

  return (
    <div className="flex flex-col gap-4">
      <div
        className="flex h-16 items-center justify-center rounded-md border text-sm font-medium"
        style={{ background: oklchCss(shown), color: foreground }}
      >
        Save changes
      </div>
      <span className="font-mono text-xs">
        --primary: oklch({round(asked.l, 3)} {round(asked.c, 3)} {hue})
      </span>
      <SliderField
        id="oklch-hue"
        label="Hue"
        value={hue}
        min={0}
        max={360}
        step={1}
        display={`${hue}°`}
        onChange={setHue}
      />
      <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-xs sm:grid-cols-4">
        <div>
          <dt className="text-muted-foreground">Lightness</dt>
          <dd className="font-mono">{round(shown.l, 3)}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Chroma</dt>
          <dd className="font-mono">{round(shown.c, 3)}</dd>
          {fits ? null : (
            <dd className="text-muted-foreground">
              Most this hue reaches; asked for {round(asked.c, 3)}
            </dd>
          )}
        </div>
        <div>
          <dt className="text-muted-foreground">Hue</dt>
          <dd className="font-mono">{hue}°</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Text contrast</dt>
          <dd className="font-mono">{round(contrast, 1)}:1</dd>
        </div>
      </dl>
    </div>
  )
}
