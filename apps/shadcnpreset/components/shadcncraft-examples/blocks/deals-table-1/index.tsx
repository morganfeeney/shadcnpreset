"use client"

import * as React from "react"

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
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/cn-ui/empty"
import { Badge } from "@/components/cn-ui/badge"
import {
  ProfileCard,
  ProfileCardAvatar,
  ProfileCardDetails,
  ProfileCardName,
} from "@/components/shadcncraft-examples/ui/profile-card"
import { Skeleton } from "@/components/cn-ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/cn-ui/table"
import { IconPlaceholder } from "@/components/icon-placeholder"

/** Empty is not one of these: it is a success that returned nothing. */
type LoadStatus = "error" | "pending" | "success"

type StageId = "contract-sent" | "negotiation" | "proposal" | "qualified"

/**
 * Every stage keeps one badge treatment, so a row is readable at a glance.
 * shadcncraft ships its own Badge with a hardcoded green "success" variant; the
 * preset Badge plus the success token keeps it on-theme.
 */
const stages: Record<
  StageId,
  {
    label: string
    variant: React.ComponentProps<typeof Badge>["variant"]
    className?: string
  }
> = {
  qualified: { label: "Qualified", variant: "secondary" },
  proposal: { label: "Proposal", variant: "outline" },
  negotiation: { label: "Negotiation", variant: "outline" },
  "contract-sent": {
    label: "Contract sent",
    variant: "outline",
    className: "border-success/25 bg-success/10 text-success",
  },
}

type Owner = { name: string; avatar: string }

const owners: Record<string, Owner> = {
  "sarah-chen": {
    name: "Sarah Chen",
    avatar: "https://assets.shadcncraft.com/registry/avatars/person-1.webp",
  },
  "marcus-webb": {
    name: "Marcus Webb",
    avatar: "https://assets.shadcncraft.com/registry/avatars/person-2.webp",
  },
  "priya-nair": {
    name: "Priya Nair",
    avatar: "https://assets.shadcncraft.com/registry/avatars/person-4.webp",
  },
}

type Deal = {
  id: string
  name: string
  owner: keyof typeof owners
  stage: StageId
  value: number
  /** Local midnight, so the printed date never slips a day across time zones. */
  closeDate: string
}

/** Replace with your own deals. */
const dealsData: Deal[] = [
  {
    id: "acme-corp",
    name: "Acme Corp – Team plan",
    owner: "sarah-chen",
    stage: "negotiation",
    value: 12400,
    closeDate: "2026-08-15T00:00:00",
  },
  {
    id: "northstar-labs",
    name: "Northstar Labs",
    owner: "marcus-webb",
    stage: "proposal",
    value: 8900,
    closeDate: "2026-08-22T00:00:00",
  },
  {
    id: "fieldstone-group",
    name: "Fieldstone Group",
    owner: "priya-nair",
    stage: "qualified",
    value: 5800,
    closeDate: "2026-09-03T00:00:00",
  },
  {
    id: "brightline-studio",
    name: "Brightline Studio",
    owner: "sarah-chen",
    stage: "contract-sent",
    value: 6200,
    closeDate: "2026-08-08T00:00:00",
  },
  {
    id: "meridian-health",
    name: "Meridian Health",
    owner: "priya-nair",
    stage: "contract-sent",
    value: 3100,
    closeDate: "2026-08-11T00:00:00",
  },
]

const columns = ["Deal", "Owner", "Stage", "Value", "Close date"]

/**
 * The design's 200fr : 150fr split. An auto table layout would instead hand the
 * slack to whichever column holds the longest string.
 */
const columnWidths = ["25%", "18.75%", "18.75%", "18.75%", "18.75%"]

/** Bar widths for the loading rows: the deal name, then the stage badge. */
const rowSkeletonWidths = [
  { deal: "w-35", owner: "w-19", stage: "w-20" },
  { deal: "w-24", owner: "w-22", stage: "w-16" },
  { deal: "w-28", owner: "w-17", stage: "w-16" },
  { deal: "w-28", owner: "w-19", stage: "w-22" },
  { deal: "w-26", owner: "w-17", stage: "w-22" },
]

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
})

