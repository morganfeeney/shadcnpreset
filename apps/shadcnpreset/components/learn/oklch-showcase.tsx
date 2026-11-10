import { BrandColourPlayground } from "@/components/learn/brand-colour-playground"
import {
  HueSwapPlayground,
  LightnessPlayground,
} from "@/components/learn/oklch-playground"
import { cn } from "@/lib/utils"
import { BASE_COLORS } from "@/registry/base-colors"
import { THEMES } from "@/registry/themes"

const GREY_BASES = ["neutral", "mist", "mauve", "taupe", "olive"] as const

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

function Swatch({
  colour,
  label,
  detail,
}: {
  colour: string
  label: string
  detail?: string
}) {
  return (
    <div className="flex min-w-0 flex-col gap-1">
      <div className="h-10 rounded-md border" style={{ background: colour }} />
      <span className="text-xs font-medium">{label}</span>
      {detail ? (
        <span className="font-mono text-[11px] text-muted-foreground">
          {detail}
        </span>
      ) : null}
    </div>
  )
}

export type OklchShowcaseProps = {
  /** hues: HSL against OKLCH with sliders. token: Blue's --primary taken apart, its hue on a slider. greys: the base colours' tinted greys. brand: one colour turned into a theme. */
  variant: "hues" | "token" | "greys" | "brand"
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
              const value =
                (base?.cssVars?.light as Record<string, string> | undefined)?.[
                  "muted-foreground"
                ] ?? ""
              const { c, h } = parts(value)
              return (
                <Swatch
                  key={name}
                  colour={value}
                  label={base?.title ?? name}
                  detail={
                    h === "none" || Number(c) === 0
                      ? "C 0"
                      : `C ${c} · H ${Math.round(Number(h))}°`
                  }
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
