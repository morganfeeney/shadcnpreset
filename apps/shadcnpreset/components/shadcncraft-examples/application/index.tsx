import type { ReactNode } from "react"

import { IconPlaceholder } from "@/components/icon-placeholder"
import { ActivityFeed1 } from "@/components/shadcncraft-examples/blocks/activity-feed-1"
import { Header1 } from "@/components/shadcncraft-examples/blocks/header-1"
import { Table4 } from "@/components/shadcncraft-examples/blocks/table-4"
import { ShadcncraftCredit } from "@/components/shadcncraft-examples/credit"
import { Balance1 } from "@/components/shadcncraft-examples/ui/balance-1"
import { Expenses1 } from "@/components/shadcncraft-examples/ui/expenses-1"
import {
  MetricCard1,
  MetricCard1Delta,
  MetricCard1Icon,
  MetricCard1Title,
  MetricCard1Value,
} from "@/components/shadcncraft-examples/ui/metric-card-1"
import { Transactions1 } from "@/components/shadcncraft-examples/ui/transactions-1"

export function ApplicationDemo() {
  return (
    <div className="bg-background px-2 text-foreground">
      <ShadcncraftCredit
        label="Application blocks"
        source="application-preview"
      />
      <Header1 />
      <main className="mx-auto flex max-w-7xl flex-col">
        <div className="flex flex-col gap-4">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {metrics.map((metric) => (
              <MetricCard1 key={metric.title}>
                <MetricCard1Icon>{metric.icon}</MetricCard1Icon>
                <MetricCard1Title>{metric.title}</MetricCard1Title>
                <MetricCard1Value value={metric.value} />
                <MetricCard1Delta
                  value={metric.delta}
                  trend={metric.trend}
                  description="vs last month"
                />
              </MetricCard1>
            ))}
          </div>
          <div className="grid gap-4 lg:grid-cols-3 [&>[data-slot=card]]:max-w-none">
            <Balance1 />
            <Expenses1 />
            <Transactions1 />
          </div>
        </div>
        <Table4 />
        <ActivityFeed1 />
      </main>
    </div>
  )
}

const metrics: {
  title: string
  value: string
  delta: string
  trend: "up" | "down" | "neutral"
  icon: ReactNode
}[] = [
  {
    title: "Revenue",
    value: "$48,210",
    delta: "+12.4%",
    trend: "up",
    icon: (
      <IconPlaceholder
        lucide="CircleDollarSign"
        tabler="IconCurrencyDollar"
        hugeicons="DollarCircleIcon"
        phosphor="CurrencyCircleDollarIcon"
        remixicon="RiMoneyDollarCircleLine"
      />
    ),
  },
  {
    title: "Active members",
    value: "1,284",
    delta: "+3.1%",
    trend: "up",
    icon: (
      <IconPlaceholder
        lucide="Users"
        tabler="IconUsers"
        hugeicons="UserGroupIcon"
        phosphor="UsersIcon"
        remixicon="RiGroupLine"
      />
    ),
  },
  {
    title: "Open tasks",
    value: "96",
    delta: "0%",
    trend: "neutral",
    icon: (
      <IconPlaceholder
        lucide="FolderOpen"
        tabler="IconFolderOpen"
        hugeicons="FolderOpenIcon"
        phosphor="FolderOpenIcon"
        remixicon="RiFolderOpenLine"
      />
    ),
  },
  {
    title: "Uptime",
    value: "99.92%",
    delta: "-0.05%",
    trend: "down",
    icon: (
      <IconPlaceholder
        lucide="Activity"
        tabler="IconActivity"
        hugeicons="Activity01Icon"
        phosphor="ActivityIcon"
        remixicon="RiPulseLine"
      />
    ),
  },
]