const closeDateFormat = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
})

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
}

/**
 * The timer stands in for the fetch. Swap it for your own query — the branches
 * below are unchanged:
 *
 * ```tsx
 * const { data = [], status } = useQuery({ queryKey: ["deals"], queryFn })
 * ```
 *
 * Start at `"error"`, or resolve with `[]`, to see the other two states.
 */
export function DealsTable1() {
  const [status, setStatus] = React.useState<LoadStatus>("pending")
  const [deals, setDeals] = React.useState<Deal[]>([])

  React.useEffect(() => {
    if (status !== "pending") {
      return
    }

    const timer = setTimeout(() => {
      setDeals(dealsData)
      setStatus("success")
    }, 900)

    return () => clearTimeout(timer)
  }, [status])

  const handleRetry = React.useCallback(() => setStatus("pending"), [])

  const loaded = status === "success" && deals.length > 0

  return (
    <Card>
      {loaded ? (
        <CardHeader>
          <CardTitle>Open deals</CardTitle>
          <CardDescription>Deals in flight across the team</CardDescription>
          <CardAction>
            <Button variant="outline" size="sm">
              View all
            </Button>
          </CardAction>
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
              <EmptyTitle>Couldn&apos;t load deals</EmptyTitle>
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
            <span className="sr-only">Loading open deals</span>
            <div className="flex flex-col gap-1">
              <div className="text-base">
                <Skeleton className="h-lh w-22" />
              </div>
              <div className="text-sm">
                <Skeleton className="h-lh w-45" />
              </div>
            </div>
            {/* Built on the real table, so the columns do not shift once loaded. */}
            <Table>
              <TableHeader>
                <TableRow>
                  {columns.map((column, index) => (
                    <TableHead
                      key={column}
                      style={{ width: columnWidths[index] }}
                    >
                      <div className="text-sm">
                        <Skeleton
                          className={cn(
                            "h-lh",
                            ["w-9", "w-11", "w-10", "w-10", "w-17"][index]
                          )}
                        />
                      </div>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {rowSkeletonWidths.map((row, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <div className="text-sm">
                        <Skeleton className={cn("h-lh", row.deal)} />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Skeleton className="size-6 shrink-0 rounded-full" />
                        <div className="text-sm">
                          <Skeleton className={cn("h-lh", row.owner)} />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Skeleton className={cn("h-5 rounded-4xl", row.stage)} />
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <Skeleton className="h-lh w-13" />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <Skeleton className="h-lh w-21" />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : loaded ? (
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((column, index) => (
                  <TableHead
                    key={column}
                    style={{ width: columnWidths[index] }}
                  >
                    {column}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {deals.map((deal) => {
                const owner = owners[deal.owner]
                const stage = stages[deal.stage]

                return (
                  <TableRow key={deal.id}>
                    <TableCell className="font-medium">{deal.name}</TableCell>
                    <TableCell>
                      <ProfileCard>
                        <ProfileCardAvatar
                          size="sm"
                          src={owner.avatar}
                          name={initials(owner.name)}
                        />
                        <ProfileCardDetails>
                          <ProfileCardName>{owner.name}</ProfileCardName>
                        </ProfileCardDetails>
                      </ProfileCard>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={stage.variant}
                        className={stage.className}
                      >
                        {stage.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="tabular-nums">
                      {currency.format(deal.value)}
                    </TableCell>
                    <TableCell className="tabular-nums">
                      <time dateTime={deal.closeDate.slice(0, 10)}>
                        {closeDateFormat.format(new Date(deal.closeDate))}
                      </time>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
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
              <EmptyTitle>No deals found</EmptyTitle>
              <EmptyDescription>
                Try adjusting your filters, or add your first deal to get
                started.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}
      </CardContent>
    </Card>
  )
}
