"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"

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

type LeadPoint = {
  /** A day of the current period; `previous` is the matching day one period back. */
  date: string
  current: number
  previous: number
}

/** Replace with your own series. */
const leadsData: LeadPoint[] = [
  { date: "2026-07-01", current: 70, previous: 63 },
  { date: "2026-07-02", current: 71, previous: 65 },
  { date: "2026-07-03", current: 75, previous: 67 },
  { date: "2026-07-04", current: 76, previous: 66 },
  { date: "2026-07-05", current: 77, previous: 70 },
  { date: "2026-07-06", current: 80, previous: 71 },
  { date: "2026-07-07", current: 83, previous: 75 },
  { date: "2026-07-08", current: 83, previous: 76 },
  { date: "2026-07-09", current: 83, previous: 75 },
  { date: "2026-07-10", current: 80, previous: 72 },
  { date: "2026-07-11", current: 82, previous: 74 },
  { date: "2026-07-12", current: 80, previous: 72 },
  { date: "2026-07-13", current: 80, previous: 70 },
  { date: "2026-07-14", current: 80, previous: 71 },
  { date: "2026-07-15", current: 81, previous: 74 },
  { date: "2026-07-16", current: 86, previous: 75 },
  { date: "2026-07-17", current: 88, previous: 76 },
  { date: "2026-07-18", current: 89, previous: 80 },
  { date: "2026-07-19", current: 91, previous: 80 },
  { date: "2026-07-20", current: 91, previous: 80 },
  { date: "2026-07-21", current: 94, previous: 83 },
  { date: "2026-07-22", current: 98, previous: 86 },
  { date: "2026-07-23", current: 100, previous: 91 },
  { date: "2026-07-24", current: 103, previous: 89 },
  { date: "2026-07-25", current: 104, previous: 92 },
  { date: "2026-07-26", current: 101, previous: 88 },
  { date: "2026-07-27", current: 104, previous: 93 },
  { date: "2026-07-28", current: 105, previous: 92 },
  { date: "2026-07-29", current: 104, previous: 92 },
  { date: "2026-07-30", current: 102, previous: 92 },
  { date: "2026-07-31", current: 104, previous: 91 },
  { date: "2026-08-01", current: 102, previous: 90 },
]

const chartConfig = {
  previous: {
    label: "Previous period",
    color: "var(--chart-1)",
  },
  current: {
    label: "This period",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig

/** `new Date("2026-07-01")` parses as UTC, which lands a day early west of it. */
function parseLocalDate(isoDate: string) {
  const [year, month, day] = isoDate.split("-").map(Number)
  return new Date(year, month - 1, day)
}

function formatDay(isoDate: string) {
  return parseLocalDate(isoDate).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  })
}

function LeadsHeadline({ data }: { data: LeadPoint[] }) {
  const total = data.reduce((sum, point) => sum + point.current, 0)
  const previousTotal = data.reduce((sum, point) => sum + point.previous, 0)
  const change =
    previousTotal === 0 ? 0 : ((total - previousTotal) / previousTotal) * 100

  return (
    <div className="flex items-baseline gap-1.5">
      <span className="text-2xl font-semibold tracking-tight tabular-nums">
        {total}
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
      <span className="text-sm text-muted-foreground">vs previous period</span>
    </div>
  )
}

function LeadsChart({ data }: { data: LeadPoint[] }) {
  return (
    <ChartContainer config={chartConfig} className="min-h-0 w-full flex-1">
      <AreaChart
        accessibilityLayer
        data={data}
        margin={{ left: 12, right: 12 }}
      >
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="date"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          minTickGap={32}
          tickFormatter={formatDay}
        />
        <ChartTooltip
          cursor={{ strokeDasharray: "4 4" }}
          content={
            <ChartTooltipContent
              className="w-45"
              indicator="dot"
              labelFormatter={(value) => formatDay(String(value))}
            />
          }
        />
        <defs>
          <linearGradient id="fillPrevious" x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="5%"
              stopColor="var(--color-previous)"
              stopOpacity={0.6}
            />
            <stop
              offset="95%"
              stopColor="var(--color-previous)"
              stopOpacity={0.02}
            />
          </linearGradient>
          <linearGradient id="fillCurrent" x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="5%"
              stopColor="var(--color-current)"
              stopOpacity={0.6}
            />
            <stop
              offset="95%"
              stopColor="var(--color-current)"
              stopOpacity={0.02}
            />
          </linearGradient>
        </defs>
        {/* Overlaid, not stacked: two periods sharing one baseline. */}
        <Area
          dataKey="previous"
          type="natural"
          fill="url(#fillPrevious)"
          fillOpacity={0.4}
          stroke="var(--color-previous)"
        />
        <Area
          dataKey="current"
          type="natural"
          fill="url(#fillCurrent)"
          fillOpacity={0.4}
          stroke="var(--color-current)"
        />
      </AreaChart>
    </ChartContainer>
  )
}

/**
 * The timer stands in for the fetch. Swap it for your own query — the branches
 * below are unchanged:
 *
 * ```tsx
 * const { data = [], status } = useQuery({ queryKey: ["leads"], queryFn })
 * ```
 *
 * Start at `"error"`, or resolve with `[]`, to see the other two states.
 */
export function HeroTimeSeries1() {
  const [status, setStatus] = React.useState<LoadStatus>("pending")
  const [points, setPoints] = React.useState<LeadPoint[]>([])

  React.useEffect(() => {
    if (status !== "pending") {
      return
    }

    const timer = setTimeout(() => {
      setPoints(leadsData)
      setStatus("success")
    }, 900)

    return () => clearTimeout(timer)
  }, [status])

  const handleRetry = React.useCallback(() => setStatus("pending"), [])

  const loaded = status === "success" && points.length > 0

  return (
    <Card className="h-90">
      {loaded ? (
        <CardHeader>
          <CardTitle>Leads over time</CardTitle>
          <CardDescription>
            Leads this period vs previous period
          </CardDescription>
        </CardHeader>
      ) : null}

      <CardContent className="flex min-h-0 flex-1 flex-col gap-3">
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
              <EmptyTitle>Couldn&apos;t load leads</EmptyTitle>
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
            className="flex min-h-0 flex-1 flex-col gap-3"
          >
            <span className="sr-only">Loading leads</span>
            <Skeleton className="h-4 w-45" />
            <Skeleton className="h-3 w-75" />
            <Skeleton className="min-h-0 flex-1" />
          </div>
        ) : loaded ? (
          <>
            <LeadsHeadline data={points} />
            <LeadsChart data={points} />
          </>
        ) : (
          <Empty className="px-0 py-0">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <IconPlaceholder
                  lucide="ChartNoAxesCombined"
                  tabler="IconChartLine"
                  hugeicons="AnalyticsUpIcon"
                  phosphor="ChartLineUpIcon"
                  remixicon="RiLineChartLine"
                />
              </EmptyMedia>
              <EmptyTitle>No leads yet</EmptyTitle>
              <EmptyDescription>
                The trend builds as leads come in.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}
      </CardContent>
    </Card>
  )
}
