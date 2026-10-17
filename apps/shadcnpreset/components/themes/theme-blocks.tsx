"use client"

import type { RegistryThemeSurface } from "@/components/preset-theme-surface"
import { AiInsights1 } from "@/components/shadcncraft/blocks/ai-insights-1"
import { ChannelPerformance1 } from "@/components/shadcncraft/blocks/channel-performance-1"
import { CTA3 } from "@/components/shadcncraft/blocks/cta-3"
import { Hero4 } from "@/components/shadcncraft/blocks/hero-4"
import { HeroTimeSeries1 } from "@/components/shadcncraft/blocks/hero-time-series-1"
import { MetricCards1 } from "@/components/shadcncraft/blocks/metric-cards-1"
import { PipelineByStage1 } from "@/components/shadcncraft/blocks/pipeline-by-stage-1"
import { Pricing5 } from "@/components/shadcncraft/blocks/pricing-5"
import { TopNavigation5 } from "@/components/shadcncraft/blocks/top-navigation-5"
import {
  ShadcncraftCredit,
  ShadcncraftCreditImpression,
} from "@/components/shadcncraft-examples/credit"
import { ThemeSurface, useSurfaceMode } from "@/components/themes/theme-surface"
import type { PresetPreviewCredit } from "@/lib/preset-preview"

const CREDIT: PresetPreviewCredit = {
  label: "Marketing blocks",
  source: "theme-page-blocks",
}

/**
 * The theme on a landing page built from shadcncraft blocks: a hero whose
 * product shot is live dashboard blocks (so the chart colors show), then
 * pricing and a primary call to action. None of them portal a popup, so they
 * keep the surface's style and colors.
 */
export function ThemeBlocks({
  name,
  code,
  registryTheme,
}: {
  name: string
  code: string
  registryTheme: RegistryThemeSurface
}) {
  const mode = useSurfaceMode()

  return (
    <section aria-labelledby="theme-blocks-heading" className="grid gap-4">
      <ShadcncraftCreditImpression credit={CREDIT} />
      <div className="flex flex-wrap items-end justify-between gap-2">
        <h2
          id="theme-blocks-heading"
          className="text-2xl font-semibold tracking-tight"
        >
          {name} in real blocks
        </h2>
        <ShadcncraftCredit credit={CREDIT} presetCode={code} />
      </div>
      {mode ? (
        <ThemeSurface
          registryTheme={registryTheme}
          mode={mode}
          className="overflow-hidden rounded-2xl border bg-background px-4 text-foreground md:px-8"
        >
          <TopNavigation5 />
          {/* The hero's stock background photo clashes with most themes. */}
          <div className="[&_img]:hidden">
            <Hero4 navigation={false} />
          </div>
          <div className="grid gap-4 rounded-2xl border bg-muted/50 p-3 md:p-4">
            <MetricCards1 />
            <div className="grid items-start gap-4 lg:grid-cols-2">
              <HeroTimeSeries1 />
              <ChannelPerformance1 />
              <PipelineByStage1 />
              <AiInsights1 />
            </div>
          </div>
          <Pricing5 />
          <CTA3 />
        </ThemeSurface>
      ) : (
        <div
          aria-hidden
          className="min-h-[160rem] animate-pulse rounded-2xl bg-muted"
        />
      )}
    </section>
  )
}
