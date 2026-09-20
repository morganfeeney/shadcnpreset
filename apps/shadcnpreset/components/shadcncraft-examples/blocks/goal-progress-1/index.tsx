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
import { Progress } from "@/components/cn-ui/progress"
import { Skeleton } from "@/components/cn-ui/skeleton"
import { IconPlaceholder } from "@/components/icon-placeholder"

/** Empty is not one of these: it is a success that returned nothing. */
type LoadStatus = "error" | "pending" | "success"

type Goal = {
  id: string
  label: string
  current: number
  target: number
  unit: "count" | "currency"
}

/** Replace with your own goals. */
const goalsData: Goal[] = [
  {
    id: "pipeline",
    label: "Pipeline created",
    current: 12847,
    target: 13000,
    unit: "currency",
  },
  {
    id: "leads",
    label: "Leads generated",
    current: 2830,
    target: 3000,
    unit: "count",
  },
  {
    id: "customers",
    label: "New customers",
    current: 459,
    target: 600,
    unit: "count",
  },
]

/**
 * The track runs to 120% of target, so a goal that is beaten reads as overshoot
 * past the tick instead of a bar that merely stops full.
 */
const trackScale = 1.2
const targetTickPercent = 100 / trackScale

/** Bar widths for the three loading rows, so they read as text of their length. */
const rowSkeletonWidths = [
  { label: "w-26", value: "w-32" },
  { label: "w-27", value: "w-23" },
  { label: "w-26", value: "w-16" },
]

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
})

const plainNumber = new Intl.NumberFormat("en-US")

function formatGoalValue(goal: Goal, value: number) {
  return goal.unit === "currency"
    ? currency.format(value)
    : plainNumber.format(value)
}

function GoalRow({ goal }: { goal: Goal }) {
  const reading = `${formatGoalValue(goal, goal.current)} / ${formatGoalValue(goal, goal.target)}`
  const fill = Math.min(goal.current / goal.target / trackScale, 1) * 100

  return (
    <li className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <span className="min-w-0 truncate text-sm font-medium">
          {goal.label}
        </span>
        <span className="shrink-0 text-sm font-medium tabular-nums">
          {reading}
        </span>
      </div>
      <div className="relative">
        {/* The recipe paints the indicator `primary`; the design wants a chart tone. */}
        <Progress
          value={fill}
          aria-label={goal.label}
          aria-valuetext={reading.replace("/", "of")}
          className="**:data-[slot=progress-indicator]:bg-chart-3"
        />
        {/* The tick is the goal, not the end of the track. */}
        <span
          aria-hidden="true"
          className="absolute inset-y-0 border-l border-dashed border-muted-foreground"
          style={{ left: `${targetTickPercent}%` }}
        />
      </div>
    </li>
  )
}

/**
 * The timer stands in for the fetch. Swap it for your own query — the branches
 * below are unchanged:
 *
 * ```tsx
 * const { data = [], status } = useQuery({ queryKey: ["goals"], queryFn })
 * ```
 *
 * Start at `"error"`, or resolve with `[]`, to see the other two states.
 */
export function GoalProgress1() {
  const [status, setStatus] = React.useState<LoadStatus>("pending")
  const [goals, setGoals] = React.useState<Goal[]>([])

  React.useEffect(() => {
    if (status !== "pending") {
      return
    }

    const timer = setTimeout(() => {
      setGoals(goalsData)
      setStatus("success")
    }, 900)

    return () => clearTimeout(timer)
  }, [status])

  const handleRetry = React.useCallback(() => setStatus("pending"), [])

  const loaded = status === "success" && goals.length > 0

  return (
    <Card>
      {loaded ? (
        <CardHeader>
          <CardTitle>Marketing goals</CardTitle>
          <CardDescription>
            Month-to-date attainment against monthly targets
          </CardDescription>
        </CardHeader>
      ) : null}

      <CardContent className="flex flex-1 flex-col justify-center">
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
              <EmptyTitle>Couldn&apos;t load goals</EmptyTitle>
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
            <span className="sr-only">Loading marketing goals</span>
            <div className="flex flex-col gap-1">
              <div className="text-base">
                <Skeleton className="h-lh w-35" />
              </div>
              <div className="text-sm">
                <Skeleton className="h-lh w-65" />
              </div>
            </div>
            <div className="flex flex-col gap-6">
              {rowSkeletonWidths.map((row, index) => (
                <div key={index} className="flex flex-col gap-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-sm">
                      <Skeleton className={cn("h-lh", row.label)} />
                    </div>
                    <div className="text-sm">
                      <Skeleton className={cn("h-lh", row.value)} />
                    </div>
                  </div>
                  <Skeleton className="h-1.5 w-full rounded-full" />
                </div>
              ))}
            </div>
          </div>
        ) : loaded ? (
          <ul className="flex flex-col gap-6">
            {goals.map((goal) => (
              <GoalRow key={goal.id} goal={goal} />
            ))}
          </ul>
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
              <EmptyTitle>No goals configured</EmptyTitle>
              <EmptyDescription>
                Set monthly targets to track them here.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}
      </CardContent>
    </Card>
  )
}
