"use client"

import * as React from "react"
import { Slider as SliderPrimitive } from "@base-ui/react/slider"

import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { isUsableColour } from "@/lib/brand-theme"
import {
  areaColour,
  areaPosition,
  formatOklch,
  MAX_CHROMA,
  onScreen,
  paintArea,
  readOklch,
  type Lch,
} from "@/lib/oklch-colour"
import { cn } from "@/lib/utils"

/**
 * The area's pixels: about its size on screen, so the edge of what a screen
 * shows stays smooth, and still quick enough to repaint while the hue drags.
 */
const AREA_WIDTH = 240
const AREA_HEIGHT = 144

const HUE_TRACK = `linear-gradient(to right, ${Array.from(
  { length: 13 },
  (_, i) => `oklch(0.72 0.13 ${i * 30})`
).join(", ")})`

type OnChange = (colour: string, settle: boolean) => void

/**
 * One exact colour, picked in OKLCH: chroma across and lightness up at one
 * hue, the hue under it, and each value to type. Colours an ordinary screen
 * can't show are hatched, and kept if chosen. `settle` is false mid-drag.
 */
export function OklchPicker({
  colour,
  onChange,
}: {
  colour: string
  onChange: OnChange
}) {
  // The hue lives here as well as in the colour: a grey has none, and
  // dragging through one must not lose the hue being worked in.
  const [lch, setLch] = React.useState<Lch>(
    () => readOklch(colour) ?? { l: 0.5, c: 0, h: 0 }
  )
  const [synced, setSynced] = React.useState(colour)
  if (colour !== synced) {
    setSynced(colour)
    const next = readOklch(colour)
    if (next) setLch(next.c < 0.001 ? { ...next, h: lch.h } : next)
  }

  function move(next: Lch, settle: boolean) {
    const value = formatOklch(next)
    setLch(next)
    setSynced(value)
    onChange(value, settle)
  }

  const canvas = React.useRef<HTMLCanvasElement>(null)
  React.useEffect(() => {
    const context = canvas.current?.getContext("2d")
    if (!context) return
    const pixels = paintArea(lch.h, AREA_WIDTH, AREA_HEIGHT)
    context.putImageData(new ImageData(pixels, AREA_WIDTH, AREA_HEIGHT), 0, 0)
  }, [lch.h])

  const dragging = React.useRef(false)
  function pickAt(event: React.PointerEvent<HTMLDivElement>, settle: boolean) {
    const box = event.currentTarget.getBoundingClientRect()
    move(
      areaColour(
        (event.clientX - box.left) / box.width,
        (event.clientY - box.top) / box.height,
        lch.h
      ),
      settle
    )
  }

  const marker = areaPosition(lch)

  return (
    <div className="grid grid-cols-1 gap-2.5">
      {/* Pointer only: the fields below do the same from the keyboard. */}
      <div
        aria-hidden
        className="relative h-36 cursor-crosshair touch-none overflow-hidden rounded-md bg-[repeating-linear-gradient(135deg,var(--color-muted)_0_4px,transparent_4px_8px)]"
        onPointerDown={(event) => {
          event.currentTarget.setPointerCapture(event.pointerId)
          dragging.current = true
          pickAt(event, false)
        }}
        onPointerMove={(event) => {
          if (dragging.current) pickAt(event, false)
        }}
        onPointerUp={(event) => {
          if (!dragging.current) return
          dragging.current = false
          pickAt(event, true)
        }}
      >
        <canvas
          ref={canvas}
          width={AREA_WIDTH}
          height={AREA_HEIGHT}
          className="absolute inset-0 size-full"
        />
        <span
          className="pointer-events-none absolute -mt-1.5 -ml-1.5 size-3 rounded-full border-2 border-white shadow-[0_0_0_1px_rgb(0_0_0/0.5)]"
          style={{ left: `${marker.x * 100}%`, top: `${marker.y * 100}%` }}
        />
      </div>

      <SliderPrimitive.Root
        value={lch.h}
        min={0}
        max={360}
        step={0.1}
        thumbAlignment="edge"
        onValueChange={(value) => move({ ...lch, h: value as number }, false)}
        onValueCommitted={(value) => move({ ...lch, h: value as number }, true)}
      >
        <SliderPrimitive.Control className="relative flex h-3 w-full touch-none items-center select-none">
          <SliderPrimitive.Track
            className="h-3 w-full rounded-full"
            style={{ background: HUE_TRACK }}
          />
          <SliderPrimitive.Thumb
            aria-label="Hue"
            className="block size-3.5 rounded-full border-2 border-white shadow-[0_0_0_1px_rgb(0_0_0/0.5)] outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          />
        </SliderPrimitive.Control>
      </SliderPrimitive.Root>

      <div className="grid grid-cols-3 gap-1.5">
        <ChannelField
          label="L"
          name="Lightness, percent"
          value={Math.round(lch.l * 1000) / 10}
          min={0}
          max={100}
          onCommit={(l) => move({ ...lch, l: l / 100 }, true)}
        />
        <ChannelField
          label="C"
          name="Chroma"
          value={Math.round(lch.c * 1000) / 1000}
          min={0}
          max={MAX_CHROMA}
          onCommit={(c) => move({ ...lch, c }, true)}
        />
        <ChannelField
          label="H"
          name="Hue, degrees"
          value={Math.round(lch.h * 10) / 10}
          min={0}
          max={360}
          onCommit={(h) => move({ ...lch, h }, true)}
        />
      </div>

      <ColourText colour={colour} onChange={onChange} />

      {onScreen(lch) ? null : (
        <p className="text-xs text-muted-foreground">
          Past what most screens show. They show it as near as they can, and
          wide-gamut screens show it as it is.
        </p>
      )}
    </div>
  )
}

