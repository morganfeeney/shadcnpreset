"use client"

import { useState } from "react"

import { PricingCards } from "@/components/shadcncraft-examples/blocks/pricing-4/components/pricing-cards"
import {
  SectionHeading,
  SectionHeadingBody,
  SectionHeadingTagline,
  SectionHeadingTitle,
} from "@/components/shadcncraft-examples/ui/section-heading"
import { Tabs, TabsList, TabsTrigger } from "@/components/cn-ui/tabs"

type BillingPeriod = "yearly" | "monthly"

export function Pricing4() {
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>("yearly")

  return (
    <section className="py-5 lg:py-16">
      <div className="mx-auto flex max-w-7xl flex-col gap-10">
        {/* Section Heading and Billing Period Tabs */}
        <div className="flex flex-col gap-4">
          <SectionHeading
            alignment="center"
            className="mx-auto w-full max-w-3xl"
          >
            <SectionHeadingTagline>Pricing</SectionHeadingTagline>
            <SectionHeadingTitle>
              Simple Pricing, Smarter Work
            </SectionHeadingTitle>
            <SectionHeadingBody>
              Acme Inc. has a plan designed to help you move faster.
            </SectionHeadingBody>
          </SectionHeading>

          {/* Billing Period Tabs */}
          <Tabs
            className="w-full"
            value={billingPeriod}
            onValueChange={(value) => setBillingPeriod(value as BillingPeriod)}
          >
            <TabsList className="mx-auto w-full sm:w-fit">
              <TabsTrigger value="yearly">Billed yearly</TabsTrigger>
              <TabsTrigger value="monthly">Billed monthly</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Pricing Cards */}
        <PricingCards billingPeriod={billingPeriod} />
      </div>
    </section>
  )
}
