"use client"

import * as React from "react"
import { Bar, BarChart, CartesianGrid, Cell, XAxis, YAxis } from "recharts"

import { cn } from "@/lib/utils"
import { Button } from "@/components/cn-ui/button"
import {
  Card,
  CardAction,
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

type ChannelRow = {
  channel: string
  firstTouch: number
  lastTouch: number
}

/**
 * Replace with your own channels. Both models divide up the same closed
 * revenue, so the two columns add up to the same total — what moves is which
 * channel gets the credit.
 */
const attributionData: ChannelRow[] = [
  { channel: "Organic", firstTouch: 68400, lastTouch: 52300 },
  { channel: "Paid", firstTouch: 61200, lastTouch: 48900 },
  { channel: "Socials", firstTouch: 39500, lastTouch: 21400 },
  { channel: "Direct", firstTouch: 42800, lastTouch: 79600 },
  { channel: "Other", firstTouch: 36100, lastTouch: 45800 },
]

const chartConfig = {
  firstTouch: { label: "First", color: "var(--chart-1)" },
  lastTouch: { label: "Last", color: "var(--chart-2)" },
} satisfies ChartConfig

/** The legend names the models in full; the tooltip has room for one word. */
const legendKeys = [
  { key: "firstTouch", label: "First touch", dot: "bg-chart-1" },
  { key: "lastTouch", label: "Last touch", dot: "bg-chart-2" },
] as const

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
})

function AttributionLegend() {
  return (
    <div className="flex items-center gap-5">
      {legendKeys.map((item) => (
        <div key={item.key} className="flex items-center gap-1.5">
          <span className={cn("size-2 shrink-0 rounded-full", item.dot)} />
          <span className="text-sm text-muted-foreground">{item.label}</span>
        </div>
      ))}
    </div>
  )
}

function AttributionChart({ data }: { data: ChannelRow[] }) {
  const [activeChannel, setActiveChannel] = React.useState<string | null>(null)

  const barOpacity = (channel: string) =>
    activeChannel === null || activeChannel === channel ? 1 : 0.15

  return (
    <ChartContainer config={chartConfig} className="min-h-0 w-full flex-1">
      <BarChart
        accessibilityLayer
        data={data}
        layout="vertical"
        margin={{ left: 4, right: 4 }}
        barGap={5}
        onMouseMove={(state) =>
          setActiveChannel(
            typeof state?.activeLabel === "string" ? state.activeLabel : null
          )
        }
        onMouseLeave={() => setActiveChannel(null)}
      >
        <CartesianGrid horizontal={false} strokeDasharray="3 3" />
        <XAxis type="number" hide />
        <YAxis
          dataKey="channel"
          type="category"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
        />
        <ChartTooltip
          cursor={false}
          content={
            <ChartTooltipContent
              className="w-45"
              formatter={(value, name) => (
                <>
                  <span
                    className="size-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: `var(--color-${String(name)})` }}
                  />
                  <span className="text-muted-foreground">
                    {chartConfig[name as keyof typeof chartConfig]?.label ??
                      name}
                  </span>
                  <span className="ml-auto font-mono font-medium text-foreground tabular-nums">
                    {currency.format(Number(value))}
                  </span>
                </>
              )}
            />
          }
        />
        <defs>
          <linearGradient id="fillFirstTouch" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="var(--chart-2)" />
            <stop offset="100%" stopColor="var(--chart-1)" />
          </linearGradient>
          <linearGradient id="fillLastTouch" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="var(--chart-4)" />
            <stop offset="100%" stopColor="var(--chart-2)" />
          </linearGradient>
        </defs>
        {/*
         * The gradient goes on the Cell, not the Bar: the Bar's `fill` is what
         * the tooltip paints its dot with, and a `url(#…)` there is not a colour.
         * Cells also let the row under the cursor stay lit while the rest recede.
         */}
        <Bar
          dataKey="firstTouch"
          fill="var(--color-firstTouch)"
          radius={6}
          barSize={16}
        >
          {data.map((row) => (
            <Cell
              key={row.channel}
              fill="url(#fillFirstTouch)"
              fillOpacity={barOpacity(row.channel)}
            />
          ))}
        </Bar>
        <Bar
          dataKey="lastTouch"
          fill="var(--color-lastTouch)"
          radius={6}
          barSize={16}
        >
          {data.map((row) => (
            <Cell
              key={row.channel}
              fill="url(#fillLastTouch)"
              fillOpacity={barOpacity(row.channel)}
            />
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
 * const { data = [], status } = useQuery({ queryKey: ["attribution"], queryFn })
 * ```
 *
 * Start at `"error"`, or resolve with `[]`, to see the other two states.
 */
export function AttributionBreakdown1() {
  const [status, setStatus] = React.useState<LoadStatus>("pending")
  const [channels, setChannels] = React.useState<ChannelRow[]>([])

  React.useEffect(() => {
    if (status !== "pending") {
      return
    }

    const timer = setTimeout(() => {
      setChannels(attributionData)
      setStatus("success")
    }, 900)

    return () => clearTimeout(timer)
  }, [status])

  const handleRetry = React.useCallback(() => setStatus("pending"), [])

  const loaded = status === "success" && channels.length > 0

  return (
    <Card className="h-90">
      {loaded ? (
        <CardHeader className="max-sm:flex max-sm:flex-col">
          <CardTitle>Attribution breakdown</CardTitle>
          <CardDescription>
            Revenue credited by first touch vs last touch
          </CardDescription>
          {/*
           * `max-sm:flex` above retires the header's action column, dropping
           * the legend to its own row rather than squeezing the title beside
           * it. The inset is what keeps the legend, once it is back on the
           * right, from reading as the tail of the description.
           */}
          <CardAction className="self-end pl-6 max-sm:mt-2 max-sm:pl-0">
            <AttributionLegend />
          </CardAction>
        </CardHeader>
      ) : null}

      <CardContent className="flex min-h-0 flex-1 flex-col">
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
              <EmptyTitle>Couldn&apos;t load attribution</EmptyTitle>
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
            className="flex min-h-0 flex-1 flex-col gap-4"
          >
            <span className="sr-only">Loading attribution breakdown</span>
            <div className="flex flex-col gap-1">
              <div className="text-base">
                <Skeleton className="h-lh w-30" />
              </div>
              <div className="text-sm">
                <Skeleton className="h-lh w-74" />
              </div>
            </div>
            <Skeleton className="min-h-0 flex-1" />
          </div>
        ) : loaded ? (
          <AttributionChart data={channels} />
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
              <EmptyTitle>No attribution data yet</EmptyTitle>
              <EmptyDescription>
                Not enough closed revenue to attribute.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}
      </CardContent>
    </Card>
  )
}