/** One of L, C or H to type, applied on Enter or leaving the field. */
function ChannelField({
  label,
  name,
  value,
  min,
  max,
  onCommit,
}: {
  label: string
  name: string
  value: number
  min: number
  max: number
  onCommit: (value: number) => void
}) {
  const [draft, setDraft] = React.useState(String(value))
  const [synced, setSynced] = React.useState(value)
  if (value !== synced) {
    setSynced(value)
    setDraft(String(value))
  }

  function commit() {
    const next = Number.parseFloat(draft)
    if (Number.isNaN(next)) return setDraft(String(value))
    const clamped = Math.min(max, Math.max(min, next))
    if (clamped !== value) onCommit(clamped)
    else setDraft(String(value))
  }

  return (
    <label className="flex h-7 items-center gap-1.5 rounded-md bg-muted px-2 text-xs">
      <span aria-hidden className="text-muted-foreground">
        {label}
      </span>
      <input
        aria-label={name}
        inputMode="decimal"
        value={draft}
        className="min-w-0 flex-1 bg-transparent font-mono outline-none"
        onChange={(event) => setDraft(event.target.value)}
        onBlur={commit}
        onKeyDown={(event) => {
          if (event.key === "Enter") commit()
        }}
      />
    </label>
  )
}

/** The colour as text, to read or paste: any CSS colour, kept as typed. */
function ColourText({
  colour,
  onChange,
}: {
  colour: string
  onChange: OnChange
}) {
  const [draft, setDraft] = React.useState(colour)
  const [synced, setSynced] = React.useState(colour)
  if (colour !== synced) {
    setSynced(colour)
    setDraft(colour)
  }

  function commit() {
    const value = draft.trim()
    if (value === colour) return
    if (isUsableColour(value)) onChange(value, true)
    else setDraft(colour)
  }

  return (
    <Input
      aria-label="Colour"
      value={draft}
      spellCheck={false}
      className="h-7 font-mono text-xs"
      onChange={(event) => setDraft(event.target.value)}
      onBlur={commit}
      onKeyDown={(event) => {
        if (event.key === "Enter") commit()
      }}
    />
  )
}

/**
 * A custom colour in the properties column: its swatch and value, opening
 * the picker beside the column.
 */
export function OklchField({
  label,
  colour,
  disabled,
  onChange,
  className,
}: {
  label: string
  colour: string
  disabled: boolean
  onChange: OnChange
  className?: string
}) {
  return (
    <Popover>
      <PopoverTrigger
        disabled={disabled}
        aria-label={`${label}: ${colour}`}
        className={cn(
          "flex h-7 min-w-0 items-center gap-2 rounded-md bg-muted px-2 text-left text-xs outline-none focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-default data-popup-open:ring-1 data-popup-open:ring-ring",
          className
        )}
      >
        <span
          aria-hidden
          className="size-3.5 shrink-0 rounded-sm border"
          style={{ background: colour }}
        />
        <span className="min-w-0 flex-1 truncate font-mono">{colour}</span>
      </PopoverTrigger>
      <PopoverContent
        side="left"
        align="start"
        sideOffset={12}
        aria-label={label}
        className="w-64 p-2.5"
      >
        <OklchPicker colour={colour} onChange={onChange} />
      </PopoverContent>
    </Popover>
  )
}
