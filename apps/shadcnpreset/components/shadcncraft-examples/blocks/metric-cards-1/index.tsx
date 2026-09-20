"use client"

import * as React from "react"

import {
  MetricCard1Delta,
  MetricCard1Title,
  MetricCard1Value,
} from "@/components/shadcncraft-examples/ui/metric-card-1"
import { Button } from "@/components/cn-ui/button"
import { Card, CardContent } from "@/components/cn-ui/card"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/cn-ui/empty"
import { Separator } from "@/components/cn-ui/separator"
import { Skeleton } from "@/components/cn-ui/skeleton"
import { IconPlaceholder } from "@/components/icon-placeholder"

/** Empty is not one of these: it is a success that returned nothing. */
type LoadStatus = "error" | "pending" | "success"

type Metric = {
  id: string
  label: string
  value: string
  delta: string
  description: string
  /** Which way the number moved: the arrow. */
  direction: "up" | "down"
  /** Whether that move is good or bad for this metric: the colour. */
  trend: "up" | "down"
}

/** Replace with your own metrics. */
const metricsData: Metric[] = [
  {
    id: "marketing-spend",
    label: "Marketing spend",
    value: "$84,300",
    delta: "+8.2%",
    description: "from last month",
    direction: "up",
    trend: "up",
  },
  {
    id: "total-revenue",
    label: "Total revenue",
    value: "$1,250.00",
    delta: "+12.5%",
    description: "from last month",
    direction: "up",
    trend: "up",
  },
  {
    // The one rise nobody wants, so it goes up in destructive.
    id: "cost-per-lead",
    label: "Cost per lead",
    value: "$29.61",
    delta: "+12.5%",
    description: "from last month",
    direction: "up",
    trend: "down",
  },
  {
    id: "lead-conversion-rate",
    label: "Lead conversion rate",
    value: "3.4%",
    delta: "+12.5%",
    description: "from last month",
    direction: "up",
    trend: "up",
  },
]

const SKELETON_COLUMNS = 4

function DeltaIcon({ direction }: { direction: Metric["direction"] }) {
  return direction === "up" ? (
    <IconPlaceholder
      lucide="ArrowUpIcon"
      tabler="IconArrowUp"
      hugeicons="ArrowUp01Icon"
      phosphor="ArrowUpIcon"
      remixicon="RiArrowUpLine"
    />
  ) : (
    <IconPlaceholder
      lucide="ArrowDownIcon"
      tabler="IconArrowDown"
      hugeicons="ArrowDown01Icon"
      phosphor="ArrowDownIcon"
      remixicon="RiArrowDownLine"
    />
  )
}

function MetricStrip({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-2 gap-4 lg:flex lg:flex-row lg:gap-5">
      {React.Children.toArray(children).map((column, index) => (
        <React.Fragment key={index}>
          {/* `hidden`, not just `lg:block`: it also keeps the separator from
              taking a cell of the grid. */}
          {index > 0 ? (
            <Separator orientation="vertical" className="hidden lg:block" />
          ) : null}
          {/* Its own card on a phone, a bare column once they share one. */}
          <Card className="min-w-0 flex-1 lg:rounded-none lg:bg-transparent lg:py-0 lg:ring-0">
            <CardContent className="lg:px-0">{column}</CardContent>
          </Card>
        </React.Fragment>
      ))}
    </div>
  )
}

function MetricColumn({ metric }: { metric: Metric }) {
  return (
    <>
      <MetricCard1Title className="truncate">{metric.label}</MetricCard1Title>
      <MetricCard1Value value={metric.value} />
      <MetricCard1Delta
        className="truncate"
        value={metric.delta}
        description={metric.description}
        trend={metric.trend}
        icon={<DeltaIcon direction={metric.direction} />}
      />
    </>
  )
}

/** `1lh` inside the real type scale: same height loading as loaded, per style. */
function MetricColumnSkeleton() {
  return (
    <>
      <div className="mb-1.5 text-base">
        <Skeleton className="h-lh w-2/3" />
      </div>
      <div className="mb-1.5 text-2xl">
        <Skeleton className="h-lh w-1/2" />
      </div>
      <div className="text-sm">
        <Skeleton className="h-lh w-3/4" />
      </div>
    </>
  )
}

/**
 * The timer stands in for the fetch. Swap it for your own query — the branches
 * below are unchanged:
 *
 * ```tsx
 * const { data = [], status } = useQuery({ queryKey: ["metrics"], queryFn })
 * ```
 *
 * Start at `"error"`, or resolve with `[]`, to see the other two states.
 */
export function MetricCards1() {
  const [status, setStatus] = React.useState<LoadStatus>("pending")
  const [metrics, setMetrics] = React.useState<Metric[]>([])

  React.useEffect(() => {
    if (status !== "pending") {
      return
    }

    const timer = setTimeout(() => {
      setMetrics(metricsData)
      setStatus("success")
    }, 900)

    return () => clearTimeout(timer)
  }, [status])

  const handleRetry = React.useCallback(() => setStatus("pending"), [])

  return (
    <Card>
      <CardContent>
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
              <EmptyTitle>Couldn&apos;t load metrics</EmptyTitle>
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
          <div role="status" aria-busy="true">
            <span className="sr-only">Loading metrics</span>
            <MetricStrip>
              {Array.from({ length: SKELETON_COLUMNS }, (_, index) => (
                <MetricColumnSkeleton key={index} />
              ))}
            </MetricStrip>
          </div>
        ) : metrics.length > 0 ? (
          <MetricStrip>
            {metrics.map((metric) => (
              <MetricColumn key={metric.id} metric={metric} />
            ))}
          </MetricStrip>
        ) : (
          <Empty className="px-0 py-0">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <IconPlaceholder
                  lucide="TrendingUp"
                  tabler="IconTrendingUp"
                  hugeicons="AnalyticsUpIcon"
                  phosphor="TrendUpIcon"
                  remixicon="RiLineChartLine"
                />
              </EmptyMedia>
              <EmptyTitle>No data yet</EmptyTitle>
              <EmptyDescription>
                Metrics appear once tracking is connected.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}
      </CardContent>
    </Card>
  )
}
