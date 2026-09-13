import * as React from "react"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/cn-ui/badge"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/cn-ui/card"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/cn-ui/tooltip"
import { IconPlaceholder } from "@/components/icon-placeholder"

interface PricingCardFeature {
  text: string
  tooltip?: string
}

interface PricingCardProps extends React.ComponentProps<typeof Card> {
  mostPopular?: boolean
  title: string
  description?: string
  icon?: React.ReactNode
  amount: string
  billingPeriod: string
  features?: PricingCardFeature[]
  badge?: React.ReactNode
  button?: React.ReactNode
}

function PricingCard1({
  mostPopular = false,
  className,
  title,
  description,
  icon,
  amount,
  billingPeriod,
  features,
  badge,
  button,
  ...props
}: PricingCardProps) {
  const badgeContent = React.useMemo(() => {
    // If badge is explicitly provided, use it (can be null to hide)
    if (badge !== undefined) return badge
    // Default: show "Most Popular" badge if mostPopular is true
    if (mostPopular) return <Badge>Most Popular</Badge>
    return null
  }, [badge, mostPopular])

  return (
    <Card
      data-slot="pricing-card"
      data-most-popular={mostPopular}
      className={cn(
        "@container/pricing-card w-full max-w-xl",
        mostPopular && "border-2 border-primary",
        className
      )}
      {...props}
    >
      {(!!icon || !!badgeContent) && (
        <CardHeader>
          <span className="[&_svg:not([class*='size-'])]:size-4 [&_svg:not([class*='text-'])]:text-primary">
            {icon}
          </span>
          {badgeContent && (
            <CardAction data-slot="pricing-card-badge">
              {badgeContent}
            </CardAction>
          )}
        </CardHeader>
      )}

      <CardContent>
        <CardTitle data-slot="pricing-card-title" className="text-lg">
          {title}
        </CardTitle>
        {description && (
          <CardDescription data-slot="pricing-card-description">
            {description}
          </CardDescription>
        )}
      </CardContent>

      <PricingCardPricing>
        <PricingCardAmount>{amount}</PricingCardAmount>
        <PricingCardDetails>
          <PricingCardBillingPeriod>{billingPeriod}</PricingCardBillingPeriod>
          <PricingCardTax />
        </PricingCardDetails>
      </PricingCardPricing>

      {button && <PricingCardCTA>{button}</PricingCardCTA>}

      {features && features.length > 0 && (
        <PricingCardFeatures>
          {features.map((feature, index) => (
            <PricingCardFeatureItem key={index}>
              <IconPlaceholder
                lucide="CircleCheck"
                tabler="IconCircleCheck"
                hugeicons="CheckmarkCircle02Icon"
                phosphor="CheckCircleIcon"
                remixicon="RiCheckboxCircleLine"
              />
              <PricingCardFeatureLabel>{feature.text}</PricingCardFeatureLabel>
              {feature.tooltip && (
                <Tooltip>
                  <TooltipTrigger aria-label="More information">
                    <IconPlaceholder
                      lucide="Info"
                      tabler="IconInfoSmall"
                      hugeicons="InformationCircleIcon"
                      phosphor="InfoIcon"
                      remixicon="RiInformationLine"
                      className="size-4 text-muted-foreground opacity-70 hover:opacity-100"
                    />
                  </TooltipTrigger>
                  <TooltipContent>{feature.tooltip}</TooltipContent>
                </Tooltip>
              )}
            </PricingCardFeatureItem>
          ))}
        </PricingCardFeatures>
      )}
    </Card>
  )
}

function PricingCardPricing({
  className,
  ...props
}: React.ComponentProps<typeof CardContent>) {
  return (
    <CardContent
      data-slot="pricing-card-pricing"
      className={cn(
        "group/pricing-card-pricing mt-auto flex gap-1.5",
        className
      )}
      {...props}
    />
  )
}

function PricingCardCTA({
  className,
  ...props
}: React.ComponentProps<typeof CardContent>) {
  return (
    <CardContent
      data-slot="pricing-card-action"
      className={cn("[&>button]:w-full", className)}
      {...props}
    />
  )
}

function PricingCardAmount({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="pricing-card-amount"
      className={cn(
        "self-end text-6xl font-medium tracking-tight tabular-nums group-[.flex-col]/pricing-card-pricing:self-auto",
        className
      )}
      {...props}
    />
  )
}

function PricingCardDetails({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="pricing-card-details"
      className={cn(
        "flex flex-col self-end group-[.flex-col]/pricing-card-pricing:self-auto",
        className
      )}
      {...props}
    />
  )
}

function PricingCardBillingPeriod({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="pricing-card-billing-period"
      className={cn("text-sm font-medium", className)}
      {...props}
    />
  )
}

function PricingCardTax({
  className,
  children,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="pricing-card-tax"
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    >
      {children ?? "Plus local taxes"}
    </span>
  )
}

function PricingCardFeatures({
  className,
  ...props
}: React.ComponentProps<typeof CardContent>) {
  return (
    <CardContent
      data-slot="pricing-card-features"
      className={cn("flex flex-col items-stretch gap-2.5", className)}
      {...props}
    />
  )
}

function PricingCardFeatureItem({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="pricing-card-feature-item"
      className={cn(
        "flex gap-1 [&_svg]:mt-1 [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 [&_svg:not([class*='text-'])]:text-muted-foreground",
        className
      )}
      {...props}
    />
  )
}

function PricingCardFeatureLabel({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="pricing-card-feature-label"
      className={cn("flex-1 text-base", className)}
      {...props}
    />
  )
}

export {
  PricingCard1,
  PricingCardAmount,
  PricingCardBillingPeriod,
  PricingCardCTA,
  PricingCardDetails,
  PricingCardFeatureItem,
  PricingCardFeatureLabel,
  PricingCardFeatures,
  PricingCardPricing,
  PricingCardTax,
}
export type { PricingCardFeature, PricingCardProps }
