"use client"

import { useState } from "react"
import { Bar, BarChart, XAxis, YAxis } from "recharts"

import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/cn-ui/card"
import {
  ChartContainer,
  ChartTooltip,
  type ChartConfig,
} from "@/components/cn-ui/chart"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/cn-ui/select"
import { Separator } from "@/components/cn-ui/separator"
import { IconPlaceholder } from "@/components/icon-placeholder"

type Period =
  "last-day" | "last-week" | "last-month" | "last-year" | "year-to-date"

interface ExpensesData {
  rent: number
  food: number
  bills: number
  utilities: number
  other: number
}

const periodData: Record<Period, ExpensesData> = {
  "last-day": {
    rent: 9,
    food: 7,
    bills: 6,
    utilities: 6,
    other: 3,
  },
  "last-week": {
    rent: 64,
    food: 47,
    bills: 44,
    utilities: 41,
    other: 21,
  },
  "last-month": {
    rent: 275,
    food: 200,
    bills: 187,
    utilities: 173,
    other: 90,
  },
  "last-year": {
    rent: 3300,
    food: 2400,
    bills: 2244,
    utilities: 2076,
    other: 1080,
  },
  "year-to-date": {
    rent: 2475,
    food: 1800,
    bills: 1683,
    utilities: 1557,
    other: 810,
  },
}

export function Expenses1() {
  const [selectedPeriod, setSelectedPeriod] = useState<Period>("last-month")
  const data = periodData[selectedPeriod]

  const chartData = [
    { expense: "rent", amount: data.rent, fill: "var(--color-rent)" },
    { expense: "food", amount: data.food, fill: "var(--color-food)" },
    { expense: "bills", amount: data.bills, fill: "var(--color-bills)" },
    {
      expense: "utilities",
      amount: data.utilities,
      fill: "var(--color-utilities)",
    },
    { expense: "other", amount: data.other, fill: "var(--color-other)" },
  ]

  return (
    <Card size="sm" className="w-full max-w-sm min-w-72">
      <CardHeader>
        <CardTitle className="flex items-center gap-1">
          <IconPlaceholder
            lucide="CircleDollarSign"
            tabler="IconCurrencyDollar"
            hugeicons="DollarCircleIcon"
            phosphor="CurrencyCircleDollarIcon"
            remixicon="RiMoneyDollarCircleLine"
            className="size-4 text-muted-foreground"
          />
          Expenses
        </CardTitle>
        <CardAction>
          <Select
            value={selectedPeriod}
            onValueChange={(value) => setSelectedPeriod(value as Period)}
          >
            <SelectTrigger size="sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="last-day">Last 24 hours</SelectItem>
              <SelectItem value="last-week">Last 7 days</SelectItem>
              <SelectItem value="last-month">Last month</SelectItem>
              <SelectItem value="last-year">Last year</SelectItem>
              <SelectItem value="year-to-date">Year to date</SelectItem>
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>

      <Separator />

      <CardContent>
        <ExpensesBarChart chartData={chartData} />
      </CardContent>
    </Card>
  )
}

const chartConfig = {
  expenses: {
    label: "Expenses",
  },
  rent: {
    label: "Rent",
    color: "var(--chart-1)",
  },
  food: {
    label: "Food",
    color: "var(--chart-2)",
  },
  bills: {
    label: "Bills",
    color: "var(--chart-3)",
  },
  utilities: {
    label: "Utilities",
    color: "var(--chart-4)",
  },
  other: {
    label: "Other",
    color: "var(--chart-5)",
  },
} satisfies ChartConfig

function ExpensesBarChart({
  chartData,
}: {
  chartData: Array<{ expense: string; amount: number; fill: string }>
}) {
  return (
    <ChartContainer config={chartConfig}>
      <BarChart
        accessibilityLayer
        data={chartData}
        layout="vertical"
        margin={{
          left: 0,
        }}
      >
        <YAxis
          dataKey="expense"
          type="category"
          tickLine={false}
          tickMargin={10}
          axisLine={false}
          tickFormatter={(value) =>
            chartConfig[value as keyof typeof chartConfig]?.label
          }
        />
        <XAxis dataKey="amount" type="number" hide />
        <ChartTooltip cursor={false} content={<ExpensesTooltipContent />} />
        <Bar dataKey="amount" radius={5} />
      </BarChart>
    </ChartContainer>
  )
}

function ExpensesTooltipContent({
  active,
  payload,
}: {
  active?: boolean
  payload?: Array<{ value: number }>
}) {
  if (!active || !payload?.length) return null

  const amount = payload[0].value
  const formatted = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(amount)

  return (
    <div className="z-50 w-fit rounded-md bg-primary px-3 py-1.5 text-xs text-primary-foreground">
      {formatted}
    </div>
  )
}
