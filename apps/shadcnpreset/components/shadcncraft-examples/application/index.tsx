import { AiInsights1 } from "@/components/shadcncraft-examples/blocks/ai-insights-1"
import { AppShell1 } from "@/components/shadcncraft-examples/blocks/app-shell-1"
import { AttributionBreakdown1 } from "@/components/shadcncraft-examples/blocks/attribution-breakdown-1"
import { GoalProgress1 } from "@/components/shadcncraft-examples/blocks/goal-progress-1"
import { HeroTimeSeries1 } from "@/components/shadcncraft-examples/blocks/hero-time-series-1"
import { MetricCards1 } from "@/components/shadcncraft-examples/blocks/metric-cards-1"
import { PipelineByStage1 } from "@/components/shadcncraft-examples/blocks/pipeline-by-stage-1"
import { RevenueVsTarget1 } from "@/components/shadcncraft-examples/blocks/revenue-vs-target-1"
import { WinRate1 } from "@/components/shadcncraft-examples/blocks/win-rate-1"

/**
 * shadcncraft's sales and marketing dashboard, laid out as they ship it: a
 * full-width metric strip over two equal columns.
 *
 * The columns are `contents` below `lg`, so every card becomes a sibling of the
 * page's own flex column and the `order-*` classes decide the phone order —
 * which is not column order, but hero, revenue, goals, pipeline, attribution,
 * win rate, insights.
 */
export function ApplicationDemo() {
  return (
    <div className="h-full bg-background text-foreground">
      <AppShell1>
        <MetricCards1 />

        <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
          <div className="contents lg:flex lg:min-w-0 lg:flex-1 lg:flex-col lg:gap-4">
            <div className="order-1">
              <HeroTimeSeries1 />
            </div>
            <div className="order-5">
              <AttributionBreakdown1 />
            </div>
            <div className="order-7">
              <AiInsights1 />
            </div>
          </div>

          <div className="contents lg:flex lg:min-w-0 lg:flex-1 lg:flex-col lg:gap-4">
            <div className="order-2">
              <RevenueVsTarget1 />
            </div>
            <div className="order-3">
              <GoalProgress1 />
            </div>
            <div className="order-4">
              <PipelineByStage1 />
            </div>
            <div className="order-6">
              <WinRate1 />
            </div>
          </div>
        </div>
      </AppShell1>
    </div>
  )
}
