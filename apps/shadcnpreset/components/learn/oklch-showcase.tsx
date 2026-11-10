import { wcagContrast } from "culori"

import { BrandColourPlayground } from "@/components/learn/brand-colour-playground"
import {
  HueSwapPlayground,
  LightnessPlayground,
} from "@/components/learn/oklch-playground"
import { cn } from "@/lib/utils"
import { BASE_COLORS } from "@/registry/base-colors"
import { THEMES } from "@/registry/themes"

const GREY_BASES = ["neutral", "mist", "mauve", "taupe", "olive"] as const

/** Three mid-tone themes and yellow, the light one that takes dark text. */
const PRIMARY_THEMES = ["blue", "orange", "green", "yellow"] as const

const MODES = ["light", "dark"] as const

function parts(value: string) {
  const [l, c, h] = value.replace(/^oklch\(|\)$/g, "").split(/\s+/)
  return { l, c, h: h ?? "none" }
}

function tokenValue(themeName: string, mode: "light" | "dark", token: string) {
  const theme = THEMES.find((t) => t.name === themeName)
  return (
    (theme?.cssVars?.[mode] as Record<string, string> | undefined)?.[token] ??
    ""
  )
}

function chromaDetail(value: string) {
  const { c, h } = parts(value)
  return h === "none" || Number(c) === 0
    ? "C 0"
    : `C ${c} · H ${Math.round(Number(h))}°`
}

/** A colour that follows the site's mode: `light` normally, `dark` in dark mode. */
function ModeSwatch({
  light,
  dark,
  label,
}: {
  light: string
  dark: string
  label: string
}) {
  return (
    <div className="flex min-w-0 flex-col gap-1">
      <div
        className="h-10 rounded-md border bg-(--swatch-light) dark:bg-(--swatch-dark)"
        style={
          {
            "--swatch-light": light,
            "--swatch-dark": dark,
          } as React.CSSProperties
        }
      />
      <span className="text-xs font-medium">{label}</span>
      <span className="font-mono text-[11px] text-muted-foreground dark:hidden">
        {chromaDetail(light)}
      </span>
      <span className="hidden font-mono text-[11px] text-muted-foreground dark:inline">
        {chromaDetail(dark)}
      </span>
    </div>
  )
}

/** One theme's primary in one mode: a button-like chip with its text, the value and the contrast. */
function PrimaryCell({
  themeName,
  mode,
}: {
  themeName: string
  mode: (typeof MODES)[number]
}) {
  const fill = tokenValue(themeName, mode, "primary")
  const text = tokenValue(themeName, mode, "primary-foreground")
  const { l, c, h } = parts(fill)
  return (
    <div className="flex min-w-0 items-center gap-3">
      <div
        className="flex size-11 shrink-0 items-center justify-center rounded-md border text-sm font-semibold"
        style={{ background: fill, color: text }}
        aria-hidden
      >
        Aa
      </div>
      <div className="flex min-w-0 flex-col gap-0.5">
        <span className="text-[11px] text-muted-foreground sm:hidden">
          {mode === "light" ? "Light mode" : "Dark mode"}
        </span>
        <span className="font-mono text-xs">
          oklch({l} {c} {Math.round(Number(h))})
        </span>
        <span className="text-xs text-muted-foreground">
          Text contrast {wcagContrast(fill, text).toFixed(1)}:1
        </span>
      </div>
    </div>
  )
}

const PRIMARY_ROW =
  "grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-[5rem_1fr_1fr] sm:items-center"

function ThemePrimaries() {
  return (
    <div className="flex flex-col">
      <div
        className={cn(
          PRIMARY_ROW,
          "hidden border-b pb-3 text-xs text-muted-foreground sm:grid"
        )}
      >
        <span>Theme</span>
        <span>Light mode</span>
        <span>Dark mode</span>
      </div>
      {PRIMARY_THEMES.map((name) => {
        const theme = THEMES.find((t) => t.name === name)
        return (
          <div
            key={name}
            className={cn(
              PRIMARY_ROW,
              // The header row is hidden on phones, so the first theme starts flush
              "py-4 not-last:border-b last:pb-0 max-sm:nth-2:pt-0"
            )}
          >
            <span className="col-span-2 text-sm font-medium sm:col-span-1">
              {theme?.title ?? name}
            </span>
            {MODES.map((mode) => (
              <PrimaryCell key={mode} themeName={name} mode={mode} />
            ))}
          </div>
        )
      })}
    </div>
  )
}

export type OklchShowcaseProps = {
  /** hues: HSL against OKLCH with sliders. token: Blue's --primary taken apart, its hue on a slider. greys: the base colours' tinted greys. brand: one colour turned into a theme. primaries: four themes' primary in light and dark mode. */
  variant: "hues" | "token" | "greys" | "brand" | "primaries"
  caption?: React.ReactNode
  className?: string
}

/**
 * OKLCH examples for the colours article, built from the real preset values
 * in the vendored registry so the numbers match what the CLI installs.
 */
export function OklchShowcase({
  variant,
  caption,
  className,
}: OklchShowcaseProps) {
  return (
    <figure className={className}>
      <div className="flex flex-col gap-5 rounded-lg border bg-background p-4">
        {variant === "hues" ? <LightnessPlayground /> : null}
        {variant === "brand" ? <BrandColourPlayground /> : null}
        {variant === "primaries" ? <ThemePrimaries /> : null}

        {variant === "token" ? (
          <HueSwapPlayground
            primary={tokenValue("blue", "light", "primary")}
            foreground={tokenValue("blue", "light", "primary-foreground")}
          />
        ) : null}

        {variant === "greys" ? (
          <div className={cn("grid grid-cols-2 gap-3 sm:grid-cols-5")}>
            {GREY_BASES.map((name) => {
              const base = BASE_COLORS.find((b) => b.name === name)
              // Muted text for the mode on show. The dark value is the swatch
              // shadcn create's base colour picker shows on its dark panel.
              const muted = (mode: "light" | "dark") =>
                (base?.cssVars?.[mode] as Record<string, string> | undefined)?.[
                  "muted-foreground"
                ] ?? ""
              return (
                <ModeSwatch
                  key={name}
                  light={muted("light")}
                  dark={muted("dark")}
                  label={base?.title ?? name}
                />
              )
            })}
          </div>
        ) : null}
      </div>
      {caption ? <figcaption>{caption}</figcaption> : null}
    </figure>
  )
}
