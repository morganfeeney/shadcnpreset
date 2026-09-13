"use client"

import { PolarGrid, RadialBar, RadialBarChart } from "recharts"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/cn-ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/cn-ui/card"
import { ChartContainer, type ChartConfig } from "@/components/cn-ui/chart"
import { IconPlaceholder } from "@/components/icon-placeholder"

const chartConfig = {
  balance: {
    label: "Balance",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig

export function Balance1() {
  const amount = 25895
  const max = 100000

  return (
    <Card className="w-full max-w-lg min-w-72">
      <CardContent>
        <RadialShapeChart value={amount} max={max} />
      </CardContent>

      <CardHeader>
        <CardTitle className="text-xl">Checking Account</CardTitle>
        <CardDescription>Current balance</CardDescription>
        <div className="flex items-end gap-1.5">
          <span className="flex-1 text-3xl font-medium tracking-tight tabular-nums">
            {`$${amount.toFixed(2)}`}
          </span>
          <Badge
            className={cn(
              "border-success/25 bg-success-foreground text-success tabular-nums"
            )}
          >
            +1.25%
            <IconPlaceholder
              lucide="ArrowUpRight"
              tabler="IconArrowUpRight"
              hugeicons="ArrowUpRight01Icon"
              phosphor="ArrowUpRightIcon"
              remixicon="RiArrowRightUpLine"
            />
          </Badge>
        </div>
      </CardHeader>
    </Card>
  )
}

function RadialShapeChart({ value, max }: { value: number; max: number }) {
  const percentage = Math.min(value / max, 1)
  const endAngle = percentage * 360

  const chartData = [{ balance: value, max, fill: "var(--chart-2)" }]

  return (
    <div className="relative size-20 shrink-0">
      <ChartContainer config={chartConfig} className="aspect-square">
        <RadialBarChart
          data={chartData}
          endAngle={endAngle}
          outerRadius={40}
          innerRadius={30}
        >
          <PolarGrid
            gridType="circle"
            radialLines={false}
            stroke="none"
            className="first:fill-muted last:fill-card"
            polarRadius={[37, 32]}
          />
          <RadialBar dataKey="balance" background />
        </RadialBarChart>
      </ChartContainer>
    </div>
  )
}
