"use client"

import * as React from "react"
import { formatHex, parse, wcagContrast } from "culori"

interface ColorSpecimenProps {
  name: string
  value: string
}

const TONAL_STOPS = [
  "black",
  "color-mix(in oklch, black 80%, var(--specimen-color))",
  "color-mix(in oklch, black 60%, var(--specimen-color))",
  "color-mix(in oklch, black 40%, var(--specimen-color))",
  "color-mix(in oklch, black 20%, var(--specimen-color))",
  "var(--specimen-color)",
  "color-mix(in oklch, white 15%, var(--specimen-color))",
  "color-mix(in oklch, white 30%, var(--specimen-color))",
  "color-mix(in oklch, white 45%, var(--specimen-color))",
  "color-mix(in oklch, white 60%, var(--specimen-color))",
  "color-mix(in oklch, white 75%, var(--specimen-color))",
  "white",
] as const

const BLACK = parse("#000")!
const WHITE = parse("#fff")!

export function ColorSpecimen({ name, value }: ColorSpecimenProps) {
  const surfaceRef = React.useRef<HTMLDivElement>(null)
  const [resolvedValue, setResolvedValue] = React.useState(value)
  const [textColor, setTextColor] = React.useState<"#000000" | "#FFFFFF">(
    "#FFFFFF"
  )

  React.useEffect(() => {
    const element = surfaceRef.current

    if (!element) {
      return
    }

    const backgroundColor = getComputedStyle(element).backgroundColor
    const color = parse(backgroundColor)

    if (!color) {
      setResolvedValue(value)
      setTextColor("#FFFFFF")
      return
    }

    setResolvedValue(formatHex(color).toUpperCase())
    setTextColor(
      wcagContrast(color, BLACK) > wcagContrast(color, WHITE)
        ? "#000000"
        : "#FFFFFF"
    )
  }, [value])

  return (
    <div
      className="overflow-hidden rounded-md border border-border"
      style={{ ["--specimen-color" as string]: value }}
    >
      <div
        ref={surfaceRef}
        className="grid min-h-28 content-start gap-2 px-4 py-3"
        style={{
          backgroundColor: "var(--specimen-color)",
          color: textColor,
        }}
      >
        <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-1 text-xs">
          <div className="font-semibold">{name}</div>
          <div className="font-medium">{resolvedValue}</div>
        </div>
      </div>
      <div className="grid grid-cols-12">
        {TONAL_STOPS.map((stop, index) => (
          <span
            key={`${name}-${index}`}
            className="h-8 border-r border-black/5 last:border-r-0 dark:border-white/5"
            style={{ backgroundColor: stop }}
          />
        ))}
      </div>
    </div>
  )
}
