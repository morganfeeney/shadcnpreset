"use client"

import * as React from "react"

import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/cn-ui/avatar"
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

type Rep = {
  id: string
  name: string
  avatar: string
  closed: number
  quota: number
}

/** Replace with your own reps. The order here does not matter — see `rankReps`. */
const repsData: Rep[] = [
  {
    id: "ethan",
    name: "Ethan Parker Jenson",
    avatar: "https://assets.shadcncraft.com/registry/avatars/person-1.webp",
    closed: 220000,
    quota: 200000,
  },
  {
    id: "olivia",
    name: "Olivia Johnson",
    avatar: "https://assets.shadcncraft.com/registry/avatars/person-2.webp",
    closed: 135000,
    quota: 220000,
  },
  {
    id: "liam",
    name: "Liam Smith",
    avatar: "https://assets.shadcncraft.com/registry/avatars/person-4.webp",
    closed: 160000,
    quota: 210000,
  },
  {
    id: "noah",
    name: "Noah Mark Davis",
    avatar: "https://assets.shadcncraft.com/registry/avatars/person-7.webp",
    closed: 410000,
    quota: 250000,
  },
  {
    id: "sophia",
    name: "Sophia Brown",
    avatar: "https://assets.shadcncraft.com/registry/avatars/person-5.webp",
    closed: 230000,
    quota: 230000,
  },
]

/**
 * The track runs to 120% of quota, so a rep who beat it reads as overshoot past
 * the tick instead of a bar that merely stops full.
 */
const trackScale = 1.2
const quotaTickPercent = 100 / trackScale

/** Bar widths for the five loading rows, so they read as names of their length. */
const nameSkeletonWidths = ["w-21", "w-24", "w-18", "w-19", "w-23"]

const compactCurrency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  notation: "compact",
  maximumFractionDigits: 0,
})

/** The card claims a ranking, so it earns one rather than trusting the order in. */
function rankReps(reps: Rep[]) {
  return [...reps].sort((a, b) => b.closed / b.quota - a.closed / a.quota)
}

function initials(name: string) {
  const parts = name.split(" ").filter(Boolean)
  return `${parts[0]?.[0] ?? ""}${parts.length > 1 ? (parts[parts.length - 1][0] ?? "") : ""}`
}

function RepRow({ rep, rank }: { rep: Rep; rank: number }) {
  const reading = `${compactCurrency.format(rep.closed)}/${compactCurrency.format(rep.quota)}`
  const fill = Math.min(rep.closed / rep.quota / trackScale, 1) * 100

  return (
    <li className="flex items-center gap-3.5">
      <span className="w-3 shrink-0 text-xl font-medium tracking-tight text-muted-foreground tabular-nums">
        {rank}
      </span>
      <div className="flex min-w-0 flex-1 items-center gap-3.5">
        <div className="flex min-w-0 flex-1 items-center gap-2.5">
          <Avatar size="sm">
            <AvatarImage src={rep.avatar} alt="" />
            <AvatarFallback>{initials(rep.name)}</AvatarFallback>
          </Avatar>
          <span className="truncate text-sm font-medium">{rep.name}</span>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          {/* Hidden rather than shrunk on a phone: the reading beside it
              already carries the same numbers. */}
          <div className="relative hidden w-40 sm:block">
            <Progress
              value={fill}
              aria-label={`${rep.name} quota attainment`}
              aria-valuetext={`${compactCurrency.format(rep.closed)} of ${compactCurrency.format(rep.quota)}`}
              className="**:data-[slot=progress-indicator]:bg-chart-3"
            />
            {/* The tick is the quota, not the end of the track. */}
            <span
              aria-hidden="true"
              className="absolute inset-y-0 border-l border-dashed border-muted-foreground"
              style={{ left: `${quotaTickPercent}%` }}
            />
          </div>
          <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
            {reading}
          </span>
        </div>
      </div>
    </li>
  )
}

/**
 * The timer stands in for the fetch. Swap it for your own query — the branches
 * below are unchanged:
 *
 * ```tsx
 * const { data = [], status } = useQuery({ queryKey: ["reps"], queryFn })
 * ```
 *
 * Start at `"error"`, or resolve with `[]`, to see the other two states.
 */
export function RepLeaderboard1() {
  const [status, setStatus] = React.useState<LoadStatus>("pending")
  const [reps, setReps] = React.useState<Rep[]>([])

  React.useEffect(() => {
    if (status !== "pending") {
      return
    }

    const timer = setTimeout(() => {
      setReps(repsData)
      setStatus("success")
    }, 900)

    return () => clearTimeout(timer)
  }, [status])

  const handleRetry = React.useCallback(() => setStatus("pending"), [])

  const loaded = status === "success" && reps.length > 0
  const ranked = React.useMemo(() => rankReps(reps), [reps])

  return (
    <Card>
      {loaded ? (
        <CardHeader>
          <CardTitle>Sales rep leaderboard</CardTitle>
          <CardDescription>Quota attainment this quarter</CardDescription>
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
              <EmptyTitle>Couldn&apos;t load leaderboard</EmptyTitle>
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
            <span className="sr-only">Loading rep leaderboard</span>
            <div className="flex flex-col gap-1">
              <div className="text-base">
                <Skeleton className="h-lh w-40" />
              </div>
              <div className="text-sm">
                <Skeleton className="h-lh w-55" />
              </div>
            </div>
            <div className="flex flex-col gap-4">
              {nameSkeletonWidths.map((width, index) => (
                <div key={index} className="flex items-center gap-3.5">
                  <div className="text-sm">
                    <Skeleton className="h-lh w-3" />
                  </div>
                  <div className="flex min-w-0 flex-1 items-center gap-3.5">
                    <div className="flex min-w-0 flex-1 items-center gap-2.5">
                      <Skeleton className="size-6 shrink-0 rounded-full" />
                      <div className="text-sm">
                        <Skeleton className={cn("h-lh", width)} />
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      <Skeleton className="hidden h-4 w-40 sm:block" />
                      <Skeleton className="h-4 w-17 shrink-0" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : loaded ? (
          <ul className="flex flex-col gap-4">
            {ranked.map((rep, index) => (
              <RepRow key={rep.id} rep={rep} rank={index + 1} />
            ))}
          </ul>
        ) : (
          <Empty className="px-0 py-0">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <IconPlaceholder
                  lucide="TrophyIcon"
                  tabler="IconTrophy"
                  hugeicons="Award01Icon"
                  phosphor="TrophyIcon"
                  remixicon="RiTrophyLine"
                />
              </EmptyMedia>
              <EmptyTitle>No rep activity yet</EmptyTitle>
              <EmptyDescription>
                The leaderboard fills in once reps start closing deals.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}
      </CardContent>
    </Card>
  )
}
