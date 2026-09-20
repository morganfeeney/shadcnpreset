"use client"

import * as React from "react"

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

type Quarter = {
  closed: number
  target: number
  forecast: number
}

/** Replace with your own quarter. */
const quarterData: Quarter = {
  closed: 412000,
  target: 1500000,
  forecast: 1380000,
}

/** The tally runs to target, so each tick is 2.5% of it. */
const totalTicks = 40

/** Bar widths for the three loading stats, so they read as text of their length. */
const statSkeletonWidths = [
  { label: "w-11", value: "w-16" },
  { label: "w-10", value: "w-20" },
  { label: "w-13", value: "w-19" },
]

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
})

function tickCount(value: number, target: number) {
  if (target <= 0) {
    return 0
  }

  return Math.min(
    totalTicks,
    Math.max(0, Math.round((value / target) * totalTicks))
  )
}

function TargetMeter({ quarter }: { quarter: Quarter }) {
  const closedTicks = tickCount(quarter.closed, quarter.target)
  /* A forecast below what is already closed would otherwise erase the band. */
  const forecastTicks = Math.max(
    closedTicks,
    tickCount(quarter.forecast, quarter.target)
  )

  return (
    // The three figures above carry every number this encodes.
    <div aria-hidden="true" className="flex h-10 gap-0.5 sm:gap-1">
      {Array.from({ length: totalTicks }, (_, index) => (
        <span
          key={index}
          className={cn(
            "min-w-0 flex-1 rounded-sm",
            index < closedTicks
              ? "bg-linear-to-b from-chart-2 to-chart-3"
              : index < forecastTicks
                ? "bg-chart-1"
                : "bg-muted"
          )}
        />
      ))}
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-1.5">
      <span className="truncate text-xs text-muted-foreground">{label}</span>
      <span className="text-sm font-medium tabular-nums">{value}</span>
    </div>
  )
}

/**
 * The timer stands in for the fetch. Swap it for your own query — the branches
 * below are unchanged:
 *
 * ```tsx
 * const { data, status } = useQuery({ queryKey: ["revenue"], queryFn })
 * ```
 *
 * Start at `"error"`, or resolve with `null`, to see the other two states.
 */
export function RevenueVsTarget1() {
  const [status, setStatus] = React.useState<LoadStatus>("pending")
  const [quarter, setQuarter] = React.useState<Quarter | null>(null)

  React.useEffect(() => {
    if (status !== "pending") {
      return
    }

    const timer = setTimeout(() => {
      setQuarter(quarterData)
      setStatus("success")
    }, 900)

    return () => clearTimeout(timer)
  }, [status])

  const handleRetry = React.useCallback(() => setStatus("pending"), [])

  const loaded = status === "success" && quarter !== null

  return (
    <Card>
      {loaded ? (
        <CardHeader>
          <CardTitle>Revenue vs target</CardTitle>
          <CardDescription>Q3 target, quarter to date</CardDescription>
        </CardHeader>
      ) : null}

      <CardContent className="flex flex-1 flex-col justify-center gap-5">
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
              <EmptyTitle>Couldn&apos;t load revenue data</EmptyTitle>
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
          <div role="status" aria-busy="true" className="flex flex-col gap-5">
            <span className="sr-only">Loading revenue against target</span>
            <div className="flex flex-col gap-1">
              <div className="text-base">
                <Skeleton className="h-lh w-45" />
              </div>
              <div className="text-sm">
                <Skeleton className="h-lh w-60" />
              </div>
            </div>
            <div className="flex gap-3">
              {statSkeletonWidths.map((stat, index) => (
                <div
                  key={index}
                  className="flex min-w-0 flex-1 flex-col gap-1.5"
                >
                  <div className="text-xs">
                    <Skeleton className={cn("h-lh", stat.label)} />
                  </div>
                  <div className="text-sm">
                    <Skeleton className={cn("h-lh", stat.value)} />
                  </div>
                </div>
              ))}
            </div>
            <Skeleton className="h-10 w-full" />
          </div>
        ) : loaded ? (
          <>
            <div className="flex gap-3">
              <Stat label="Closed" value={currency.format(quarter.closed)} />
              <Stat label="Target" value={currency.format(quarter.target)} />
              <Stat
                label="Forecast"
                value={currency.format(quarter.forecast)}
              />
            </div>
            <TargetMeter quarter={quarter} />
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
              <EmptyTitle>No target set</EmptyTitle>
              <EmptyDescription>
                Set a quarterly revenue target to track progress.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}
      </CardContent>
    </Card>
  )
}
