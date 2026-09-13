"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/cn-ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/cn-ui/card"
import { FeaturedIcon } from "@/components/shadcncraft-examples/ui/featured-icon"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/cn-ui/select"
import { Separator } from "@/components/cn-ui/separator"
import { Tabs, TabsList, TabsTrigger } from "@/components/cn-ui/tabs"
import { IconPlaceholder } from "@/components/icon-placeholder"

export function Transactions1() {
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
          Transactions
        </CardTitle>
        <CardAction>
          <Select defaultValue="last-month">
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
        <Tabs defaultValue="completed">
          <TabsList>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardContent>

      <CardContent className="flex flex-col gap-4">
        <TransactionItem
          icon={
            <IconPlaceholder
              lucide="Building2"
              tabler="IconBuildingSkyscraper"
              hugeicons="Building03Icon"
              phosphor="BuildingOfficeIcon"
              remixicon="RiBuilding2Line"
            />
          }
          title="Tax Refund"
          description="2024 Income Tax Refund"
          amount={542}
          date="Dec 20"
        />

        <TransactionItem
          icon={
            <IconPlaceholder
              lucide="Building2"
              tabler="IconBuildingSkyscraper"
              hugeicons="Building03Icon"
              phosphor="BuildingOfficeIcon"
              remixicon="RiBuilding2Line"
            />
          }
          title="Freelance Payment"
          description="Payment for Invoice #INV-4421 - Website redesign project"
          amount={800}
          date="Dec 14"
        />

        <TransactionItem
          icon={
            <IconPlaceholder
              lucide="Building2"
              tabler="IconBuildingSkyscraper"
              hugeicons="Building03Icon"
              phosphor="BuildingOfficeIcon"
              remixicon="RiBuilding2Line"
            />
          }
          title="Salary Payment"
          description="Monthly salary - Acme Corporation SRL, Payroll November 2025"
          amount={2500}
          date="Dec 01"
        />
      </CardContent>

      <CardFooter>
        <Button variant="secondary" className="w-full">
          View all
        </Button>
      </CardFooter>
    </Card>
  )
}

function TransactionItem({
  icon,
  title,
  description,
  amount,
  date,
}: {
  icon: React.ReactNode
  title: string
  description: string
  amount: number
  date: string
}) {
  const isPositive = amount >= 0
  const formattedAmount = `${isPositive ? "+" : "-"}$${Math.abs(amount).toFixed(2)}`

  return (
    <div className="flex gap-2">
      <FeaturedIcon>{icon}</FeaturedIcon>

      <div className="flex flex-1 flex-col gap-1">
        <h3 className="text-sm font-medium">{title}</h3>
        <p className="line-clamp-2 text-xs text-muted-foreground">
          {description}
        </p>
      </div>

      <div className="flex flex-col items-end gap-1">
        <span
          className={cn(
            "text-sm font-medium tabular-nums",
            isPositive ? "text-success" : "text-destructive"
          )}
        >
          {formattedAmount}
        </span>
        <span className="text-xs text-muted-foreground">{date}</span>
      </div>
    </div>
  )
}
