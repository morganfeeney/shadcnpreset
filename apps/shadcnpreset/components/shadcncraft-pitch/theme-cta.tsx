"use client"

import { CheckCircleIcon } from "@phosphor-icons/react"

import type { RegistryThemeSurface } from "@/components/preset-theme-surface"
import {
  BuyLink,
  SHADCNCRAFT_FEATURES,
  SHADCNCRAFT_SOCIAL_PROOF,
  SHADCNCRAFT_STARTING_PRICE,
  useShadcncraftImpression,
} from "@/components/shadcncraft-pitch/pitch"
import { ThemeSwatch } from "@/components/themes/theme-nav"
import { useSurfaceMode } from "@/components/themes/theme-surface"
import type { PresetThemeSummary } from "@/lib/preset-themes"

const PLACEMENT = "theme-page"

const FIGMA_TOKENS = [
  ["primary", "Primary"],
  ["secondary", "Secondary"],
  ["chart-1", "Chart 1"],
  ["chart-3", "Chart 3"],
  ["chart-5", "Chart 5"],
] as const

/** The theme as it would sit in the Figma kit, in the site's current mode. */
function FigmaThemeCard({
  name,
  registryTheme,
}: {
  name: string
  registryTheme: RegistryThemeSurface
}) {
  const mode = useSurfaceMode()
  const vars = mode
    ? (registryTheme.cssVars[mode] as Record<string, string>)
    : null

  return (
    <div className="grid w-72 gap-2.5 rounded-xl border bg-background p-4 shadow-xl">
      <span className="text-[11px] tracking-widest text-muted-foreground uppercase">
        Figma plugin · Themes
      </span>
      <span className="text-xl font-bold tracking-tight">{name}</span>
      <span className="text-xs text-muted-foreground">
        Apply it to the official shadcn/ui Figma kit, in all 8 styles.
      </span>
      {FIGMA_TOKENS.map(([token, label]) => (
        <span key={token} className="flex items-center gap-2 text-xs">
          <span
            className="size-3.5 shrink-0 rounded-sm bg-muted ring-1 ring-foreground/15 ring-inset"
            style={vars ? { background: vars[token] } : undefined}
          />
          <span className="flex-1">{label}</span>
          <code className="font-mono text-[10px] text-muted-foreground">
            {vars?.[token]}
          </code>
        </span>
      ))}
    </div>
  )
}

/** shadcncraft Pro pitch for a theme page, in the site's own colors. */
export function ShadcncraftThemeCta({
  theme,
  registryTheme,
  related,
  total,
}: {
  theme: PresetThemeSummary
  registryTheme: RegistryThemeSurface
  /** Themes shown in the list card; the current theme first. */
  related: PresetThemeSummary[]
  total: number
}) {
  useShadcncraftImpression(PLACEMENT)

  return (
    <section
      aria-label="shadcncraft Pro"
      className="flex flex-wrap items-center gap-10 rounded-2xl border p-6 md:p-10"
    >
      <div className="grid min-w-0 flex-[1_1_26rem] gap-5">
        <span className="text-xs font-medium tracking-widest text-muted-foreground uppercase">
          shadcncraft Pro
        </span>
        <h2 className="text-3xl leading-[1.1] font-semibold tracking-tight text-balance sm:text-4xl">
          <span className="block">Every block, your theme.</span>
          <span className="block text-muted-foreground">
            Ship faster with Pro.
          </span>
        </h2>
        <p className="max-w-[52ch] text-muted-foreground">
          Themes are free to copy. shadcncraft Pro is a premium shadcn/ui design
          system, with blocks, components and the official Figma kit ready for
          your theme.
        </p>
        <ul className="grid gap-3 text-sm sm:grid-cols-2 sm:gap-x-6">
          {SHADCNCRAFT_FEATURES.map((feature) => (
            <li key={feature} className="flex items-start gap-2.5">
              <CheckCircleIcon
                aria-hidden
                className="mt-0.5 size-4 shrink-0 text-muted-foreground"
              />
              {feature}
            </li>
          ))}
        </ul>
        <div className="flex flex-wrap items-center gap-4">
          <BuyLink presetCode={theme.code} placement={PLACEMENT}>
            Get shadcncraft Pro
          </BuyLink>
          <span className="text-sm text-muted-foreground">
            From {SHADCNCRAFT_STARTING_PRICE} · {SHADCNCRAFT_SOCIAL_PROOF}
          </span>
        </div>
        <p className="text-xs text-muted-foreground">
          One-time payment. We earn a commission on sales.
        </p>
      </div>

      <div
        aria-hidden
        className="relative min-h-[28rem] min-w-0 flex-[1_1_24rem] overflow-hidden rounded-xl bg-muted"
      >
        <div className="absolute top-6 right-6 grid w-64 gap-2 rounded-xl border bg-background p-3.5 shadow-xl">
          <span className="flex items-center justify-between text-[11px] tracking-widest text-muted-foreground uppercase">
            shadcn themes
            <span className="rounded-full border px-1.5 tracking-normal">
              {total}
            </span>
          </span>
          {related.map((item) => (
            <span
              key={item.slug}
              className="flex items-center justify-between gap-3 rounded-md border px-2.5 py-2 text-sm font-medium"
            >
              <span className="truncate">{item.name}</span>
              <ThemeSwatch code={item.code} />
            </span>
          ))}
        </div>
        <div className="absolute bottom-6 left-6">
          <FigmaThemeCard name={theme.name} registryTheme={registryTheme} />
        </div>
      </div>
    </section>
  )
}
