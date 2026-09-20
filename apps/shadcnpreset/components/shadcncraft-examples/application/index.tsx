import { AiInsights1 } from "@/components/shadcncraft-examples/blocks/ai-insights-1"
import { AppShell1 } from "@/components/shadcncraft-examples/blocks/app-shell-1"
import { DealsTable1 } from "@/components/shadcncraft-examples/blocks/deals-table-1"
import { GoalProgress1 } from "@/components/shadcncraft-examples/blocks/goal-progress-1"
import { HeroTimeSeries1 } from "@/components/shadcncraft-examples/blocks/hero-time-series-1"
import { MarketingFunnel1 } from "@/components/shadcncraft-examples/blocks/marketing-funnel-1"
import { MetricCards1 } from "@/components/shadcncraft-examples/blocks/metric-cards-1"
import { RepLeaderboard1 } from "@/components/shadcncraft-examples/blocks/rep-leaderboard-1"
import { RevenueVsTarget1 } from "@/components/shadcncraft-examples/blocks/revenue-vs-target-1"
import { TrafficByChannel1 } from "@/components/shadcncraft-examples/blocks/traffic-by-channel-1"
import { WinRate1 } from "@/components/shadcncraft-examples/blocks/win-rate-1"

/**
 * A sales and marketing dashboard inside shadcncraft's app shell. The shell
 * sizes itself to the frame and scrolls its own content, so the root is
 * `h-full` rather than a page that grows.
 */
export function ApplicationDemo() {
  return (
    <div className="h-full bg-background text-foreground">
      <AppShell1>
        {/*
         * One wrapper, not a row of siblings: the shell's content area is a
         * flex column, and `.cn-card` is `overflow-hidden`, which zeroes a flex
         * item's automatic minimum height. Cards as direct children shrink to
         * fit the frame and clip their own content instead of scrolling. This
         * div has visible overflow, so it keeps its content's height.
         */}
        <div className="flex flex-col gap-4">
          <MetricCards1 />

          <div className="grid gap-4 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <HeroTimeSeries1 />
            </div>
            <div className="flex flex-col gap-4">
              <RevenueVsTarget1 />
              <GoalProgress1 />
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <TrafficByChannel1 />
            <MarketingFunnel1 />
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <WinRate1 />
            <RepLeaderboard1 />
            <AiInsights1 />
          </div>

          <DealsTable1 />
        </div>
      </AppShell1>
    </div>
  )
}
