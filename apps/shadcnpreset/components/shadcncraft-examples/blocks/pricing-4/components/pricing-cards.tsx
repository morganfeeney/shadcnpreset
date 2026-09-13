import type { ReactNode } from "react"

import { PricingCard1 } from "@/components/shadcncraft-examples/ui/pricing-card-1"
import { Button } from "@/components/cn-ui/button"
import { IconPlaceholder } from "@/components/icon-placeholder"

export function PricingCards({
  billingPeriod,
}: {
  billingPeriod: "yearly" | "monthly"
}) {
  return (
    <div className="flex w-full flex-col items-center justify-center gap-3 lg:flex-row">
      {pricingTiersData.map((tier) => {
        const amount =
          billingPeriod === "yearly" ? tier.price.yearly : tier.price.monthly

        return (
          <PricingCard1
            key={tier.title}
            mostPopular={tier.mostPopular}
            icon={tier.icon}
            title={tier.title}
            description={tier.description}
            amount={`$${amount}`}
            billingPeriod="Per month"
            features={tier.features.map((feature) => ({ text: feature }))}
            button={<Button size="lg">Get started</Button>}
          />
        )
      })}
    </div>
  )
}

interface PricingTier {
  icon: ReactNode
  title: string
  description: string
  price: {
    yearly: number
    monthly: number
  }
  features: string[]
  mostPopular?: boolean
}

const pricingTiersData: PricingTier[] = [
  {
    icon: (
      <IconPlaceholder
        lucide="Star"
        tabler="IconStar"
        hugeicons="StarIcon"
        phosphor="StarIcon"
        remixicon="RiStarLine"
      />
    ),
    title: "Starter",
    description:
      "For individuals who want AI assistance in their daily workflow.",
    price: { yearly: 10, monthly: 15 },
    features: [
      "Unlimited projects",
      "AI-powered insights",
      "Real-time collaboration",
      "Seamless integrations",
      "Priority support",
    ],
  },
  {
    icon: (
      <IconPlaceholder
        lucide="Users"
        tabler="IconUsers"
        hugeicons="UserGroupIcon"
        phosphor="UsersIcon"
        remixicon="RiGroupLine"
      />
    ),
    title: "Pro",
    description:
      "For individuals who want AI assistance in their daily workflow.",
    price: { yearly: 20, monthly: 30 },
    mostPopular: true,
    features: [
      "Everything in Starter",
      "Advanced analytics & reporting",
      "Role-based access",
      "Custom project templates",
      "Dedicated onboarding support",
    ],
  },
  {
    icon: (
      <IconPlaceholder
        lucide="Building"
        tabler="IconBuilding"
        hugeicons="Building01Icon"
        phosphor="BuildingIcon"
        remixicon="RiBuildingLine"
      />
    ),
    title: "Enterprise",
    description:
      "For individuals who want AI assistance in their daily workflow.",
    price: { yearly: 30, monthly: 45 },
    features: [
      "Everything in Pro",
      "Single sign-on (SSO)",
      "Custom integrations & API access",
      "SLA-backed uptime guarantee",
      "Dedicated success manager",
    ],
  },
]
