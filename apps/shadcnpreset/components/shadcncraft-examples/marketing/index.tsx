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
      <div className="mx-auto w-full max-w-7xl px-5 py-2 lg:px-8">
        <p className="text-xs text-muted-foreground">
          Marketing blocks from{" "}
          <a
            href="https://shadcncraft.com?atp=shadcnpreset&amp;src=marketing-preview"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-4 hover:text-foreground"
          >
            shadcncraft Pro
          </a>
        </p>
      </div>
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
