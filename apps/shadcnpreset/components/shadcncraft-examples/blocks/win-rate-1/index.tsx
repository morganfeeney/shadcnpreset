"use client"

import * as React from "react"
import { Bar, BarChart, CartesianGrid, Cell, XAxis, YAxis } from "recharts"

import { cn } from "@/lib/utils"
import { Button } from "@/components/cn-ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/cn-ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/cn-ui/chart"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/cn-ui/empty"
import { Skeleton } from "@/components/cn-ui/skeleton"
import { IconPlaceholder } from "@/components/icon-placeholder"

/** Empty is not one of these: it is a success that returned nothing. */
type LoadStatus = "error" | "pending" | "success"

type StageStep = {
  step: string
  /** Share of deals that move from the left stage to the right one. */
  conversion: number
}

/** Replace with your own steps. */
const stepsData: StageStep[] = [
  { step: "Lead → Qual", conversion: 44 },
  { step: "Qual → Prop", conversion: 72 },
  { step: "Prop → Neg", conversion: 78 },
  { step: "Neg → Won", conversion: 57 },
]

/**
 * A lead is not a deal yet, so the headline is what the steps *after*
 * qualification multiply out to. Drop this to 0 if your funnel counts raw leads
 * as deals.
 */
const winRateFromStep = 1

/** The same measure one period back, which is all the delta needs. */
const previousWinRate = 29.9

const chartConfig = {
  conversion: { label: "Conversion", color: "var(--chart-2)" },
} satisfies ChartConfig

function winRateOf(steps: StageStep[]) {
  return (
    steps
      .slice(winRateFromStep)
      .reduce((rate, step) => rate * (step.conversion / 100), 1) * 100
  )
}

function ConversionChart({ steps }: { steps: StageStep[] }) {
  return (
    <ChartContainer config={chartConfig} className="min-h-0 w-full flex-1">
      <BarChart
        accessibilityLayer
        data={steps}
        layout="vertical"
        margin={{ right: 4 }}
        barSize={28}
      >
        <CartesianGrid horizontal={false} strokeDasharray="3 3" />
        {/* Every bar is a percentage, so the axis is pinned rather than fitted. */}
        <XAxis type="number" domain={[0, 100]} hide />
        <YAxis
          dataKey="step"
          type="category"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          width={100}
        />
        <ChartTooltip
          cursor={false}
          content={
            <ChartTooltipContent
              formatter={(value, name) => (
                <>
                  <span className="size-2.5 shrink-0 rounded-full bg-chart-2" />
                  <span className="text-muted-foreground">
                    {chartConfig[name as keyof typeof chartConfig]?.label ??
                      name}
                  </span>
                  <span className="ml-auto font-mono font-medium text-foreground tabular-nums">
                    {value}%
                  </span>
                </>
              )}
            />
          }
        />
        <defs>
          <linearGradient id="fillConversion" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="var(--chart-2)" />
            <stop offset="100%" stopColor="var(--chart-1)" />
          </linearGradient>
        </defs>
        {/*
         * The gradient goes on the Cell, not the Bar: the Bar's `fill` is what
         * the tooltip paints its dot with, and a `url(#…)` there is not a colour.
         */}
        <Bar dataKey="conversion" fill="var(--color-conversion)" radius={6}>
          {steps.map((step) => (
            <Cell key={step.step} fill="url(#fillConversion)" />
          ))}
        </Bar>
      </BarChart>
    </ChartContainer>
  )
}

/**
 * The timer stands in for the fetch. Swap it for your own query — the branches
 * below are unchanged:
 *
 * ```tsx
 * const { data = [], status } = useQuery({ queryKey: ["win-rate"], queryFn })
 * ```
 *
 * Start at `"error"`, or resolve with `[]`, to see the other two states.
 */
export function WinRate1() {
  const [status, setStatus] = React.useState<LoadStatus>("pending")
  const [steps, setSteps] = React.useState<StageStep[]>([])

  React.useEffect(() => {
    if (status !== "pending") {
      return
    }

    const timer = setTimeout(() => {
      setSteps(stepsData)
      setStatus("success")
    }, 900)

    return () => clearTimeout(timer)
  }, [status])

  const handleRetry = React.useCallback(() => setStatus("pending"), [])

  const loaded = status === "success" && steps.length > 0
  const winRate = winRateOf(steps)
  const change = winRate - previousWinRate

  return (
    <Card className="h-90">
      {loaded ? (
        <CardHeader>
          <CardTitle>Win rate and conversion between stages</CardTitle>
          <CardDescription>Closed-won share of recent deals</CardDescription>
        </CardHeader>
      ) : null}

      <CardContent className="flex min-h-0 flex-1 flex-col gap-5">
        {status === "error" ? (
          <Empty className="px-0 py-0">
            <EmptyHeader>
              <EmptyMedia variant="icon" className="text-destructive">
                <IconPlaceholder
                  lucide="TriangleAlertIcon"
                  tabler="IconAlertTriangle"
                  hugeicons="Alert02Icon"
                  phosphor="WarningIcon"
                  remixicon="RiErrorWarningLine"
                />
              </EmptyMedia>
              <EmptyTitle>Couldn&apos;t load win rate</EmptyTitle>
              <EmptyDescription>
                Something went wrong while fetching data.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button variant="outline" onClick={handleRetry}>
                Retry
              </Button>
            </EmptyContent>
          </Empty>
        ) : status === "pending" ? (
          <div
            role="status"
            aria-busy="true"
            className="flex min-h-0 flex-1 flex-col gap-5"
          >
            <span className="sr-only">Loading win rate</span>
            <div className="flex flex-col gap-1">
              <div className="text-base">
                <Skeleton className="h-lh w-65" />
              </div>
              <div className="text-sm">
                <Skeleton className="h-lh w-50" />
              </div>
            </div>
            <div className="flex items-baseline gap-1.5">
              <div className="text-2xl">
                <Skeleton className="h-lh w-16" />
              </div>
              <div className="text-sm">
                <Skeleton className="h-lh w-10" />
              </div>
              <div className="text-sm">
                <Skeleton className="h-lh w-28" />
              </div>
            </div>
            <Skeleton className="min-h-0 flex-1" />
          </div>
        ) : loaded ? (
          <>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-semibold tracking-tight tabular-nums">
                {winRate.toFixed(0)}%
              </span>
              <span
                className={cn(
                  "text-sm font-medium tabular-nums",
                  change < 0 ? "text-destructive" : "text-success"
                )}
              >
                {change >= 0 ? "+" : ""}
                {change.toFixed(1)}%
              </span>
              <span className="text-sm text-muted-foreground">
                vs previous period
              </span>
            </div>
            <ConversionChart steps={steps} />
          </>
        ) : (
          <Empty className="px-0 py-0">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <IconPlaceholder
                  lucide="TargetIcon"
                  tabler="IconTarget"
                  hugeicons="Target01Icon"
                  phosphor="TargetIcon"
                  remixicon="RiTargetLine"
                />
              </EmptyMedia>
              <EmptyTitle>No win rate yet</EmptyTitle>
              <EmptyDescription>
                Win rate appears once deals start closing.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}
      </CardContent>
    </Card>
  )
}
