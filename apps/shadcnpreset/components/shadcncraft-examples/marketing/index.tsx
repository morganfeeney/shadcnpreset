import { Benefits1 } from "@/components/shadcncraft-examples/blocks/benefits-1"
import { CTA1 } from "@/components/shadcncraft-examples/blocks/cta-1"
import { FAQs2 } from "@/components/shadcncraft-examples/blocks/faqs-2"
import { Footer1 } from "@/components/shadcncraft-examples/blocks/footer-1"
import { Hero1 } from "@/components/shadcncraft-examples/blocks/hero-1"
import { Metrics1 } from "@/components/shadcncraft-examples/blocks/metrics-1"
import { Pricing4 } from "@/components/shadcncraft-examples/blocks/pricing-4"
import { SocialProof1 } from "@/components/shadcncraft-examples/blocks/social-proof-1"
import { Testimonials1 } from "@/components/shadcncraft-examples/blocks/testimonials-1"

export function MarketingDemo() {
  return (
    <div className="bg-background text-foreground">
      <Hero1 />
      <main>
        <SocialProof1 />
        <Benefits1 />
        <Metrics1 />
        <Testimonials1 />
        <Pricing4 />
        <FAQs2 />
        <CTA1 />
      </main>
      <Footer1 />
    </div>
  )
}
