import { TopNavigation4 } from "@/components/shadcncraft-examples/blocks/top-navigation-4"
import { Button } from "@/components/cn-ui/button"
import {
  PageHeading,
  PageHeadingActions,
  PageHeadingBody,
  PageHeadingTagline,
  PageHeadingTitle,
} from "@/components/shadcncraft-examples/ui/page-heading"
import { IconPlaceholder } from "@/components/icon-placeholder"

export function Hero1() {
  return (
    <>
      <div className="sticky top-0 z-50">
        <TopNavigation4 />
      </div>

      <section className="py-5 lg:py-16">
        <div className="mx-auto flex max-w-7xl flex-col gap-12">
          {/* Page Heading */}
          <PageHeading alignment="center" className="mx-auto w-full">
            <PageHeadingTagline>New features released</PageHeadingTagline>
            <PageHeadingTitle>
              Make Better Decisions, With Ease
            </PageHeadingTitle>
            <PageHeadingBody>
              Acme Inc&apos;s personal AI helps you cut through the noise, speed
              up delivery, and stay focused without switching contexts.
            </PageHeadingBody>
            <PageHeadingActions>
              <Button>Get Started</Button>
            </PageHeadingActions>
          </PageHeading>

          {/* Media showcase container */}
          <div className="relative aspect-5/3 w-full overflow-clip rounded-lg bg-muted">
            <img
              src="https://assets.shadcncraft.com/registry/pro-marketing/heroes/1.webp"
              className="size-full object-cover"
              alt="Hero 1"
            />

            <button className="group absolute inset-0 z-10 m-auto flex size-16 items-center justify-center rounded-full bg-background p-2.5 shadow-2xs">
              <IconPlaceholder
                lucide="Play"
                tabler="IconPlayerPlay"
                hugeicons="PlayIcon"
                phosphor="PlayIcon"
                remixicon="RiPlayLine"
                className="size-6 transition-all duration-300 group-hover:scale-110"
              />
            </button>
          </div>
        </div>
      </section>
    </>
  )
}
