"use client"

import type { RegistryThemeSurface } from "@/components/preset-theme-surface"
import { ClaimableBalance } from "@/components/preset-swatch/components/cards/claimable-balance"
import { FeedbackForm } from "@/components/preset-swatch/components/cards/feedback-form"
import { ObservabilityCard } from "@/components/preset-swatch/components/cards/observability-card"
import { PieChartCard } from "@/components/preset-swatch/components/cards/pie-chart-card"
import { PreviewAnalyticsCard } from "@/components/preset-swatch/components/cards/preview-analytics-card"
import { SavingsProgress } from "@/components/preset-swatch/components/cards/savings-progress"
import { UIElements } from "@/components/preset-swatch/components/cards/ui-elements"
import { ThemeSurface, useSurfaceMode } from "@/components/themes/theme-surface"
import { cn } from "@/lib/utils"
import { DEFAULT_CONFIG } from "@/registry/config"

function SurfaceSkeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn("animate-pulse rounded-2xl bg-muted", className)}
    />
  )
}

/** The theme on the existing preview cards, in the site's current mode. */
export function ThemeShowcase({
  registryTheme,
  name,
}: {
  registryTheme: RegistryThemeSurface
  name: string
}) {
  const mode = useSurfaceMode()
  if (!mode) return <SurfaceSkeleton className="min-h-[40rem]" />

  return (
    <ThemeSurface
      registryTheme={registryTheme}
      mode={mode}
      className="rounded-2xl border bg-muted p-4 text-foreground md:p-6 dark:bg-background"
    >
      <section
        aria-label={`${name} on example components`}
        className="columns-1 gap-4 *:mb-4 *:break-inside-avoid md:columns-2 xl:columns-3"
      >
        <PreviewAnalyticsCard />
        <UIElements />
        <FeedbackForm />
        <PieChartCard />
        <SavingsProgress />
        <ClaimableBalance />
        <ObservabilityCard iconLibrary={DEFAULT_CONFIG.iconLibrary} />
      </section>
    </ThemeSurface>
  )
}

const PALETTE = [
  ["background", "Background"],
  ["foreground", "Foreground"],
  ["primary", "Primary"],
  ["secondary", "Secondary"],
  ["muted", "Muted"],
  ["accent", "Accent"],
  ["border", "Border"],
  ["chart-1", "Chart 1"],
  ["chart-2", "Chart 2"],
  ["chart-3", "Chart 3"],
  ["chart-4", "Chart 4"],
  ["chart-5", "Chart 5"],
] as const

/** A swatch, name and value for each color token, in the site's current mode. */
export function ThemePalette({
  registryTheme,
}: {
  registryTheme: RegistryThemeSurface
}) {
  const mode = useSurfaceMode()
  const vars = mode
    ? (registryTheme.cssVars[mode] as Record<string, string>)
    : null

  return (
    <ul className="grid grid-cols-[repeat(auto-fill,minmax(9rem,1fr))] gap-4">
      {PALETTE.map(([token, label]) => (
        <li key={token} className="grid gap-2">
          <span
            aria-hidden
            className={cn(
              "block h-16 rounded-lg ring-1 ring-foreground/10 ring-inset",
              !vars && "animate-pulse bg-muted"
            )}
            style={vars ? { background: vars[token] } : undefined}
          />
          <span className="grid gap-0.5">
            <span className="text-sm font-medium">{label}</span>
            <code className="min-h-4 font-mono text-[11px] text-muted-foreground">
              {vars?.[token]}
            </code>
          </span>
        </li>
      ))}
    </ul>
  )
}
