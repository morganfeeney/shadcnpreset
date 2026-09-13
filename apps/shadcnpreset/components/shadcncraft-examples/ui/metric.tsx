import * as React from "react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/cn-ui/button"

function Metric({
  className,
  size = "default",
  alignment = "left",
  ...props
}: React.ComponentProps<"div"> & {
  size?: "default" | "lg"
  alignment?: "left" | "center"
}) {
  return (
    <div
      data-slot="metric"
      data-size={size}
      data-alignment={alignment}
      className={cn(
        "group/metric flex max-w-xl flex-col items-start gap-y-0.5 data-[alignment=center]:gap-y-1 data-[alignment=left]:pl-4",
        "data-[alignment=left]:border-l",
        "data-[alignment=center]:items-center data-[alignment=center]:text-center",
        className
      )}
      {...props}
    />
  )
}

function MetricLabel({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="metric-label"
      className={cn(
        "cn-font-heading text-3xl font-medium tracking-tight group-data-[size=lg]/metric:text-5xl",
        className
      )}
      {...props}
    />
  )
}

function MetricSubLabel({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="metric-description"
      className={cn("text-base text-pretty text-muted-foreground", className)}
      {...props}
    />
  )
}

function MetricActionButton({
  className,
  ...props
}: React.ComponentProps<typeof Button>) {
  return (
    <Button
      data-slot="metric-action-button"
      variant="link"
      className={cn("px-0!", className)}
      {...props}
    />
  )
}

export { Metric, MetricActionButton, MetricLabel, MetricSubLabel }
