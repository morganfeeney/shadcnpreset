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

type Stage = {
  id: string
  label: string
  /** Open pipeline value sitting in this stage. */
  value: number
  /** The tooltip dot. The band itself is a slice of the shared ramp below. */
  color: string
}

/** Replace with your own stages, largest first. */
const stagesData: Stage[] = [
  { id: "lead", label: "Lead", value: 763000, color: "var(--chart-1)" },
  {
    id: "qualified",
    label: "Qualified",
    value: 482000,
    color: "var(--chart-2)",
  },
  { id: "proposal", label: "Proposal", value: 361000, color: "var(--chart-3)" },
  {
    id: "negotiation",
    label: "Negotiation",
    value: 241000,
    color: "var(--chart-4)",
  },
  {
    id: "closed-won",
    label: "Closed won",
    value: 161000,
    color: "var(--chart-5)",
  },
]

/**
 * The plot is drawn in these units and stretched to the card by the viewBox, so
 * every measurement below is a proportion rather than a pixel.
 */
const VIEW_WIDTH = 1000
const VIEW_HEIGHT = 400

/** Gutter between two stages. */
const STAGE_GAP = 7

/** The tallest band, as a share of the plot, leaving room for its glow rings. */
const PEAK_BAND = 0.8

/** Concentric rings behind each band, scaled off the band's own thickness. */
const GLOW_RINGS = [1.22, 1.11]

const SAMPLES_PER_STAGE = 32

const compactCurrency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  notation: "compact",
  maximumFractionDigits: 0,
})

type Node = { center: number; half: number }

function stageNodes(stages: Stage[]): Node[] {
  const peak = Math.max(...stages.map((stage) => stage.value))
  const span = VIEW_WIDTH / stages.length

  return stages.map((stage, index) => ({
    center: (index + 0.5) * span,
    half: (stage.value / peak) * (VIEW_HEIGHT / 2) * PEAK_BAND,
  }))
}

/**
 * Smoothstep between stage centres — a flat tangent at every centre, so the
 * ribbon reads as one funnel narrowing rather than a chain of trapezoids, and
 * each band is exactly its own thickness under its own label.
 */
function halfAt(x: number, nodes: Node[]) {
  const first = nodes[0]
  const last = nodes[nodes.length - 1]

  if (x <= first.center) {
    return first.half
  }

  if (x >= last.center) {
    return last.half
  }

  const index = nodes.findLastIndex((node) => node.center <= x)
  const from = nodes[index]
  const to = nodes[index + 1]
  const t = (x - from.center) / (to.center - from.center)

  return from.half + (to.half - from.half) * t * t * (3 - 2 * t)
}

function segmentPath(
  index: number,
  total: number,
  nodes: Node[],
  scale: number
) {
  const span = VIEW_WIDTH / total
  const start = index * span + (index === 0 ? 0 : STAGE_GAP / 2)
  const end = (index + 1) * span - (index === total - 1 ? 0 : STAGE_GAP / 2)
  const top: string[] = []
  const bottom: string[] = []

  for (let step = 0; step <= SAMPLES_PER_STAGE; step++) {
    const x = start + ((end - start) * step) / SAMPLES_PER_STAGE
    const half = halfAt(x, nodes) * scale
    top.push(`${x.toFixed(1)},${(VIEW_HEIGHT / 2 - half).toFixed(1)}`)
    bottom.push(`${x.toFixed(1)},${(VIEW_HEIGHT / 2 + half).toFixed(1)}`)
  }

  return `M${top.join("L")}L${bottom.reverse().join("L")}Z`
}

function FunnelTooltip({
  stage,
  share,
  index,
  total,
}: {
  stage: Stage
  share: number
  index: number
  total: number
}) {
  const atStart = index === 0
  const atEnd = index === total - 1

  return (
    <div
      className={cn(
        "pointer-events-none absolute top-0 z-10 grid w-max items-start gap-1.5 rounded-lg border border-border/50 bg-background px-2.5 py-1.5 text-xs shadow-xl",
        atStart && "left-0",
        atEnd && "right-0",
        !atStart && !atEnd && "-translate-x-1/2"
      )}
      style={
        atStart || atEnd
          ? undefined
          : { left: `${((index + 0.5) / total) * 100}%` }
      }
    >
      <div className="font-medium">{stage.label}</div>
      <div className="flex items-center gap-2">
        <span
          className="size-2.5 shrink-0 rounded-full"
          style={{ backgroundColor: stage.color }}
        />
        <span className="text-muted-foreground">Pipeline</span>
        <span className="ml-auto flex items-baseline gap-1.5 pl-4">
          <span className="font-mono font-medium text-foreground tabular-nums">
            {compactCurrency.format(stage.value)}
          </span>
          <span className="text-muted-foreground tabular-nums">{share}%</span>
        </span>
      </div>
    </div>
  )
}

