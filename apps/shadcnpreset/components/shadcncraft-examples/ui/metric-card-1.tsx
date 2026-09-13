import * as React from "react"

import { cn } from "@/lib/utils"
import { Card, CardContent } from "@/components/cn-ui/card"

type Trend = "up" | "down" | "neutral"

function MetricCard1({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <Card
      data-slot="metric-card"
      className={cn("relative", className)}
      {...props}
    >
      <CardContent>{children}</CardContent>
    </Card>
  )
}

function MetricCard1Title({ className, ...props }: React.ComponentProps<"h3">) {
  return (
    <h3
      data-slot="metric-card-title"
      className={cn("mb-1.5 text-base font-medium", className)}
      {...props}
    />
  )
}

function MetricCard1Value({
  value,
  label,
  className,
  ...props
}: React.ComponentProps<"div"> & {
  value: React.ReactNode
  label?: React.ReactNode
}) {
  return (
    <div
      data-slot="metric-card-value"
      className={cn("mb-1.5", className)}
      {...props}
    >
      <div
        data-slot="metric-card-value-number"
        className="text-2xl font-semibold tracking-tight tabular-nums"
      >
        {value}
      </div>
      {label ? (
        <div
          data-slot="metric-card-value-label"
          className="text-sm text-muted-foreground"
        >
          {label}
        </div>
      ) : null}
    </div>
  )
}

function MetricCard1Delta({
  value,
  description,
  trend = "neutral",
  icon,
  className,
  ...props
}: React.ComponentProps<"p"> & {
  value: React.ReactNode
  description?: React.ReactNode
  trend?: Trend
  icon?: React.ReactNode
}) {
  const trendClassName = {
    up: "text-success",
    down: "text-destructive",
    neutral: "text-muted-foreground",
  }[trend]

  return (
    <p
      data-slot="metric-card-delta"
      className={cn("text-sm text-muted-foreground", className)}
      data-trend={trend}
      {...props}
    >
      <span
        data-slot="metric-card-delta-value"
        className={cn(
          "inline-flex items-center gap-0.5 align-middle font-medium [&_svg]:size-[1em]",
          trendClassName
        )}
      >
        {icon}
        {value}
      </span>{" "}
      {description}
    </p>
  )
}

function MetricCard1Icon({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="metric-card-icon"
      className={cn(
        "absolute top-2 right-2 flex size-10 items-center justify-center rounded-sm bg-muted/50 text-muted-foreground [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-5",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export {
  MetricCard1,
  MetricCard1Delta,
  MetricCard1Icon,
  MetricCard1Title,
  MetricCard1Value,
}
