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

type Channel = {
  id: string
  label: string
  visitors: number
  /** Drives the dot and this channel's slice of the share bar. */
  color: string
}

/** Replace with your own channels. */
const channelsData: Channel[] = [
  {
    id: "organic-search",
    label: "Organic search",
    visitors: 29300,
    color: "bg-chart-1",
  },
  {
    id: "paid-search",
    label: "Paid search",
    visitors: 16700,
    color: "bg-chart-2",
  },
  { id: "social", label: "Social", visitors: 12600, color: "bg-chart-3" },
  { id: "direct", label: "Direct", visitors: 10000, color: "bg-chart-4" },
  { id: "other", label: "Other", visitors: 15100, color: "bg-chart-5" },
]

/** The same window one period back, which is all the headline delta needs. */
const previousTotalVisitors = 76400

/** Bar widths for the five loading rows, so they read as text of varying length. */
const rowSkeletonWidths = [
  { label: "w-32", value: "w-20" },
  { label: "w-28", value: "w-21" },
  { label: "w-38", value: "w-22" },
  { label: "w-28", value: "w-18" },
  { label: "w-17", value: "w-22" },
]

const compactNumber = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 1,
})

const plainNumber = new Intl.NumberFormat("en-US")

function ShareBar({ channels }: { channels: Channel[] }) {
  return (
    // The rows below already carry every number this encodes.
    <div aria-hidden="true" className="flex items-center gap-1">
      {channels.map((channel) => (
        <div
          key={channel.id}
          className={cn("h-2.5 rounded-full", channel.color)}
          style={{ flexGrow: channel.visitors }}
        />
      ))}
    </div>
  )
}

function ChannelRows({
  channels,
  total,
}: {
  channels: Channel[]
  total: number
}) {
  return (
    <ul className="flex flex-col gap-3">
      {channels.map((channel) => (
        <li
          key={channel.id}
          className="flex items-center justify-between gap-3"
        >
          <div className="flex min-w-0 items-center gap-1.5">
            <span
              className={cn("size-2 shrink-0 rounded-full", channel.color)}
            />
            <span className="truncate text-sm">{channel.label}</span>
          </div>
          <div className="flex shrink-0 items-center gap-1.5 text-sm tabular-nums">
            <span className="font-medium">
              {plainNumber.format(channel.visitors)}
            </span>
            <span className="text-muted-foreground">
              {Math.round((channel.visitors / total) * 100)}%
            </span>
          </div>
        </li>
      ))}
    </ul>
  )
}

/**
 * The timer stands in for the fetch. Swap it for your own query — the branches
 * below are unchanged:
 *
 * ```tsx
 * const { data = [], status } = useQuery({ queryKey: ["traffic"], queryFn })
 * ```
 *
 * Start at `"error"`, or resolve with `[]`, to see the other two states.
 */
export function TrafficByChannel1() {
  const [status, setStatus] = React.useState<LoadStatus>("pending")
  const [channels, setChannels] = React.useState<Channel[]>([])

  React.useEffect(() => {
    if (status !== "pending") {
      return
    }

    const timer = setTimeout(() => {
      setChannels(channelsData)
      setStatus("success")
    }, 900)

    return () => clearTimeout(timer)
  }, [status])

  const handleRetry = React.useCallback(() => setStatus("pending"), [])

  const loaded = status === "success" && channels.length > 0
  const total = channels.reduce((sum, channel) => sum + channel.visitors, 0)
  const change = ((total - previousTotalVisitors) / previousTotalVisitors) * 100

  return (
    <Card>
      {loaded ? (
        <CardHeader>
          <CardTitle>Traffic by channel</CardTitle>
          <CardDescription>Traffic break down across channels</CardDescription>
        </CardHeader>
      ) : null}

      <CardContent className="flex flex-1 flex-col gap-4">
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
              <EmptyTitle>Couldn&apos;t load traffic</EmptyTitle>
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
          <div role="status" aria-busy="true" className="flex flex-col gap-4">
            <span className="sr-only">Loading traffic</span>
            <div className="flex flex-col gap-1">
              <div className="text-base">
                <Skeleton className="h-lh w-40" />
              </div>
              <div className="text-sm">
                <Skeleton className="h-lh w-58" />
              </div>
            </div>
            <div className="text-2xl">
              <Skeleton className="h-lh w-50" />
            </div>
            <Skeleton className="h-2.5 w-full rounded-full" />
            <div className="flex flex-col gap-3">
              {rowSkeletonWidths.map((row, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="text-sm">
                    <Skeleton className={cn("h-lh", row.label)} />
                  </div>
                  <div className="text-sm">
                    <Skeleton className={cn("h-lh", row.value)} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : loaded ? (
          <>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-semibold tracking-tight tabular-nums">
                {compactNumber.format(total)}
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
            <ShareBar channels={channels} />
            <ChannelRows channels={channels} total={total} />
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
              <EmptyTitle>No traffic yet</EmptyTitle>
              <EmptyDescription>
                Channel breakdown appears once visitors arrive.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}
      </CardContent>
    </Card>
  )
}