function FunnelPlot({ stages, total }: { stages: Stage[]; total: number }) {
  const [active, setActive] = React.useState<number | null>(null)
  const gradientId = `funnel-ramp-${React.useId().replace(/:/g, "")}`

  const { nodes, shares, bands } = React.useMemo(() => {
    const computed = stageNodes(stages)

    return {
      nodes: computed,
      shares: stages.map((stage) => Math.round((stage.value / total) * 100)),
      bands: stages.map((_, index) => [
        ...GLOW_RINGS.map((ring) =>
          segmentPath(index, stages.length, computed, ring)
        ),
        segmentPath(index, stages.length, computed, 1),
      ]),
    }
  }, [stages, total])

  const span = VIEW_WIDTH / stages.length

  return (
    <div className="relative min-h-0 flex-1">
      <svg
        aria-hidden="true"
        className="size-full"
        viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
        preserveAspectRatio="none"
      >
        <defs>
          {/* One ramp across the whole plot, so each band picks up its slice. */}
          <linearGradient
            id={gradientId}
            gradientUnits="userSpaceOnUse"
            x1={0}
            x2={VIEW_WIDTH}
          >
            {stages.map((stage, index) => (
              <stop
                key={stage.id}
                offset={nodes[index].center / VIEW_WIDTH}
                stopColor={stage.color}
              />
            ))}
          </linearGradient>
        </defs>

        {stages.map((stage, index) => {
          const [outer, mid, core] = bands[index]

          return (
            <g
              key={stage.id}
              opacity={active === null || active === index ? 1 : 0.3}
              onMouseEnter={() => setActive(index)}
              onMouseLeave={() => setActive(null)}
            >
              <path d={outer} fill="var(--chart-1)" fillOpacity={0.5} />
              <path d={mid} fill="var(--chart-1)" />
              <path d={core} fill={`url(#${gradientId})`} />
              {/* The tail bands are only a few pixels tall, so the whole column picks up the hover. */}
              <rect
                x={index * span}
                y={0}
                width={span}
                height={VIEW_HEIGHT}
                fill="transparent"
              />
            </g>
          )
        })}
      </svg>

      {/*
       * The ramp runs light to dark, so no single text colour clears both ends
       * of it - and which end is the dark one flips in dark mode. The chip
       * carries its own contrast instead.
       */}
      <div className="pointer-events-none absolute inset-0 flex items-center gap-1.5">
        {stages.map((stage, index) => (
          <span key={stage.id} className="flex min-w-0 flex-1 justify-center">
            <span className="rounded-full bg-background/85 px-1.5 text-xs font-semibold tabular-nums">
              {shares[index]}%
            </span>
          </span>
        ))}
      </div>

      <ul className="sr-only">
        {stages.map((stage, index) => (
          <li key={stage.id}>
            {stage.label}: {compactCurrency.format(stage.value)} (
            {shares[index]}% of total)
          </li>
        ))}
      </ul>

      {active !== null ? (
        <FunnelTooltip
          stage={stages[active]}
          share={shares[active]}
          index={active}
          total={stages.length}
        />
      ) : null}
    </div>
  )
}

/**
 * The timer stands in for the fetch. Swap it for your own query — the branches
 * below are unchanged:
 *
 * ```tsx
 * const { data = [], status } = useQuery({ queryKey: ["pipeline"], queryFn })
 * ```
 *
 * Start at `"error"`, or resolve with `[]`, to see the other two states.
 */
export function PipelineByStage1() {
  const [status, setStatus] = React.useState<LoadStatus>("pending")
  const [stages, setStages] = React.useState<Stage[]>([])

  React.useEffect(() => {
    if (status !== "pending") {
      return
    }

    const timer = setTimeout(() => {
      setStages(stagesData)
      setStatus("success")
    }, 900)

    return () => clearTimeout(timer)
  }, [status])

  const handleRetry = React.useCallback(() => setStatus("pending"), [])

  const loaded = status === "success" && stages.length > 0
  const total = stages.reduce((sum, stage) => sum + stage.value, 0)

  return (
    <Card className="h-90">
      {loaded ? (
        <CardHeader>
          <CardTitle>Pipeline by stage</CardTitle>
          <CardDescription>Open pipeline across all deals</CardDescription>
        </CardHeader>
      ) : null}

      <CardContent className="flex min-h-0 flex-1 flex-col justify-center">
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
              <EmptyTitle>Couldn&apos;t load pipeline</EmptyTitle>
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
            <span className="sr-only">Loading pipeline by stage</span>
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
          <div className="flex min-h-0 flex-1 flex-col gap-5">
            <FunnelPlot stages={stages} total={total} />
            {/* The design's 24px gutter starves the labels on a phone. */}
            <div className="flex gap-1 sm:gap-6">
              {stages.map((stage) => (
                <span
                  key={stage.id}
                  title={stage.label}
                  className="min-w-0 flex-1 truncate text-center text-xs text-muted-foreground"
                >
                  {stage.label}
                </span>
              ))}
            </div>
          </div>
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
              <EmptyTitle>No open pipeline</EmptyTitle>
              <EmptyDescription>
                Create deals to see the pipeline by stage.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}
      </CardContent>
    </Card>
  )
}
