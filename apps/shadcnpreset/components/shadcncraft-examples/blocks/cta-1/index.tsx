import { Button } from "@/components/cn-ui/button"
import {
  SectionHeading,
  SectionHeadingActions,
  SectionHeadingBody,
  SectionHeadingTitle,
} from "@/components/shadcncraft-examples/ui/section-heading"

export function CTA1() {
  return (
    <section className="py-5 lg:py-16">
      <div className="mx-auto max-w-7xl">
        {/* Section Heading */}
        <SectionHeading alignment="center">
          <SectionHeadingTitle>
            Ready to Work Smarter with AI?
          </SectionHeadingTitle>

          <SectionHeadingBody>
            Start today and see how Acme Inc. helps you finish projects faster,
            with clarity and focus at every step.
          </SectionHeadingBody>

          <SectionHeadingActions>
            <Button>Learn More</Button>
            <Button variant="secondary">Book a Demo</Button>
          </SectionHeadingActions>
        </SectionHeading>
      </div>
    </section>
  )
}
