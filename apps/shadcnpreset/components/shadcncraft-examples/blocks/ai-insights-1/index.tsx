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
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from "@/components/cn-ui/item"
import { Skeleton } from "@/components/cn-ui/skeleton"
import { IconPlaceholder } from "@/components/icon-placeholder"

/** Empty is not one of these: it is a success that returned nothing. */
type LoadStatus = "error" | "pending" | "success"

type Insight = {
  id: string
  title: string
  description: string
  icon: React.ReactNode
}

/** Replace with your own insights. */
const insightsData: Insight[] = [
  {
    id: "win-rate",
    title: "Win rate up 4 pts",
    description: "32% this quarter, driven by faster Proposal-stage exits.",
    icon: (
      <IconPlaceholder
        lucide="TrendingUp"
        tabler="IconTrendingUp"
        hugeicons="AnalyticsUpIcon"
        phosphor="TrendUpIcon"
        remixicon="RiLineChartLine"
      />
    ),
  },
  {
    id: "cost-per-lead",
    title: "Cost per lead climbing",
    description: "CPL rose 12.5% while spend grew 8.2%. Socials is the driver.",
    icon: (
      <IconPlaceholder
        lucide="TriangleAlertIcon"
        tabler="IconAlertTriangle"
        hugeicons="Alert02Icon"
        phosphor="WarningIcon"
        remixicon="RiErrorWarningLine"
      />
    ),
  },
  {
    id: "forecast-gap",
    title: "Q3 forecast gap",
    description: "Forecast $1.38M against the $1.5M target, an 8% gap.",
    icon: (
      <IconPlaceholder
        lucide="TargetIcon"
        tabler="IconTarget"
        hugeicons="Target01Icon"
        phosphor="TargetIcon"
        remixicon="RiTargetLine"
      />
    ),
  },
  {
    id: "organic-vs-paid",
    title: "Organic outperforming paid",
    description: "Organic drives the most first-touch revenue this month.",
    icon: (
      <IconPlaceholder
        lucide="Sparkles"
        tabler="IconSparkles"
        hugeicons="SparklesIcon"
        phosphor="SparkleIcon"
        remixicon="RiSparklingLine"
      />
    ),
  },
]

/** Bar widths for the four loading rows, so they read as text of varying length. */
const rowSkeletonWidths = [
  { title: "w-40", description: "w-4/5" },
  { title: "w-48", description: "w-11/12" },
  { title: "w-36", description: "w-3/4" },
  { title: "w-52", description: "w-5/6" },
]

/**
 * The timer stands in for the fetch. Swap it for your own query — the branches
 * below are unchanged:
 *
 * ```tsx
 * const { data = [], status } = useQuery({ queryKey: ["insights"], queryFn })
 * ```
 *
 * Start at `"error"`, or resolve with `[]`, to see the other two states.
 */
export function AiInsights1() {
  const [status, setStatus] = React.useState<LoadStatus>("pending")
  const [insights, setInsights] = React.useState<Insight[]>([])

  React.useEffect(() => {
    if (status !== "pending") {
      return
    }

    const timer = setTimeout(() => {
      setInsights(insightsData)
      setStatus("success")
    }, 900)

    return () => clearTimeout(timer)
  }, [status])

  const handleRetry = React.useCallback(() => setStatus("pending"), [])

  const loaded = status === "success" && insights.length > 0

  return (
    <Card>
      {loaded ? (
        <CardHeader>
          <CardTitle>AI insights</CardTitle>
          <CardDescription>
            Alerts and opportunities across your funnel
          </CardDescription>
        </CardHeader>
      ) : null}

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
              <EmptyTitle>Couldn&apos;t load insights</EmptyTitle>
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
            <span className="sr-only">Loading insights</span>
            <div className="flex flex-col gap-1">
              <div className="text-base">
                <Skeleton className="h-lh w-35" />
              </div>
              <div className="text-sm">
                <Skeleton className="h-lh w-65" />
              </div>
            </div>
            <ItemGroup className="gap-2">
              {rowSkeletonWidths.map((row, index) => (
                <Item key={index} size="sm" className="items-start">
                  <ItemMedia className="py-0.5">
                    <Skeleton className="size-4 rounded-sm" />
                  </ItemMedia>
                  <ItemContent>
                    <div className="text-sm">
                      <Skeleton className={cn("h-lh", row.title)} />
                    </div>
                    <div className="w-full text-sm">
                      <Skeleton className={cn("h-lh", row.description)} />
                    </div>
                  </ItemContent>
                </Item>
              ))}
            </ItemGroup>
          </div>
        ) : loaded ? (
          <ItemGroup className="gap-2">
            {insights.map((insight) => (
              <Item key={insight.id} size="sm" className="items-start">
                <ItemMedia className="py-0.5">{insight.icon}</ItemMedia>
                <ItemContent>
                  <ItemTitle>{insight.title}</ItemTitle>
                  <ItemDescription>{insight.description}</ItemDescription>
                </ItemContent>
              </Item>
            ))}
          </ItemGroup>
        ) : (
          <Empty className="px-0 py-0">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <IconPlaceholder
                  lucide="Sparkles"
                  tabler="IconSparkles"
                  hugeicons="SparklesIcon"
                  phosphor="SparkleIcon"
                  remixicon="RiSparklingLine"
                />
              </EmptyMedia>
              <EmptyTitle>No insights yet</EmptyTitle>
              <EmptyDescription>
                Insights appear here when we spot anomalies or opportunities in
                your data.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}
      </CardContent>
    </Card>
  )
}
